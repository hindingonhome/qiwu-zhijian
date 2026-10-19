import hashlib,json,pathlib,subprocess,zipfile,os,tempfile
root=pathlib.Path.cwd();version=json.loads((root/'package.json').read_text(encoding='utf8'))['version']
js="import {platformFiles} from './scripts/platform-files.mjs';import {readdirSync} from 'node:fs';console.log(JSON.stringify(platformFiles(process.argv[1],readdirSync('.release-work').filter(n=>n.endsWith('.usdz')).sort())))"
plan=json.loads(subprocess.check_output(['node','--input-type=module','-e',js,version]))
for platform,files in plan.items():
    prefix=f'QiwuZhijian-{version}-{platform}/'
    with zipfile.ZipFile(root/'dist'/f'QiwuZhijian-{version}-{platform}.zip') as archive:
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
                    temp=pathlib.Path(temp);archive.extractall(temp);bin_dir=temp/'bin';bin_dir.mkdir()
                    opener=bin_dir/'xdg-open';opener.write_text('#!/bin/sh\nprintf \'%s\\n\' "$1"\n');opener.chmod(0o755)
                    actual=subprocess.check_output(['sh',str(temp/prefix/'Launch.sh')],env={**os.environ,'PATH':str(bin_dir)+os.pathsep+os.environ['PATH']},text=True).strip()
                    assert actual==str(temp/prefix/'QiwuZhijian.html'),'Linux launcher must preserve paths with spaces'
    print(platform,'ZIP verified:',len(files),'entries')
assert len(list((root/'dist').iterdir()))==6,'Release must contain four platform ZIPs, APK and checksum file'
print('PLATFORM_ARCHIVES_CONTENT_HASHES_LINUX_EXECUTABLE_AND_SIX_DOWNLOADS_PASS')
