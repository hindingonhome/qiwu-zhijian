export function platformFiles(version,models){
 const common=[{source:'licenses/fflate-LICENSE.txt',name:'Licenses/fflate.txt'},{source:'docs/物派-简明使用说明.pdf',name:'Quick-Start.pdf'},{source:'docs/COMMERCIAL-LICENSE.md',name:'Commercial-License.md'},{source:'docs/PRIVACY.md',name:'Privacy.md'},{source:'SUPPORT.md',name:'Support.md'},{source:'licenses/Electron-LICENSE.txt',name:'Licenses/Electron.txt'},{source:'PRODUCT_README.md',name:'User-Guide.md'},{source:'CHANGELOG.md',name:'CHANGELOG.md'},{source:'LICENSE',name:'LICENSE.txt'},{source:'docs/ADDING-SERIES.md',name:'Adding-Series.md'},{source:'THIRD_PARTY_LICENSE.txt',name:'THIRD_PARTY_LICENSE.txt'},{source:'assets/ASSET_LICENSES.md',name:'Licenses/Assets.md'},{source:'licenses/Capacitor-LICENSE',name:'Licenses/Capacitor.txt'},{source:'vendor/package/LICENSE',name:'Licenses/Three.txt'},{source:'licenses/GenSen-OFL.txt',name:'Licenses/GenSen-OFL.txt'},{source:'assets/branding/icon.svg',name:'Branding/icon.svg'},{source:'assets/branding/icon.png',name:'Branding/icon.png'},{source:'assets/branding/icon.ico',name:'Branding/icon.ico'}];
 const html=platform=>({source:`.release-work/Wupai-${version}-${platform}-Offline.html`,name:'Wupai.html'});
 const files=(platform,items)=>[{source:`docs/platforms/${platform}.md`,name:'README.md'},...items,...common];
 return {
  Desktop:files('Desktop',[{...html('Desktop'),name:'Backup-HTML/Wupai.html'},{source:`.release-work/Wupai-${version}-Windows.exe`,name:'物派.exe'}]),
  Android:files('Android',[html('Android'),{source:`.release-work/Wupai-${version}-Android.apk`,name:'Wupai.apk'}]),
  iPhone:files('iPhone',[html('iPhone'),{source:'docs/IPHONE-OPENING.txt',name:'iPhone-Opening-Guide.txt'},...models.map(name=>({source:'.release-work/'+name,name:'Models/'+name}))]),
  Linux:files('Linux',[{...html('Desktop'),name:'Backup-HTML/Wupai.html'},{source:`.release-work/Wupai-${version}-Linux.AppImage`,name:'物派.AppImage',mode:0o100755},{source:'packaging/Launch.sh',name:'Launch.sh',mode:0o100755},{source:'packaging/Create-Desktop-Entry.sh',name:'Create-Desktop-Entry.sh',mode:0o100755}])
 };
}
