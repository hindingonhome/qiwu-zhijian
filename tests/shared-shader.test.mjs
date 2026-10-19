import test from 'node:test';
import assert from 'node:assert/strict';
import {buildFruitShader,fruitPaletteUniforms} from '../fruit-flow.mjs';
import {FRUIT_PROFILES} from '../fruit-profiles.mjs';
import {ARTIFACTS} from '../artifact-library.mjs';
test('all fruit palettes share a GPU program including banana and density changes',()=>{
 for(const id of ['pear','apple-production','banana','peach-production','watermelon'])assert.equal(buildFruitShader('apple'),buildFruitShader(id));
});
test('shared uniforms retain every original palette and banana interior switch',()=>{
 for(const [id,profile]of Object.entries(FRUIT_PROFILES)){
  const u=fruitPaletteUniforms(id);
  assert.equal(u.fruitColors.value.length,24);
  for(let i=0;i<profile.bands.length;i++)assert.ok(Math.abs(u.fruitEnds.value[i]-profile.bands[i].end)<1e-6);
  assert.equal(u.fruitInnerEnabled.value,['banana','banana-production'].includes(id)?1:0);
 }
});
test('each artifact has one fixed thumbnail in its own first color',()=>{for(const item of ARTIFACTS)assert.equal(item.thumbnail,'./assets/thumbs/'+item.id+'.png');});
