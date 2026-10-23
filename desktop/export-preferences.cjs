const fs=require('node:fs'),path=require('node:path');
const {safeFilename}=require('./security.cjs');
class ExportPreferences{
 constructor(profile){this.file=path.join(profile,'export-location.json');}
 read(){try{const data=JSON.parse(fs.readFileSync(this.file,'utf8'));return {directory:typeof data.directory==='string'&&path.isAbsolute(data.directory)?data.directory:'',askEachTime:data.askEachTime!==false};}catch{return {directory:'',askEachTime:true};}}
 write(value){fs.mkdirSync(path.dirname(this.file),{recursive:true});fs.writeFileSync(this.file+'.tmp',JSON.stringify(value));fs.renameSync(this.file+'.tmp',this.file);return value;}
 choose(directory){if(!path.isAbsolute(directory)||!fs.statSync(directory).isDirectory())throw Error('请选择有效文件夹。');fs.accessSync(directory,fs.constants.W_OK);return this.write({...this.read(),directory:fs.realpathSync(directory)});}
 setAsk(value){if(typeof value!=='boolean')throw Error('导出设置无效。');const prefs=this.read();if(!value&&!prefs.directory)throw Error('请先选择默认文件夹。');return this.write({...prefs,askEachTime:value});}
 reset(){return this.write({directory:'',askEachTime:true});}
 target(name){name=safeFilename(name);const prefs=this.read();if(!prefs.directory)throw Error('请先选择默认文件夹。');fs.accessSync(prefs.directory,fs.constants.W_OK);const ext=path.extname(name),stem=path.basename(name,ext);let target=path.join(prefs.directory,name),i=2;while(fs.existsSync(target))target=path.join(prefs.directory,`${stem} (${i++})${ext}`);return target;}
}
module.exports={ExportPreferences};
