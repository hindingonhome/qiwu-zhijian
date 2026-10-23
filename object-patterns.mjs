import {FRUIT_PROFILES} from './fruit-profiles.mjs';
const KEY='wupai-object-patterns-v1';
export function defaultPatterns(kind){
 if(kind==='vase')return ['vase-profile:mango','vase-profile:mango-production','lacquer'];
 if(kind==='plate')return ['vase-profile:mango','lacquer'];
 if(!FRUIT_PROFILES[kind])return [];
 const ids=[kind==='peach'?'peach-production':kind,kind+'-production',...(kind==='apple'?['apple-green','apple-green-production']:[]),...(kind==='banana'?['banana-blue']:[])];
 return [...new Set(ids.filter(id=>FRUIT_PROFILES[id]).map(id=>'vase-profile:'+id))];
}
const valid=id=>typeof id==='string'&&id.length<=400&&(['copper','gold','lacquer','none','orange','production','production-green','apple-green'].includes(id)||id.startsWith('custom:')||(id.startsWith('vase-profile:')&&FRUIT_PROFILES[id.slice(13)]));
function cleanSettings(s){if(!s||typeof s!=='object')return {};const out={};for(const [key,min,max]of [['repeat',1,10],['angle',0,270],['offsetX',-1,1],['offsetY',-1,1],['roughness',.05,1],['metalness',0,1]])if(Number.isFinite(s[key])&&s[key]>=min&&s[key]<=max)out[key]=s[key];for(const key of ['original','solid','fruitFlow','mangoLacquer','lacquerVase'])if(typeof s[key]==='boolean')out[key]=s[key];for(const key of ['fruitProfile','vaseProfile'])if(s[key]===null||FRUIT_PROFILES[s[key]])out[key]=s[key];if(/^#[0-9a-f]{6}$/i.test(s.color||''))out.color=s.color;if(['uv','triplanar'].includes(s.projection))out.projection=s.projection;if(['original','warm','cool','soft'].includes(s.paletteId))out.paletteId=s.paletteId;return out;}
export class ObjectPatterns{
 constructor(storage){this.storage=storage;this.objects=Object.create(null);try{const saved=JSON.parse(storage?.getItem(KEY)||'{}');for(const [key,value]of Object.entries(saved).slice(0,2000))if(key.length<=120&&value&&typeof value==='object'){this.objects[key]={added:Array.isArray(value.added)?value.added.filter(valid).slice(0,200):[],hidden:Array.isArray(value.hidden)?value.hidden.filter(valid).slice(0,240):[],...(valid(value.selected?.id)?{selected:{id:value.selected.id,settings:cleanSettings(value.selected.settings)}}:{})};}}catch{}}
 save(){try{this.storage?.setItem(KEY,JSON.stringify(this.objects));}catch{}}
 list(kind){return [...new Set(['copper','gold',...defaultPatterns(kind),...(this.objects[kind]?.added||[])])].filter(id=>!this.objects[kind]?.hidden?.includes(id));}
 bind(kind,id){if(!valid(id))return;const entry=this.objects[kind]??={added:[]};entry.hidden=(entry.hidden||[]).filter(value=>value!==id);if(!this.list(kind).includes(id)&&entry.added.length<200)entry.added.push(id);this.save();}
 remember(kind,{id,settings}){if(!valid(id))return;this.bind(kind,id);this.objects[kind].selected={id,settings:cleanSettings(settings)};this.save();}
 remove(kind,id){if(!valid(id))return;const entry=this.objects[kind]??={added:[]};entry.added=entry.added.filter(value=>value!==id);entry.hidden=[...new Set([...(entry.hidden||[]),id])];if(entry.selected?.id===id)delete entry.selected;this.save();}
 removeEverywhere(id){for(const kind of Object.keys(this.objects))this.remove(kind,id);}
 read(kind){const saved=this.objects[kind]?.selected;return saved?{id:saved.id,settings:{...saved.settings}}:null;}
}
