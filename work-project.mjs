import {artifactById} from './artifact-library.mjs';
import {FRUIT_PROFILES} from './fruit-profiles.mjs';
import {SURFACE_PALETTES} from './surface-palette.mjs';
const magic='WUPWORK1',assetLimits={model:100*1024*1024,texture:30*1024*1024,source:30*1024*1024};
const text=(s,max)=>typeof s==='string'&&s.trim().length>0&&s.length<=max;
const finite=(n,min,max)=>typeof n==='number'&&Number.isFinite(n)&&n>=min&&n<=max;
export const DESIGN_SETTING_KEYS=Object.freeze(['repeat','angle','offsetX','offsetY','color','roughness','metalness','projection','original','solid','fruitFlow','mangoLacquer','lacquerVase','fruitProfile','vaseProfile','paletteId']);
export function validateWork(input){
 if(!input||input.schemaVersion!==1||!text(input.id,100)||!/^[\w-]+$/.test(input.id)||!text(input.name,120)||!finite(input.updatedAt,0,1e16))throw Error('作品格式或版本不支持');
 const object=input.object;if(!object||!text(object.name,120)||typeof object.description!=='string'||object.description.length>2000)throw Error('作品器物资料无效');
 const custom=/^custom:[\w-]{1,80}$/.test(object.id);if(!custom&&!artifactById(object.id))throw Error('作品器物不存在');
 const assets={};for(const key of Object.keys(assetLimits)){const value=input.assets?.[key];if(value!==undefined){if(!(value instanceof Blob)||!value.size||value.size>assetLimits[key])throw Error('作品素材大小无效');assets[key]=value;}}
 if(custom&&(!assets.model||!text(object.filename,240)||! /\.(glb|gltf|stl)$/i.test(object.filename)))throw Error('作品缺少完整模型文件');
 const surface=input.surface,s=surface?.settings;if(!surface||!text(surface.id,400)||!s)throw Error('作品纹样无效');
 if(!['orange','lacquer','copper','gold','none','apple-green','production','production-green'].includes(surface.id)&&!surface.id.startsWith('custom:')&&!(surface.id.startsWith('vase-profile:')&&FRUIT_PROFILES[surface.id.slice(13)]))throw Error('作品纹样类型不支持');
 for(const [key,min,max]of [['repeat',1,10],['angle',0,270],['offsetX',-1,1],['offsetY',-1,1],['roughness',.05,1],['metalness',0,1]])if(!finite(s[key],min,max))throw Error('作品参数超出范围');
 if(!Number.isInteger(s.repeat)||!/^#[0-9a-f]{6}$/i.test(s.color)||!['uv','triplanar'].includes(s.projection)||!SURFACE_PALETTES.some(p=>p.id===(s.paletteId||'original')))throw Error('作品表面参数无效');
 for(const key of ['original','solid','fruitFlow','mangoLacquer','lacquerVase'])if(typeof s[key]!=='boolean')throw Error('作品材质状态无效');
 for(const key of ['fruitProfile','vaseProfile'])if(s[key]!=null&&!FRUIT_PROFILES[s[key]])throw Error('作品配色不存在');
 if((s.mangoLacquer||s.lacquerVase||surface.id.startsWith('custom:'))&&!assets.texture&&!s.original&&!s.solid&&!s.fruitFlow)throw Error('作品缺少纹理图片');
 const settings=Object.fromEntries(DESIGN_SETTING_KEYS.filter(k=>s[k]!==undefined).map(k=>[k,s[k]]));settings.paletteId??='original';
 let view;if(input.view){const v=input.view;view={};for(const [key,length]of [['camera',3],['target',3],['objectQuaternion',4],['spinQuaternion',4]]){if(!Array.isArray(v[key])||v[key].length!==length||!v[key].every(n=>finite(n,-100,100)))throw Error('作品视角参数无效');view[key]=[...v[key]];if(length===4&&Math.abs(Math.hypot(...v[key])-1)>.02)throw Error('作品旋转参数无效');}const light=v.lighting;view.lighting={};for(const [key,min,max]of [['brightness',.65,1.6],['fill',.35,2],['direction',-180,180],['height',-35,45]]){if(!finite(light?.[key],min,max))throw Error('作品灯光参数无效');view.lighting[key]=light[key];}if(!finite(v.speed,.03,.65)||typeof v.autoSpin!=='boolean')throw Error('作品播放参数无效');view.speed=v.speed;view.autoSpin=v.autoSpin;}
 return {schemaVersion:1,id:input.id,name:input.name,updatedAt:input.updatedAt,object:{id:object.id,name:object.name,description:object.description,...(custom?{filename:object.filename}:{})},surface:{id:surface.id,settings},...(view?{view}:{}),textureFlipY:input.textureFlipY!==false,assets};
}
export function encodeWork(input){const work=validateWork(input),assets=Object.entries(work.assets),manifest={...work,assets:Object.fromEntries(assets.map(([key,blob])=>[key,{bytes:blob.size}]))},data=new TextEncoder().encode(JSON.stringify(manifest)),header=new Uint8Array(12);header.set(new TextEncoder().encode(magic));new DataView(header.buffer).setUint32(8,data.length,true);return new Blob([header,data,...assets.map(([,blob])=>blob)],{type:'application/octet-stream'});}
export async function decodeWork(file){if(file.size<12||file.size>161*1024*1024)throw Error('作品文件大小无效');const header=await file.slice(0,12).arrayBuffer();if(new TextDecoder().decode(header.slice(0,8))!==magic)throw Error('不是物派作品文件，请勿选择藏库备份');const length=new DataView(header).getUint32(8,true);if(length>1024*1024||length+12>file.size)throw Error('作品文件头无效');const work=JSON.parse(await file.slice(12,12+length).text()),assets={};let offset=12+length;for(const [key,entry]of Object.entries(work.assets||{})){if(!Object.prototype.hasOwnProperty.call(assetLimits,key)||!entry||!Number.isSafeInteger(entry.bytes)||entry.bytes<=0||entry.bytes>assetLimits[key]||offset+entry.bytes>file.size)throw Error('作品素材不完整');assets[key]=file.slice(offset,offset+entry.bytes,key==='model'?'application/octet-stream':'image/png');offset+=entry.bytes;}if(offset!==file.size)throw Error('作品文件不完整');return validateWork({...work,assets});}
export class WorkStore{
 async connect(){if(this.db)return this.db;return new Promise((resolve,reject)=>{const request=indexedDB.open('wupai-design-works',1);request.onupgradeneeded=()=>request.result.createObjectStore('works',{keyPath:'id'});request.onblocked=()=>reject(Error('作品库被其他窗口占用'));request.onerror=()=>reject(request.error);request.onsuccess=()=>{this.db=request.result;this.db.onversionchange=()=>{this.db.close();this.db=null;};resolve(this.db);};});}
 async list(){const db=await this.connect();return new Promise((resolve,reject)=>{const r=db.transaction('works').objectStore('works').getAll();r.onsuccess=()=>resolve(r.result.sort((a,b)=>b.updatedAt-a.updatedAt));r.onerror=()=>reject(r.error);});}
 async save(input){const work=validateWork(input),db=await this.connect();return new Promise((resolve,reject)=>{const tx=db.transaction('works','readwrite');tx.objectStore('works').put(work);tx.oncomplete=()=>resolve(work);tx.onerror=tx.onabort=()=>reject(tx.error||Error('作品未能保存'));});}
}
