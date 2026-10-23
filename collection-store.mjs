// Model blobs are cloned by IndexedDB without parsing geometry or touching WebGL.
const empty=()=>({version:1,collections:[],models:[]});
const clone=state=>({...state,collections:state.collections.map(x=>({...x})),models:state.models.map(x=>({...x}))});
const validId=id=>typeof id==='string'&&/^[a-zA-Z0-9_-]{1,80}$/.test(id)&&!['fruit','objects'].includes(id);
const text=(s,max)=>typeof s==='string'&&s.trim().length>0&&s.length<=max;
export function validateState(state){
 if(!state||state.version!==1||!Array.isArray(state.collections)||!Array.isArray(state.models)||state.collections.length>100||state.models.length>2000)throw Error('派库格式无效');
 const ids=new Set();for(const c of state.collections){if(!validId(c.id)||ids.has(c.id)||!text(c.name,80))throw Error('栏目格式无效');ids.add(c.id);}
 const models=new Set();let bytes=0;for(const m of state.models){if(!validId(m.id)||models.has(m.id)||!['fruit','objects',...ids].includes(m.collectionId)||!text(m.name,120)||!text(m.filename,240)||! /\.(glb|gltf|stl)$/i.test(m.filename)||!(m.blob instanceof Blob)||m.blob.size>100*1024*1024||typeof m.description!=='string'||m.description.length>2000)throw Error('模型格式无效');models.add(m.id);bytes+=m.blob.size;}if(bytes>300*1024*1024)throw Error('派库超过 300 MB，请分库保存');return clone(state);
}
export function indexedCollectionStorage(){let db;
 const connect=()=>db?Promise.resolve(db):new Promise((resolve,reject)=>{const r=indexedDB.open('wupai-personal-library',1);r.onupgradeneeded=()=>r.result.createObjectStore('library');r.onsuccess=()=>{db=r.result;db.onversionchange=()=>{db.close();db=null;};resolve(db)};r.onerror=()=>reject(r.error);});
 return {async read(){const d=await connect();return new Promise((resolve,reject)=>{const r=d.transaction('library').objectStore('library').get('state');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});},async write(value){const d=await connect();return new Promise((resolve,reject)=>{const tx=d.transaction('library','readwrite');tx.objectStore('library').put(value,'state');tx.oncomplete=()=>resolve();tx.onerror=tx.onabort=()=>reject(tx.error||Error('本地保存失败'));});}};
}
export class CollectionStore{
 constructor(storage=indexedCollectionStorage()){this.storage=storage;this.state=empty();this.past=[];this.future=[];this.unlocked=new Set();this.busy=false;}
 async open(){const saved=await this.storage.read();if(saved)this.state=validateState(saved);return this;}
 unlock(id){if(!this.state.collections.some(c=>c.id===id))throw Error('默认栏目不能解锁');this.unlocked.has(id)?this.unlocked.delete(id):this.unlocked.add(id);}
 requireEditable(id){if(!this.state.collections.some(c=>c.id===id)||!this.unlocked.has(id))throw Error('请先解锁自建栏目');}
 async commit(next,history=true){if(this.busy)throw Error('正在保存，请稍候');this.busy=true;try{next=validateState(next);await this.storage.write(next);if(history){this.past.push(this.state);if(this.past.length>20)this.past.shift();this.future=[];}this.state=next;}finally{this.busy=false;}}
 async addCollection(name){if(!text(name,80))throw Error('栏目名称需为 1–80 字');const id='c_'+crypto.randomUUID();await this.commit({...this.state,collections:[...this.state.collections,{id,name:name.trim()}]});return id;}
 rename(id,name){this.requireEditable(id);if(!text(name,80))throw Error('栏目名称需为 1–80 字');return this.commit({...this.state,collections:this.state.collections.map(c=>c.id===id?{...c,name:name.trim()}:c)});}
 removeCollection(id){this.requireEditable(id);return this.commit({...this.state,collections:this.state.collections.filter(c=>c.id!==id),models:this.state.models.filter(m=>m.collectionId!==id)});}
 async addModel(collectionId,{name,filename,blob,description='',id='m_'+crypto.randomUUID()}){if(!['fruit','objects'].includes(collectionId)&&!this.state.collections.some(c=>c.id===collectionId))throw Error('栏目不存在');await this.commit({...this.state,models:[...this.state.models,{id,collectionId,name,filename,blob,description}]});return id;}
 removeModel(id){const model=this.state.models.find(m=>m.id===id);if(!model)throw Error('模型不存在');this.requireModelEditable(model);return this.commit({...this.state,models:this.state.models.filter(m=>m.id!==id)});}
 requireModelEditable(model){if(['fruit','objects'].includes(model.collectionId)){if(!this.unlocked.has('imports:'+model.collectionId))throw Error('请先解锁导入模型');}else this.requireEditable(model.collectionId);}
 editModel(id,{name,description}){const model=this.state.models.find(m=>m.id===id);if(!model)throw Error('模型不存在');this.requireModelEditable(model);return this.commit({...this.state,models:this.state.models.map(m=>m.id===id?{...m,name,description}:m)});}
 async undo(){if(!this.past.length)return;const target=this.past.at(-1),current=this.state;await this.commit(target,false);this.past.pop();this.future.push(current);}
 async redo(){if(!this.future.length)return;const target=this.future.at(-1),current=this.state;await this.commit(target,false);this.future.pop();this.past.push(current);}
 restore(state){return this.commit(validateState(state));}
}
