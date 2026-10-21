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
test('large native exports use bounded chunks and close the output stream',async()=>{const source=new Uint8Array(9*1024*1024+17).fill(57),oldFetch=globalThis.fetch;let bytes=0,finished=false;try{globalThis.fetch=async()=>new Response(source);installNativeDownloads({async startSave(){return {id:'stream'}},async appendSave({id,base64}){assert.equal(id,'stream');const chunk=Buffer.from(base64,'base64');assert.ok(chunk.length<=262144);assert.equal(chunk[0],57);bytes+=chunk.length;},async finishSave(){finished=true;return {saved:true}}});await globalThis.QIWU_NATIVE_DOWNLOAD('blob:test','library.wupai');assert.equal(bytes,source.length);assert.ok(finished);}finally{globalThis.fetch=oldFetch;}});
test('large native export cancellation does not start transferring data',async()=>{const previous=globalThis.fetch;let transferred=false;try{globalThis.fetch=async()=>new Response(new Uint8Array(9*1024*1024));installNativeDownloads({async startSave(){return {cancelled:true}},async appendSave(){transferred=true}});assert.deepEqual(await globalThis.QIWU_NATIVE_DOWNLOAD('blob:test','library.wupai'),{cancelled:true});assert.equal(transferred,false);}finally{globalThis.fetch=previous;}});
test('large native transfer failure aborts the partially written output',async()=>{const previous=globalThis.fetch;let aborted=false;try{globalThis.fetch=async()=>new Response(new Uint8Array(9*1024*1024));installNativeDownloads({async startSave(){return {id:'failed'}},async appendSave(){throw Error('disk full')},async abortSave({id}){assert.equal(id,'failed');aborted=true}});await assert.rejects(globalThis.QIWU_NATIVE_DOWNLOAD('blob:test','library.wupai'),/disk full/);assert.equal(aborted,true);}finally{globalThis.fetch=previous;}});
