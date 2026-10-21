import test from 'node:test';
import assert from 'node:assert/strict';
import {feedbackInput,createFeedbackService} from './feedback.mjs';
const sample={title:'Sentetik bildirim',description:'Belgeyi bulmak için partiye dönmem gerekti.',page:'documents',category:'Öneri',consent:true};
function harness(responses){
  const db={feedback:[],feedbackJobs:[],feedbackTasks:[]};let locked=false,calls=0;
  const service=createFeedbackService({model:'test-model',storage:{mutate:async fn=>fn(db)},ready:async()=>true,claim:()=>{if(locked)return false;locked=true;return true;},release:()=>{locked=false;},chat:async()=>{const x=responses[calls++];if(x instanceof Error)throw x;return JSON.stringify(x);}});
  return {db,service,get locked(){return locked;},get calls(){return calls;}};
}
const analysis={area:'Belge',priority:'Orta',summary:'Belge erişimini inceleme önerisi.',question:'Hangi belge aranıyordu?'};
const proposal={title:'Belge erişimini incele',action:'Adımları örnek veriyle yeniden üret.',acceptance:'Aranan belgeye erişim akışını kullanıcıyla doğrula.'};
async function finish(h){for(let i=0;i<50&&h.locked;i++)await new Promise(r=>setTimeout(r,2));assert.equal(h.locked,false);}
test('açık onay gerekir; otomatik tanılama ve şirket alanları kabul edilen içeriğe taşınmaz',()=>{
  assert.throws(()=>feedbackInput({...sample,consent:false}));
  assert.throws(()=>feedbackInput({...sample,page:'https://example.com?secret=123'}));
  const x=feedbackInput({...sample,password:'secret',companyId:'other',screenshot:'secret'});
  assert.deepEqual(Object.keys(x).sort(),['category','description','page','title']);
});
test('iki model adımı görev yazmaz; onay tekrarları tek görev oluşturur; tamamlamak bildirimi çözmez',async()=>{
  const h=harness([analysis,proposal]);const [,item]=await h.service.handle('/api/feedback',sample);
  await h.service.handle('/api/feedback/analyze',{id:item.id});await finish(h);
  assert.equal(h.calls,2);assert.equal(h.db.feedbackTasks.length,0);assert.equal(h.db.feedbackJobs[0].status,'Onay bekliyor');
  const b={jobId:h.db.feedbackJobs[0].id};await h.service.handle('/api/feedback/approve',b);await h.service.handle('/api/feedback/approve',b);
  assert.equal(h.db.feedbackTasks.length,1);assert.equal(item.status,'Planlandı');
  await h.service.handle('/api/feedback/task-complete',{id:h.db.feedbackTasks[0].id,reason:'Sentetik doğrulama yapıldı.'});
  assert.equal(item.status,'Planlandı');assert.equal(h.db.feedbackTasks[0].status,'Tamamlandı');
});
test('hatalı model çıktısında ikinci ajan ve görev açma engellenir, kilit serbest bırakılır',async()=>{
  const h=harness([{...analysis,priority:'Kesin güvenlik ihlali'}]);const [,item]=await h.service.handle('/api/feedback',sample);
  await h.service.handle('/api/feedback/analyze',{id:item.id});await finish(h);
  assert.equal(h.calls,1);assert.equal(h.db.feedbackJobs[0].status,'Başarısız');
  await assert.rejects(h.service.handle('/api/feedback/approve',{jobId:h.db.feedbackJobs[0].id}));
  assert.equal(h.db.feedbackTasks.length,0);
});
test('kapalı bildirimde görev açılamaz; durum değişimi gerekçe gerektirir',async()=>{
  const h=harness([analysis,proposal]);const [,item]=await h.service.handle('/api/feedback',sample);
  await assert.rejects(h.service.handle('/api/feedback/status',{id:item.id,status:'Kapandı',reason:''}));
  await h.service.handle('/api/feedback/analyze',{id:item.id});await finish(h);
  await h.service.handle('/api/feedback/status',{id:item.id,status:'Kapandı',reason:'Tekrarlı bildirim.'});
  await assert.rejects(h.service.handle('/api/feedback/approve',{jobId:h.db.feedbackJobs[0].id}));
});
