import {readFile,writeFile,mkdir,copyFile,readdir,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {platformFiles} from './platform-files.mjs';
const root=fileURLToPath(new URL('..',import.meta.url));process.chdir(root);
const {version}=JSON.parse(await readFile('package.json','utf8'));
const output=path.resolve(root,'../物派-本地验收/V'+version+'-综合修订验收');
const models=(await readdir('.release-work')).filter(name=>name.endsWith('.usdz')).sort();
if(models.length!==26)throw Error('Expected all 26 native models');
await copyFile('desktop-output/Wupai-'+version+'-Windows.exe','.release-work/Wupai-'+version+'-Windows.exe');
await copyFile('android/app/build/outputs/apk/release/app-release.apk','.release-work/Wupai-'+version+'-Android.apk');
for(const [platform,items]of Object.entries(platformFiles(version,models))){
 for(const item of items){
  if(platform==='Linux'&&item.source.endsWith('.AppImage'))continue; // Native Linux is not built on this Windows host.
  let name=item.name;if(platform==='Android'&&name==='Wupai.apk')name='Wupai-'+version+'.apk';
  const dest=path.join(output,platform,name);await mkdir(path.dirname(dest),{recursive:true});await copyFile(path.resolve(item.source),dest);
 }
}
const documents=path.join(output,'Documents');await mkdir(documents,{recursive:true});
for(const [source,name]of [['docs/CODE-SELF-AUDIT.md','代码自检与优化建议.md'],['verification/plate-planar-top.png','盘子顶面验证.png'],['verification/hover-selected-library.png','派库管理布局.png'],['verification/hover-selected-shortcuts.png','表面历史操作.png'],['PRODUCT_README.md','使用手册.md'],['CHANGELOG.md','更新日志.md'],['LICENSE','使用许可.txt'],['docs/TEXTURE-STUDIO-SOURCE-AUDIT.md','纹理生成来源审查.md'],['docs/FINAL-REVISION-ACCEPTANCE.md','测试与验收记录.md'],['docs/物派-简明使用说明.pdf','物派-V'+version+'-简明使用说明.pdf'],['verification/final-revision-unit.log','单元测试.log'],['verification/final-revision-browser.log','浏览器回归.log'],['verification/final-revision-windows-build.log','Windows构建.log'],['verification/final-revision-android-build.log','Android构建.log'],['verification/final-revision-portable.json','实际EXE测试.json'],['verification/texture-studio-apk-assets.json','APK资源核验.json'],['verification/final-revision-desktop.png','纹样菜单-桌面.png'],['verification/final-revision-mobile.png','纹样菜单-手机.png']])await copyFile(source,path.join(documents,name));
await copyFile('docs/FINAL-REVISION-ACCEPTANCE.md',path.join(output,'验收说明.md'));
await writeFile(path.join(output,'Linux','本轮平台说明.txt'),'本轮 Linux 提供备用 HTML，未构建或验证原生 AppImage。请在支持 WebGL 的浏览器中打开 Backup-HTML/Wupai.html。\n');
const entries=[];async function walk(folder){for(const item of await readdir(folder,{withFileTypes:true})){const file=path.join(folder,item.name);if(item.isDirectory())await walk(file);else if(item.name!=='SHA256SUMS.txt')entries.push(file);}}
await walk(output);const lines=[];for(const file of entries.sort()){const digest=createHash('sha256').update(await readFile(file)).digest('hex');lines.push(digest+'  '+path.relative(output,file).split(path.sep).join('/'));}await writeFile(path.join(output,'SHA256SUMS.txt'),lines.join('\n')+'\n');
console.log(JSON.stringify({output,files:entries.length,models:models.length,exeBytes:(await stat(path.join(output,'Desktop','物派.exe'))).size,apkBytes:(await stat(path.join(output,'Android','Wupai-'+version+'.apk'))).size},null,2));
