import {pngDpi} from './texture-studio-core.mjs';
import * as THREE from 'three';
import {zipSync,strToU8} from 'three/addons/libs/fflate.module.js';
import {buildFruitShader,fruitPaletteUniforms} from './fruit-flow.mjs';
import {FRUIT_PROFILES} from './fruit-profiles.mjs';
import {VASE_PROFILE_IDS} from './vase-textures.mjs';
export function textureExportItems(entries=[]){return [{id:'copper',name:'抛光纯铜',colors:['b87333']},{id:'gold',name:'仿金色',colors:['d9ad45']},...VASE_PROFILE_IDS.map(id=>({id:'vase-profile:'+id,name:FRUIT_PROFILES[id].name+(id.endsWith('-production')?'纹样':'原配色纹样'),colors:FRUIT_PROFILES[id].colors,weights:FRUIT_PROFILES[id].weights})),{id:'lacquer',name:'仿大漆肌理',colors:['d5bdbe','8a435a','d7b15c','eee0d3']},...entries.map(e=>({...e}))];}
export function createTextureExports({viewer,getTextures}){
 function list(){return textureExportItems(getTextures());}
 async function render(item,size){
  if(!item)throw Error('请选择纹理');
  if(item.blob||item.id==='vase-profile:mango'||item.id==='lacquer'){
   const image=new Image(),url=item.blob?URL.createObjectURL(item.blob):null;image.src=url||(globalThis.MUSEUM_ASSETS?.[item.id==='lacquer'?'./assets/friend/lacquer.png':'./assets/friend/orange-gold.png']||(item.id==='lacquer'?'./assets/friend/lacquer.png':'./assets/friend/orange-gold.png'));
   try{await image.decode();const c=document.createElement('canvas'),ratio=size/Math.max(image.width,image.height);c.width=Math.max(1,Math.round(image.width*ratio));c.height=Math.max(1,Math.round(image.height*ratio));c.getContext('2d').drawImage(image,0,0,c.width,c.height);return c;}finally{if(url)URL.revokeObjectURL(url);}
  }
  const canvas=document.createElement('canvas');canvas.width=canvas.height=size;
  if(!item.id.startsWith('vase-profile:')){const ctx=canvas.getContext('2d');ctx.fillStyle='#'+item.colors[0];ctx.fillRect(0,0,size,size);return canvas;}
  // A flat slice of the same 3D procedural field, independent of model UV and lighting.
  const material=new THREE.ShaderMaterial({uniforms:fruitPaletteUniforms(item.id.slice(13)),vertexShader:'varying vec2 sliceUv; varying vec3 fruitPosition; varying float fruitCoat; varying float fruitInner; void main(){sliceUv=uv;fruitPosition=position;fruitCoat=1.;fruitInner=0.;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:`varying vec2 sliceUv;${buildFruitShader()}void main(){vec3 p=vec3(sliceUv*2.-1.,0.)*3.;gl_FragColor=vec4(fruitPalette(fruitField(p)),1.);\n#include <colorspace_fragment>\n}`,depthTest:false,depthWrite:false});
  material.fragmentShader=material.fragmentShader.replace(';#include',';\n#include');
  const geometry=new THREE.PlaneGeometry(2,2),scene=new THREE.Scene(),mesh=new THREE.Mesh(geometry,material);mesh.frustumCulled=false;scene.add(mesh);
  const renderer=viewer.renderer,target=new THREE.WebGLRenderTarget(size,size),oldTarget=renderer.getRenderTarget(),oldColor=renderer.getClearColor(new THREE.Color()),oldAlpha=renderer.getClearAlpha(),oldXr=renderer.xr.enabled;target.texture.colorSpace=THREE.SRGBColorSpace;
  try{renderer.xr.enabled=false;renderer.setRenderTarget(target);renderer.setClearColor(0,0);renderer.clear();renderer.render(scene,new THREE.Camera());const bytes=new Uint8Array(size*size*4);renderer.readRenderTargetPixels(target,0,0,size,size,bytes);const ctx=canvas.getContext('2d'),data=ctx.createImageData(size,size),stride=size*4;for(let y=0;y<size;y++)data.data.set(bytes.subarray((size-y-1)*stride,(size-y)*stride),y*stride);ctx.putImageData(data,0,0);return canvas;}finally{renderer.setRenderTarget(oldTarget);renderer.setClearColor(oldColor,oldAlpha);renderer.xr.enabled=oldXr;target.dispose();geometry.dispose();material.dispose();viewer.dirty=true;}
 }
 async function archive(size,dpi,onProgress=()=>{}){size=Math.min(size,2048);const items=list(),files={},manifest=[];let totalBytes=0;for(const [index,item]of items.entries()){onProgress(index+1,items.length);const canvas=await render(item,size),blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('纹理生成失败')),'image/png'));const name=String(index+1).padStart(2,'0')+'-'+item.name.replace(/[<>:"/\\|?*\x00-\x1f]/g,'_').slice(0,100)+'.png';totalBytes+=blob.size;if(totalBytes>160*1024*1024)throw Error('纹理包超过 160 MB，请降低分辨率或逐张导出');files[name]=new Uint8Array(pngDpi(await blob.arrayBuffer(),dpi));manifest.push({file:name,id:item.id,name:item.name});await new Promise(resolve=>setTimeout(resolve,0));}files['纹理清单.json']=strToU8(JSON.stringify({note:'内置三维程序纹样导出为平面切片，模型 UV 烘焙请使用 GLB 导出。',textures:manifest},null,2));return new Blob([zipSync(files,{level:0})],{type:'application/zip'});}
 return {list,render,archive};
}
