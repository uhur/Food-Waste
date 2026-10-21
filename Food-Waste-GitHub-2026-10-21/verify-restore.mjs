import {readFile,mkdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import assert from 'node:assert/strict';
import pg from 'pg';
try{process.loadEnvFile();}catch(e){if(e.code!=='ENOENT')throw e;}
const uri=new URL(process.env.DATABASE_URL),adminSecret=await readFile(new URL('./.local/pg-admin-secret',import.meta.url),'utf8');
const base={host:uri.hostname,port:Number(uri.port)},admin=new pg.Client({...base,user:'fwadmin',password:adminSecret,database:'postgres'}),app=new pg.Client({connectionString:process.env.DATABASE_URL});
const database='fw_restore_test_'+Date.now(),directory=new URL('./test-results/',import.meta.url);await mkdir(directory,{recursive:true});
const dumpPath=path.join(process.cwd(),'test-results','restore-test.pgdump'),bin=path.join(process.env.LOCALAPPDATA,'FoodWaste','postgresql','bin');
function run(executable,args,password){const result=spawnSync(path.join(bin,executable),args,{env:{...process.env,PGPASSWORD:password},encoding:'utf8',windowsHide:true});if(result.status!==0)throw new Error('Veritabanı yedekleme/geri yükleme işlemi başarısız: '+result.stderr);}
let created=false,restored;
try{
  await app.connect();await admin.connect();
  const tables=['app_records','app_documents','app_runs','app_feedback','app_feedback_jobs','app_feedback_tasks'],before={};
  for(const table of tables)before[table]=(await app.query(`SELECT * FROM ${table} ORDER BY id`)).rows;
  run('pg_dump.exe',['-h',base.host,'-p',String(base.port),'-U',decodeURIComponent(uri.username),'-d',uri.pathname.slice(1),'-Fc','--no-owner','--no-acl','-f',dumpPath],decodeURIComponent(uri.password));
  await admin.query(`CREATE DATABASE "${database}"`);created=true;
  run('pg_restore.exe',['-h',base.host,'-p',String(base.port),'-U','fwadmin','-d',database,'--no-owner','--no-acl',dumpPath],adminSecret);
  restored=new pg.Client({...base,user:'fwadmin',password:adminSecret,database});await restored.connect();
  for(const table of tables)assert.deepEqual((await restored.query(`SELECT * FROM ${table} ORDER BY id`)).rows,before[table]);
  console.log(JSON.stringify({restored:true,records:before.app_records.length,documents:before.app_documents.length,runs:before.app_runs.length,comparison:'Tüm tablo satırları eşleşti; yalnızca sayılar karşılaştırılmadı.'},null,2));
}finally{await restored?.end();await app.end();if(created)await admin.query(`DROP DATABASE "${database}"`);await admin.end();}
