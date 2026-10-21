// Add future prepared models here; category and thumbnails stay in one place.
// Fruit body surfaces have UVs. Materials named Accent_* or Gold_* stay fixed.
export const ARTIFACTS=[
 {id:'vase',name:'花瓶',category:'objects',asset:'./assets/vase.glb',thumbnail:'./assets/thumbs/vase.png',description:'瓶口收束、肩部饱满，连续纹样沿瓶身展开；内壁保留黄铜质感。',projection:'uv'},
 {id:'mango',name:'芒果',category:'fruit',asset:'./assets/mango.glb',thumbnail:'./assets/thumbs/mango.png',description:'弯曲的果身承接橙金纹样，局部露出铜底；柄与叶片保留金色。',surface:'fruit-flow',projection:'uv',pose:[0,Math.PI,Math.PI/2]},
 {id:'strawberry',name:'草莓',category:'fruit',asset:'./assets/strawberry.glb',thumbnail:'./assets/thumbs/strawberry.png',description:'心形果身与细密起伏形成层次，红色纹样包裹表面，金色萼片衬托轮廓。',projection:'uv',surface:'fruit-flow'},
 {id:'dragonfruit',name:'火龙果',category:'fruit',asset:'./assets/dragonfruit.glb',thumbnail:'./assets/thumbs/dragonfruit.png',description:'层叠的果鳞勾勒起伏轮廓，红紫纹样沿果身延展，突出表面的节奏。',projection:'uv',surface:'fruit-flow'},
 {id:'pear',name:'梨',category:'fruit',asset:'./assets/pear.glb',thumbnail:'./assets/thumbs/pear.png',description:'上窄下宽的曲线与绿金纹样相呼应，柄叶保留金色，转动可观察肩部过渡。',projection:'uv',surface:'fruit-flow'},
 {id:'lychee',pose:[0,0,Math.PI/2],name:'荔枝',category:'fruit',asset:'./assets/lychee.glb',thumbnail:'./assets/thumbs/lychee.png',description:'两枚果实与枝叶组合成组，红色纹样铺满圆润果身，金色枝叶保留层次。',projection:'uv',surface:'fruit-flow'},
 {id:'apple',name:'苹果',category:'fruit',asset:'./assets/apple.glb',thumbnail:'./assets/thumbs/apple.png',description:'饱满果身与顶部凹窝相衔接，红色纹样连续包裹，金色柄叶形成点缀。',projection:'uv',surface:'fruit-flow'},
 {id:'persimmon',name:'柿子',category:'fruit',asset:'./assets/persimmon.glb',thumbnail:'./assets/thumbs/persimmon.png',description:'扁圆果身搭配橙色纹样，果肩与底部的弧线在转动中显露。',projection:'uv',surface:'fruit-flow'},
 {id:'peach',pose:[0,0,Math.PI/2],name:'桃子',category:'fruit',asset:'./assets/peach.glb',thumbnail:'./assets/thumbs/peach.png',description:'柔和的圆润轮廓承接粉红与米白纹样，果身、枝叶在材质对比中分明。',projection:'uv',surface:'fruit-flow'},
 {id:'watermelon',pose:[0,0,Math.PI/2],name:'西瓜',category:'fruit',asset:'./assets/watermelon.glb',thumbnail:'./assets/thumbs/watermelon.png',description:'圆形果身与卷曲枝叶组成造型，绿金纹样随曲面展开，枝叶保留金色。',projection:'uv',surface:'fruit-flow'},
 {id:'banana',name:'香蕉',category:'fruit',asset:'./assets/banana.glb',thumbnail:'./assets/thumbs/banana.png',description:'剥开的果皮环绕果肉，金色外形与连续纹样构成内外层次。',projection:'uv',surface:'fruit-flow'},
 {id:'banana2',pose:[0,0,Math.PI/2],name:'香蕉 2',category:'fruit',asset:'./assets/banana2.glb',thumbnail:'./assets/thumbs/banana2.png',description:'单根弯曲香蕉呈舒展弧线，浅黄纹样沿长轴延展，转动可观察内外曲面。',projection:'uv',surface:'fruit-flow'}
];
export const artifactById=id=>ARTIFACTS.find(item=>item.id===id);
