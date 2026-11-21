import * as THREE from '../vendor/three.module.js';
import {weapon} from './weapons.js?v=ledger-r24';
export const WEAPON_PREVIEW_LABELS=Object.freeze({rifle:'MK4 carbine',carbine:'MK4 carbine',smg:'VX9 SMG',shotgun:'BREACH-12 shotgun',marksman:'SABLE DMR marksman rifle',lmg:'M60 WARDEN light machine gun',hush:'HUSH-9 precision carbine',scattergun:'TWIN drum scattergun',kestrel:'KESTREL bullpup battle rifle',mantis:'MANTIS heavy anti-mutation rifle',jackal:'JACKAL riot slug launcher',vesper:'VESPER needle carbine',pistol:'P9 sidearm'});
/** Long barrels and bulky magazines fit the same preview without cropping. */
export function frameWeaponPreview(model){
 model.rotation.y=-Math.PI/2;model.updateMatrixWorld(true);
 const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3());
 const scale=Math.min(2.0/Math.max(.01,size.x),.76/Math.max(.01,size.y),2);
 model.scale.multiplyScalar(scale);model.updateMatrixWorld(true);
 const center=new THREE.Box3().setFromObject(model).getCenter(new THREE.Vector3());model.position.sub(center);model.position.x+=.1;model.updateMatrixWorld(true);return model;
}
/** A static render of the actual equipped model; redraws only when the weapon changes. */
export function createWeaponPreview(canvas){
 const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(112,50,false);
 const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-1.08,1.08,.48,-.48,.1,20);
 camera.position.set(.1,2.2,4);camera.lookAt(.1,0,0);
 scene.add(new THREE.HemisphereLight(0xe6f3e8,0x34483c,2.8));
 const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(-2,4,3);scene.add(light);
 let current=null,lastType='';
 return function show(type){
   if(type===lastType)return;lastType=type;if(current)scene.remove(current);
   current=frameWeaponPreview(weapon(type));scene.add(current);renderer.render(scene,camera);
   canvas.setAttribute('aria-label','Equipped weapon: '+(WEAPON_PREVIEW_LABELS[type]??type));
 };
}

const thumbnailCache=new Map();
/** Static armory art from the real model; no persistent render loop or WebGL context. */
export function weaponThumbnail(type){
 if(thumbnailCache.has(type))return thumbnailCache.get(type);
 const canvas=document.createElement('canvas'),renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,preserveDrawingBuffer:true});renderer.setSize(640,250,false);
 try{const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-1.3,1.3,.51,-.51,.1,20);camera.position.set(.1,1.8,4);camera.lookAt(.1,0,0);scene.add(new THREE.HemisphereLight(0xe8efff,0x424656,3));const key=new THREE.DirectionalLight(0xffdfac,4);key.position.set(-2,4,3);scene.add(key);const model=frameWeaponPreview(weapon(type));scene.add(model);renderer.render(scene,camera);const image=canvas.toDataURL('image/png');thumbnailCache.set(type,image);return image;}finally{renderer.dispose();renderer.forceContextLoss();}
}
