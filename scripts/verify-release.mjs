import {readdir,readFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const {version}=JSON.parse(await readFile('package.json','utf8'));
const repo=process.env.GITHUB_REPOSITORY;if(!repo)throw Error('GITHUB_REPOSITORY is required');
const release=JSON.parse(execFileSync('gh',['api',`repos/${repo}/releases/tags/V${version}`],{encoding:'utf8'}));
const assets=JSON.parse(execFileSync('gh',['api',`repos/${repo}/releases/${release.id}/assets?per_page=100`],{encoding:'utf8'}));
const files=await readdir('dist');if(assets.length!==files.length)throw Error(`Release asset count mismatch: ${assets.length} / ${files.length}`);
for(const name of files){
 const asset=assets.find(a=>a.name===name),size=(await stat('dist/'+name)).size;
 if(!asset||asset.size!==size||asset.state!=='uploaded')throw Error('Missing or changed release asset: '+name);
 const digest='sha256:'+createHash('sha256').update(await readFile('dist/'+name)).digest('hex');
 if(asset.digest!==digest)throw Error('Release digest mismatch: '+name);
}
console.log('All release names, sizes and SHA256 digests verified:',files.length);
