// Add future prepared models here; category and thumbnails stay in one place.
// Fruit body surfaces have UVs. Materials named Accent_* or Gold_* stay fixed.
export const ARTIFACTS=[
 {id:'vase',name:'花瓶',category:'objects',asset:'./assets/vase.glb',thumbnail:'./assets/thumbs/vase.png',description:'在瓶口、肩部与曲面之间观察纹样。内壁保留黄铜材质。',projection:'uv'},
 {id:'mango',name:'芒果',category:'fruit',asset:'./assets/mango.glb',thumbnail:'./assets/thumbs/mango.png',description:'连续纹样采用专用配色和露铜遮罩。柄与叶片保留金黄色。',surface:'fruit-flow',projection:'uv',pose:[0,Math.PI,Math.PI/2]},
 {id:'strawberry',name:'草莓',category:'fruit',asset:'./assets/strawberry.glb',thumbnail:'./assets/thumbs/strawberry.png',description:'专用配色与连续纹样。柄叶保持金色，局部露出铜底。',projection:'uv',surface:'fruit-flow'},
 {id:'dragonfruit',name:'火龙果',category:'fruit',asset:'./assets/dragonfruit.glb',thumbnail:'./assets/thumbs/dragonfruit.png',description:'专用配色与连续纹样。柄叶保持金色，局部露出铜底。',projection:'uv',surface:'fruit-flow'},
 {id:'pear',name:'梨',category:'fruit',asset:'./assets/pear.glb',thumbnail:'./assets/thumbs/pear.png',description:'专用配色与连续纹样。柄叶保持金色，局部露出铜底。',projection:'uv',surface:'fruit-flow'},
 {id:'lychee',pose:[0,0,Math.PI/2],name:'荔枝',category:'fruit',asset:'./assets/lychee.glb',thumbnail:'./assets/thumbs/lychee.png',description:'专用配色与连续纹样。柄叶保持金色，局部露出铜底。',projection:'uv',surface:'fruit-flow'},
 {id:'apple',name:'苹果',category:'fruit',asset:'./assets/apple.glb',thumbnail:'./assets/thumbs/apple.png',description:'专用配色与连续纹样。柄叶保持金色，局部露出铜底。',projection:'uv',surface:'fruit-flow'},
 {id:'persimmon',name:'柿子',category:'fruit',asset:'./assets/persimmon.glb',thumbnail:'./assets/thumbs/persimmon.png',description:'专用配色与连续纹样。柄叶保持金色，局部露出铜底。',projection:'uv',surface:'fruit-flow'},
 {id:'peach',pose:[0,0,Math.PI/2],name:'桃子',category:'fruit',asset:'./assets/peach.glb',thumbnail:'./assets/thumbs/peach.png',description:'专用配色与连续纹样。柄叶保持金色，局部露出铜底。',projection:'uv',surface:'fruit-flow'},
 {id:'watermelon',pose:[0,0,Math.PI/2],name:'西瓜',category:'fruit',asset:'./assets/watermelon.glb',thumbnail:'./assets/thumbs/watermelon.png',description:'专用配色与连续纹样。柄叶保持金色，局部露出铜底。',projection:'uv',surface:'fruit-flow'},
 {id:'banana',name:'香蕉',category:'fruit',asset:'./assets/banana.glb',thumbnail:'./assets/thumbs/banana.png',description:'专用配色与连续纹样。柄叶保持金色，局部露出铜底。',projection:'uv',surface:'fruit-flow'},
 {id:'banana2',pose:[0,0,Math.PI/2],name:'香蕉 2',category:'fruit',asset:'./assets/banana2.glb',thumbnail:'./assets/thumbs/banana2.png',description:'专用配色与连续纹样。柄叶保持金色，局部露出铜底。',projection:'uv',surface:'fruit-flow'}
];
export const artifactById=id=>ARTIFACTS.find(item=>item.id===id);
