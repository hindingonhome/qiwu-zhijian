import assert from 'node:assert/strict';
import {PAINT_FINISH,paintGrain} from '../paint-finish.mjs';
assert.equal(PAINT_FINISH.metalness,0);
assert.ok(PAINT_FINISH.roughness>=.3&&PAINT_FINISH.clearcoatRoughness>=.2);
assert.ok(PAINT_FINISH.copperRoughness>PAINT_FINISH.roughness*.65);
assert.equal(paintGrain(.2,.3,.4),paintGrain(.2,.3,.4));
console.log('Shared paint defaults distinguish dielectric paint, copper and subtle stable grain');
