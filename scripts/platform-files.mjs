export function platformFiles(version,models){
 const common=[{source:'PRODUCT_README.md',name:'User-Guide.md'},{source:'CHANGELOG.md',name:'CHANGELOG.md'},{source:'LICENSE',name:'LICENSE.txt'},{source:'docs/ADDING-SERIES.md',name:'Adding-Series.md'},{source:'THIRD_PARTY_LICENSE.txt',name:'THIRD_PARTY_LICENSE.txt'},{source:'assets/ASSET_LICENSES.md',name:'Licenses/Assets.md'},{source:'licenses/Capacitor-LICENSE',name:'Licenses/Capacitor.txt'},{source:'vendor/package/LICENSE',name:'Licenses/Three.txt'}];
 const html=platform=>({source:`.release-work/QiwuZhijian-${version}-${platform}-Offline.html`,name:'QiwuZhijian.html'});
 const files=(platform,items)=>[{source:`docs/platforms/${platform}.md`,name:'README.md'},...items,...common];
 return {
  Desktop:files('Desktop',[html('Desktop'),{source:'packaging/Launch.cmd',name:'Launch.cmd'}]),
  Android:files('Android',[html('Android'),{source:`.release-work/QiwuZhijian-${version}-Android.apk`,name:'QiwuZhijian.apk'}]),
  iPhone:files('iPhone',[html('iPhone'),{source:'docs/IPHONE-OPENING.txt',name:'iPhone-Opening-Guide.txt'},...models.map(name=>({source:'.release-work/'+name,name:'Models/'+name}))]),
  Linux:files('Linux',[html('Desktop'),{source:'packaging/Launch.sh',name:'Launch.sh',mode:0o100755}])
 };
}
