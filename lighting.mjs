export const LIGHT_DEFAULTS=Object.freeze({brightness:1,fill:1,direction:0,height:0});
export function initLightingControls(viewer){
 const fields=[['light-brightness','brightness',v=>v.toFixed(2)],['light-fill','fill',v=>v.toFixed(2)],['light-direction','direction',v=>v+'°'],['light-height','height',v=>v+'°']];
 const sync=()=>{for(const [id,key,format]of fields){document.getElementById(id).value=viewer.lighting[key];document.getElementById(id+'-value').textContent=format(viewer.lighting[key]);}};
 for(const [id,key]of fields)document.getElementById(id).oninput=e=>viewer.updateLighting({[key]:Number(e.target.value)});
 document.getElementById('lighting-reset').onclick=()=>viewer.updateLighting({...LIGHT_DEFAULTS});
 document.getElementById('lighting-soft').onclick=()=>viewer.updateLighting({brightness:1.08,fill:1.65,direction:0,height:0});
 window.addEventListener('lightingchange',sync);sync();
}
