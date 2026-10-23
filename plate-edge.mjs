import {Vector4} from 'three';
export function plateProjectionBounds(positions,indices){
 let minX=Infinity,maxX=-Infinity,minZ=Infinity,maxZ=-Infinity;const ids=indices||Array.from({length:positions.length/3},(_,i)=>i);
 for(const i of ids){minX=Math.min(minX,positions[i*3]);maxX=Math.max(maxX,positions[i*3]);minZ=Math.min(minZ,positions[i*3+2]);maxZ=Math.max(maxZ,positions[i*3+2]);}
 const center=[(minX+maxX)/2,(minZ+maxZ)/2],half=[Math.max((maxX-minX)/2,1e-6),Math.max((maxZ-minZ)/2,1e-6)];let radius=0;for(const i of ids)radius=Math.max(radius,Math.hypot((positions[i*3]-center[0])/half[0],(positions[i*3+2]-center[1])/half[1]));return {center,half,radius:Math.max(radius,1e-6)};
}
export function applyPlateEdgeFinish(material,geometry){
 const bounds=geometry.userData.plateProjectionBounds??=plateProjectionBounds(geometry.attributes.position.array,geometry.index?.array),prior=material.onBeforeCompile,key=material.customProgramCacheKey();
 material.onBeforeCompile=shader=>{prior(shader);shader.uniforms.plateTopBounds={value:new Vector4(bounds.center[0],bounds.center[1],1/(bounds.half[0]*bounds.radius),1/(bounds.half[1]*bounds.radius))};shader.vertexShader='uniform vec4 plateTopBounds;varying vec2 plateTopPoint;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nplateTopPoint=(position.xz-plateTopBounds.xy)*plateTopBounds.zw;');shader.fragmentShader='varying vec2 plateTopPoint;\n'+shader.fragmentShader;
 const blend='float plateRimGrain=sin(plateTopPoint.x*431.)*sin(plateTopPoint.y*397.);float plateRimBlend=smoothstep(.963+plateRimGrain*.0008,.998,length(plateTopPoint));';
 shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n'+blend+'diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.6938718,.4178851,.05951124),plateRimBlend);').replace('#include <normal_fragment_begin>','metalnessFactor=mix(metalnessFactor,.78,plateRimBlend);roughnessFactor=mix(roughnessFactor,.44+plateRimGrain*.012,plateRimBlend);\n#include <normal_fragment_begin>');
 };material.customProgramCacheKey=()=>key+'-plate-rim-feather-v1';
}
