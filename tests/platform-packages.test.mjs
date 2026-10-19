import test from 'node:test';
import assert from 'node:assert/strict';
import {platformFiles} from '../scripts/platform-files.mjs';
test('platform packages separate desktop, Android, iPhone models and Linux launcher',()=>{
 const models=['Apple-Original.usdz','Mango-Original.usdz'];
 const plan=platformFiles('1.0.1',models);
 assert.deepEqual(Object.keys(plan),['Desktop','Android','iPhone','Linux']);
 assert.ok(plan.Android.some(f=>f.source.endsWith('-Android.apk')));
 assert.ok(plan.Android.some(f=>f.source.endsWith('-Android-Offline.html')));
 assert.deepEqual(plan.iPhone.filter(f=>f.source.endsWith('.usdz')).map(f=>f.name),models.map(n=>'Models/'+n));
 assert.ok(plan.Desktop.some(f=>f.source.endsWith('-Windows.exe')));
 assert.ok(plan.Linux.some(f=>f.source.endsWith('-Linux.AppImage')&&f.mode===0o100755));
 assert.ok(plan.Linux.some(f=>f.name==='Launch.sh'&&f.mode===0o100755));
 for(const platform of ['Desktop','Linux'])assert.ok(plan[platform].some(f=>f.name==='Backup-HTML/Wupai.html'));
 for(const platform of ['Desktop','Android','Linux'])assert.ok(!plan[platform].some(f=>f.source.endsWith('.usdz')));
 for(const files of Object.values(plan))assert.ok(files.some(f=>f.name==='CHANGELOG.md'));
});
