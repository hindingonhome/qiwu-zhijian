import test from 'node:test';
import assert from 'node:assert/strict';
import {dominantColors,flatColorBands} from '../swatch-style.mjs';
test('flat icons select up to five real dominant colors by weight',()=>{assert.deepEqual(dominantColors(['ff0000','00ff00','0000ff','ffffff','000000','ffff00'],[.1,.3,.2,.15,.05,.2]),['00ff00','0000ff','ffff00','ffffff','ff0000']);assert.deepEqual(dominantColors(['ff0000','ff0000','ffffff'],[.2,.3,.4]),['ff0000','ffffff']);});
test('flat color bands are hard-edged horizontal strips, never shaded spheres',()=>{const value=flatColorBands(['ff0000','0000ff']);assert.equal(value,'linear-gradient(to bottom,#ff0000 0% 50%,#0000ff 50% 100%)');assert.equal(flatColorBands(['b87333']),'#b87333');});
