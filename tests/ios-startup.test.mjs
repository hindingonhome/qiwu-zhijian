import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const runtime=new URL('../offline-boot.js',import.meta.url);
function boot(){
 const nodes=new Map(['loading','status','offline-startup-help'].map(id=>[id,{hidden:id==='offline-startup-help',textContent:'',classList:{add(){}}}]));
 const handlers={},timers=[];
 const window={document:{getElementById:id=>nodes.get(id),readyState:'complete'},setTimeout(fn){timers.push(fn);return timers.length;},clearTimeout(id){timers[id-1]=null;},addEventListener(name,fn){handlers[name]=fn;},console};
 window.window=window;window.globalThis=window;
 vm.runInNewContext(fs.readFileSync(runtime,'utf8'),window);
 return {window,nodes,handlers,timers};
}
test('stalled startup replaces indefinite spinner with local-open instructions',()=>{const b=boot();b.timers[0]();assert.equal(b.nodes.get('loading').hidden,true);assert.match(b.nodes.get('offline-startup-help').textContent,/本地 HTML/);assert.match(b.nodes.get('status').textContent,/启动超时/);});
test('startup rejection exposes its diagnostic and stops loading',()=>{const b=boot();b.window.MUSEUM_BOOT.fail(new Error('WebGL unavailable'));assert.match(b.nodes.get('status').textContent,/WebGL unavailable/);assert.equal(b.nodes.get('loading').hidden,true);});
test('completion cancels timeout and leaves no warning',()=>{const b=boot();b.window.MUSEUM_BOOT.ready();assert.equal(b.timers.filter(Boolean).length,0);assert.equal(b.nodes.get('offline-startup-help').hidden,true);});
test('early syntax or script error has a visible diagnostic',()=>{const b=boot();b.handlers.error({message:'SyntaxError: unexpected token'});assert.match(b.nodes.get('status').textContent,/SyntaxError/);});
