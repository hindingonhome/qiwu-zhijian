import {PAINT_FINISH,applyPaintFinish} from './paint-finish.mjs';
import {exportCurrentModel} from './model-export.mjs';
import {LIGHT_DEFAULTS} from './lighting.mjs';
import {RectAreaLightUniformsLib} from 'three/addons/lights/RectAreaLightUniformsLib.js';
import * as THREE from 'three';
import {buildFruitShader,effectiveDensity,fruitPaletteUniforms} from './fruit-flow.mjs';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {RGBELoader} from 'three/addons/loaders/RGBELoader.js';
import {createArtifact,normalizeArtifact} from './models.mjs';
import {artifactById} from './artifact-library.mjs';
import {STLLoader} from 'three/addons/loaders/STLLoader.js';
import {ORBIT_LIMIT,MAX_POLAR} from './gallery-config.mjs';

const assetURL=path=>globalThis.MUSEUM_ASSETS?.[path]||path;
RectAreaLightUniformsLib.init();

export class GalleryViewer{
 constructor(container,report){
  this.container=container;this.report=report;this.token=0;this.meshes=[];this.modelCache=new Map();this.lighting={...LIGHT_DEFAULTS};this.settings={repeat:1,angle:0,offsetX:0,offsetY:0,projection:'uv',roughness:PAINT_FINISH.roughness,metalness:0,color:'#e7e0cf',original:false};
  this.renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=.95;container.append(this.renderer.domElement);
  this.scene=new THREE.Scene();
  this.camera=new THREE.PerspectiveCamera(38,1,.05,60);this.controls=new OrbitControls(this.camera,this.renderer.domElement);this.controls.enableDamping=false;this.controls.rotateSpeed=.45;this.controls.zoomSpeed=.65;this.controls.enablePan=false;this.controls.minDistance=.75;this.controls.maxDistance=ORBIT_LIMIT;this.controls.minPolarAngle=.24;this.controls.maxPolarAngle=MAX_POLAR;this.controls.autoRotateSpeed=.65;this.dirty=true;this.controls.addEventListener('change',()=>{this.dirty=true;});
  this.makeLighting();this.setLight();this.reset();this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(container);this.resize();
  this.brass={};const tl=new THREE.TextureLoader();this.brassReady=Promise.all(['color','normal','roughness','metalness'].map(async name=>{const t=await tl.loadAsync(assetURL(`./assets/brass/${name}.jpg`));if(name==='color')t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(2,2);this.brass[name]=t;})).then(()=>this.updateMaterial()).catch(()=>this.report('黄铜贴图未加载，使用黄铜参数材质。'));
  this.controls.mouseButtons={LEFT:null,MIDDLE:THREE.MOUSE.DOLLY,RIGHT:null};this.bindGestures();
  this.clock=new THREE.Clock();this.renderer.setAnimationLoop(()=>{const dt=Math.min(this.clock.getDelta(),.05);this.controls.update(dt);if(this.switching)return;if(this.autoSpin&&this.spinPivot)this.spinPivot.rotation.y+=dt*(this.autoSpinSpeed??.12);if(this.dirty||this.autoSpin){this.renderer.render(this.scene,this.camera);this.dirty=false;}});
  const pmrem=new THREE.PMREMGenerator(this.renderer);
  new RGBELoader().load(assetURL('./assets/museum.hdr'),hdr=>{const env=pmrem.fromEquirectangular(hdr);this.scene.environment=env.texture;this.updateLighting();this.dirty=true;hdr.dispose();pmrem.dispose();},undefined,()=>{pmrem.dispose();this.report('HDR 未加载，当前使用展厅灯光。');});
  this.renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();this.report('三维上下文中断，请刷新页面恢复。',true);});
 }
 makeLighting(kind='vase'){
  if(this.lights){this.lights.traverse(o=>{o.shadow?.map?.dispose();o.shadow?.mapPass?.dispose();});this.scene.remove(this.lights);this.disposeRoot(this.lights);}
  this.lights=new THREE.Group();this.scene.add(this.lights);
  this.setTheme(this.theme||'light');this.scene.fog=null;
  this.hemi=new THREE.HemisphereLight('#f3f2e9','#666156',1.6);this.lights.add(this.hemi);
  this.key=new THREE.SpotLight('#fff4e2',45,18,Math.PI/5,.8,1.5);this.key.position.set(-2.4,5.4,3);this.key.target.position.set(0,1.4,0);this.key.castShadow=true;this.key.shadow.mapSize.set(1024,1024);this.key.shadow.bias=-.00015;this.key.shadow.normalBias=.025;this.lights.add(this.key,this.key.target);
  this.fill=new THREE.DirectionalLight('#e5e9e8',.3);this.fill.position.set(3,3,2);this.lights.add(this.fill);this.rim=new THREE.DirectionalLight('#e5dcc8',.35);this.rim.position.set(-1,3,-2);this.lights.add(this.rim);
  this.softbox=new THREE.RectAreaLight('#fff8ec',3.2,3.5,4);this.softbox.position.set(-3,3.5,4);this.softbox.lookAt(0,1,0);this.lights.add(this.softbox);this.softFill=new THREE.RectAreaLight('#edf2ff',1.6,2.5,3);this.softFill.position.set(3,2,1);this.softFill.lookAt(0,1,0);this.lights.add(this.softFill);this.dirty=true;
 }
 resize(){const w=this.container.clientWidth,h=this.container.clientHeight;if(!w||!h)return;const style=getComputedStyle(this.container),top=parseFloat(style.getPropertyValue('--stage-safe-top'))||110,bottom=parseFloat(style.getPropertyValue('--stage-safe-bottom'))||230,safeHeight=Math.max(160,h-top-bottom);this.camera.setViewOffset(w,safeHeight,0,-top,w,h);this.renderer.setSize(w,h,false);this.dirty=true;}
 bindGestures(){
  const canvas=this.renderer.domElement;let gesture;const touches=new Set();this.controls.touches.ONE=null;
  canvas.addEventListener('contextmenu',e=>e.preventDefault());
  canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'){touches.add(e.pointerId);if(touches.size>1){gesture=null;return;}}else if(e.pointerType!=='mouse'||![0,2].includes(e.button))return;this.isDragging=true;this.autoSpin=false;window.dispatchEvent(new Event('spinchange'));gesture={id:e.pointerId,button:e.pointerType==='touch'?0:e.button,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(!gesture||gesture.id!==e.pointerId)return;const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y;gesture.x=e.clientX;gesture.y=e.clientY;
   if(gesture.button===0&&this.artifactPivot){const movement=new THREE.Vector3(dy,dx,0),distance=movement.length();if(distance){movement.normalize();const turn=new THREE.Quaternion().setFromAxisAngle(movement,distance*.0026),frame=this.spinPivot.quaternion;turn.premultiply(frame.clone().invert()).multiply(frame);this.artifactPivot.quaternion.premultiply(turn).normalize();}}
   else if(gesture.button===2){this.updateLighting({direction:THREE.MathUtils.euclideanModulo(this.lighting.direction-dx*.2+180,360)-180,height:THREE.MathUtils.clamp(this.lighting.height-dy*.15,-35,45)});}this.dirty=true;
  });
  const end=e=>{touches.delete(e.pointerId);if(gesture?.id===e.pointerId){gesture=null;this.isDragging=false;}if(!touches.size&&!gesture)this.isDragging=false;};canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);canvas.addEventListener('lostpointercapture',end);
 }
 reset(){this.autoSpin=false;window.dispatchEvent(new Event('spinchange'));if(this.spinPivot)this.spinPivot.rotation.set(0,0,0);if(this.artifactPivot)this.artifactPivot.rotation.set(0,0,0);const h=this.root?.userData.height||1.8;this.controls.target.set(0,h/2,0);this.camera.position.set(0,h/2+.14,this.camera.aspect<.7?4.5:3.9);this.controls.update();this.dirty=true;}
 setTheme(theme){this.theme=theme;this.scene.background=new THREE.Color(theme==='light'?'#f5f5f7':'#101012');this.dirty=true;}
 setLight(){this.updateLighting();}
 updateLighting(values={}){
  Object.assign(this.lighting,values);const s=this.lighting;this.renderer.toneMappingExposure=.95*s.brightness;this.key.color.set('#fffaf2');this.key.intensity=7;this.fill.color.set('#e5edf5');this.fill.intensity=.6*s.fill;this.hemi.intensity=.4*s.fill;this.softFill.intensity=1.6*s.fill;this.scene.environmentIntensity=.55*s.fill;
  const target=this.key.target.position;for(const [light,base]of [[this.key,[-2.4,5.4,3]],[this.softbox,[-3,3.5,4]]]){const spherical=new THREE.Spherical().setFromVector3(new THREE.Vector3(...base).sub(target));spherical.theta+=THREE.MathUtils.degToRad(s.direction);spherical.phi=THREE.MathUtils.clamp(spherical.phi-THREE.MathUtils.degToRad(s.height),.12,2.8);light.position.copy(new THREE.Vector3().setFromSpherical(spherical).add(target));if(light.isRectAreaLight)light.lookAt(0,1,0);}
  this.dirty=true;window.dispatchEvent(new Event('lightingchange'));
 }
 disposeRoot(root){const gs=new Set(),ms=new Set(),ts=new Set();root.traverse(m=>{if(!m.isMesh)return;gs.add(m.geometry);for(const mat of [m.material,m.userData.originalMaterial,m.userData.editMaterial,...(m.userData.materialCache?.values()||[])].flat().filter(Boolean)){ms.add(mat);for(const value of Object.values(mat))if(value?.isTexture&&value!==this.texture&&!Object.values(this.brass||{}).includes(value)&&!Object.values(this.lacquerMaps||{}).includes(value))ts.add(value);}});gs.forEach(g=>g.dispose());ms.forEach(m=>m.dispose());ts.forEach(t=>t.dispose());}
 detachRoot(){if(!this.root)return;this.scene.remove(this.spinPivot);if(![...this.modelCache.values()].some(entry=>entry.root===this.root))this.disposeRoot(this.root);}
 install(raw){
  const root=normalizeArtifact(raw),meshes=[];root.traverse(m=>{if(m.isMesh){m.castShadow=m.receiveShadow=true;m.userData.originalMaterial=Array.isArray(m.material)?m.material.map(mat=>mat.clone()):m.material.clone();for(const mat of [m.userData.originalMaterial].flat()){mat.transparent=false;mat.opacity=1;mat.transmission=0;mat.alphaMap=null;mat.depthWrite=true;mat.needsUpdate=true;}meshes.push(m);}});
  if(!meshes.length){this.disposeRoot(root);throw new Error('模型中没有网格');}
  this.detachRoot();this.root=root;this.meshes=meshes;this.artifactPivot=new THREE.Group();this.spinPivot=new THREE.Group();this.spinPivot.position.y=root.userData.height/2;this.spinPivot.add(this.artifactPivot);root.position.y=-root.userData.height/2;this.artifactPivot.add(root);this.scene.add(this.spinPivot);this.settings.original=false;
  this.reset();this.updateMaterial();
  const info={meshes:meshes.length,hasUV:meshes.filter(m=>!m.userData.keepOriginalMaterial&&!m.userData.plainInterior).every(m=>!!m.geometry.attributes.uv),procedural:raw.userData.procedural};
  if(this.currentKind!=='custom'){this.modelCache.set(this.currentKind,{root,meshes,artifactPivot:this.artifactPivot,spinPivot:this.spinPivot,info});while(this.modelCache.size>(navigator.maxTouchPoints?2:3)){const key=this.modelCache.keys().next().value,entry=this.modelCache.get(key);this.modelCache.delete(key);this.disposeRoot(entry.root);}}
  return info;
 }
 async select(kind){
  this.currentKind=kind;const token=++this.token;let raw;
  if(this.modelCache.has(kind)){const entry=this.modelCache.get(kind);this.detachRoot();this.modelCache.delete(kind);this.modelCache.set(kind,entry);Object.assign(this,{root:entry.root,meshes:entry.meshes,artifactPivot:entry.artifactPivot,spinPivot:entry.spinPivot});this.scene.add(this.spinPivot);this.settings.projection=artifactById(kind)?.projection||'uv';this.reset();this.updateMaterial();return entry.info;}
  if(kind==='vase'){try{raw=(await new GLTFLoader().loadAsync(assetURL('./assets/vase.glb'))).scene;}catch{raw=createArtifact('vase');this.report('原花瓶加载失败，已使用示意花瓶。',true);}}
  else{const path=artifactById(kind)?.asset;if(!path)throw new Error('未找到这个器物');raw=(await new GLTFLoader().loadAsync(assetURL(path))).scene;}
  if(token!==this.token){this.disposeRoot(raw);return null;}
  if(kind==='vase'&&!raw.userData.procedural){raw.traverse(m=>{if(!m.isMesh)return;m.userData.plainInterior=m.material.name==='材质.008';
   if(!m.userData.plainInterior&&m.geometry.attributes.uv){const uv=m.geometry.attributes.uv,pos=m.geometry.attributes.position,adapt=uv.clone();let u0=Infinity,u1=-Infinity,v0=Infinity,v1=-Infinity;for(let i=0;i<uv.count;i++){u0=Math.min(u0,uv.getX(i));u1=Math.max(u1,uv.getX(i));v0=Math.min(v0,uv.getY(i));v1=Math.max(v1,uv.getY(i));}const seams=new Map();for(let i=0;i<uv.count;i++){adapt.setXY(i,(uv.getX(i)-u0)/(u1-u0),(uv.getY(i)-v0)/(v1-v0));if(Math.abs(uv.getX(i)-u0)<1e-5||Math.abs(uv.getX(i)-u1)<1e-5){const key=[pos.getX(i),pos.getY(i),pos.getZ(i)].map(v=>v.toFixed(3)).join(',');if(!seams.has(key))seams.set(key,[]);seams.get(key).push(i);}}for(const ids of seams.values()){const v=ids.reduce((sum,i)=>sum+adapt.getY(i),0)/ids.length;ids.forEach(i=>adapt.setY(i,v));}m.geometry.setAttribute('surfaceUv',adapt);}
   for(const mat of [m.material].flat()){mat.transparent=false;mat.opacity=1;mat.transmission=0;mat.depthWrite=true;mat.side=THREE.FrontSide;mat.needsUpdate=true;}});this.settings.projection='uv';}
  raw.traverse(m=>{if(m.isMesh)m.userData.keepOriginalMaterial=/^(Gold_|Accent_)/.test(m.material?.name||'');});
  const profile=artifactById(kind);this.settings.projection=profile?.projection||'uv';
  if(profile?.pose){raw.updateMatrixWorld(true);const center=new THREE.Box3().setFromObject(raw).getCenter(new THREE.Vector3());raw.position.sub(center);const posed=new THREE.Group();posed.rotation.set(...profile.pose,'ZYX');posed.add(raw);raw=posed;}
  return this.install(raw);
 }
 async importModel(file){
  if(file.size>100*1024*1024)throw new Error('模型超过 100 MB，请先精简模型。');
  this.currentKind='custom';this.settings.fruitFlow=false;this.settings.solid=false;this.settings.mangoLacquer=false;this.settings.lacquerVase=false;this.settings.roughness=PAINT_FINISH.roughness;this.settings.metalness=0;const token=++this.token,data=await file.arrayBuffer();
  if(file.name.toLowerCase().endsWith('.stl')){const geometry=new STLLoader().parse(data);geometry.computeVertexNormals();const raw=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:'#ffffff',roughness:.45}));if(token!==this.token){geometry.dispose();return null;}this.settings.projection='triplanar';return this.install(raw);}
  if(file.name.toLowerCase().endsWith('.gltf')){
   const json=JSON.parse(new TextDecoder().decode(data));
   if([...json.buffers||[],...json.images||[]].some(v=>v.uri&&!v.uri.startsWith('data:')))throw new Error('这个 GLTF 引用了外部文件，请打包导出为 GLB 后导入。');
  }else{
   const view=new DataView(data);if(data.byteLength<20||view.getUint32(0,true)!==0x46546c67)throw new Error('不是有效的 GLB 文件。');
   let pos=12,json;
   while(pos+8<=data.byteLength){const len=view.getUint32(pos,true),type=view.getUint32(pos+4,true);if(pos+8+len>data.byteLength)throw new Error('GLB 数据不完整');if(type===0x4e4f534a)json=JSON.parse(new TextDecoder().decode(new Uint8Array(data,pos+8,len)));pos+=8+len;}
   if(!json)throw new Error('GLB 缺少场景描述');if([...json.buffers||[],...json.images||[]].some(v=>v.uri&&!v.uri.startsWith('data:')))throw new Error('GLB 含外部引用，请导出完整打包模型。');
  }
  const result=await new GLTFLoader().parseAsync(file.name.toLowerCase().endsWith('.gltf')?new TextDecoder().decode(data):data,'');
  if(token!==this.token){this.disposeRoot(result.scene);return null;}result.scene.traverse(m=>{if(m.isMesh)m.userData.keepOriginalMaterial=/^(Gold_|Accent_)/.test(m.material?.name||'');});this.settings.projection='uv';return this.install(result.scene);
 }
 setTexture(canvas){
  if(canvas&&this.texture?.image===canvas){this.settings.original=false;this.updateMaterial();return;}
  if(this.texture)this.texture.dispose();this.texture=canvas?new THREE.CanvasTexture(canvas):null;
  if(this.texture){this.texture.colorSpace=THREE.SRGBColorSpace;this.texture.wrapS=this.texture.wrapT=THREE.RepeatWrapping;this.texture.anisotropy=this.renderer.capabilities.getMaxAnisotropy();}
  this.settings.original=false;this.updateMaterial();
 }
 useMangoAtlas(){const body=this.meshes.find(m=>!m.userData.keepOriginalMaterial&&m.userData.originalMaterial?.map);if(!body)throw new Error('芒果专用纹样未找到');const atlas=body.userData.originalMaterial.map.clone();if(this.texture)this.texture.dispose();this.texture=atlas;atlas.needsUpdate=true;this.updateMaterial({fruitFlow:false,mangoLacquer:true,fruitProfile:'mango',lacquerVase:false,solid:false,original:false,repeat:1,color:'#ffffff',roughness:PAINT_FINISH.roughness,metalness:0});}
 async prepareLacquerMaps(){if(this.lacquerMaps)return;const loader=new THREE.TextureLoader();const maps=await Promise.all(['metalness','roughness'].map(n=>loader.loadAsync(assetURL('./assets/friend/lacquer-'+n+'.png'))));this.lacquerMaps={metalness:maps[0],roughness:maps[1]};for(const t of maps){t.flipY=true;t.wrapS=t.wrapT=THREE.RepeatWrapping;}}
 updateMaterial(settings={}){
  Object.assign(this.settings,settings);if(settings.fruitFlow===true||settings.solid===true)this.settings.lacquerVase=false;this.dirty=true;const s={...this.settings};
  if(this.texture){this.texture.repeat.set(s.repeat,s.repeat);this.texture.center.set(.5,.5);this.texture.rotation=s.angle*Math.PI/180;this.texture.offset.set(s.offsetX,s.offsetY);this.texture.updateMatrix();}
  if(s.lacquerVase&&this.texture)for(const map of Object.values(this.lacquerMaps||{})){map.repeat.copy(this.texture.repeat);map.center.copy(this.texture.center);map.offset.copy(this.texture.offset);map.rotation=this.texture.rotation;map.updateMatrix();}
  if(!this.root)return;this.root.updateMatrixWorld(true);const inverse=new THREE.Matrix4().copy(this.root.matrixWorld).invert();
  for(const mesh of this.meshes){
   if(mesh.userData.keepOriginalMaterial){mesh.material=mesh.userData.originalMaterial;continue;}
   if(s.original){mesh.material=mesh.userData.originalMaterial;continue;}
   const cache=mesh.userData.materialCache??=new Map(),signature=JSON.stringify([s,this.texture?.uuid||'',!!this.brass.color]);
   if(cache.has(signature)){mesh.material=cache.get(signature);mesh.userData.editMaterial=mesh.material;continue;}
   const interior=!!mesh.userData.plainInterior;
   const material=new THREE.MeshPhysicalMaterial({color:interior?(this.brass.color?'#ffffff':'#bf983f'):s.color,roughness:interior?.55:s.roughness,metalness:interior?1:s.metalness,clearcoat:0,clearcoatRoughness:Math.max(.2,s.roughness),map:interior?this.brass.color:(s.solid||s.fruitFlow?null:this.texture),normalMap:interior?this.brass.normal:null,roughnessMap:interior?this.brass.roughness:(s.lacquerVase?this.lacquerMaps?.roughness:null),metalnessMap:interior?this.brass.metalness:(s.lacquerVase?this.lacquerMaps?.metalness:null),envMapIntensity:interior?.7:(s.solid?2:1),side:THREE.FrontSide,transparent:false,opacity:1,transmission:0,depthWrite:true});
   if(!interior&&mesh.geometry.attributes.surfaceUv&&s.projection==='uv'){material.onBeforeCompile=shader=>{shader.vertexShader='attribute vec2 surfaceUv;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\n#ifdef USE_MAP\nvMapUv=(mapTransform*vec3(surfaceUv,1.0)).xy;\n#endif\n#ifdef USE_METALNESSMAP\nvMetalnessMapUv=(metalnessMapTransform*vec3(surfaceUv,1.0)).xy;\n#endif\n#ifdef USE_ROUGHNESSMAP\nvRoughnessMapUv=(roughnessMapTransform*vec3(surfaceUv,1.0)).xy;\n#endif');};material.customProgramCacheKey=()=> 'surface-uv-adapt';}
   if(s.projection==='triplanar'&&this.texture&&!interior){
    const localMatrix=new THREE.Matrix4().multiplyMatrices(inverse,mesh.matrixWorld),normalMatrix=new THREE.Matrix3().getNormalMatrix(localMatrix);
    material.onBeforeCompile=shader=>{
     shader.uniforms.artifactMatrix={value:localMatrix};shader.uniforms.artifactNormalMatrix={value:normalMatrix};shader.uniforms.tileScale={value:s.repeat};shader.uniforms.tileAngle={value:s.angle*Math.PI/180};shader.uniforms.tileOffset={value:new THREE.Vector2(s.offsetX,s.offsetY)};
     shader.vertexShader='uniform mat4 artifactMatrix; uniform mat3 artifactNormalMatrix; varying vec3 artifactPosition; varying vec3 artifactNormal;\n'+shader.vertexShader;
     shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nartifactPosition=(artifactMatrix*vec4(position,1.0)).xyz; artifactNormal=normalize(artifactNormalMatrix*normal);');
     shader.fragmentShader='uniform float tileScale; uniform float tileAngle; uniform vec2 tileOffset; varying vec3 artifactPosition; varying vec3 artifactNormal;\nvec2 tileUV(vec2 p){ float c=cos(tileAngle),s=sin(tileAngle);return mat2(c,-s,s,c)*(p*tileScale)+tileOffset; }\n'+shader.fragmentShader;
     shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#ifdef USE_MAP
      vec3 weights=pow(abs(normalize(artifactNormal)),vec3(4.0));weights=weights.x>=weights.y&&weights.x>=weights.z?vec3(1.0,0.0,0.0):(weights.y>=weights.z?vec3(0.0,1.0,0.0):vec3(0.0,0.0,1.0));
      vec4 sampledDiffuseColor=texture2D(map,tileUV(artifactPosition.yz))*weights.x+texture2D(map,tileUV(artifactPosition.xz))*weights.y+texture2D(map,tileUV(artifactPosition.xy))*weights.z;
      diffuseColor*=sampledDiffuseColor;
      #endif`);
    };
    material.customProgramCacheKey=()=>`artifact-triplanar-${s.repeat}-${s.angle}-${s.offsetX}-${s.offsetY}`;
   }
   if(s.fruitFlow&&!interior&&!s.solid){
    const profile=this.settings.fruitProfile||this.currentKind;
    mesh.geometry.computeBoundingBox();const box=mesh.geometry.boundingBox,origin=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3()),unit=1/Math.max(size.x,size.y,size.z);
    if(!mesh.geometry.attributes.coatMask){const count=mesh.geometry.attributes.position.count;mesh.geometry.setAttribute('coatMask',mesh.geometry.attributes._coat_mask||new THREE.Float32BufferAttribute(new Float32Array(count).fill(1),1));mesh.geometry.setAttribute('innerMask',mesh.geometry.attributes._inner_mask||new THREE.Float32BufferAttribute(new Float32Array(count),1));}
    material.clearcoat=PAINT_FINISH.clearcoat;material.clearcoatRoughness=PAINT_FINISH.clearcoatRoughness;
    material.onBeforeCompile=shader=>{
     Object.assign(shader.uniforms,fruitPaletteUniforms(profile));shader.uniforms.fruitOrigin={value:origin};shader.uniforms.fruitUnit={value:unit};shader.uniforms.fruitDensity={value:effectiveDensity(profile,s.repeat)};
     shader.vertexShader='attribute float coatMask;attribute float innerMask; varying float fruitCoat;varying float fruitInner;varying vec3 fruitPosition; uniform vec3 fruitOrigin; uniform float fruitUnit;\n'+shader.vertexShader;
     shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nfruitPosition=(position-fruitOrigin)*fruitUnit;fruitCoat=coatMask;fruitInner=innerMask;');
     shader.fragmentShader=buildFruitShader(profile)+shader.fragmentShader;
     shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`float fruitGold=1.0-fruitCoat;float fruitCopperAmount=fruitCopper(fruitPosition*fruitDensity);float fruitMetalMask=max(fruitCopperAmount,fruitGold);vec3 fruitBase=fruitColor(fruitField(fruitPosition*fruitDensity));fruitBase=mix(fruitBase,vec3(.4793202,.1714411,.03310477),fruitCopperAmount);fruitBase=mix(fruitBase,vec3(.6938718,.4178851,.05951124),fruitGold);diffuseColor.rgb*=fruitBase;`);
     shader.fragmentShader=shader.fragmentShader.replace('#include <metalnessmap_fragment>','#include <metalnessmap_fragment>\nmetalnessFactor=mix(metalnessFactor,.95,fruitMetalMask);');
     shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,.27,fruitMetalMask);');
    };material.customProgramCacheKey=()=> 'fruit-shared-palette-v2';
   }
   // Painted accessory masks remain gold for every body finish and imported pattern.
   if(!s.fruitFlow&&!interior&&mesh.geometry.attributes._coat_mask){
    mesh.geometry.setAttribute('accessoryCoat',mesh.geometry.attributes._coat_mask);const prior=material.onBeforeCompile,priorKey=material.customProgramCacheKey();
    material.onBeforeCompile=shader=>{prior(shader);shader.vertexShader='attribute float accessoryCoat;varying float accessoryGold;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\naccessoryGold=1.0-accessoryCoat;');shader.fragmentShader='varying float accessoryGold;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.rgb=mix(diffuseColor.rgb,vec3(.6938718,.4178851,.05951124),accessoryGold);').replace('#include <metalnessmap_fragment>','#include <metalnessmap_fragment>\nmetalnessFactor=mix(metalnessFactor,.95,accessoryGold);').replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,.27,accessoryGold);');};material.customProgramCacheKey=()=>priorKey+'-gold-mask';
   }
   if(!interior&&!s.solid)applyPaintFinish(material,mesh.geometry);
   mesh.material=material;mesh.userData.editMaterial=material;
   cache.set(signature,material);while(cache.size>8){const key=cache.keys().next().value;cache.get(key).dispose();cache.delete(key);}
  }
 }
 capture(){this.renderer.render(this.scene,this.camera);return this.renderer.domElement.toDataURL('image/png');}
 exportModel(){return exportCurrentModel(this);}
}
