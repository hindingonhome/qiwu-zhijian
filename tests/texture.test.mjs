import {test} from 'node:test';
import assert from 'node:assert/strict';
import {makeTileable} from '../texture.mjs';
test('high contrast RGBA becomes periodic on both boundaries without modifying source',()=>{
 const w=32,h=24, data=Uint8ClampedArray.from({length:w*h*4},(_,i)=>(i*53+Math.floor(i/128)*71)%256);
 const original=data.slice(), result=makeTileable(data,w,h,.35);
 assert.deepEqual(data,original); assert.equal(result.length,data.length);
 for(let y=0;y<h;y++)for(let c=0;c<4;c++)assert.equal(result[(y*w)*4+c],result[(y*w+w-1)*4+c]);
 for(let x=0;x<w;x++)for(let c=0;c<4;c++)assert.equal(result[x*4+c],result[((h-1)*w+x)*4+c]);
 assert.ok(result.some((v,i)=>v!==data[i]));
});
test('uniform transparent image stays uniform',()=>{
 const data=Uint8ClampedArray.from({length:8*8*4},(_,i)=>[20,40,60,120][i%4]);
 assert.deepEqual(makeTileable(data,8,8,.3),data);
});
test('invalid dimensions are rejected',()=>{
 assert.throws(()=>makeTileable(new Uint8ClampedArray(4),0,1,.3));
 assert.throws(()=>makeTileable(new Uint8ClampedArray(4),8,8,.3));
});
