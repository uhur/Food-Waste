import {test} from 'node:test';
import assert from 'node:assert/strict';
import {decodeUpload,MAX_FILE} from './uploads.mjs';
test('dosya uzantısı güvenilir kabul edilmez',()=>assert.throws(()=>decodeUpload({name:'foto.jpg',base64:Buffer.from('<script>bad</script>').toString('base64')})));
test('boş ve geçersiz base64 reddedilir',()=>{for(const base64 of ['','not base64%','===='])assert.throws(()=>decodeUpload({name:'a.png',base64}));});
test('boyut sınırı sunucuda uygulanır',()=>assert.throws(()=>decodeUpload({name:'a.png',base64:Buffer.alloc(MAX_FILE+1).toString('base64')})));
test('pdf imzası tespit edilir ve dosya adı temizlenir',()=>{const f=decodeUpload({name:'belge\r\n.pdf',base64:Buffer.from('%PDF-1.7\n%%EOF').toString('base64')});assert.equal(f.mime,'application/pdf');assert.equal(f.name,'belge__.pdf');});
test('PNG içeriği dosya uzantısından bağımsız tanınır',()=>{const bytes=Buffer.from([137,80,78,71,13,10,26,10]);assert.equal(decodeUpload({name:'test.dat',base64:bytes.toString('base64')}).mime,'image/png');});
