import * as THREE from 'three';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';

// Export standard PBR maps, rather than losing the live shader's pattern and copper masks.
function pixelsToCanvas(bytes,size){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=size;
 const context=canvas.getContext('2d'),image=context.createImageData(size,size),stride=size*4;
 for(let y=0;y<size;y++)image.data.set(bytes.subarray((size-y-1)*stride,(size-y)*stride),y*stride);
 // Extend island edges for mipmaps without changing their interior colors.
 let data=image.data;
 for(let pass=0;pass<4;pass++){
  const next=new Uint8ClampedArray(data);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){const i=(y*size+x)*4;if(data[i+3])continue;
   for(const [dx,dy]of [[-1,0],[1,0],[0,-1],[0,1]]){const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=size||yy>=size)continue;const j=(yy*size+xx)*4;if(data[j+3]){next.set(data.subarray(j,j+4),i);break;}}
  }data=next;
 }
 image.data.set(data);context.putImageData(image,0,0);return canvas;
}
function atlasGeometry(source){
 let geometry=source.clone();
 if(!geometry.attributes.uv){
  const flat=geometry.index?geometry.toNonIndexed():geometry; if(flat!==geometry)geometry.dispose();geometry=flat;
  const count=geometry.attributes.position.count,cells=Math.ceil(Math.sqrt(count/3)),uv=new Float32Array(count*2);
  for(let i=0;i<count;i+=3){const x=(i/3)%cells,y=Math.floor(i/3/cells),pad=.12;
   uv.set([(x+pad)/cells,(y+pad)/cells,(x+1-pad)/cells,(y+pad)/cells,(x+pad)/cells,(y+1-pad)/cells],i*2);}
  geometry.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 }
 return geometry;
}
function bake(renderer,geometry,source,size,packed){
 const material=source.clone(),hook=source.onBeforeCompile;
 material.toneMapped=false;material.side=THREE.DoubleSide;material.depthTest=false;material.depthWrite=false;material.transparent=false;material.blending=THREE.NoBlending;
 material.onBeforeCompile=shader=>{
  hook(shader);
  shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\ngl_Position=vec4(uv*2.0-1.0,0.0,1.0);');
  shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',packed?'gl_FragColor=vec4(0.0,roughnessFactor,metalnessFactor,1.0);':'gl_FragColor=vec4(diffuseColor.rgb,1.0);')
   .replace('#include <tonemapping_fragment>','').replace('#include <fog_fragment>','').replace('#include <premultiplied_alpha_fragment>','').replace('#include <dithering_fragment>','');
 };
 material.customProgramCacheKey=()=>source.customProgramCacheKey()+'-export-'+packed;
 const scene=new THREE.Scene(),mesh=new THREE.Mesh(geometry,material);mesh.frustumCulled=false;scene.add(mesh);
 const target=new THREE.WebGLRenderTarget(size,size);target.texture.colorSpace=packed?THREE.NoColorSpace:THREE.SRGBColorSpace;
 try{renderer.setRenderTarget(target);renderer.clear();renderer.render(scene,new THREE.Camera());const bytes=new Uint8Array(size*size*4);renderer.readRenderTargetPixels(target,0,0,size,size,bytes);return pixelsToCanvas(bytes,size);}
 finally{target.dispose();material.dispose();}
}
export async function exportCurrentModel(viewer){
 if(!viewer.root)throw new Error('尚未载入器物');
 const renderer=viewer.renderer,oldTarget=renderer.getRenderTarget(),oldColor=renderer.getClearColor(new THREE.Color()),oldAlpha=renderer.getClearAlpha(),exportRoot=viewer.root.clone(true),resources=[];
 const originals=[];viewer.root.traverse(o=>{if(o.isMesh)originals.push(o);});let index=0;
 try{
  renderer.setClearColor(0,0);
  exportRoot.traverse(mesh=>{
   mesh.userData={};if(!mesh.isMesh)return;const original=originals[index++];
   const geometry=atlasGeometry(original.geometry);mesh.geometry=geometry;resources.push(geometry);
   if(!original.userData.keepOriginalMaterial&&!original.userData.plainInterior&&!viewer.settings.original){
    if(geometry.attributes.surfaceUv&&viewer.settings.projection==='uv')geometry.setAttribute('uv',geometry.attributes.surfaceUv.clone());
    const size=2048,source=original.material;
    if(Array.isArray(source))throw new Error('此多材质模型请先拆分网格后导出');
    const color=new THREE.CanvasTexture(bake(renderer,geometry,source,size,false)),packed=new THREE.CanvasTexture(bake(renderer,geometry,source,size,true));
    color.colorSpace=THREE.SRGBColorSpace;color.flipY=packed.flipY=true;
    const material=new THREE.MeshPhysicalMaterial({color:0xffffff,map:color,roughness:1,metalness:1,roughnessMap:packed,metalnessMap:packed,clearcoat:source.clearcoat,clearcoatRoughness:source.clearcoatRoughness,ior:source.ior,side:source.side});
    mesh.material=material;resources.push(color,packed,material);
   }else{mesh.material=Array.isArray(original.material)?original.material.map(m=>m.clone()):original.material.clone();resources.push(...[mesh.material].flat());}
   // GPU-only source attributes are baked into ordinary UV maps above.
   for(const name of Object.keys(geometry.attributes))if(!['position','normal','uv','uv1','color','tangent','skinIndex','skinWeight'].includes(name))geometry.deleteAttribute(name);
  });
  exportRoot.name='器物之间-'+viewer.currentKind;
  exportRoot.updateMatrixWorld(true);
  renderer.setRenderTarget(oldTarget);renderer.setClearColor(oldColor,oldAlpha);viewer.dirty=true;
  return await new GLTFExporter().parseAsync(exportRoot,{binary:true,onlyVisible:true,maxTextureSize:4096});
 }finally{renderer.setRenderTarget(oldTarget);renderer.setClearColor(oldColor,oldAlpha);resources.forEach(resource=>resource.dispose());viewer.dirty=true;}
}
