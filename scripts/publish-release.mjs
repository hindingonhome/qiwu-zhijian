import {readFile,readdir,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {verifyAssets} from './verify-release.mjs';
const {version}=JSON.parse(await readFile('package.json','utf8')),repo=process.env.GITHUB_REPOSITORY,token=process.env.GH_TOKEN,tag='V'+version;
if(!repo||!token)throw Error('Repository and release token are required');
const base='https://api.github.com/repos/'+repo,sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function api(method,url,data,binary=false){
 for(let attempt=0;attempt<3;attempt++){
  try{
   const response=await fetch(url.startsWith('https:')?url:base+url,{method,headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','Content-Type':binary?'application/octet-stream':'application/json'},body:data===undefined?undefined:binary?data:JSON.stringify(data)});
   if(response.status===204)return;
   if(!response.ok)throw Error(`${method} ${new URL(response.url).pathname}: HTTP ${response.status} ${await response.text()}`);
   return await response.json();
  }catch(error){if(attempt===2)throw error;await sleep(2000);}
 }
}
const releases=await api('GET','/releases?per_page=100');let release=releases.find(r=>r.tag_name===tag);
if(release&&!release.draft){console.log(tag+' already exists; tested build remains in workflow artifacts.');process.exit(0);}
let notes;try{notes=await readFile(`docs/releases/${tag}.md`,'utf8');}catch{notes=`物派 ${tag}\n\nCHAMBER · 97101yy@gmail.com\n保留所有权利。`;}
if(!release)release=await api('POST','/releases',{tag_name:tag,target_commitish:process.env.GITHUB_SHA,name:'物派 '+tag,body:notes,draft:true});
const assets=await api('GET',`/releases/${release.id}/assets?per_page=100`),expected=[];
for(const name of (await readdir('dist')).sort()){
 if(!/^[A-Za-z0-9_.-]+$/.test(name))throw Error('Release filename must be ASCII: '+name);
 const data=await readFile('dist/'+name),file={name,size:(await stat('dist/'+name)).size,digest:'sha256:'+createHash('sha256').update(data).digest('hex')};expected.push(file);
 const previous=assets.find(a=>a.name===name);
 if(previous?.digest===file.digest&&previous.size===file.size&&previous.state==='uploaded')continue;
 if(previous)await api('DELETE','/releases/assets/'+previous.id);
 const uploaded=await api('POST',release.upload_url.split('{')[0]+'?name='+encodeURIComponent(name),data,true);
 verifyAssets([file],[uploaded]);console.log('Uploaded',name,file.size);
}
const actual=await api('GET',`/releases/${release.id}/assets?per_page=100`);verifyAssets(expected,actual);
console.log('All release names, sizes and SHA256 digests verified:',expected.length);
await api('PATCH','/releases/'+release.id,{draft:false,make_latest:'true',body:notes});console.log(release.html_url);
