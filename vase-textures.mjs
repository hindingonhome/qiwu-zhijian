import {ARTIFACTS} from './artifact-library.mjs';
import {FRUIT_PROFILES} from './fruit-profiles.mjs';
const ordered=[];
const add=id=>{if(id!=='peach'&&FRUIT_PROFILES[id]&&!ordered.includes(id))ordered.push(id);};
for(const item of ARTIFACTS.filter(item=>item.category==='fruit')){
 add(item.id);add(item.id+'-production');
 if(item.id==='apple'){add('apple-green');add('apple-green-production');}
 if(item.id==='banana')add('banana-blue');
}
for(const id of Object.keys(FRUIT_PROFILES))add(id);
export const VASE_PROFILE_IDS=Object.freeze(ordered);

export function initVaseTextures({viewer,getKind,onApplied=()=>{}}){
 const groups=[];let active=null,pinned=false,closeTimer;
 function close(){clearTimeout(closeTimer);if(active){active.popover.hidden=true;active.more.setAttribute('aria-expanded','false');active=null;}pinned=false;}
 function position(group){
  const rect=group.more.getBoundingClientRect(),panel=group.popover;
  const width=panel.getBoundingClientRect().width,height=panel.getBoundingClientRect().height;
  panel.style.left=Math.max(12,Math.min(innerWidth-width-12,rect.left+rect.width/2-width/2))+'px';
  panel.style.top=Math.max(12,rect.top-height-12)+'px';
 }
 function open(group,pin=false){if(getKind()!=='vase')return;clearTimeout(closeTimer);if(active!==group)close();active=group;pinned=pin;group.popover.hidden=false;group.more.setAttribute('aria-expanded','true');position(group);}
 function scheduleClose(){if(!pinned)closeTimer=setTimeout(close,220);}
 function syncPressed(){for(const group of groups)for(const button of group.buttons)button.setAttribute('aria-pressed',String(getKind()==='vase'&&(viewer.settings?.vaseProfile===button.dataset.vaseProfile||(viewer.settings?.fruitFlow&&viewer.settings?.fruitProfile===button.dataset.vaseProfile))));}
 for(const [index,host]of [...document.querySelectorAll('.quick-patterns,.sample-row')].entries()){
  const more=document.createElement('button');more.type='button';more.className='vase-more';more.innerHTML='<span class="sr-only">...</span><svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>';more.setAttribute('aria-label','更多花瓶纹样');more.setAttribute('aria-expanded','false');more.setAttribute('aria-controls','vase-textures-'+index);
  const popover=document.createElement('div');popover.id='vase-textures-'+index;popover.className='vase-texture-popover';popover.hidden=true;popover.setAttribute('role','group');popover.setAttribute('aria-label','更多花瓶纹样');document.body.append(popover);
  const group={host,more,popover,buttons:[]};groups.push(group);
  for(const id of VASE_PROFILE_IDS){
   const profile=FRUIT_PROFILES[id],button=document.createElement('button');button.type='button';button.className='swatch vase-profile';button.dataset.vaseProfile=id;button.setAttribute('aria-label',profile.name+(id.endsWith('-production')?'纹样':'原配色纹样'));button.setAttribute('aria-pressed','false');button.style.background='conic-gradient('+(profile.cardColors||profile.colors).map(color=>'#'+color).join(',')+')';
   button.onclick=()=>{
    if(getKind()!=='vase')return;
    document.querySelectorAll('.quick-patterns .swatch,.sample-row .swatch').forEach(other=>other.setAttribute('aria-pressed','false'));
    onApplied(id);syncPressed();close();
   };
   group.buttons.push(button);
  }
  const clear=host.querySelector('#clear-texture');host.insertBefore(more,clear);
  more.onclick=()=>{if(active===group&&pinned)close();else open(group,true);};
  more.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch'&&matchMedia('(hover:hover)').matches)open(group,false);});
  more.addEventListener('pointerleave',scheduleClose);popover.addEventListener('pointerenter',()=>clearTimeout(closeTimer));popover.addEventListener('pointerleave',scheduleClose);
 }
 document.addEventListener('pointerdown',event=>{if(active&&!active.popover.contains(event.target)&&!active.more.contains(event.target))close();});
 document.addEventListener('click',event=>{const button=event.target.closest?.('.swatch');if(button&&!button.dataset.vaseProfile)for(const group of groups)for(const extra of group.buttons)extra.setAttribute('aria-pressed','false');});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&active){const trigger=active.more;close();trigger.focus();}});
 window.addEventListener('resize',close);window.addEventListener('scroll',close,true);
 function refresh(){
  close();const isVase=getKind()==='vase';
  for(const group of groups){
   group.host.classList.toggle('vase-palette',isVase);
   group.host.closest('.object-controls')?.classList.toggle('has-vase-palette',isVase);
   const base=[...group.host.querySelectorAll(':scope > .swatch:not([data-vase-profile])')].filter(button=>!button.hidden).length,visible=Math.max(0,8-base);
   group.buttons.forEach((button,index)=>{button.hidden=!isVase;if(index<visible)group.host.insertBefore(button,group.more);else group.popover.append(button);});
   group.more.hidden=!isVase||group.buttons.length<=visible;
  }
  syncPressed();
 }
 refresh();return {refresh};
}
