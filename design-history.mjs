// Only small material snapshots and existing image references are retained.
export class DesignHistory{
 constructor({capture,restore,onChange=()=>{},equals=(a,b)=>JSON.stringify(a)===JSON.stringify(b),limit=20}){Object.assign(this,{capture,restore,onChange,equals,limit});this.past=[];this.future=[];this.tasks=new Set();this.version=0;this.busy=false;}
 record(before,after){if(!this.equals(before,after)){this.past.push(before);if(this.past.length>this.limit)this.past.shift();this.future=[];}this.onChange();}
 flush(){clearTimeout(this.timer);if(this.draft){const before=this.draft;this.draft=null;this.record(before,this.capture());}}
 change(action){if(this.busy)return;this.draft??=this.capture();action();clearTimeout(this.timer);this.timer=setTimeout(()=>this.flush(),200);this.onChange();}
 async edit(action){this.flush();const version=++this.version;if(!this.busy)this.before=this.capture();this.busy=true;this.onChange();const task=Promise.resolve().then(action);this.tasks.add(task);try{const result=await task;if(version===this.version)this.record(this.before,this.capture());return result;}finally{this.tasks.delete(task);if(version===this.version){this.busy=false;this.before=null;this.onChange();}}}
 async whenIdle(){while(this.tasks.size)await Promise.allSettled([...this.tasks]);this.flush();}
 async move(from,to){this.flush();if(this.busy||!from.length)return false;const target=from.at(-1),current=this.capture();this.busy=true;this.onChange();try{await this.restore(target);from.pop();to.push(current);return true;}finally{this.busy=false;this.onChange();}}
 undo(){return this.move(this.past,this.future);}
 redo(){return this.move(this.future,this.past);}
 reset(){clearTimeout(this.timer);this.version++;this.draft=null;this.before=null;this.busy=false;this.past=[];this.future=[];this.onChange();}
}
