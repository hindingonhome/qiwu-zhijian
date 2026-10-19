import test from 'node:test';
import assert from 'node:assert/strict';
import {verifyAssets} from '../scripts/verify-release.mjs';
const file={name:'Mango-Original.usdz',size:500,digest:'sha256:abc'},asset={...file,state:'uploaded'};
test('release requires exact filename and binary digest, not only a successful upload',()=>{
 assert.doesNotThrow(()=>verifyAssets([file],[asset]));
 assert.throws(()=>verifyAssets([file],[{...asset,name:'-.usdz'}]),/Missing or changed/);
 assert.throws(()=>verifyAssets([file],[{...asset,digest:'sha256:changed'}]),/Missing or changed/);
 assert.throws(()=>verifyAssets([file],[{...asset,state:'starter'}]),/Missing or changed/);
});
test('release rejects missing attachments and duplicate expected names',()=>{
 assert.throws(()=>verifyAssets([file],[]),/count mismatch/);
 assert.throws(()=>verifyAssets([file,file],[asset,asset]),/Duplicate/);
});
