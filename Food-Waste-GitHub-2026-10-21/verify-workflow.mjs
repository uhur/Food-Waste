import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const base=process.env.APP_URL||'http://127.0.0.1:3100';
async function get(path){const response=await fetch(base+path);assert.equal(response.status,200);return response.json();}
async function post(path,data){const response=await fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const value=await response.json();assert.ok(response.ok,JSON.stringify(value));return value;}
const before=await get('/api/state');assert.equal(before.storage,'PostgreSQL');
const bytes=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jmZkAAAAASUVORK5CYII=','base64');
const record=await post('/api/records',{lot:'TEST-'+Date.now(),product:'Sentetik arşiv testi',quantity:10,unit:'kg',issue:'Yalnızca geliştirme testi. Gerçek ürün değildir.',source:'photo',attachments:[{name:'sentetik-test.png',base64:bytes.toString('base64')}]});
assert.equal(record.attachments.length,1);
const attachment=record.attachments[0];
assert.equal(attachment.sha256,createHash('sha256').update(bytes).digest('hex'));
const downloaded=await fetch(base+'/api/documents/'+attachment.id);assert.equal(downloaded.status,200);assert.deepEqual(Buffer.from(await downloaded.arrayBuffer()),bytes);
await post('/api/decision',{id:record.id,type:'Atığa ayırma',reason:'Sentetik test kararı.'});
await post('/api/delivery',{id:record.id,quantity:10,receiver:'Örnek test firması',reference:'TEST-BELGE',date:'2026-10-21'});
const after=await get('/api/state'),saved=after.records.find(r=>r.id===record.id);
assert.equal(saved.status,'Kapandı');assert.equal(saved.history.length,3);assert.equal(saved.attachments[0].id,attachment.id);
assert.ok(before.records.every(r=>after.records.some(x=>x.id===r.id)));
console.log('PostgreSQL: eski kayıtlar korundu; fotoğraflı kayıt, belge indirme ve SHA-256, karar, teslim, kapanmış kayıt geçmişi geçti. Sentetik test kaydı: '+record.lot);
