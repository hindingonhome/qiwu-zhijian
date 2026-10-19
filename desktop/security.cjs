const path = require('node:path');

const ORIGIN = 'wupai://app';
function isAppURL(value) {
  try { const url = new URL(value); return url.protocol === 'wupai:' && url.hostname === 'app' && !url.username && !url.password && !url.port; } catch { return false; }
}
function resolveAppPath(value, root) {
  if (!isAppURL(value)) return null;
  let pathname;
  try { pathname = decodeURIComponent(new URL(value).pathname); } catch { return null; }
  if (pathname.includes('\\') || pathname.includes('\0') || pathname.split('/').some(part => part === '..')) return null;
  const candidate = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  return candidate.startsWith(path.resolve(root) + path.sep) ? candidate : null;
}
function isDownloadURL(value) {
  return typeof value === 'string' && (value.startsWith('blob:wupai://app/') || /^data:(image\/(png|jpeg|webp)|model\/gltf-binary|application\/octet-stream|text\/plain)[;,]/i.test(value));
}
function safeFilename(value) {
  if (typeof value !== 'string' || !value || value.length > 200 || /[<>:"/\\|?*\x00-\x1f]/.test(value) || value === '.' || value === '..') throw new Error('Invalid download filename');
  return value;
}
module.exports = { ORIGIN, isAppURL, resolveAppPath, isDownloadURL, safeFilename };
