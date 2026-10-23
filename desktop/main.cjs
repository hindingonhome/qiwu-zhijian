const { app, BrowserWindow, protocol, session, ipcMain, dialog } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { Readable } = require('node:stream');
const { ORIGIN, isAppURL, resolveAppPath, isDownloadURL, safeFilename } = require('./security.cjs');

protocol.registerSchemesAsPrivileged([{ scheme: 'wupai', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true } }]);
app.setName('物派');
if (process.platform === 'win32') app.setAppUserModelId('cn.chamber.wupai.desktop');
const testing = process.env.WUPAI_TEST === '1';
// Keep a portable app's preferences with its executable when that location is writable.
const portableDirectory = process.env.PORTABLE_EXECUTABLE_DIR || (process.env.APPIMAGE ? path.dirname(process.env.APPIMAGE) : null);
if (portableDirectory && !(testing && process.env.WUPAI_TEST_PROFILE)) {
  try {
    const profile = path.join(portableDirectory, 'Wupai-Data');
    fs.mkdirSync(profile, { recursive: true });
    fs.accessSync(profile, fs.constants.W_OK);
    const probe = path.join(profile, `.write-test-${process.pid}`);
    fs.writeFileSync(probe, ''); fs.unlinkSync(probe);
    app.setPath('userData', profile);
  } catch { /* Read-only removable media uses the OS application-data directory. */ }
}
if (testing) {
  app.commandLine.appendSwitch('use-angle', 'swiftshader');
  app.commandLine.appendSwitch('enable-unsafe-swiftshader');
  if (process.env.WUPAI_TEST_PROFILE) app.setPath('userData', path.resolve(process.env.WUPAI_TEST_PROFILE));
}
let window;
const pending = new Map();
const {ExportPreferences}=require('./export-preferences.cjs');
let exportPreferences;
function createWindow() {
  window = new BrowserWindow({ width: 1440, height: 960, minWidth: 760, minHeight: 640, title: '物派', backgroundColor: '#f4f1ec', icon: path.join(app.getAppPath(), 'assets/branding/icon.png'), webPreferences: { preload: path.join(__dirname, 'preload.cjs'), nodeIntegration: false, contextIsolation: true, sandbox: true, webSecurity: true, webviewTag: false } });
  window.removeMenu();
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  window.webContents.on('will-navigate', (event, url) => { if (!isAppURL(url)) event.preventDefault(); });
  window.webContents.on('will-redirect', (event, url) => { if (!isAppURL(url)) event.preventDefault(); });
  window.webContents.on('page-title-updated', event => { event.preventDefault(); window.setTitle('物派'); });
  window.loadURL(ORIGIN + '/index.html');
}
app.whenReady().then(() => {
  exportPreferences=new ExportPreferences(app.getPath('userData'));
  const trusted=event=>event.sender===window?.webContents&&event.senderFrame===event.sender.mainFrame&&isAppURL(event.senderFrame?.url);
  ipcMain.handle('wupai:export-preferences',event=>{if(!trusted(event))throw Error('Blocked');return exportPreferences.read();});
  ipcMain.handle('wupai:export-choose',async event=>{if(!trusted(event))throw Error('Blocked');const result=testing&&process.env.WUPAI_TEST_CHOOSE_DIR?{canceled:false,filePaths:[process.env.WUPAI_TEST_CHOOSE_DIR]}:await dialog.showOpenDialog(window,{title:'选择默认导出文件夹',properties:['openDirectory','createDirectory'],defaultPath:exportPreferences.read().directory||app.getPath('downloads')});return result.canceled?{cancelled:true}:exportPreferences.choose(result.filePaths[0]);});
  ipcMain.handle('wupai:export-ask',(event,value)=>{if(!trusted(event))throw Error('Blocked');return exportPreferences.setAsk(value);});
  ipcMain.handle('wupai:export-reset',event=>{if(!trusted(event))throw Error('Blocked');return exportPreferences.reset();});
  const root = path.join(app.getAppPath(), 'desktop-web');
  protocol.handle('wupai', request => {
    const file = resolveAppPath(request.url, root);
    if (!file || !fs.existsSync(file) || !fs.statSync(file).isFile()) return new Response('Not found', { status: 404 });
    // Do not follow package symlinks to files outside the application content.
    if (!fs.realpathSync(file).startsWith(fs.realpathSync(root) + path.sep)) return new Response('Forbidden', { status: 403 });
    const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.glb': 'model/gltf-binary' };
    return new Response(Readable.toWeb(fs.createReadStream(file)), { headers: { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Content-Length': String(fs.statSync(file).size), 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; connect-src 'self' blob: data:; font-src 'self' data:; worker-src 'self' blob:; object-src 'none'; frame-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'" } });
  });
  session.defaultSession.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
  session.defaultSession.setPermissionCheckHandler(() => false);
  session.defaultSession.webRequest.onBeforeRequest((details, callback) => callback({ cancel: !isAppURL(details.url) && !details.url.startsWith('blob:wupai://app/') && !details.url.startsWith('data:') && details.url !== 'devtools://devtools/bundled/inspector.html' }));
  session.defaultSession.on('will-download', (event, item, contents) => {
    const queue = pending.get(item.getURL());
    const job = queue?.shift();
    if (queue && !queue.length) pending.delete(item.getURL());
    if (!contents || contents !== window?.webContents || !isDownloadURL(item.getURL())) { event.preventDefault(); job?.reject(new Error('Download blocked')); return; }
    const name = job?.name || item.getFilename();
    if(job?.target)item.setSavePath(job.target);
    item.setSaveDialogOptions({ title: '保存物派文件', defaultPath: name });
    if (testing && process.env.WUPAI_TEST_DOWNLOAD_DIR) {
      const target = path.resolve(process.env.WUPAI_TEST_DOWNLOAD_DIR); fs.mkdirSync(target, { recursive: true });
      item.setSavePath(path.join(target, safeFilename(name)));
    }
    item.once('done', (_event, state) => {
      if (state === 'completed') job?.resolve({ cancelled: false });
      else if (state === 'cancelled') job?.resolve({ cancelled: true });
      else job?.reject(new Error('文件保存中断，请重试。'));
    });
    if (testing && process.env.WUPAI_TEST_CANCEL_DOWNLOAD === '1') item.cancel();
  });
  ipcMain.handle('wupai:download', async (event, url, name) => {
    if (event.sender !== window?.webContents || event.senderFrame !== event.sender.mainFrame || !isAppURL(event.senderFrame?.url) || !isDownloadURL(url)) throw new Error('Download blocked');
    name = safeFilename(name);
    let target;const prefs=exportPreferences.read();
    if(!(testing&&process.env.WUPAI_TEST_DOWNLOAD_DIR)){if(prefs.askEachTime){const result=await dialog.showSaveDialog(window,{title:'保存物派文件',defaultPath:path.join(prefs.directory||app.getPath('downloads'),name)});if(result.canceled||!result.filePath)return {cancelled:true};target=result.filePath;}else target=exportPreferences.target(name);}
    return new Promise((resolve, reject) => {
      const queue = pending.get(url) || []; queue.push({ name, target, resolve, reject }); pending.set(url, queue);
      try { event.sender.downloadURL(url); } catch (error) { queue.pop(); if (!queue.length) pending.delete(url); reject(error); }
    });
  });
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
