import * as THREE from '../vendor/three.module.js';
const geometry=new THREE.PlaneGeometry(1,1);
const background=new THREE.MeshBasicMaterial({color:0x14201b});
const colors=[0xa4e89c,0xe7b86f,0xee826a].map(color=>new THREE.MeshBasicMaterial({color}));
export function attachEnemyHealthBar(scene,enemy){
 const group=new THREE.Group(),back=new THREE.Mesh(geometry,background),fill=new THREE.Mesh(geometry,colors[0]);
 const width=enemy.variant==='boss'?1.9:enemy.variant==='brute'?1.35:1.05;
 back.rotation.x=fill.rotation.x=-Math.PI/2;back.scale.set(width+.08,.18,1);fill.scale.set(width,.1,1);fill.position.y=.015;group.add(back,fill);scene.add(group);
 enemy.maxHp=enemy.maxHp??Math.max(1,enemy.hp);enemy.healthBar={group,fill,width};group.visible=false;return group;
}
export function updateEnemyHealthBar(enemy){
 const bar=enemy.healthBar;if(!bar)return;
 bar.group.visible=enemy.hp>0&&enemy.mesh.visible&&enemy.hp<enemy.maxHp;
 if(!bar.group.visible)return;
 const ratio=Math.max(0,Math.min(1,enemy.hp/enemy.maxHp));
 bar.group.position.set(enemy.x,2.15,enemy.z-(enemy.radius??.32)-.6);
 bar.fill.scale.x=bar.width*ratio;bar.fill.position.x=-(bar.width-bar.width*ratio)/2;bar.fill.material=colors[ratio>.55?0:ratio>.25?1:2];
}
