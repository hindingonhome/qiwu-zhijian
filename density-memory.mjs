const STORAGE_KEY='surface-studio-density-v1';
export class DensityMemory{
 constructor(storage){this.storage=storage;try{this.values=JSON.parse(storage?.getItem(STORAGE_KEY)||'{}');}catch{this.values={};}if(!this.values||typeof this.values!=='object'||Array.isArray(this.values))this.values={};}
 get(object,pattern){const v=Number(this.values[object+'|'+pattern]);return Number.isFinite(v)?Math.max(1,Math.min(5,Math.round(v*100)/100)):1;}
 set(object,pattern,value){this.values[object+'|'+pattern]=Number.isFinite(value)?Math.max(1,Math.min(5,Math.round(value*100)/100)):1;try{this.storage?.setItem(STORAGE_KEY,JSON.stringify(this.values));}catch{} }
}
