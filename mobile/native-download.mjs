export function installNativeDownloads(plugin){
 globalThis.QIWU_NATIVE_DOWNLOAD=async(url,name)=>{
  const response=await fetch(url);if(!response.ok)throw Error(`文件读取失败 (${response.status})`);
  const blob=await response.blob();
  if(blob.size>8*1024*1024&&typeof plugin.startSave==='function'){
   const result=await plugin.startSave({name,mime:blob.type||'application/octet-stream'});if(result.cancelled)return result;
   try{for(let offset=0;offset<blob.size;offset+=262144){const bytes=new Uint8Array(await blob.slice(offset,offset+262144).arrayBuffer());let raw='';for(let i=0;i<bytes.length;i+=24576)raw+=String.fromCharCode(...bytes.subarray(i,i+24576));await plugin.appendSave({id:result.id,base64:btoa(raw)});}return await plugin.finishSave({id:result.id});}catch(error){try{await plugin.abortSave({id:result.id});}catch{}throw error;}
  }
  const buffer=new Uint8Array(await blob.arrayBuffer());let encoded='';
  for(let offset=0;offset<buffer.length;offset+=24576)encoded+=btoa(String.fromCharCode(...buffer.subarray(offset,offset+24576)));
  const result=await plugin.save({name,mime:blob.type||'application/octet-stream',base64:encoded});
  return result;
 };
}
