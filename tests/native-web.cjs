const {chromium}=require('playwright'),assert=require('node:assert/strict'),{spawn}=require('node:child_process');
(async()=>{
 const server=spawn(process.execPath,['server.cjs'],{stdio:'ignore'});let browser;
 try{
  for(let i=0;i<80;i++){try{if((await fetch('http://127.0.0.1:8765')).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
  browser=await chromium.launch({...(process.env.PLAYWRIGHT_CHANNEL?{channel:process.env.PLAYWRIGHT_CHANNEL}:{}),headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true}),errors=[],failed=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failed.push(r.url());});
  await page.goto('http://127.0.0.1:8765/mobile-web/index.html');
  await page.waitForFunction(()=>globalThis.SAFARI_VIEWER&&document.querySelector('#loading').hidden);
  assert.equal(await page.evaluate(()=>typeof globalThis.QIWU_NATIVE_DOWNLOAD),'undefined','web preview must not invoke the Android bridge');
  for(const id of ['apple','mango','watermelon']){
   await page.evaluate(id=>document.querySelector('[data-kind='+id+']').click(),id);
   await page.waitForFunction(()=>document.querySelector('#loading').hidden);
   await page.locator('.quick-patterns [data-production]').click();
  }
  await page.locator('#capture').click();
  const downloadEvent=page.waitForEvent('download');await page.locator('#export-menu button').first().click();
  assert.ok((await downloadEvent).suggestedFilename().endsWith('.png'));
  assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
  console.log('NATIVE_SPLIT_ASSET_BOOT_SWITCH_PNG_WEB_FALLBACK_PASS');
 }finally{if(browser)await browser.close();server.kill();}
})().catch(error=>{console.error(error);process.exitCode=1;});
