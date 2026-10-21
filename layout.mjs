// Keep camera framing tied to occupied UI space rather than screen-resolution assumptions.
export function safeViewport({height,titleBottom,controlsTop}){
 const h=Math.max(1,height),minimum=Math.min(160,h);
 let top=Math.max(0,titleBottom)+Math.min(56,Math.max(20,h*.035));
 let bottom=Math.max(0,h-controlsTop)+Math.min(40,Math.max(16,h*.025));
 const budget=Math.max(0,h-minimum),occupied=top+bottom;
 if(occupied>budget&&occupied){const ratio=budget/occupied;top*=ratio;bottom*=ratio;}
 return {top,bottom,height:h-top-bottom};
}
export function fitDistance({width,height,depth,aspect,fov}){const tangent=Math.tan(fov*Math.PI/360);return Math.min(6.5,Math.max(2.6,Math.max(height/2/tangent,width/2/(tangent*Math.max(.1,aspect)))*1.24+depth*.5));}
