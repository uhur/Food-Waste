import {readFile,writeFile,mkdir,rename} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';

export function seed(){return {records:[{id:randomUUID(),lot:'DEMO-2026-041',product:'Örnek yoğurt',quantity:120,unit:'kg',issue:'Soğuk depo kontrolünde sıcaklık sapması kaydedildi. İnceleme bekleniyor.',status:'İncelemede',createdAt:new Date().toISOString(),attachments:[],history:[{at:new Date().toISOString(),text:'Sentetik örnek kayıt oluşturuldu.'}]}],runs:[]};}

export async function createStorage(){
  const directory=new URL('./data/',import.meta.url);await mkdir(directory,{recursive:true});
  const file=new URL('store.json',directory);
  async function legacy(){try{return JSON.parse(await readFile(file,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;return seed();}}
  if(!process.env.DATABASE_URL){
    let db={feedback:[],feedbackJobs:[],feedbackTasks:[],...await legacy()},queue=Promise.resolve();
    return {kind:'JSON geliştirme deposu',read:async()=>structuredClone(db),mutate(fn){const task=queue.then(async()=>{const next=structuredClone(db),result=fn(next);await writeFile(new URL('store.tmp',directory),JSON.stringify(next,null,2));await rename(new URL('store.tmp',directory),file);db=next;return result;});queue=task.catch(()=>{});return task;}};
  }
  const {default:pg}=await import('pg');
  const pool=new pg.Pool({connectionString:process.env.DATABASE_URL,max:5,connectionTimeoutMillis:5000});
  await pool.query(`CREATE TABLE IF NOT EXISTS app_records(id uuid PRIMARY KEY, lot text NOT NULL, product text NOT NULL, status text NOT NULL, created_at timestamptz NOT NULL, payload jsonb NOT NULL);
  CREATE TABLE IF NOT EXISTS app_documents(id uuid PRIMARY KEY,record_id uuid NOT NULL REFERENCES app_records(id),name text NOT NULL,mime text NOT NULL,bytes integer NOT NULL,sha256 text NOT NULL,storage_key text NOT NULL UNIQUE,created_at timestamptz NOT NULL);
  CREATE TABLE IF NOT EXISTS app_runs(id uuid PRIMARY KEY,record_id uuid NOT NULL REFERENCES app_records(id),created_at timestamptz NOT NULL,payload jsonb NOT NULL);
  CREATE INDEX IF NOT EXISTS app_records_status ON app_records(status);
  CREATE INDEX IF NOT EXISTS app_records_created_at ON app_records(created_at DESC);
  CREATE INDEX IF NOT EXISTS app_documents_record ON app_documents(record_id);`);
  await pool.query(`CREATE TABLE IF NOT EXISTS app_feedback(id uuid PRIMARY KEY,created_at timestamptz NOT NULL,payload jsonb NOT NULL);
  CREATE TABLE IF NOT EXISTS app_feedback_jobs(id uuid PRIMARY KEY,created_at timestamptz NOT NULL,payload jsonb NOT NULL);
  CREATE TABLE IF NOT EXISTS app_feedback_tasks(id uuid PRIMARY KEY,created_at timestamptz NOT NULL,payload jsonb NOT NULL);`);
  async function read(client=pool){const records=await client.query('SELECT payload FROM app_records ORDER BY created_at DESC');const runs=await client.query('SELECT payload FROM app_runs ORDER BY created_at DESC');const documents=await client.query('SELECT * FROM app_documents ORDER BY created_at DESC');const extras={};for(const [key,table] of Object.entries({feedback:'app_feedback',feedbackJobs:'app_feedback_jobs',feedbackTasks:'app_feedback_tasks'})){extras[key]=(await client.query('SELECT payload FROM '+table+' ORDER BY created_at DESC')).rows.map(x=>x.payload);}return {...extras,records:records.rows.map(({payload:r})=>({...r,attachments:documents.rows.filter(d=>d.record_id===r.id).map(d=>({id:d.id,name:d.name,mime:d.mime,bytes:d.bytes,sha256:d.sha256,key:d.storage_key,createdAt:d.created_at.toISOString()}))})),runs:runs.rows.map(r=>r.payload)};}
  async function save(client,db){for(const [key,table] of Object.entries({feedback:'app_feedback',feedbackJobs:'app_feedback_jobs',feedbackTasks:'app_feedback_tasks'})){for(const x of db[key]||[])await client.query('INSERT INTO '+table+' VALUES($1,$2,$3) ON CONFLICT(id) DO UPDATE SET payload=$3',[x.id,x.createdAt,JSON.stringify(x)]);}for(const record of db.records){const {attachments=[],...r}=record;await client.query('INSERT INTO app_records VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(id) DO UPDATE SET lot=$2,product=$3,status=$4,payload=$6',[r.id,r.lot,r.product,r.status,r.createdAt,JSON.stringify(r)]);for(const a of attachments)await client.query('INSERT INTO app_documents VALUES($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT(id) DO NOTHING',[a.id,r.id,a.name,a.mime,a.bytes,a.sha256,a.key,a.createdAt]);}for(const r of db.runs)await client.query('INSERT INTO app_runs VALUES($1,$2,$3,$4) ON CONFLICT(id) DO UPDATE SET payload=$4',[r.id,r.recordId,r.at,JSON.stringify(r)]);}
  async function mutate(fn){const client=await pool.connect();try{await client.query('BEGIN');await client.query('SELECT pg_advisory_xact_lock(7483100)');const db=await read(client);const result=fn(db);await save(client,db);await client.query('COMMIT');return result;}catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}}
  // Import once into an empty PostgreSQL database; keep the original JSON untouched.
  const old=await legacy();await mutate(db=>{if(!db.records.length){db.records=old.records;db.runs=old.runs;}});
  return {kind:'PostgreSQL',read,mutate,close:()=>pool.end()};
}

