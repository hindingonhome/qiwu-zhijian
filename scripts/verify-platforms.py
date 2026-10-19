import hashlib,json,pathlib,subprocess,zipfile,os,tempfile
root=pathlib.Path.cwd();version=json.loads((root/'package.json').read_text(encoding='utf8'))['version']
js="import {platformFiles} from './scripts/platform-files.mjs';import {readdirSync} from 'node:fs';console.log(JSON.stringify(platformFiles(process.argv[1],readdirSync('.release-work').filter(n=>n.endsWith('.usdz')).sort())))"
plan=json.loads(subprocess.check_output(['node','--input-type=module','-e',js,version]))
for platform,files in plan.items():
    prefix=f'Wupai-{version}-{platform}/'
    with zipfile.ZipFile(root/'dist'/f'Wupai-{version}-{platform}.zip') as archive:
        assert archive.testzip() is None,platform
        assert set(archive.namelist())=={prefix+f['name'] for f in files},platform
        for file in files:
            with archive.open(prefix+file['name']) as stream: actual=hashlib.file_digest(stream,'sha256').digest()
            with (root/file['source']).open('rb') as stream: assert actual==hashlib.file_digest(stream,'sha256').digest(),file['name']
        if platform=='Linux':
            assert (archive.getinfo(prefix+'Launch.sh').external_attr>>16)&0o111
            assert b'\r' not in archive.read(prefix+'Launch.sh')
            if os.name!='nt':
                subprocess.run(['sh','-n','packaging/Launch.sh'],check=True)
                with tempfile.TemporaryDirectory(prefix='qiwu linux ') as temp:
                    temp=pathlib.Path(temp);archive.extractall(temp)
                    stub=temp/prefix/'物派.AppImage';stub.write_text('#!/bin/sh\nprintf \'%s\\n\' "$APPIMAGE_EXTRACT_AND_RUN" "$1"\n');stub.chmod(0o755)
                    actual=subprocess.check_output(['sh',str(temp/prefix/'Launch.sh'),'test argument'],text=True).strip()
                    assert actual=='1\ntest argument','Linux launcher must preserve paths and arguments'
                    subprocess.run(['sh','-n','packaging/Create-Desktop-Entry.sh'],check=True)
    print(platform,'ZIP verified:',len(files),'entries')
assert len(list((root/'dist').iterdir()))==6,'Release must contain four platform ZIPs, APK and checksum file'
print('PLATFORM_ARCHIVES_CONTENT_HASHES_LINUX_EXECUTABLE_AND_SIX_DOWNLOADS_PASS')
