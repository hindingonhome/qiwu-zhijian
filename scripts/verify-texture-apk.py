from pathlib import Path
import gzip,hashlib,json,zipfile
root=Path(__file__).resolve().parents[1]
with zipfile.ZipFile(root/'android/app/build/outputs/apk/release/app-release.apk') as apk:
    checks=[('assets/public/app.js','mobile-web/app.js'),('assets/public/assets/pattern-master.json.bin','assets/pattern-master.json.gz'),('assets/public/assets/plate.glb','assets/plate.glb')]
    records=[]
    for key,source in checks:
        actual=apk.read(key)
        assert actual==(root/source).read_bytes(),key
        records.append({'apkEntry':key,'sha256':hashlib.sha256(actual).hexdigest(),'bytes':len(actual)})
    html=apk.read('assets/public/index.html').decode('utf-8')
    assert './assets/pattern-master.json.gz":"./assets/pattern-master.json.bin' in html
    master=json.loads(gzip.decompress(apk.read('assets/public/assets/pattern-master.json.bin')))
    assert master['viewBox']=='0 0 8000 8000' and master['gold'] and len(master['six'])==6
    assert 'assets/public/assets/pattern-master.json.gz' not in apk.namelist()
report={'result':'APK_FINAL_JS_VECTOR_BYTES_ALIAS_DECOMPRESSION_PLATE_MATCH_PASS','assets':records}
(root/'verification').mkdir(exist_ok=True)
(root/'verification/texture-studio-apk-assets.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(report['result'])
