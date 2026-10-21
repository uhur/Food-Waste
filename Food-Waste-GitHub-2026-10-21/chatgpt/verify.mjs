import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
const client=new Client({name:'foodwaste-verification',version:'0.1.0'});
const transport=new StreamableHTTPClientTransport(new URL('http://127.0.0.1:3102/mcp'));
const read=async(name,args={})=>{const r=await client.callTool({name,arguments:args});assert.equal(r.isError,undefined,JSON.stringify(r.content));return r.structuredContent;};
await client.connect(transport);
try{
  const tools=await client.listTools();assert.equal(tools.tools.length,5);
  const blocked=await client.callTool({name:'foodwaste_get_feedback',arguments:{feedback_id:randomUUID()}});assert.equal(blocked.isError,true);
  const health=await read('foodwaste_health');assert.equal(health.application,'Food & Waste');
  const input={title:'Sentetik ChatGPT MCP bağlantı testi',description:'Bu bildirim MCP protokolünden oluşturulan sentetik bir testtir. Belge arşivinde arama yardımının daha açıklayıcı olmasını öneriyorum.',category:'Öneri',page:'documents',consent:true,request_id:randomUUID()};
  const item=await read('foodwaste_submit_feedback',input),again=await read('foodwaste_submit_feedback',input);assert.equal(item.id,again.id);
  const started=await read('foodwaste_start_review',{feedback_id:item.id});assert.ok(started.jobId);
  let result;const deadline=Date.now()+240000;
  do{await new Promise(r=>setTimeout(r,4000));result=await read('foodwaste_get_feedback',{feedback_id:item.id});}while(result.review?.status==='Çalışıyor'&&Date.now()<deadline);
  assert.equal(result.review.status,'Onay bekliyor');assert.ok(result.review.analysis);assert.ok(result.review.proposal);assert.equal(result.tasks.length,0);
  const list=await read('foodwaste_list_feedback');assert.ok(list.items.some(x=>x.id===item.id));
  const badOrigin=await fetch('http://127.0.0.1:3102/mcp',{method:'POST',headers:{Origin:'https://example.com'},body:'{}'});assert.equal(badOrigin.status,403);
  console.log(JSON.stringify({mcpVerified:true,toolCount:5,realModel:result.review.model,status:result.review.status,feedbackId:item.id,unownedAccessDenied:true,repeatedSubmitCreatesNoDuplicate:true,noTaskWithoutApproval:true,chatgptAccountActivated:false}));
}finally{await client.close();}
