// UI-only colors: retain shader colors, masks and all underlying materials.
export function dominantColors(colors,weights=[],limit=5){
 const totals=new Map();colors.forEach((value,i)=>{const color=String(value).replace(/^#/,'').toLowerCase();if(!/^[0-9a-f]{6}$/.test(color))return;totals.set(color,(totals.get(color)||0)+(Number.isFinite(weights[i])?Math.max(0,weights[i]):1));});
 return [...totals].sort((a,b)=>b[1]-a[1]).slice(0,Math.max(1,Math.min(5,limit))).map(([color])=>color);
}
export function flatColorBands(colors,weights){const chosen=dominantColors(colors,weights);if(!chosen.length)return '#d5d5d7';if(chosen.length===1)return '#'+chosen[0];return 'linear-gradient(to bottom,'+chosen.map((c,i)=>'#'+c+' '+(i*100/chosen.length)+'% '+((i+1)*100/chosen.length)+'%').join(',')+')';}
export function styleSwatch(element,colors,weights){element.style.background=flatColorBands(colors,weights);element.dataset.flatColors=dominantColors(colors,weights).join(',');}
