import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ORBIT_LIMIT,MAX_POLAR} from '../gallery-config.mjs';
test('active camera limits permit controlled inspection',()=>{assert.equal(ORBIT_LIMIT,7);assert.ok(MAX_POLAR>1&&MAX_POLAR<Math.PI/2);});
