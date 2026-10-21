// Sentetik örnek kaydı inceleyen gerçek model testi; üretim verisi kullanmayın.
const base=process.env.APP_URL || 'http://127.0.0.1:3100';
const state=await fetch(base+'/api/state').then(r=>r.json());
if(!state.ai.configured)throw new Error('Uygulamada model yapılandırılmamış.');
const record=state.records.find(r=>r.lot==='DEMO-2026-041');
if(!record)throw new Error('Sentetik örnek kayıt bulunamadı.');
const start=Date.now();
const response=await fetch(base+'/api/agent',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:record.id}),signal:AbortSignal.timeout(190000)});
const result=await response.json();
if(!response.ok)throw new Error(result.error);
let after,run;
do {
  await new Promise(resolve=>setTimeout(resolve,1000));
  after=await fetch(base+'/api/state').then(r=>r.json());
  run=after.runs.find(r=>r.id===result.runId);
} while(run?.status==='Çalışıyor' && Date.now()-start<190000);
if(!run?.output || run.status!=='İnceleme bekliyor')throw new Error('Ajan taslağı oluşmadı.');
const current=after.records.find(r=>r.id===record.id);
if(JSON.stringify(current)!==JSON.stringify(record))throw new Error('Ajan kaydı değiştirdi.');
console.log(JSON.stringify({model:run.model,seconds:Math.round((Date.now()-start)/100)/10,status:run.status,recordUnchanged:true,output:run.output},null,2));
