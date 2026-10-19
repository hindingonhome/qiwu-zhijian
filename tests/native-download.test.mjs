import test from 'node:test';
import assert from 'node:assert/strict';
import {installNativeDownloads} from '../mobile/native-download.mjs';

test('native export preserves binary data across encoding chunks and cancellation',async()=>{
 const bytes=Uint8Array.from({length:70001},(_,i)=>i%256),url=URL.createObjectURL(new Blob([bytes],{type:'model/gltf-binary'}));
 try{
  installNativeDownloads({save:async args=>{assert.equal(args.name,'模型.glb');assert.equal(args.mime,'model/gltf-binary');assert.deepEqual(Buffer.from(args.base64,'base64'),Buffer.from(bytes));return {cancelled:true};}});
  assert.deepEqual(await globalThis.QIWU_NATIVE_DOWNLOAD(url,'模型.glb'),{cancelled:true});
 }finally{URL.revokeObjectURL(url);delete globalThis.QIWU_NATIVE_DOWNLOAD;}
});

test('native export rejects failed asset reads before opening the save dialog',async()=>{
 const previous=globalThis.fetch;let called=false;
 globalThis.fetch=async()=>new Response('missing',{status:404});
 installNativeDownloads({save:async()=>{called=true;}});
 try{await assert.rejects(globalThis.QIWU_NATIVE_DOWNLOAD('https://localhost/missing','model.glb'),/404/);assert.equal(called,false);}
 finally{globalThis.fetch=previous;delete globalThis.QIWU_NATIVE_DOWNLOAD;}
});
