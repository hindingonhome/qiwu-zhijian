// Portable launchers detach their real Electron child, hiding its inspector stderr.
// Attach to the Chromium port written inside the isolated test profile instead.
const { chromium } = require('playwright');
const { spawn } = require('node:child_process');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const delay = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const progress=stage=>{if(process.env.WUPAI_TEST_REPORT)fs.writeFileSync(process.env.WUPAI_TEST_REPORT,JSON.stringify({stage}));};
(async()=>{
 progress('starting');
 const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'wupai-portable-'));
 const profile=path.join(temporary,'profile'),downloads=path.join(temporary,'downloads');
 const executable=path.resolve(process.env.WUPAI_TEST_EXECUTABLE);
 const child=spawn(executable,['--remote-debugging-port=0'],{env:{...process.env,WUPAI_TEST:'1',WUPAI_TEST_PROFILE:profile,WUPAI_TEST_DOWNLOAD_DIR:downloads},stdio:'ignore',windowsHide:true});
 let browser;
 try {
  const portFile=path.join(profile,'DevToolsActivePort');
  const deadline=Date.now()+120000;
  while(!fs.existsSync(portFile)){if(Date.now()>deadline)throw new Error('Portable Chromium debugging port did not appear');await delay(200);}
  const [port,endpoint]=fs.readFileSync(portFile,'utf8').trim().split(/\r?\n/);
  progress('connecting');
  browser=await chromium.connectOverCDP(`ws://127.0.0.1:${port}${endpoint}`);
  progress('connected');
  const context=browser.contexts()[0];
  const browserSession=await browser.newBrowserCDPSession();
  await browserSession.send('Browser.setDownloadBehavior',{behavior:'default'});
  let page=context.pages().find(page=>page.url().startsWith('wupai:'));
  if(!page)page=await context.waitForEvent('page');
  progress('page');
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.waitForFunction(()=>globalThis.SAFARI_VIEWER&&document.querySelector('#loading').hidden,undefined,{timeout:120000});
  progress('ready');
  assert.match(await page.title(),/物派/);
  assert.deepEqual(await page.evaluate(()=>[typeof require,typeof process,typeof Buffer,typeof wupaiDesktop.download]),['undefined','undefined','undefined','function']);
  for(const id of ['apple','watermelon']){
   await page.evaluate(id=>document.querySelector('[data-kind='+id+']').click(),id);
   await page.waitForFunction(()=>document.querySelector('#loading').hidden);
   assert.equal(await page.locator('[data-kind='+id+']').getAttribute('aria-pressed'),'true');
  }
  const download=async(selector,suffix)=>{
   await page.evaluate(()=>document.querySelector('#status').textContent='等待保存');
   await page.locator('#capture').click();await page.locator(selector).click();
   await page.waitForFunction(()=>/已导出/.test(document.querySelector('#status').textContent),undefined,{timeout:120000});
   const names=fs.readdirSync(downloads),name=names.find(name=>name.endsWith(suffix));assert.ok(name,JSON.stringify(names));return path.join(downloads,name);
  };
  const png=await download('#export-menu button:first-child','.png');assert.equal(fs.readFileSync(png).readUInt32BE(0),0x89504e47);
  const glb=await download('#export-model','.glb');assert.equal(fs.readFileSync(glb).readUInt32LE(0),0x46546c67);
  await page.locator('#texture-file').setInputFiles(png);await page.waitForFunction(()=>!document.querySelector('#export-texture').disabled);
  assert.ok(await page.evaluate(async()=>{try{await wupaiDesktop.download('https://example.com/test.png','test.png');return false;}catch{return true;}}));
  await page.evaluate(()=>window.open('https://example.com'));assert.equal(context.pages().length,1);
  assert.deepEqual(errors,[]);
  const result={result:'PACKAGED_PORTABLE_BOOT_ISOLATION_SWITCH_IMPORT_PNG_GLB_PASS',executable,pngBytes:fs.statSync(png).size,glbBytes:fs.statSync(glb).size};
  if(process.env.WUPAI_TEST_REPORT)fs.writeFileSync(process.env.WUPAI_TEST_REPORT,JSON.stringify(result,null,2));
  console.log(result.result+' '+executable);
  browserSession.send('Browser.close').catch(()=>{});browser=null;
 }catch(error){if(process.env.WUPAI_TEST_REPORT)fs.writeFileSync(process.env.WUPAI_TEST_REPORT,JSON.stringify({error:error.stack},null,2));throw error;}finally{
  if(browser){try{const cdp=await browser.newBrowserCDPSession();cdp.send('Browser.close').catch(()=>{});}catch{}}
  await delay(1500);child.kill();
  // The launcher may take a moment to release extraction/profile handles.
  for(let i=0;i<20;i++){try{fs.rmSync(temporary,{recursive:true,force:true});break;}catch{await delay(200);}}
 }
})().catch(error=>{if(process.env.WUPAI_TEST_REPORT)fs.writeFileSync(process.env.WUPAI_TEST_REPORT,JSON.stringify({error:error.stack},null,2));console.error(error);process.exitCode=1;});
