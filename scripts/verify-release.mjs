export function verifyAssets(expected,actual){
 if(actual.length!==expected.length)throw Error(`Release asset count mismatch: ${actual.length} / ${expected.length}`);
 const names=new Set();
 for(const file of expected){
  if(names.has(file.name))throw Error('Duplicate expected asset: '+file.name);names.add(file.name);
  const asset=actual.find(a=>a.name===file.name);
  if(!asset||asset.size!==file.size||asset.state!=='uploaded'||asset.digest!==file.digest)throw Error('Missing or changed release asset: '+file.name);
 }
}
