import * as THREE from '../vendor/three.module.js';
/** Visible finite cash bundles. The wallet owns claims; these never respawn rewards. */
export function createSalvageArt(scene,{caches=[],operation,claimed=()=>false,visible=()=>false}={}){
 const views=new Map(),geometry=new THREE.BoxGeometry(1,1,1),paper=new THREE.MeshStandardMaterial({color:0xc2cfac,roughness:.9}),bill=new THREE.MeshStandardMaterial({color:0x557d52,roughness:.8}),band=new THREE.MeshStandardMaterial({color:0xd3b37c,roughness:.9});
 for(const cache of caches){const group=new THREE.Group();group.position.set(cache.x,0,cache.z);group.visible=false;for(let i=0;i<3;i++){const block=new THREE.Mesh(geometry,i===2?bill:paper);block.scale.set(.63,.08,.32);block.position.set((i%2)*.035,.13+i*.08,0);group.add(block);}const strap=new THREE.Mesh(geometry,band);strap.scale.set(.11,.26,.34);strap.position.set(.01,.24,0);group.add(strap);scene.add(group);views.set(cache.id,{group,operation:cache.operation});}
 return {update(){for(const [id,view]of views){const group=view.group;group.visible=view.operation===(typeof operation==='function'?operation():operation)&&!claimed(id)&&visible(group.position.x,group.position.z);}},clear(){for(const {group}of views.values())scene.remove(group);views.clear();geometry.dispose();paper.dispose();bill.dispose();band.dispose();}};
}
