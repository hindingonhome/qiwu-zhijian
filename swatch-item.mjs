let touchInput=false,listening=false;
function trackInput(event){const next=event.pointerType==='touch';if(next===touchInput)return;touchInput=next;for(const item of document.querySelectorAll('.swatch-item'))item.syncRemove?.();}
export function swatchItem(button,onRemove){
 if(!listening){listening=true;document.addEventListener('pointerdown',trackInput);document.addEventListener('pointerover',trackInput);}
 const item=document.createElement('span');item.className='swatch-item';item.append(button);
 const remove=document.createElement('button');remove.type='button';remove.className='swatch-remove';remove.setAttribute('aria-label','移除 '+(button.getAttribute('aria-label')||'纹样'));remove.innerHTML='<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 5l6 6M11 5l-6 6"/></svg>';
 let hovering=false,focused=false;
 const sync=()=>{const visible=button.getAttribute('aria-pressed')==='true'&&(hovering||focused||touchInput||matchMedia('(hover:none)').matches);item.classList.toggle('is-remove-visible',visible);remove.tabIndex=visible?0:-1;if(visible)remove.removeAttribute('aria-hidden');else remove.setAttribute('aria-hidden','true');};
 item.syncRemove=sync;
 item.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch'){hovering=true;sync();}});item.addEventListener('pointerleave',()=>{hovering=false;sync();});
 item.addEventListener('focusin',()=>{focused=button.matches(':focus-visible')||remove.matches(':focus-visible');sync();});item.addEventListener('focusout',event=>{if(!item.contains(event.relatedTarget)){focused=false;sync();}});
 item.addEventListener('pointercancel',()=>{hovering=false;sync();});
 new MutationObserver(sync).observe(button,{attributes:true,attributeFilter:['aria-pressed']});
 remove.onclick=event=>{event.stopPropagation();onRemove();};item.append(remove);sync();return item;
}
