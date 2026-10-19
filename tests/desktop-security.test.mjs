import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
const { isAppURL, resolveAppPath, isDownloadURL, safeFilename } = createRequire(import.meta.url)('../desktop/security.cjs');
test('desktop protocol confines requests to app content', () => {
 const root = path.resolve('desktop-web');
 assert.equal(resolveAppPath('wupai://app/index.html', root), path.join(root, 'index.html'));
 for (const url of ['https://example.com', 'wupai://evil/index.html', 'wupai://app/%2e%2e%2fsecret', 'wupai://app/%5csecret', 'wupai://user@app/index.html', 'wupai://app/%00']) assert.equal(resolveAppPath(url, root), null, url);
 assert.equal(isAppURL('file:///index.html'), false);
});
test('download bridge allows local assets and plain filenames only', () => {
 assert.ok(isDownloadURL('blob:wupai://app/123'));
 assert.ok(isDownloadURL('data:image/png;base64,aA=='));
 for (const url of ['https://example.com/a.png','file:///secret','data:text/html,hello','blob:https://example.com/id']) assert.equal(isDownloadURL(url),false);
 assert.equal(safeFilename('物派-apple.png'),'物派-apple.png');
 for(const name of ['../secret','a/b','a\\b','a:stream','', '..']) assert.throws(()=>safeFilename(name));
});
