/** Conservative first-run rendering choice; a saved user preference always wins. */
export function initialQuality(savedQuality,{coarse=false,touchPoints=0,touch=false}={}){
 if(['low','medium','high'].includes(savedQuality))return savedQuality;
 return coarse||touch||touchPoints>0?'medium':'high';
}
/**
 * Portrait touch views gain horizontal awareness without flattening the zoom
 * control. The saved/base height stays 14–32; only the effective camera framing
 * expands, proportionally, up to twice that height on exceptionally tall screens.
 */
export function cameraViewSize(viewHeight=22,aspect=1,touch=false){
 const base=Number.isFinite(viewHeight)?Math.max(14,Math.min(32,viewHeight)):22;
 const ratio=Number.isFinite(aspect)&&aspect>0?aspect:1;
 const compensation=touch&&ratio<1?Math.min(2,1/Math.sqrt(ratio)):1;
 const height=base*compensation;
 return {height,width:height*ratio};
}
