export function installNativeDownloads(plugin){
 globalThis.QIWU_NATIVE_DOWNLOAD=async(url,name)=>{
  const response=await fetch(url);if(!response.ok)throw Error(`文件读取失败 (${response.status})`);
  const blob=await response.blob(),buffer=new Uint8Array(await blob.arrayBuffer());let encoded='';
  for(let offset=0;offset<buffer.length;offset+=24576)encoded+=btoa(String.fromCharCode(...buffer.subarray(offset,offset+24576)));
  const result=await plugin.save({name,mime:blob.type||'application/octet-stream',base64:encoded});
  return result;
 };
}
