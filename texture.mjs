// Local image processing: opposing edge bands are blended symmetrically.
// This reduces seams; it does not infer missing artwork or recover a motif.
export function makeTileable(source,w,h,strength=.04){
 if(!Number.isInteger(w)||!Number.isInteger(h)||w<2||h<2||source.length!==w*h*4)throw new Error('图片尺寸无效');
 const data=new Uint8ClampedArray(source);
 const bandX=Math.max(1,Math.floor(w*Math.min(.49,Math.max(.02,strength))));
 const bandY=Math.max(1,Math.floor(h*Math.min(.49,Math.max(.02,strength))));
 const mix=(a,b,t)=>{
  for(let c=0;c<4;c++){const av=data[a+c],bv=data[b+c];data[a+c]=av+(bv-av)*t;data[b+c]=bv+(av-bv)*t;}
 };
 for(let y=0;y<h;y++)for(let i=0;i<bandX;i++)mix((y*w+i)*4,(y*w+w-1-i)*4,.25*(1+Math.cos(Math.PI*i/bandX)));
 for(let x=0;x<w;x++)for(let i=0;i<bandY;i++)mix((i*w+x)*4,((h-1-i)*w+x)*4,.25*(1+Math.cos(Math.PI*i/bandY)));
 return data;
}
export function processedCanvas(image,strength=.04){
 const ratio=Math.min(1,1024/Math.max(image.width,image.height));
 const canvas=document.createElement('canvas');canvas.width=Math.max(2,Math.round(image.width*ratio));canvas.height=Math.max(2,Math.round(image.height*ratio));
 const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0,canvas.width,canvas.height);
 if(strength>0){const frame=ctx.getImageData(0,0,canvas.width,canvas.height);frame.data.set(makeTileable(frame.data,canvas.width,canvas.height,strength));ctx.putImageData(frame,0,0);}
 return canvas;
}
// Periodic reflection tiles: every output pixel comes from a single source
// pixel. No alpha mixing or layered motifs at tile boundaries.
export function mirroredCanvas(image){
 const ratio=Math.min(1,512/Math.max(image.width,image.height));
 const w=Math.max(2,Math.round(image.width*ratio)),h=Math.max(2,Math.round(image.height*ratio));
 const tile=document.createElement('canvas');tile.width=w;tile.height=h;
 const t=tile.getContext('2d');t.fillStyle='#ffffff';t.fillRect(0,0,w,h);t.drawImage(image,0,0,w,h);
 const canvas=document.createElement('canvas');canvas.width=w*2;canvas.height=h*2;const ctx=canvas.getContext('2d');
 for(let y=0;y<2;y++)for(let x=0;x<2;x++){ctx.save();ctx.translate(x?w*2:0,y?h*2:0);ctx.scale(x?-1:1,y?-1:1);ctx.drawImage(tile,0,0);ctx.restore();}
 return canvas;
}
