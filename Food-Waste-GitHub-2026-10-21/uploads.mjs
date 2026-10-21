import {createHash,randomUUID} from 'node:crypto';
import {writeFile,mkdir,unlink} from 'node:fs/promises';
export const MAX_FILE=8*1024*1024;
export function decodeUpload(input){
  if(!input || typeof input.name!=='string' || !input.name.trim() || input.name.length>180)throw new Error('Geçerli dosya adı gerekiyor.');
  if(typeof input.base64!=='string' || input.base64.length>Math.ceil(MAX_FILE/3)*4 || !/^[A-Za-z0-9+/]*={0,2}$/.test(input.base64))throw new Error('Geçersiz veya çok büyük dosya.');
  const bytes=Buffer.from(input.base64,'base64');
  if(!bytes.length || bytes.length>MAX_FILE)throw new Error('Dosya en fazla 8 MB olabilir.');
  let mime,ext;
  if(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))){mime='image/png';ext='png';}
  else if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255){mime='image/jpeg';ext='jpg';}
  else if(bytes.subarray(0,5).toString()==='%PDF-'){mime='application/pdf';ext='pdf';}
  else if(bytes.subarray(0,4).toString()==='RIFF'&&bytes.subarray(8,12).toString()==='WEBP'){mime='image/webp';ext='webp';}
  else throw new Error('Yalnızca JPEG, PNG, WebP ve PDF desteklenir.');
  return {bytes,mime,ext,name:input.name.replace(/[\r\n\x00-\x1f]/g,'_')};
}
export async function persistUploads(inputs=[]){
  if(!Array.isArray(inputs)||inputs.length>4)throw new Error('Bir işlemde en fazla 4 dosya yüklenebilir.');
  const validated=inputs.map(decodeUpload),root=new URL('./data/documents/',import.meta.url);await mkdir(root,{recursive:true});
  const saved=[];
  try{for(const f of validated){const id=randomUUID(),key=`${id}.${f.ext}`;await writeFile(new URL(key,root),f.bytes,{flag:'wx'});saved.push({id,key,name:f.name,mime:f.mime,bytes:f.bytes.length,sha256:createHash('sha256').update(f.bytes).digest('hex'),createdAt:new Date().toISOString()});}return saved;}catch(e){await cleanupUploads(saved);throw e;}
}
export async function cleanupUploads(files){await Promise.all(files.map(f=>unlink(new URL('./data/documents/'+f.key,import.meta.url)).catch(()=>{})));}
