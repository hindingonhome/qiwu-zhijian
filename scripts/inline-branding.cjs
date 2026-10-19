const fs=require('node:fs'),path=require('node:path');
module.exports=function inlineBranding(html,root){return html.replace(/(href|src)="(assets\/branding\/[^"/]+)"/g,(_,attribute,file)=>{const mime=file.endsWith('.svg')?'image/svg+xml':'image/png';return `${attribute}="data:${mime};base64,${fs.readFileSync(path.join(root,file)).toString('base64')}"`;});};
