const fs=require('node:fs'),path=require('node:path');
const root=__dirname,native=process.argv.includes('--native');
async function build(){
 let app=fs.readFileSync(path.join(root,'app.mjs'),'utf8');
 if(!app.includes('const $=id=>')||!app.includes('export {viewer};'))throw new Error('App startup markers changed; Safari wrapper must be updated.');
 app=app.replace('const $=id=>','async function start(){\nconst $=id=>').replace('export {viewer};','globalThis.SAFARI_VIEWER=viewer;\n}\nstart().then(()=>globalThis.MUSEUM_BOOT.ready()).catch(error=>{console.error(error);globalThis.MUSEUM_BOOT.fail(error);});');
 if(native)app="import {Capacitor,registerPlugin} from '@capacitor/core';\nimport {installNativeDownloads} from './mobile/native-download.mjs';\nif(Capacitor.isNativePlatform())installNativeDownloads(registerPlugin('FileExport'));\n"+app;
 const code=require('esbuild').buildSync({stdin:{contents:app,resolveDir:root,sourcefile:'app.mjs'},bundle:true,format:'iife',target:'safari15',minify:true,write:false}).outputFiles[0].text;
 const assets=new Map(),{ARTIFACTS}=await import('./artifact-library.mjs');
 for(const item of ARTIFACTS)for(const [file,mime]of [[item.asset,'model/gltf-binary'],[item.thumbnail,'image/png']])if(file)assets.set(file,{file,mime});
 for(const [file,mime]of [['brass/color.jpg','image/jpeg'],['brass/normal.jpg','image/jpeg'],['brass/roughness.jpg','image/jpeg'],['brass/metalness.jpg','image/jpeg'],['friend/orange-gold.png','image/png'],['friend/lacquer.png','image/png'],['friend/lacquer-metalness.png','image/png'],['friend/lacquer-roughness.png','image/png'],['friend/orange-gold.jpg','image/jpeg']])assets.set('./assets/'+file,{file:'./assets/'+file,mime});
 assets.set('./assets/museum.hdr',{file:'./assets/mobile-museum.hdr',mime:'application/octet-stream'});
 let mobileScript;
 if(native){
  const outputFlag=process.argv.indexOf('--output'),target=path.dirname(path.resolve(outputFlag>=0?process.argv[outputFlag+1]:'mobile-web/index.html'));
  fs.mkdirSync(target,{recursive:true});
  for(const [key,{file}]of assets){const destination=path.join(target,key.replace(/^\.\//,''));fs.mkdirSync(path.dirname(destination),{recursive:true});fs.copyFileSync(path.join(root,file),destination);}
  fs.writeFileSync(path.join(target,'app.js'),code);mobileScript='<script src="app.js"></script>';
 }else{
 // Inert base64 blocks avoid compiling every model into a huge JS string literal.
 // Convert on first use and cache Blob URLs; decode in chunks to limit peak memory.
 const entries=[...assets],blocks=entries.map(([key,{file,mime}],i)=>'<script type="application/octet-stream" id="museum-asset-'+i+'">'+fs.readFileSync(path.join(root,file)).toString('base64')+'</script>').join('');
 const assetScript='<script>globalThis.MUSEUM_ASSETS={};'+JSON.stringify(entries.map(([key,{mime}])=>[key,mime]))+'.forEach(function(item,i){var cached;Object.defineProperty(globalThis.MUSEUM_ASSETS,item[0],{get:function(){if(cached)return cached;var node=document.getElementById("museum-asset-"+i),data=node.textContent,parts=[];for(var offset=0;offset<data.length;offset+=32768){var raw=atob(data.slice(offset,offset+32768)),bytes=new Uint8Array(raw.length);for(var j=0;j<raw.length;j++)bytes[j]=raw.charCodeAt(j);parts.push(bytes);}cached=URL.createObjectURL(new Blob(parts,{type:item[1]}));node.remove();return cached;}});});</script>';
 mobileScript=blocks+assetScript+'<script>'+code.replace(/<\/script/gi,'<\\/script')+'</script>';
 }
 let html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 // Use iOS system Chinese fonts instead of embedding the 16 MB desktop font.
 const css=fs.readFileSync(path.join(root,'product.css'),'utf8').replace(/@font-face\s*\{[^}]*\}/g,'');
 html=html.replace('<link rel="stylesheet" href="product.css">',()=>'<style>'+css+'</style>');
 html=html.replace(/<script type="importmap">[\s\S]*?<\/script>/,'');
 html=html.replace(/<script>if\(location.protocol==='file:'\)[\s\S]*?<\/script>/,'');
 html=html.replace('<script type="module" src="app.mjs"></script>',()=>mobileScript);
 html=html.replace('</head>',()=>'<script>'+fs.readFileSync(path.join(root,'offline-boot.js'),'utf8')+'</script></head>');
 const help='<aside id="offline-startup-help" hidden role="alert" style="position:fixed;z-index:9999;left:16px;right:16px;bottom:20px;padding:18px;border-radius:16px;background:#fff;color:#222;box-shadow:0 4px 32px #0003;font:14px/1.7 system-ui"></aside><noscript><style>#loading{display:none!important}</style><aside style="position:fixed;z-index:9999;inset:25% 16px auto;padding:24px;background:white;color:#222;border:1px solid #bbb;font:16px/1.8 system-ui">当前打开方式未运行 JavaScript，因此无法显示三维器物。请使用支持 JavaScript 和 WebGL 的浏览器打开这个本地 HTML 文件。微信或“文件”的预览可能仅显示静态页面；请使用“在浏览器中打开”，若没有此项，将同一文件转到支持本地 HTML 的浏览器。无需联网或部署。</aside></noscript>';
 html=html.replace('</body>',help+'</body>');
 html=html.replace('<title>器物之间 · 数字博物馆</title>','<title>器物之间 · Safari 离线器物工作室</title>').replace('href="./"','href="#gallery"');
 html=html.replace('href="README.md" target="_blank"','download="使用与资源说明.txt" href="data:text/plain;charset=utf-8;base64,'+Buffer.from(fs.readFileSync(path.join(root,'PRODUCT_README.md'),'utf8')).toString('base64')+'"');
 html=html.replace('<div class="view-hint" aria-label="操作说明"><span>左键转器物</span><span>右键转灯光</span><span>滚轮缩放</span></div>','<div class="view-hint" aria-label="触屏操作说明"><span>单指转器物</span><span>双指缩放</span></div>');
 html=html.replace('<p>左键转器物 · 右键转灯光 · 滚轮缩放</p>','').replace('触屏：单指转动，双指缩放。','单指拖动旋转器物，双指捏合缩放。').replace('三维器物，左键旋转器物，右键旋转灯光，滚轮缩放','三维器物，单指旋转，双指缩放');
 const index=process.argv.indexOf('--output'),output=index>=0?path.resolve(process.argv[index+1]):path.join(root,'器物之间-Safari离线版.html');
 fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,html);console.log(output+'\n'+(Buffer.byteLength(html)/1024/1024).toFixed(1)+' MB');
}
build().catch(error=>{console.error(error);process.exitCode=1;});
