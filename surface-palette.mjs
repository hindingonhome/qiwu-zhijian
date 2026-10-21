export const SURFACE_PALETTES=Object.freeze([
 {id:'original',name:'原色',colors:['e8d9c1','bf7452','f6efdf'],tint:'#ffffff'},
 {id:'warm',name:'暖阳',colors:['f4c44c','d96535','842d27','fff0d6','a83e36','e99647','4c2424'],tint:'#ffe1bc'},
 {id:'cool',name:'清凉',colors:['54b6b9','246a86','dae9e1','183c56','b2d4c9','83b9c8','efefd4'],tint:'#c8e5ff'},
 {id:'soft',name:'柔和',colors:['e9bdc3','9a687e','eee6dc','c98f99','6c5369','d8c3d3','f4e9c8'],tint:'#f5d5e5'}
]);
export function paletteColors(colors,id='original'){const preset=SURFACE_PALETTES.find(p=>p.id===id);if(!preset||id==='original')return [...colors];return colors.map((_,i)=>preset.colors[i%preset.colors.length]);}
export function nextDensity(current,random=Math.random){const index=Math.floor(Math.max(0,Math.min(.999999,random()))*9)+1;return index>=current?index+1:index;}
