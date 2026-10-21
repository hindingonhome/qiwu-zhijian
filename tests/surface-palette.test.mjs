import test from 'node:test';import assert from 'node:assert/strict';
import {paletteColors,nextDensity} from '../surface-palette.mjs';
import {fruitPaletteUniforms} from '../fruit-flow.mjs';
test('color presets preserve band count and leave original colors unchanged',()=>{const colors=['112233','445566','778899'];assert.deepEqual(paletteColors(colors,'original'),colors);const warm=paletteColors(colors,'warm');assert.equal(warm.length,colors.length);assert.notDeepEqual(warm,colors);assert.deepEqual(colors,['112233','445566','778899']);});
test('try again only returns an effective different supported density',()=>{for(let current=1;current<=10;current++){for(const random of [0,.5,.999999]){const next=nextDensity(current,()=>random);assert.ok(next>=1&&next<=10&&next!==current);}}});
test('procedural recoloring changes only color uniforms, retaining band thresholds',()=>{const original=fruitPaletteUniforms('apple'),cool=fruitPaletteUniforms('apple','cool');assert.notDeepEqual(cool.fruitColors.value,original.fruitColors.value);assert.deepEqual(cool.fruitEnds.value,original.fruitEnds.value);assert.deepEqual(cool.fruitInnerEnabled,original.fruitInnerEnabled);});
