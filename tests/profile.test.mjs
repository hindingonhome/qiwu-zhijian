import assert from 'node:assert/strict';
import {FRUIT_PROFILES} from '../fruit-profiles.mjs';
import {effectiveDensity} from '../fruit-flow.mjs';
assert.equal(effectiveDensity('mango',1),3);
assert.equal(effectiveDensity('mango',2),6);
for(const [id,p] of Object.entries(FRUIT_PROFILES)){
 assert.ok(p.colors.length>=4,id);
 assert.ok(Math.abs(p.weights.reduce((a,b)=>a+b,0)-1)<.00001,id);
 assert.ok(p.colors.every(c=>/^[0-9a-f]{6}$/i.test(c)),id);
 assert.ok(p.bands.every((v,i,a)=>i===0||v.end>a[i-1].end),id);
 assert.equal(p.bands.at(-1).end,1);
}
assert.ok(FRUIT_PROFILES.strawberry.colors.includes('f12a2a'));
assert.ok(FRUIT_PROFILES.apple.colors.includes('e82626'));
assert.ok(FRUIT_PROFILES['apple-green'].colors.includes('0daf1b'));
assert.equal(FRUIT_PROFILES.peach.source,'new-production-PPT');
assert.deepEqual(FRUIT_PROFILES.peach.colors,FRUIT_PROFILES['peach-production'].colors);
console.log('RGB profiles, area weights and mango base density passed');
