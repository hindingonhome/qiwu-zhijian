import test from 'node:test';import assert from 'node:assert/strict';
import {encodeBackup,decodeBackup,configurationState} from '../library-backup.mjs';
const state={version:1,collections:[{id:'ceramics',name:'瓷器'}],models:[{id:'cup',collectionId:'ceramics',name:'杯',filename:'cup.glb',description:'自己的模型',blob:new Blob(['binary model'])}]};
test('full backup restores original binary model and preferences',async()=>{const file=encodeBackup(state,{language:'en',theme:'dark'});const restored=await decodeBackup(file);assert.equal(await restored.state.models[0].blob.text(),'binary model');assert.equal(restored.preferences.language,'en');});
test('configuration restore preserves existing models and unrelated collections',()=>{const restored=configurationState(state,{collections:[{id:'new',name:'新派'}]});assert.equal(restored.models.length,1);assert.equal(restored.collections.length,2);});
test('corrupted backup is rejected before replacing library',async()=>{await assert.rejects(decodeBackup(new Blob(['not a backup'])));const file=encodeBackup(state,{});await assert.rejects(decodeBackup(file.slice(0,file.size-2)));});
