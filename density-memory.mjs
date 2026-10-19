const STORAGE_KEY='surface-studio-density-v1';
export class DensityMemory{
 constructor(storage){this.storage=storage;try{this.values=JSON.parse(storage?.getItem(STORAGE_KEY)||'{}');}catch{this.values={};}if(!this.values||typeof this.values!=='object'||Array.isArray(this.values))this.values={};}
 get(object,pattern){return this.values[object+'|'+pattern]||1;}
 set(object,pattern,value){this.values[object+'|'+pattern]=Math.max(1,Math.min(10,Math.round(value)));try{this.storage?.setItem(STORAGE_KEY,JSON.stringify(this.values));}catch{} }
}
