import {FRUIT_PROFILES} from './fruit-profiles.mjs';
const linear=c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4;
const rgb=hex=>[0,2,4].map(i=>linear(parseInt(hex.slice(i,i+2),16)/255));
const v3=hex=>'vec3('+rgb(hex).map(v=>v.toFixed(8)).join(',')+')';
export const effectiveDensity=(kind,value=1)=>(FRUIT_PROFILES[kind]?.baseDensity||1)*value;
export function flowValue(x,y,z,density=1){const p=[x,y,z].map(v=>v*8.8*density),q=[p[0]+.8*(Math.sin(p[1]*1.4)+.45*Math.cos(p[2]*1.8)),p[1]+.8*(Math.sin(p[2]*1.3)+.45*Math.cos(p[0]*1.7)),p[2]+.8*(Math.sin(p[0]*1.2)+.45*Math.cos(p[1]*1.6))];const f=Math.sin(q[0])*Math.cos(q[1])+.72*Math.sin(q[1]+q[2])+.35*Math.cos(q[2]*1.6-q[0]*.4),v=f*.55+.31;return v-Math.floor(v);}
function paletteCode(profile,name){return `vec3 ${name}(float t){float edge=max(.0006,min(.008,fwidth(t)*.55));vec3 color=${v3(profile.bands[0].color)};\n`+profile.bands.slice(0,-1).map((band,i)=>`color=mix(color,${v3(profile.bands[i+1].color)},smoothstep(${band.end.toFixed(7)}-edge,${band.end.toFixed(7)}+edge,t));`).join('\n')+'\nreturn color;}';}
export function fruitPaletteUniforms(kind){
 const profile=FRUIT_PROFILES[kind]||FRUIT_PROFILES.mango,colors=new Float32Array(24),ends=new Float32Array(8);
 if(profile.bands.length>8)throw new Error('纹样色带超过 8 层，请扩展共享调色板容量');
 for(let i=0;i<8;i++){const band=profile.bands[Math.min(i,profile.bands.length-1)];colors.set(rgb(band.color),i*3);ends[i]=i<profile.bands.length?Number(band.end.toFixed(7)):2;}
 return {fruitColors:{value:colors},fruitEnds:{value:ends},fruitInnerEnabled:{value:kind==='banana'||kind==='banana-production'?1:0}};
}
export function buildFruitShader(){return `
varying vec3 fruitPosition; varying float fruitCoat; varying float fruitInner; uniform float fruitDensity;
float fruitField(vec3 p){p*=8.8;vec3 q=p+.8*vec3(sin(p.y*1.4)+.45*cos(p.z*1.8),sin(p.z*1.3)+.45*cos(p.x*1.7),sin(p.x*1.2)+.45*cos(p.y*1.6));float f=sin(q.x)*cos(q.y)+.72*sin(q.y+q.z)+.35*cos(q.z*1.6-q.x*.4);return fract(f*.55+.31);}
float fruitCopper(vec3 p){
 p*=8.8;vec3 q=p+.8*vec3(sin(p.y*1.4)+.45*cos(p.z*1.8),sin(p.z*1.3)+.45*cos(p.x*1.7),sin(p.x*1.2)+.45*cos(p.y*1.6));float a=q.z*1.6-q.x*.4;
 float f=sin(q.x)*cos(q.y)+.72*sin(q.y+q.z)+.35*cos(a);
 vec3 d=vec3(cos(q.x)*cos(q.y)+.14*sin(a),-sin(q.x)*sin(q.y)+.72*cos(q.y+q.z),.72*cos(q.y+q.z)-.56*sin(a));
 vec3 g=vec3(d.x-.612*sin(p.x*1.7)*d.y+.96*cos(p.x*1.2)*d.z,d.y+1.12*cos(p.y*1.4)*d.x-.576*sin(p.y*1.6)*d.z,d.z-.648*sin(p.z*1.8)*d.x+1.04*cos(p.z*1.3)*d.y);
 mat3 J=mat3(vec3(1.,-.612*sin(p.x*1.7),.96*cos(p.x*1.2)),vec3(1.12*cos(p.y*1.4),1.,-.576*sin(p.y*1.6)),vec3(-.648*sin(p.z*1.8),1.04*cos(p.z*1.3),1.));
 float hxx=-sin(q.x)*cos(q.y)-.056*cos(a),hyy=-sin(q.x)*cos(q.y)-.72*sin(q.y+q.z),hzz=-.72*sin(q.y+q.z)-.896*cos(a),hxy=-cos(q.x)*sin(q.y),hxz=.224*cos(a),hyz=-.72*sin(q.y+q.z);
 mat3 Hq=mat3(vec3(hxx,hxy,hxz),vec3(hxy,hyy,hyz),vec3(hxz,hyz,hzz));mat3 H=transpose(J)*Hq*J;
 H[0][0]+=d.y*(-1.0404*cos(p.x*1.7))+d.z*(-1.152*sin(p.x*1.2));H[1][1]+=d.x*(-1.568*sin(p.y*1.4))+d.z*(-.9216*cos(p.y*1.6));H[2][2]+=d.x*(-1.1664*cos(p.z*1.8))+d.y*(-1.352*sin(p.z*1.3));
 float minor=H[0][0]*H[1][1]-H[0][1]*H[0][1];float definite=step(0.000001,minor)*step(0.000001,H[0][0]*determinant(H));
 return (1.0-smoothstep(.10,.14,dot(g,g)))*smoothstep(1.16,1.20,abs(f))*definite*fruitCoat;
}
uniform vec3 fruitColors[8];uniform float fruitEnds[8];uniform float fruitInnerEnabled;
vec3 fruitPalette(float t){float edge=max(.0006,min(.008,fwidth(t)*.55));vec3 color=fruitColors[0];for(int i=1;i<8;i++){color=mix(color,fruitColors[i],smoothstep(fruitEnds[i-1]-edge,fruitEnds[i-1]+edge,t));}return color;}
${paletteCode(FRUIT_PROFILES['banana-blue'],'innerPalette')}
vec3 fruitColor(float t){vec3 c=fruitPalette(t);if(fruitInnerEnabled>.5)c=mix(c,innerPalette(t),fruitInner);return c;}
`;}
