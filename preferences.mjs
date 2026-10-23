import {getLanguage,setLanguage,initTranslations} from './i18n.mjs';
import {encodeBackup,decodeBackup,configurationState,validatePreferences} from './library-backup.mjs';
const $=id=>document.getElementById(id),key='wupai-preferences-v1';
export function initPreferences({library,viewer,appearance,download,status}){
 const {store,run}=library;let applying=false,timer,saving=false;
 const notify=(text,error=false)=>{$('preferences-message').textContent=text;status(text,error);};
 function capture(){const collapsed={};document.querySelectorAll('details[id]').forEach(el=>{collapsed[el.id]=el.open;});return validatePreferences({language:getLanguage(),theme:document.documentElement.dataset.theme,lighting:{...viewer.lighting},collapsed});}
 function apply(value){const prefs=validatePreferences(value);applying=true;try{$('language-select').value=prefs.language;setLanguage(prefs.language);appearance.choose(prefs.theme);if(prefs.lighting)viewer.updateLighting(prefs.lighting);for(const [id,open]of Object.entries(prefs.collapsed)){const el=$(id);if(el?.tagName==='DETAILS'&&el.open!==open)el.open=open;}}finally{applying=false;}try{localStorage.setItem(key,JSON.stringify(prefs));}catch{}store.state={...store.state,preferences:prefs};}
 function remember(){if(applying)return;clearTimeout(timer);timer=setTimeout(()=>{const prefs=capture();store.state={...store.state,preferences:prefs};try{localStorage.setItem(key,JSON.stringify(prefs));}catch(error){status('界面设置未能保存：'+error.message,true);}},200);}
 initTranslations();try{const saved=localStorage.getItem(key);if(saved)apply(JSON.parse(saved));else if(store.state.preferences)apply(store.state.preferences);}catch(error){status('首选项读取失败：'+error.message,true);}
 $('language-select').onchange=e=>{setLanguage(e.target.value);remember();};
 document.addEventListener('toggle',remember,true);window.addEventListener('lightingchange',remember);window.addEventListener('appearancechange',remember);
 window.addEventListener('beforelibrarychange',()=>{clearTimeout(timer);store.state={...store.state,preferences:capture()};});
 window.addEventListener('librarychange',()=>{$('preferences-message').textContent=$('library-message').textContent;if(store.state.preferences)apply(store.state.preferences);});
 async function save(blob,name){if(saving)return;saving=true;for(const el of document.querySelectorAll('.backup-actions button,.backup-actions input'))el.disabled=true;let url;try{url=URL.createObjectURL(blob);const result=await download(url,name);notify(result?.cancelled?'已取消保存。':'已导出备份。');}catch(error){notify('备份导出失败：'+error.message,true);}finally{if(url)setTimeout(()=>URL.revokeObjectURL(url),60000);saving=false;for(const el of document.querySelectorAll('.backup-actions button,.backup-actions input'))el.disabled=false;}}

 $('save-configuration').onclick=()=>{const configuration={format:'wupai-configuration',version:1,collections:store.state.collections,preferences:capture()};return save(new Blob([JSON.stringify(configuration,null,2)],{type:'application/json'}),'Wupai-Configuration.json');};
 $('save-library').onclick=()=>save(encodeBackup(store.state,capture()),'Wupai-Library.wupai');
 $('load-configuration').onchange=async e=>{const file=e.target.files[0];e.target.value='';if(!file)return;try{if(file.size>2*1024*1024)throw Error('配置文件过大');const value=JSON.parse(await file.text());if(value.format!=='wupai-configuration'||value.version!==1)throw Error('不是物派配置文件');const state=configurationState(store.state,value),preferences=validatePreferences(value.preferences);await run(()=>store.restore({...state,preferences}),'已导入配置，可撤销。');}catch(error){status('配置导入失败：'+error.message,true);}};
 $('load-library').onchange=async e=>{const file=e.target.files[0];e.target.value='';if(!file)return;try{const value=await decodeBackup(file);await run(()=>store.restore({...value.state,preferences:value.preferences}),'已恢复派库，可撤销。');}catch(error){status('派库恢复失败：'+error.message,true);}};
 return {capture};
}
