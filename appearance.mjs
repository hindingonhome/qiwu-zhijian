export function initAppearance(viewer){
 let mode='light';
 const toggle=document.getElementById('theme-toggle');
 const choose=value=>{mode=value;document.documentElement.dataset.theme=value;viewer.setTheme(value);toggle.setAttribute('aria-pressed',String(value==='dark'));toggle.setAttribute('aria-label',value==='dark'?'切换为浅色':'切换为深色');window.dispatchEvent(new Event('appearancechange'));};
 let flipping=false;
 toggle.onclick=async()=>{
  if(flipping)return;const next=mode==='light'?'dark':'light';
  if(matchMedia('(prefers-reduced-motion:reduce)').matches){choose(next);return;}
  flipping=true;toggle.setAttribute('aria-busy','true');
  const icon=toggle.querySelector('span'),direction=mode==='light'?1:-1,animation=icon.animate([{transform:'perspective(160px) rotateY(0deg)'},{transform:`perspective(160px) rotateY(${direction*180}deg)`}],{duration:560,easing:'cubic-bezier(.4,0,.2,1)'});
  const midpoint=setTimeout(()=>choose(next),280);
  try{await animation.finished;}finally{clearTimeout(midpoint);choose(next);flipping=false;toggle.removeAttribute('aria-busy');}
 };choose('light');
 const tip=document.createElement('div');tip.id='material-tooltip';tip.className='material-tooltip';tip.role='tooltip';tip.hidden=true;document.body.append(tip);
 const hide=()=>{tip.hidden=true;};window.addEventListener('wupai-popover',hide);
 const selector='.swatch,.quick-upload,#spin-speed,#theme-toggle,#playback-toggle,#surface-adjust,[data-tooltip]';let target;
 const prepare=button=>{button.removeAttribute('title');button.setAttribute('aria-describedby','material-tooltip');};
 const show=button=>{if(!button||(button.disabled&&!button.hasAttribute('data-tooltip'))||!button.getAttribute('aria-label'))return;prepare(button);target=button;tip.textContent=button.getAttribute('aria-label');tip.hidden=false;const r=button.getBoundingClientRect(),t=tip.getBoundingClientRect();tip.style.left=Math.max(12,Math.min(innerWidth-t.width-12,r.left+r.width/2-t.width/2))+'px';tip.style.top=Math.max(12,r.top-t.height-12)+'px';};
 const find=event=>event.target.closest?.(selector);
 document.addEventListener('pointerover',event=>{const button=find(event);if(button&&event.pointerType!=='touch'&&!button.contains(event.relatedTarget))show(button);});
 document.addEventListener('pointerout',event=>{if(target?.contains(event.target)&&!target.contains(event.relatedTarget))hide();});
 document.addEventListener('focusin',event=>show(find(event)));document.addEventListener('focusout',event=>{if(target?.contains(event.target)&&!target.contains(event.relatedTarget))hide();});
 document.addEventListener('click',event=>{const button=find(event);if(button)show(button);else hide();});
 const refreshTooltips=()=>document.querySelectorAll(selector).forEach(prepare);refreshTooltips();window.addEventListener('scroll',hide,true);window.addEventListener('resize',hide);document.addEventListener('keydown',e=>{if(e.key==='Escape')hide();});
 return {choose,refreshTooltips};
}
