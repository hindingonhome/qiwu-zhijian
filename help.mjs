import {HELP_DOCUMENTS} from './help-content.mjs';
export function initHelp(){
 const open=document.getElementById('help-open');
 const dialog=document.createElement('dialog');dialog.className='help-dialog';dialog.setAttribute('aria-labelledby','help-title');
 dialog.innerHTML='<header class="help-heading"><h2 id="help-title">使用说明与许可</h2><button class="help-close" aria-label="关闭使用说明"><svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6L18 18M18 6L6 18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg></button></header><div class="help-tabs" role="tablist" aria-label="说明分类"></div><article id="help-body" class="help-body" role="tabpanel" tabindex="0"></article>';
 document.body.append(dialog);const tabs=dialog.querySelector('.help-tabs'),body=dialog.querySelector('#help-body');
 function choose(index,focus=false){const doc=HELP_DOCUMENTS[index];tabs.querySelectorAll('button').forEach((button,i)=>{button.setAttribute('aria-selected',String(i===index));button.tabIndex=i===index?0:-1;});body.innerHTML=doc.html;body.setAttribute('aria-labelledby','help-tab-'+doc.id);body.scrollTop=0;if(focus)tabs.children[index].focus();}
 HELP_DOCUMENTS.forEach((doc,index)=>{const button=document.createElement('button');button.id='help-tab-'+doc.id;button.type='button';button.role='tab';button.textContent=doc.title;button.setAttribute('aria-controls','help-body');button.onclick=()=>choose(index);button.onkeydown=event=>{let next;if(event.key==='ArrowRight')next=(index+1)%HELP_DOCUMENTS.length;else if(event.key==='ArrowLeft')next=(index+HELP_DOCUMENTS.length-1)%HELP_DOCUMENTS.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=HELP_DOCUMENTS.length-1;else return;event.preventDefault();choose(next,true);};tabs.append(button);});choose(0);
 open.onclick=()=>{if(!dialog.open){dialog.showModal();open.setAttribute('aria-expanded','true');tabs.querySelector('[aria-selected=true]').focus();}};
 dialog.querySelector('.help-close').onclick=()=>dialog.close();
 dialog.addEventListener('click',event=>{if(event.target===dialog){const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();}});
 dialog.addEventListener('close',()=>{open.setAttribute('aria-expanded','false');open.focus();});
}
