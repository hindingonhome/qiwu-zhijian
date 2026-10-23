import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as core from '../texture-studio-core.mjs';
test('smart gold protects bright gold but keeps ochre editable',()=>{
 const data=new Uint8ClampedArray([...Array.from({length:40},()=>[244,214,58,255]).flat(),...Array.from({length:40},()=>[168,112,23,255]).flat()]);
 const t=core.goldThreshold(data);assert.ok(core.isGold(244,214,58,{protect:true,mode:'smart',threshold:t}));assert.equal(core.isGold(168,112,23,{protect:true,mode:'smart',threshold:t}),false);assert.equal(core.isGold(244,214,58,{protect:false}),false);
});
test('image recoloring retains alpha, excludes protected gold from clustering',()=>{
 const data=new Uint8ClampedArray([240,208,40,255, 190,20,30,255, 10,30,180,255, 0,0,0,0]);
 const analyzed=core.analyzePixels(data,4,1,{count:4,protect:true,mode:'strict'});
 const out=core.recolorPixels(analyzed,['#00ff00','#ff00ff','#ffffff','#000000'],'#e6be3c',true);
 assert.equal(out[3],0);assert.equal(out[15],0);assert.ok(analyzed.palette.every(c=>c!=='#f0d028'));
});
test('vector modes map fixed regions and keep gold independent with safe colors',()=>{
 const master={viewBox:'0 0 8000 8000',base:{white:'M0 0H8V8Z',green:'M1 1H2',red:'M2 2H3',blue:'M3 3H4',black:'M4 4H5'},six:{white:'M0 0H8V8Z',green:'M1 1H2',ochre:'M5 5H6',red:'M2 2H3',blue:'M3 3H4',black:'M4 4H5'},gold:'M6 6H7'};
 const svg=core.vectorSvg(master,{count:4,colors:['#ffffff','#ff0000','#0000ff','#000000'],gold:'#e6be3c',line:12,transparent:true,size:1024});
 assert.ok(svg.includes('width="1024"'));assert.ok(svg.includes('stroke-width="12"'));assert.equal((svg.match(/fill="#0000ff"/g)||[]).length,2);assert.ok(!svg.includes('id="goldVisible"'));assert.throws(()=>core.vectorSvg(master,{count:4,colors:['bad']}));
});
test('palette swaps keep locks attached to slots and randomization skips locked colors',()=>{
 const palette=['#ffffff','#000000','#ff0000'],locks=[true,false,false];
 assert.deepEqual(core.randomPalette(palette,locks,()=>.5),['#ffffff','#800000','#800000']);assert.deepEqual(core.swapColors(palette,0,2),['#ff0000','#000000','#ffffff']);assert.deepEqual(palette,['#ffffff','#000000','#ff0000']);
});
test('PNG print density writes one valid pHYs chunk even after a second export',()=>{
 const source=readFileSync(new URL('../assets/thumbs/plate.png',import.meta.url)),bytes=core.pngDpi(core.pngDpi(source,400),800),chunks=[];
 for(let p=8;p+12<=bytes.length;){const view=new DataView(bytes.buffer,bytes.byteOffset+p),length=view.getUint32(0),type=Buffer.from(bytes.subarray(p+4,p+8)).toString();if(type==='pHYs')chunks.push({x:view.getUint32(8),y:view.getUint32(12),unit:bytes[p+16]});p+=12+length;}
 assert.deepEqual(chunks,[{x:Math.round(800/.0254),y:Math.round(800/.0254),unit:1}]);
});
