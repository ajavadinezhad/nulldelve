/** Conservative first-run rendering choice; a saved user preference always wins. */
export function initialQuality(savedQuality,{coarse=false,touchPoints=0,touch=false}={}){
 if(['low','medium','high'].includes(savedQuality))return savedQuality;
 return coarse||touch||touchPoints>0?'medium':'high';
}
/** Touch framing is symmetric across rotation: swap the visible world axes
 * instead of shrinking the operator when the viewport becomes shorter.
 * Keep the saved zoom independent of orientation; bound extreme aspect ratios.
 */
export function cameraViewSize(viewHeight=22,aspect=1,touch=false){
 const base=Number.isFinite(viewHeight)?Math.max(14,Math.min(32,viewHeight)):22;
 const ratio=Number.isFinite(aspect)&&aspect>0?aspect:1;
 const compensation=touch?Math.max(.5,Math.min(2,1/Math.sqrt(ratio))):1;
 const height=base*compensation;
 return {height,width:height*ratio};
}

/** Respect high-density screens while bounding the render buffer's GPU cost. */
export function renderPixelRatio(quality='medium',{width=1,height=1,pixelRatio=1}={}){
 const presets={low:{ratio:.75,pixels:1000000},medium:{ratio:2,pixels:2400000},high:{ratio:3,pixels:4000000}},preset=presets[quality]??presets.medium;
 const w=Number.isFinite(width)&&width>0?width:1,h=Number.isFinite(height)&&height>0?height:1,dpr=Number.isFinite(pixelRatio)&&pixelRatio>0?pixelRatio:1;
 return Math.min(dpr,preset.ratio,Math.sqrt(preset.pixels/(w*h)));
}
