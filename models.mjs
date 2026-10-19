import * as THREE from 'three';
export function createArtifact(){const root=new THREE.Group(),points=[[0,0],[.28,0],[.3,.06],[.28,.15],[.48,.5],[.52,.9],[.43,1.17],[.22,1.43],[.2,1.68],[.25,1.75],[.22,1.78],[.17,1.7],[.17,1.44],[.38,1.15],[.46,.9],[.42,.52],[.24,.2],[0,.2]];root.add(new THREE.Mesh(new THREE.LatheGeometry(points.map(p=>new THREE.Vector2(...p)),96),new THREE.MeshPhysicalMaterial({color:0xe7e0cf,roughness:.34,clearcoat:.32,clearcoatRoughness:.24})));root.userData.procedural=true;return root;}
export function normalizeArtifact(root){
 root.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(root),size=box.getSize(new THREE.Vector3());
 if(box.isEmpty()||![size.x,size.y,size.z].every(Number.isFinite)||Math.max(size.x,size.y,size.z)<1e-6)throw new Error('模型没有可显示的几何体');
 const wrapper=new THREE.Group(),s=1.8/Math.max(size.x,size.y,size.z),center=box.getCenter(new THREE.Vector3());
 root.scale.multiplyScalar(s);root.position.sub(new THREE.Vector3(center.x*s,box.min.y*s,center.z*s));wrapper.add(root);
 wrapper.userData.height=size.y*s;wrapper.updateMatrixWorld(true);return wrapper;
}
