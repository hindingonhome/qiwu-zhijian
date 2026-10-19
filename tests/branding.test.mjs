import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('approved Wupai icon is centered enlarged vector lettering, without system font dependence',async()=>{
 const metrics=JSON.parse(await readFile('assets/branding/metrics.json','utf8'));
 assert.equal(metrics.name,'物派');assert.equal(metrics.font,'GenSen Rounded 2 TW Bold');
 assert.equal(metrics.glyphSize,174);assert.deepEqual(metrics.center,[128,128]);
 const icon=await readFile('assets/branding/icon.svg','utf8');assert.ok(icon.includes('#e8d5b6'));assert.ok(!/<text|font-family/.test(icon));
 const html=await readFile('index.html','utf8');assert.ok(html.includes('<title>物派'));assert.ok(html.includes('assets/branding/icon.svg'));assert.ok(html.includes('assets/branding/wordmark.svg'));
});
test('Android visible branding changes while its update identity remains stable',async()=>{
 const config=JSON.parse(await readFile('capacitor.config.json','utf8'));assert.equal(config.appName,'物派');assert.equal(config.appId,'cn.chamber.qiwuzhijian');
 const native=await readFile('android/app/src/main/res/values/strings.xml','utf8');assert.ok(native.includes('name="app_name">物派'));
 const styles=await readFile('android/app/src/main/res/values/styles.xml','utf8');assert.ok(styles.includes('@drawable/wupai_icon'));assert.ok(!styles.includes('qiwu_icon'));
});
