import test from 'node:test';
import assert from 'node:assert/strict';
import {VASE_PROFILE_IDS} from '../vase-textures.mjs';
import {FRUIT_PROFILES} from '../fruit-profiles.mjs';
test('vase profiles follow fruit order with both generations and only production peach',()=>{
 assert.deepEqual(VASE_PROFILE_IDS.slice(0,4),['mango','mango-production','strawberry','strawberry-production']);
 assert.ok(!VASE_PROFILE_IDS.includes('peach'));
 assert.ok(VASE_PROFILE_IDS.includes('peach-production'));
 assert.ok(VASE_PROFILE_IDS.includes('apple-green'));
 assert.ok(VASE_PROFILE_IDS.includes('apple-green-production'));
 assert.equal(new Set(VASE_PROFILE_IDS).size,VASE_PROFILE_IDS.length);
 assert.deepEqual(Object.keys(FRUIT_PROFILES).filter(id=>id!=='peach').sort(),[...VASE_PROFILE_IDS].sort());
});
