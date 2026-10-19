import {readFile,mkdir,copyFile,writeFile,readdir,rm} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));process.chdir(root);
const pkg=JSON.parse(await readFile('package.json','utf8')),version=pkg.version;
if(!/^\d+\.\d+\.\d+$/.test(version))throw Error('Invalid version');
for(const file of ['build-offline.cjs','build-safari.cjs']){const result=spawnSync(process.execPath,[file],{stdio:'inherit'});if(result.status!==0)process.exit(result.status||1);}
const dist=path.resolve('dist');if(path.dirname(dist)!==process.cwd())throw Error('Unexpected release directory');
await rm(dist,{recursive:true,force:true});await mkdir(dist,{recursive:true});
await copyFile('器物之间-离线版.html',`dist/QiwuZhijian-${version}-Desktop-Offline.html`);
const mobile=await readFile('器物之间-Safari离线版.html','utf8');
for(const [label,name]of [['安卓','Android'],['苹果','iPhone']])await writeFile(`dist/QiwuZhijian-${version}-${name}-Offline.html`,mobile.replace('Safari 离线器物工作室</title>',label+'触屏器物工作室</title>'));
await copyFile('docs/IPHONE-OPENING.txt','dist/iPhone-Opening-Guide.txt');
await copyFile('docs/ADDING-SERIES.md','dist/Adding-Series.md');
await copyFile('PRODUCT_README.md','dist/User-Guide.md');
if(process.argv.includes('--native'))for(const name of await readdir('release-assets/native-usdz'))if(name.endsWith('.usdz'))await copyFile(path.join('release-assets/native-usdz',name),path.join('dist',name));
console.log('Release HTML prepared',version);
