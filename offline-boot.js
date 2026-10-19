// Runs before the application so startup errors cannot strand the loading overlay.
(function () {
  var finished=false, pending=null;
  var advice='此文件需要能运行 JavaScript 和 WebGL 的浏览器。若在微信或“文件”的预览中打开，请使用“在浏览器中打开”；若菜单没有此项，请将同一 HTML 文件转到支持本地 HTML 的浏览器打开。无需联网或部署。';
  function render(){
    if(!pending)return;
    var loading=document.getElementById('loading'),status=document.getElementById('status'),help=document.getElementById('offline-startup-help');
    if(loading)loading.hidden=true;
    if(status){status.textContent=pending;status.classList.add('error');}
    if(help){help.hidden=false;help.textContent=pending+' '+advice;}
  }
  function fail(error){if(finished)return;pending='启动未完成：'+(error&&error.message?error.message:String(error));render();}
  var timer=setTimeout(function(){fail(new Error('启动超时，请关闭其他页面后重新打开。'));},30000);
  globalThis.MUSEUM_BOOT={ready:function(){finished=true;pending=null;clearTimeout(timer);var help=document.getElementById('offline-startup-help');if(help)help.hidden=true;},fail:fail};
  window.addEventListener('error',function(event){if(event.message)fail(new Error(event.message));});
  window.addEventListener('unhandledrejection',function(event){fail(event.reason||new Error('脚本运行失败'));});
  window.addEventListener('DOMContentLoaded',render);
}());
