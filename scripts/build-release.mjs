import {readFile,mkdir,copyFile,writeFile,readdir,rm} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));process.chdir(root);
const pkg=JSON.parse(await readFile('package.json','utf8')),version=pkg.version;
if(!/^\d+\.\d+\.\d+$/.test(version))throw Error('Invalid version');
for(const file of ['build-offline.cjs','build-safari.cjs']){const result=spawnSync(process.execPath,[file],{stdio:'inherit'});if(result.status!==0)process.exit(result.status||1);}
const dist=path.resolve('.release-work');if(path.dirname(dist)!==process.cwd())throw Error('Unexpected release directory');
await rm(dist,{recursive:true,force:true});await mkdir(dist,{recursive:true});
await copyFile('物派-离线版.html',`.release-work/Wupai-${version}-Desktop-Offline.html`);
const mobile=await readFile('物派-Safari离线版.html','utf8');
for(const [label,name]of [['安卓','Android'],['苹果','iPhone']])await writeFile(`.release-work/Wupai-${version}-${name}-Offline.html`,mobile.replace('Safari 离线器物工作室</title>',label+'触屏器物工作室</title>'));
await copyFile('docs/IPHONE-OPENING.txt','.release-work/iPhone-Opening-Guide.txt');
await copyFile('docs/ADDING-SERIES.md','.release-work/Adding-Series.md');
await copyFile('PRODUCT_README.md','.release-work/User-Guide.md');
if(process.argv.includes('--native')){
 const kinds={'花瓶':'Vase','芒果':'Mango','草莓':'Strawberry','火龙果':'Dragonfruit','梨':'Pear','荔枝':'Lychee','苹果':'Apple','青苹果':'GreenApple','柿子':'Persimmon','桃子':'Peach','西瓜':'Watermelon','香蕉':'Banana','香蕉2':'Banana2'},seen=new Set();
 for(const name of await readdir('release-assets/native-usdz'))if(name.endsWith('.usdz')){
  const kind=kinds[name.split('-')[0]],finish=name.includes('仿大漆')?'Lacquer':name.includes('落地色')?'Production':'Original';
  if(!kind)throw Error('Unmapped native model: '+name);
  const output=`${kind}-${finish}.usdz`;if(seen.has(output))throw Error('Duplicate native model: '+output);seen.add(output);
  await copyFile(path.join('release-assets/native-usdz',name),path.join('.release-work',output));
 }
}
console.log('Release HTML prepared',version);
