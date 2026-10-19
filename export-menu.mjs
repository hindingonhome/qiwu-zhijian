export function initExportMenu({viewer,getKind,download,status}){
 const host=document.querySelector('.gallery-console'),trigger=document.getElementById('capture');
 const menu=document.createElement('div');menu.id='export-menu';menu.className='export-menu';menu.hidden=true;menu.setAttribute('role','group');menu.setAttribute('aria-label','保存与导出');
 const picture=document.createElement('button'),model=document.createElement('button');picture.type=model.type='button';picture.textContent='保存画面';model.textContent='导出模型';model.id='export-model';menu.append(picture,model);host.append(menu);
 trigger.setAttribute('aria-expanded','false');trigger.setAttribute('aria-controls',menu.id);
 let timer,busy=false;
 const close=()=>{clearTimeout(timer);menu.hidden=true;trigger.setAttribute('aria-expanded','false');};
 const open=()=>{clearTimeout(timer);menu.hidden=false;trigger.setAttribute('aria-expanded','true');};
 trigger.onclick=open;
 host.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch'&&matchMedia('(hover:hover)').matches)open();});
 host.addEventListener('pointerleave',()=>{timer=setTimeout(close,230);});
 host.addEventListener('focusin',open);host.addEventListener('focusout',()=>{setTimeout(()=>{if(!busy&&!host.contains(document.activeElement))close();},0);});
 document.addEventListener('pointerdown',e=>{if(!host.contains(e.target))close();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){trigger.focus();close();}});
 picture.onclick=async()=>{if(busy)return;busy=true;picture.disabled=true;try{const saved=await download(viewer.capture(),`器物之间-${getKind()}-${Date.now()}.png`);status(saved?.cancelled?'已取消保存。':'已导出当前三维展品画面 PNG。');close();}catch(error){status('画面导出失败：'+error.message,true);}finally{busy=false;picture.disabled=false;}};
 model.onclick=async()=>{
  if(busy)return;busy=true;model.disabled=true;model.textContent='正在导出…';status('正在整理模型与当前材质…');
  try{await new Promise(resolve=>requestAnimationFrame(()=>setTimeout(resolve,0)));const data=await viewer.exportModel(),url=URL.createObjectURL(new Blob([data],{type:'model/gltf-binary'}));let saved;try{saved=await download(url,`器物之间-${getKind()}-${Date.now()}.glb`);}finally{setTimeout(()=>URL.revokeObjectURL(url),60000);}status(saved?.cancelled?'已取消保存。':'已导出 GLB，包含当前纹样、密度与材质。');close();}
  catch(error){status('模型导出失败：'+error.message,true);}
  finally{busy=false;model.disabled=false;model.textContent='导出模型';}
 };
}
