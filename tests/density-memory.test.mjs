import assert from 'node:assert/strict';
import {DensityMemory} from '../density-memory.mjs';
let saved;const storage={getItem:()=>saved,setItem:(_,v)=>{saved=v;}},a=new DensityMemory(storage);
a.set('pear','production',3);a.set('pear','orange',5);a.set('apple','production',2);
const b=new DensityMemory(storage);assert.equal(b.get('pear','production'),3);assert.equal(b.get('pear','orange'),5);assert.equal(b.get('apple','production'),2);assert.equal(b.get('vase','orange'),1);
assert.doesNotThrow(()=>new DensityMemory({getItem:()=>{throw Error();},setItem:()=>{throw Error();}}).set('pear','production',4));
console.log('Density memory is separate by object/material, persistent and storage-failure tolerant');
