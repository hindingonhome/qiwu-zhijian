// Adapted from the two user-supplied local pattern tools. No page scripts execute here.
// One self-contained closure also runs in a classic Blob Worker in offline packages.
export function pixelEngine(){
 const rgb=h=>{const n=parseInt(h.slice(1),16);return [n>>16&255,n>>8&255,n&255];};
 const hex=c=>'#'+c.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
 const yellow=(r,g,b)=>r>120&&g>70&&b<165&&r>=g*.82&&r>b*1.15&&g>b*1.08&&Math.max(r,g,b)-Math.min(r,g,b)>24;
 function goldThreshold(data){
  const values=[],step=Math.max(1,Math.floor(data.length/4/12000));
  for(let i=0;i<data.length;i+=4*step)if(data[i+3]>128&&yellow(data[i],data[i+1],data[i+2]))values.push(data[i]*.299+data[i+1]*.587+data[i+2]*.114);
  if(values.length<20)return 155;let low=Math.min(...values),high=Math.max(...values);
  for(let pass=0;pass<12;pass++){let a=0,b=0,ac=0,bc=0;for(const v of values)if(Math.abs(v-low)<=Math.abs(v-high)){a+=v;ac++;}else{b+=v;bc++;}if(ac)low=a/ac;if(bc)high=b/bc;}
  return high-low>=32?Math.max(145,Math.min(195,(low+high)/2)):155;
 }
 function isGold(r,g,b,{protect=true,mode='smart',threshold=155}={}){if(!protect||!yellow(r,g,b))return false;const luma=r*.299+g*.587+b*.114;return mode==='relaxed'||(mode==='strict'?luma>=180&&r>=185&&g>=145:luma>=threshold&&r>=165&&g>=120);}
 function extractPalette(data,count,options={}){
  if(!Number.isInteger(count)||count<4||count>7)throw Error('色数应为 4–7');
  const points=[],step=Math.max(1,Math.floor(data.length/4/3000));
  for(let i=0;i<data.length;i+=step*4)if(data[i+3]>128&&!isGold(data[i],data[i+1],data[i+2],options))points.push([data[i],data[i+1],data[i+2]]);
  if(!points.length)return Array(count).fill('#ffffff');
  // Deterministic farthest-point seeding avoids palette flicker on re-analysis.
  let centers=[points[0].slice()];const distance=(a,b)=>(a[0]-b[0])**2+(a[1]-b[1])**2+(a[2]-b[2])**2;
  while(centers.length<count){let best=points[0],d=-1;for(const p of points){const value=Math.min(...centers.map(c=>distance(p,c)));if(value>d){d=value;best=p;}}centers.push(best.slice());}
  for(let pass=0;pass<15;pass++){const sums=centers.map(()=>[0,0,0,0]);for(const p of points){let idx=0,d=Infinity;centers.forEach((c,j)=>{const v=distance(p,c);if(v<d){d=v;idx=j;}});for(let c=0;c<3;c++)sums[idx][c]+=p[c];sums[idx][3]++;}let changed=false;centers=centers.map((c,j)=>{const next=sums[j][3]?sums[j].slice(0,3).map(v=>Math.round(v/sums[j][3])):c;if(next.some((v,i)=>v!==c[i]))changed=true;return next;});if(!changed)break;}
  return centers.sort((a,b)=>(b[0]*.299+b[1]*.587+b[2]*.114)-(a[0]*.299+a[1]*.587+a[2]*.114)).map(hex);
 }
 function analyzePixels(data,width,height,options={}){
  if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||width*height>16777216||data.length!==width*height*4)throw Error('图片尺寸无效或过大');
  const count=options.count||5,opts={...options,threshold:goldThreshold(data)},palette=extractPalette(data,count,opts),anchors=palette.map(rgb),length=width*height,hard=new Uint8Array(length),mask=new Uint8Array(length),map=new Uint8Array(length),alpha=new Uint8Array(length);
  for(let i=0;i<length;i++){const p=i*4;hard[i]=data[p+3]>128&&isGold(data[p],data[p+1],data[p+2],opts)?255:0;}
  // The source tool expands and softens the protected edges. Restrict expansion to
  // yellow candidates: a bright line must not eat a neighboring red/white region.
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){const i=y*width+x,p=i*4;mask[i]=hard[i];if(!hard[i]&&yellow(data[p],data[p+1],data[p+2])){for(let yy=Math.max(0,y-1);yy<=Math.min(height-1,y+1);yy++)for(let xx=Math.max(0,x-1);xx<=Math.min(width-1,x+1);xx++)if(hard[yy*width+xx])mask[i]=255;}}
  for(let i=0;i<length;i++){const p=i*4;alpha[i]=data[p+3];if(mask[i]){map[i]=255;continue;}let d=Infinity,best=0;anchors.forEach((c,j)=>{const v=(data[p]-c[0])**2+(data[p+1]-c[1])**2+(data[p+2]-c[2])**2;if(v<d){d=v;best=j;}});map[i]=best;}
  return {width,height,palette,map,alpha,threshold:opts.threshold};
 }
 function recolorPixels(image,colors,gold='#e6be3c',transparent=false){const palette=colors.map(rgb),line=rgb(gold),out=new Uint8ClampedArray(image.map.length*4);for(let i=0;i<image.map.length;i++){const protectedLine=image.map[i]===255,c=protectedLine?line:palette[image.map[i]]||[255,255,255],p=i*4;out[p]=c[0];out[p+1]=c[1];out[p+2]=c[2];out[p+3]=protectedLine&&transparent?0:image.alpha[i];}return out;}
 return {goldThreshold,isGold,extractPalette,analyzePixels,recolorPixels};
}
const engine=pixelEngine();
export const {goldThreshold,isGold,extractPalette,analyzePixels,recolorPixels}=engine;
export const VECTOR_KEYS={4:['white','red','blue','black'],5:['white','green','red','blue','black'],6:['white','green','ochre','red','blue','black']};
export const VECTOR_DEFAULTS={4:['#ffffff','#c91724','#174a9e','#000000'],5:['#ffffff','#50b638','#c91724','#174a9e','#000000'],6:['#ffffff','#50b638','#a87317','#c91724','#174a9e','#000000']};
export function vectorSvg(master,{count=5,colors=VECTOR_DEFAULTS[count],gold='#f5d84d',line=0,transparent=false,size=1024}={}){
 if(!VECTOR_KEYS[count]||colors.length!==count||[...colors,gold].some(c=>!/^#[0-9a-f]{6}$/i.test(c)))throw Error('矢量配色无效');
 if(!Number.isFinite(line)||line<0||line>48||!Number.isInteger(size)||size<1||size>8192)throw Error('矢量输出参数无效');
 const map=Object.fromEntries(VECTOR_KEYS[count].map((key,i)=>[key,colors[i]])),paths=count===6?master.six:master.base;
 const escape=value=>String(value).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
 const path=`d="${escape(master.gold)}" fill-rule="evenodd" stroke-linejoin="round" stroke-linecap="round" stroke-width="${line}"`;
 const regions=['white','green','red','blue','black',...(count===6?['ochre']:[])].map(key=>`<path d="${escape(paths[key]||'')}" fill="${key==='green'&&count===4?map.blue:map[key]}" fill-rule="evenodd"/>`).join('');
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${escape(master.viewBox)}"><defs><mask id="goldCut" maskUnits="userSpaceOnUse" x="0" y="0" width="8000" height="8000"><rect width="8000" height="8000" fill="white"/><path ${path} fill="black" stroke="black"/></mask></defs><g mask="url(#goldCut)">${regions}</g>${transparent?'':`<path id="goldVisible" ${path} fill="${gold}" stroke="${gold}" paint-order="stroke fill"/>`}</svg>`;
}
export function randomPalette(colors,locks,random=Math.random){return colors.map((c,i)=>locks[i]?c:'#'+Math.floor(Math.max(0,Math.min(.99999999,random()))*16777216).toString(16).padStart(6,'0'));}
export function swapColors(colors,a,b){const result=[...colors];if(a>=0&&b>=0&&a<result.length&&b<result.length)[result[a],result[b]]=[result[b],result[a]];return result;}
export function rgbCmyk(hex){const n=parseInt(hex.slice(1),16),r=n>>16&255,g=n>>8&255,b=n&255,k=1-Math.max(r,g,b)/255;const cmyk=k===1?[0,0,0,100]:[1-r/255-k,1-g/255-k,1-b/255-k].map(v=>Math.round(v/(1-k)*100)).concat(Math.round(k*100));return {rgb:[r,g,b],cmyk};}
export function pngDpi(input,dpi=800){
 let bytes=input instanceof Uint8Array?input:new Uint8Array(input);if(bytes.length<33||bytes[0]!==137||bytes[1]!==80||!Number.isFinite(dpi)||dpi<1||dpi>2400)throw Error('无效 PNG 或 DPI');
 const parts=[bytes.subarray(0,8)];let length=8;
 for(let p=8;p+12<=bytes.length;){const n=new DataView(bytes.buffer,bytes.byteOffset+p,4).getUint32(0),end=p+n+12;if(end>bytes.length)throw Error('PNG 数据不完整');if(!(bytes[p+4]===112&&bytes[p+5]===72&&bytes[p+6]===89&&bytes[p+7]===115)){parts.push(bytes.subarray(p,end));length+=end-p;}p=end;}
 const clean=new Uint8Array(length);let offset=0;for(const part of parts){clean.set(part,offset);offset+=part.length;}bytes=clean;
 const chunk=new Uint8Array(21),view=new DataView(chunk.buffer),ppm=Math.round(dpi/.0254);view.setUint32(0,9);chunk.set([112,72,89,115],4);view.setUint32(8,ppm);view.setUint32(12,ppm);chunk[16]=1;let crc=0xffffffff;for(const byte of chunk.slice(4,17)){crc^=byte;for(let i=0;i<8;i++)crc=crc&1?0xedb88320^(crc>>>1):crc>>>1;}view.setUint32(17,(crc^0xffffffff)>>>0);const out=new Uint8Array(bytes.length+21);out.set(bytes.slice(0,33));out.set(chunk,33);out.set(bytes.slice(33),54);return out;
}
