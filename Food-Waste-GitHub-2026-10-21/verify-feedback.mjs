import assert from 'node:assert/strict';
import pg from 'pg';
try{process.loadEnvFile();}catch(e){if(e.code!=='ENOENT')throw e;}
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:3100';
async function post(path,data){const r=await fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});return {status:r.status,data:await r.json()};}
const state=await (await fetch(base+'/api/state')).json();
const item=state.feedback.find(x=>x.title==='Sentetik pilot: belge arşivi filtresi');assert.ok(item,'Önce tarayıcıdaki sentetik akış testini çalıştırın.');
const job=state.feedbackJobs.find(x=>x.feedbackId===item.id),task=state.feedbackTasks.find(x=>x.feedbackId===item.id);
assert.equal(job.status,'Onaylandı');assert.ok(job.analysis);assert.ok(job.proposal);
assert.equal(job.steps.filter(x=>x.status==='Tamamlandı').length,3);
assert.equal(task.status,'Tamamlandı');assert.equal(item.status,'Planlandı');
const repeated=await post('/api/feedback/approve',{jobId:job.id});assert.equal(repeated.status,200);assert.equal(repeated.data.id,task.id);
assert.equal((await post('/api/feedback',{title:'Kaydedilmemeli',description:'Onaysız test',category:'Hata',page:'feedback',consent:false})).status,400);
assert.equal((await post('/api/feedback/status',{id:item.id,status:'Çözüldü',reason:''})).status,400);
const after=await (await fetch(base+'/api/state')).json();assert.equal(after.feedbackTasks.length,state.feedbackTasks.length);assert.equal(after.feedback.length,state.feedback.length);
const client=new pg.Client({connectionString:process.env.DATABASE_URL});await client.connect();
try{for(const [table,id] of [['app_feedback',item.id],['app_feedback_jobs',job.id],['app_feedback_tasks',task.id]]){const r=await client.query('SELECT payload FROM '+table+' WHERE id=$1',[id]);assert.equal(r.rows.length,1);}}
finally{await client.end();}
console.log(JSON.stringify({verified:true,realModel:job.model,completedSteps:3,postgresql:true,duplicateApprovalCreatesNoTask:true,consentEnforced:true,feedbackNotAutomaticallyResolved:true}));
