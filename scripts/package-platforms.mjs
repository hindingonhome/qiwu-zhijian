import {readFile,readdir,rm,mkdir,copyFile} from 'node:fs/promises';
import {createWriteStream} from 'node:fs';
import {pipeline} from 'node:stream/promises';
import path from 'node:path';
import yazl from 'yazl';
import {platformFiles} from './platform-files.mjs';
const version=JSON.parse(await readFile('package.json','utf8')).version;
const models=(await readdir('.release-work')).filter(n=>n.endsWith('.usdz')).sort();
if(models.length!==26)throw Error('Expected 26 native iPhone models');
const output=path.resolve('dist');if(path.dirname(output)!==process.cwd())throw Error('Unexpected package directory');
await rm(output,{recursive:true,force:true});await mkdir(output,{recursive:true});
for(const [platform,files]of Object.entries(platformFiles(version,models))){
 const zip=new yazl.ZipFile(),prefix=`Wupai-${version}-${platform}/`;
 zip.on('error',error=>zip.outputStream.destroy(error));
 for(const file of files)zip.addFile(file.source,prefix+file.name,{mode:file.mode||0o100644,compress:!['.usdz','.apk','.exe','.AppImage'].some(ext=>file.name.endsWith(ext))});
 zip.end();await pipeline(zip.outputStream,createWriteStream(`dist/Wupai-${version}-${platform}.zip`));
 console.log(platform,'package:',files.length,'files');
}
await copyFile(`.release-work/Wupai-${version}-Android.apk`,`dist/Wupai-${version}-Android.apk`);
