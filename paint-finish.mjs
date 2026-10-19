// Shared defaults also apply to future imported models and local images.
export const PAINT_FINISH=Object.freeze({roughness:.34,metalness:0,clearcoat:.32,clearcoatRoughness:.24,ior:1.48,copperRoughness:.27});
export const paintGrain=(x,y,z)=>.5+.24*Math.sin(x*193+y*127)*Math.sin(y*211-z*163)+.16*Math.sin(z*317+x*251);
export function applyPaintFinish(material,geometry){
 material.clearcoat=PAINT_FINISH.clearcoat;material.clearcoatRoughness=PAINT_FINISH.clearcoatRoughness;material.ior=PAINT_FINISH.ior;
 geometry.computeBoundingBox();const b=geometry.boundingBox,c=b.min.clone().add(b.max).multiplyScalar(.5),d=b.max.clone().sub(b.min),unit=1/Math.max(d.x,d.y,d.z);
 const prior=material.onBeforeCompile,key=material.customProgramCacheKey();
 material.onBeforeCompile=shader=>{
  prior(shader);shader.uniforms.paintOrigin={value:c};shader.uniforms.paintUnit={value:unit};
  shader.vertexShader='uniform vec3 paintOrigin;uniform float paintUnit;varying vec3 paintPoint;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\npaintPoint=(position-paintOrigin)*paintUnit;');
  shader.fragmentShader='varying vec3 paintPoint;\nfloat paintGrain(vec3 p){return .5+.24*sin(p.x*193.+p.y*127.)*sin(p.y*211.-p.z*163.)+.16*sin(p.z*317.+p.x*251.);}\nvec3 paintNormal(vec3 pos,vec3 n,float h){vec3 dx=dFdx(pos),dy=dFdy(pos),r1=cross(dy,n),r2=cross(n,dx);float det=dot(dx,r1);return normalize(max(abs(det),1e-10)*n-sign(det)*(dFdx(h)*r1+dFdy(h)*r2));}\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nfloat paintPixel=max(length(dFdx(paintPoint)),length(dFdy(paintPoint)));float paintDetail=1.-smoothstep(.002,.009,paintPixel);float grain=paintGrain(paintPoint);roughnessFactor=clamp(roughnessFactor+(grain-.5)*.055*paintDetail,.12,1.);');
  shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>','#include <normal_fragment_maps>\nnormal=paintNormal(-vViewPosition,normal,(paintGrain(paintPoint)-.5)*.00012*(1.-smoothstep(.001,.005,max(length(dFdx(paintPoint)),length(dFdy(paintPoint))))));');
 };
 material.customProgramCacheKey=()=>key+'-sprayed-copper-v1';
}
