export function initDisclosures(){
 const refresh=()=>{for(const summary of document.querySelectorAll('.library-section>summary,.preference-section>summary,.surface-library .advanced>summary')){if(summary.querySelector(':scope > .disclosure-chevron'))continue;const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('disclosure-chevron');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.innerHTML='<path d="M8 5L15 12L8 19"/>';summary.append(svg);}};
 let scheduled=false;const observer=new MutationObserver(()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;refresh();});});observer.observe(document.body,{childList:true,subtree:true});refresh();return observer;
}
