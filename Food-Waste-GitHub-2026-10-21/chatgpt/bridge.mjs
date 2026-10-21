import {mkdir,readFile,writeFile,rename} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {feedbackInput} from '../feedback.mjs';

export function createBridge({baseURL='http://127.0.0.1:3100',scopeFile=new URL('../data/chatgpt-scope.json',import.meta.url),request=fetch}={}){
  const base=new URL(baseURL);
  if(base.protocol!=='http:'||!['127.0.0.1','localhost'].includes(base.hostname)||base.username||base.password)throw new Error('Demo köprüsü yalnızca yerel SaaS adresine bağlanır.');
  let queue=Promise.resolve();
  const serial=fn=>{const work=queue.then(fn);queue=work.catch(()=>{});return work;};
  async function scope(){try{return JSON.parse(await readFile(scopeFile,'utf8'));}catch(e){if(e.code==='ENOENT')return {items:[]};throw e;}}
  async function save(s){await mkdir(new URL('.',scopeFile),{recursive:true});const temporary=new URL(scopeFile.href+'.tmp');await writeFile(temporary,JSON.stringify(s));await rename(temporary,scopeFile);}
  async function api(path,data){const r=await request(new URL(path,base),{method:data?'POST':'GET',headers:data?{'Content-Type':'application/json'}:undefined,body:data?JSON.stringify(data):undefined,signal:AbortSignal.timeout(12000),redirect:'error'});if(!r.ok)throw new Error('SaaS işlemi tamamlanamadı (HTTP '+r.status+'). Yerel panelden bağlantıyı ve iş durumunu kontrol edin.');return r.json();}
  function allowed(s,id){if(!s.items.some(x=>x.id===id))throw new Error('Bu bildirim ChatGPT bağlantısının kapsamında değil.');}
  function present(db,id){
    const item=(db.feedback||[]).find(x=>x.id===id);if(!item)throw new Error('Bildirim bulunamadı.');
    const job=(db.feedbackJobs||[]).find(x=>x.feedbackId===id);
    return {id:item.id,title:item.title,description:item.description,category:item.category,page:item.page,status:item.status,createdAt:item.createdAt,
      review:job?{id:job.id,status:job.status,stage:job.stage,model:job.model,analysis:job.analysis,proposal:job.proposal,error:job.status==='Başarısız'?'İnceleme tamamlanamadı. Yerel panelden tekrar deneyin.':undefined}:null,
      tasks:(db.feedbackTasks||[]).filter(t=>t.feedbackId===id).map(t=>({id:t.id,title:t.title,status:t.status,action:t.action,acceptance:t.acceptance})),reviewRequired:true};
  }
  return {
    health:async()=>{const s=await api('/api/ai/status');return {application:'Food & Waste',mode:'Yerel demo',textModelReady:!!s.ready,aiBusy:!!s.busy,scope:'Yalnızca bu bağlantıdan oluşturulan geri bildirimler',automaticTraining:false};},
    submit:input=>serial(async()=>{
      const data=feedbackInput(input);if(typeof input.request_id!=='string'||!/^[a-zA-Z0-9_-]{8,80}$/.test(input.request_id))throw new Error('Geçerli bir istek anahtarı gerekir.');
      const digest=createHash('sha256').update(JSON.stringify(data)).digest('hex'),s=await scope(),previous=s.items.find(x=>x.requestId===input.request_id);
      if(previous){if(previous.digest!==digest)throw new Error('Aynı istek anahtarı farklı içerikle kullanılamaz.');return present(await api('/api/state'),previous.id);}
      const item=await api('/api/feedback',{...data,consent:true});s.items.unshift({id:item.id,requestId:input.request_id,digest});await save(s);
      return present({feedback:[item]},item.id);
    }),
    list:()=>serial(async()=>{const s=await scope();if(!s.items.length)return {items:[],scope:'Bu bağlantıda henüz bildirim yok.'};const db=await api('/api/state');return {items:s.items.slice(0,20).filter(x=>db.feedback?.some(f=>f.id===x.id)).map(x=>present(db,x.id)),totalOwned:s.items.length};}),
    get:id=>serial(async()=>{const s=await scope();allowed(s,id);return present(await api('/api/state'),id);}),
    start:id=>serial(async()=>{const s=await scope();allowed(s,id);const current=present(await api('/api/state'),id);if(current.review?.status==='Çalışıyor')return {jobId:current.review.id,status:'Çalışıyor',duplicate:false};const job=await api('/api/feedback/analyze',{id});return {...job,status:'Çalışıyor',message:'İki yerel ajan sırayla çalışır. Sonucu daha sonra foodwaste_get_feedback ile sorgulayın. Onay ve görev oluşturma yerel paneldedir.'};})
  };
}
