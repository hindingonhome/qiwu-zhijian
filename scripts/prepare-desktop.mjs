import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
execFileSync(process.execPath, ['build-safari.cjs', '--native', '--desktop', '--output', 'desktop-web/index.html'], { cwd: root, stdio: 'inherit' });
