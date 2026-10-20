const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=__dirname,port=Number(process.env.MUSEUM_PORT||8765);
const mime={'.svg':'image/svg+xml','.ico':'image/x-icon','.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json','.md':'text/plain; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.glb':'model/gltf-binary','.gltf':'model/gltf+json','.hdr':'application/octet-stream'};
const server=http.createServer((req,res)=>{
 let filename;try{filename=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));}catch{res.writeHead(400);res.end('Bad request');return;}
 if(filename===root)filename=path.join(root,'index.html');
 if(!filename.startsWith(root+path.sep)){res.writeHead(403);res.end('Forbidden');return;}
 fs.stat(filename,(err,stat)=>{if(err||!stat.isFile()){if(req.method==='HEAD'&&['teapot.glb','bowl.glb','plate.glb'].includes(path.basename(filename))){res.writeHead(204);res.end();return;}res.writeHead(404);res.end('Not found');return;}res.writeHead(200,{'Content-Type':mime[path.extname(filename)]||'application/octet-stream','Content-Length':stat.size,'Cache-Control':'no-cache'});if(req.method==='HEAD')res.end();else fs.createReadStream(filename).on('error',()=>res.destroy()).pipe(res);});
});
server.listen(port,'127.0.0.1',()=>{const url=`http://127.0.0.1:${port}`;console.log(`Museum gallery: ${url}\nKeep this window open. Ctrl+C stops the gallery.`);if(process.env.MUSEUM_OPEN==='1'&&process.platform==='win32')require('node:child_process').spawn('cmd.exe',['/c','start','',url],{windowsHide:true,stdio:'ignore'});});
server.on('error',error=>{console.error(error.code==='EADDRINUSE'?`Port ${port} is occupied. Set MUSEUM_PORT to another port.`:error.message);process.exitCode=1;});
