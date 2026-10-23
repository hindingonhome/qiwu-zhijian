"""Prepare a non-destructive plate derivative: planar top UV, fixed gold underside.
Original source is retained verbatim in source-models/. No runtime face classification.
"""
import json,struct
from pathlib import Path
import numpy as np
root=Path(__file__).resolve().parents[1]
b=(root/'source-models/round-plate-original.glb').read_bytes();length=struct.unpack_from('<I',b,12)[0];j=json.loads(b[20:20+length]);binary=b[28+length:]
def read(i):
 a=j['accessors'][i];v=j['bufferViews'][a['bufferView']];dtype={5126:'<f4',5123:'<u2',5125:'<u4'}[a['componentType']];size={'VEC3':3,'VEC2':2,'SCALAR':1}[a['type']]
 return np.frombuffer(binary,dtype=dtype,count=a['count']*size,offset=v.get('byteOffset',0)+a.get('byteOffset',0)).reshape(-1,size).copy()
p=read(0);n=read(1);indices=read(3).reshape(-1,3)
# Source rotation is +90 degrees around X: source -Z is the physical top.
p=p[:,[0,2,1]];p[:,1]*=-1;p[:,1]+=.18411092460155487
n=n[:,[0,2,1]];n[:,1]*=-1
tri=p[indices];normal=np.cross(tri[:,1]-tri[:,0],tri[:,2]-tri[:,0]);normal/=np.maximum(np.linalg.norm(normal,axis=1)[:,None],1e-12)
top=normal[:,1]>.03
# Any upward bevel hidden below the eating surface belongs to the underside.
# Resolve this at preparation time with a vertical ray test, never at runtime.
candidates=np.flatnonzero(top);surfaces=tri[candidates];a,b0,c=surfaces[:,0],surfaces[:,1],surfaces[:,2]
den=(b0[:,2]-c[:,2])*(a[:,0]-c[:,0])+(c[:,0]-b0[:,0])*(a[:,2]-c[:,2])
for candidate,q in zip(candidates,surfaces.mean(axis=1)):
 u=((b0[:,2]-c[:,2])*(q[0]-c[:,0])+(c[:,0]-b0[:,0])*(q[2]-c[:,2]))/den
 v=((c[:,2]-a[:,2])*(q[0]-c[:,0])+(a[:,0]-c[:,0])*(q[2]-c[:,2]))/den
 w=1-u-v;inside=(u>=-1e-5)&(v>=-1e-5)&(w>=-1e-5)
 if inside.any() and (u*a[:,1]+v*b0[:,1]+w*c[:,1])[inside].max()-q[1]>1e-4:top[candidate]=False
uv=np.stack([(p[:,0]-p[:,0].min())/np.ptp(p[:,0]),(p[:,2]-p[:,2].min())/np.ptp(p[:,2])],axis=1).astype('<f4')
blob=bytearray();views=[];accessors=[]
def add(a,component,type,target):
 while len(blob)%4:blob.append(0)
 offset=len(blob);data=a.tobytes();blob.extend(data);views.append({'buffer':0,'byteOffset':offset,'byteLength':len(data),'target':target});v={'bufferView':len(views)-1,'componentType':component,'count':len(a),'type':type}
 if type=='VEC3':v.update(min=a.min(axis=0).tolist(),max=a.max(axis=0).tolist())
 accessors.append(v);return len(accessors)-1
pos=add(p.astype('<f4'),5126,'VEC3',34962);norm=add(n.astype('<f4'),5126,'VEC3',34962);tex=add(uv,5126,'VEC2',34962)
it=add(indices[top].reshape(-1,1).astype('<u2'),5123,'SCALAR',34963);ib=add(indices[~top].reshape(-1,1).astype('<u2'),5123,'SCALAR',34963)
attrs={'POSITION':pos,'NORMAL':norm,'TEXCOORD_0':tex}
scene={'asset':{'version':'2.0','generator':'Wupai plate preparation'},'scene':0,'scenes':[{'nodes':[0]}],'nodes':[{'mesh':0,'name':'RoundPlate'}],'meshes':[{'name':'RoundPlate','primitives':[{'attributes':attrs,'indices':it,'material':0},{'attributes':attrs,'indices':ib,'material':1}]}],'materials':[{'name':'Plate_Top','pbrMetallicRoughness':{'baseColorFactor':[1,1,1,1],'metallicFactor':0,'roughnessFactor':.26}},{'name':'Gold_PlateUnderside','pbrMetallicRoughness':{'baseColorFactor':[.6938718,.4178851,.05951124,1],'metallicFactor':.78,'roughnessFactor':.28}}],'buffers':[{'byteLength':len(blob)}],'bufferViews':views,'accessors':accessors,'extras':{'surfaceRule':'Physical upward-facing top only; underside and vertical edge fixed gold','topTriangles':int(top.sum()),'fixedGoldTriangles':int((~top).sum())}}
meta=json.dumps(scene,separators=(',',':')).encode();meta+=b' '*((-len(meta))%4);blob+=b'\0'*((-len(blob))%4)
out=struct.pack('<III',0x46546c67,2,28+len(meta)+len(blob))+struct.pack('<II',len(meta),0x4e4f534a)+meta+struct.pack('<II',len(blob),0x004e4942)+blob
(root/'assets/plate.glb').write_bytes(out);print(f'PLATE_PREPARED top={top.sum()} fixed_gold={(~top).sum()} triangles={len(indices)} bytes={len(out)}')
