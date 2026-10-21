import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const base=process.env.APP_URL||'http://127.0.0.1:3100';
const before=await fetch(base+'/api/state').then(r=>r.json());
const start=Date.now(),file=await readFile(new URL('./test-results/label.png',import.meta.url));
const response=await fetch(base+'/api/photo-draft',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({file:{name:'sentetik-etiket.png',base64:file.toString('base64')}}),signal:AbortSignal.timeout(190000)});
const result=await response.json();assert.ok(response.ok,JSON.stringify(result));assert.equal(result.reviewRequired,true);assert.equal(result.draft.lot,'LOT-2026-052');assert.equal(result.draft.quantity,25);assert.equal(result.draft.unit,'kg');
const after=await fetch(base+'/api/state').then(r=>r.json());assert.deepEqual(after.records,before.records);
console.log(JSON.stringify({seconds:Math.round((Date.now()-start)/100)/10,recordUnchanged:true,...result},null,2));
