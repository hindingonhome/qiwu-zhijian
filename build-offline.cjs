require('./scripts/prepare-help.cjs');
const fs=require('node:fs'),path=require('node:path');
async function build(){
const root=__dirname,imports={},visited=new Set();
function resolve(spec,from){if(spec==='three')return 'vendor/package/build/three.module.js';if(spec.startsWith('three/addons/'))return 'vendor/package/examples/jsm/'+spec.slice(13);if(spec.startsWith('.'))return path.posix.normalize(path.posix.join(path.posix.dirname(from),spec));throw new Error('Unsupported module '+spec);}
function add(file){if(visited.has(file))return;visited.add(file);let content=fs.readFileSync(path.join(root,file),'utf8');content=content.replace(/(\bfrom\s*|\bimport\s*)(['"])([^'"\r\n]+)\2/g,(match,prefix,quote,spec)=>{if(!spec.startsWith('.')&&spec!=='three'&&!spec.startsWith('three/addons/'))return match;const target=resolve(spec,file);add(target);return prefix+quote+'offline/'+target+quote;});imports['offline/'+file]='data:text/javascript;base64,'+Buffer.from(content).toString('base64');}
add('app.mjs');
const assets={};
const {ARTIFACTS}=await import('./artifact-library.mjs');
for(const item of ARTIFACTS)for(const [file,mime]of [[item.asset,'model/gltf-binary'],[item.thumbnail,'image/png']])if(file)assets[file]=`data:${mime};base64,`+fs.readFileSync(path.join(root,file)).toString('base64');
for(const [file,mime] of [['brass/color.jpg','image/jpeg'],['brass/normal.jpg','image/jpeg'],['brass/roughness.jpg','image/jpeg'],['brass/metalness.jpg','image/jpeg'],['vase.glb','model/gltf-binary'],['museum.hdr','application/octet-stream'],['friend/orange-gold.png','image/png'],['friend/lacquer.png','image/png'],['friend/lacquer-metalness.png','image/png'],['friend/lacquer-roughness.png','image/png'],['friend/orange-gold.jpg','image/jpeg']])assets['./assets/'+file]=`data:${mime};base64,`+fs.readFileSync(path.join(root,'assets',file)).toString('base64');
let html=fs.readFileSync(path.join(root,'index.html'),'utf8');
html=html.replace('<link rel="stylesheet" href="product.css">','<style>'+fs.readFileSync(path.join(root,'product.css'),'utf8')+'</style>');
html=html.replace(/<script type="importmap">[\s\S]*?<\/script>/,'<script type="importmap">'+JSON.stringify({imports})+'</script><script>globalThis.MUSEUM_ASSETS='+JSON.stringify(assets)+'</script>');
html=html.replace(/<script>if\(location.protocol==='file:'\)[\s\S]*?<\/script>/,'');
html=html.replace('<script type="module" src="app.mjs"></script>','<script type="module">import "offline/app.mjs";</script>');
html=html.replace('href="./"','href="#gallery"');
html=html.replace('href="README.md" target="_blank"','download="使用与资源说明.txt" href="data:text/plain;charset=utf-8;base64,'+Buffer.from(fs.readFileSync(path.join(root,'PRODUCT_README.md'),'utf8')).toString('base64')+'"');
html=html.replace('<title>物派 · 数字博物馆</title>','<title>物派 · 离线器物工作室</title>');
html=require('./scripts/inline-branding.cjs')(html,root);
const output=path.join(root,'物派-离线版.html');fs.writeFileSync(output,html);console.log(output+'\n'+(Buffer.byteLength(html)/1024/1024).toFixed(1)+' MB / '+visited.size+' embedded modules');
}
build().catch(error=>{console.error(error);process.exitCode=1;});
