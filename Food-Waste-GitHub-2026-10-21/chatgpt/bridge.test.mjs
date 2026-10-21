import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,unlink,rmdir,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createBridge} from './bridge.mjs';
const input={title:'Sentetik bağlantı testi',description:'Yalnızca test verisidir.',category:'Öneri',page:'feedback',consent:true,request_id:'test_request_01'};
async function fixture(fn){
  const dir=await mkdtemp(join(tmpdir(),'foodwaste-mcp-test-')),scopeFile=pathToFileURL(join(dir,'scope.json'));
  const state={records:[{secret:'Müşteri belgesi'}],feedback:[{id:'outside',title:'Özel müşteri verisi',description:'Aktarılmamalı'}],feedbackJobs:[],feedbackTasks:[]};let created=0,requests=0;
  const bridge=createBridge({scopeFile,request:async(url,options)=>{
    requests++;if(url.pathname==='/api/state')return Response.json(state);
    if(url.pathname==='/api/feedback'){const body=JSON.parse(options.body);assert.equal(body.consent,true);const item={...body,id:'owned',status:'Alındı',createdAt:new Date().toISOString(),internalSecret:'Gizli üst bilgi'};state.feedback.push(item);created++;return Response.json(item);}
    throw new Error('Beklenmeyen istek');
  }});
  try{await fn({bridge,scopeFile,state,get created(){return created;},get requests(){return requests;}});}
  finally{await unlink(scopeFile).catch(()=>{});await unlink(new URL(scopeFile.href+'.tmp')).catch(()=>{});await rmdir(dir);}
}
test('MCP kapsamı dışındaki kimlik veritabanı okunmadan reddedilir',async()=>fixture(async h=>{
  assert.deepEqual((await h.bridge.list()).items,[]);assert.equal(h.requests,0);
  await assert.rejects(h.bridge.get('outside'));await assert.rejects(h.bridge.start('outside'));assert.equal(h.requests,0);
}));
test('eşzamanlı aynı gönderim tek bildirim oluşturur, diğer müşteri verisi çıktıdan çıkarılır',async()=>fixture(async h=>{
  const [a,b]=await Promise.all([h.bridge.submit(input),h.bridge.submit(input)]);assert.equal(h.created,1);assert.equal(a.id,b.id);
  const result=await h.bridge.list();assert.equal(result.items.length,1);const serialized=JSON.stringify(result);
  assert.equal(serialized.includes('Gizli üst bilgi'),false);assert.equal(serialized.includes('Özel müşteri verisi'),false);assert.equal(serialized.includes('Müşteri belgesi'),false);
  await assert.rejects(h.bridge.submit({...input,title:'Farklı içerik'}));assert.equal(h.created,1);
}));
test('kapsam dosyası bozulduğunda tüm kayıtları açmak yerine işlem reddedilir',async()=>fixture(async h=>{
  await writeFile(h.scopeFile,'bozuk json');await assert.rejects(h.bridge.list());assert.equal(h.requests,0);
}));
test('harici hedef, yönlendirme adresi ve onaysız gönderim kabul edilmez',async()=>{
  assert.throws(()=>createBridge({baseURL:'https://example.com'}));assert.throws(()=>createBridge({baseURL:'http://127.0.0.1@evil.example'}));
  await fixture(async h=>{await assert.rejects(h.bridge.submit({...input,consent:false}));assert.equal(h.created,0);});
});
