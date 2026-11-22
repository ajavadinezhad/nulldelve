/** Conservative first-run rendering choice; a saved user preference always wins. */
export function initialQuality(savedQuality,{coarse=false,touchPoints=0,touch=false}={}){
 if(['low','medium','high'].includes(savedQuality))return savedQuality;
 return coarse||touch||touchPoints>0?'medium':'high';
}
/** Phones use a fixed short-axis span. Browser bars can resize the long axis
 * without changing actor scale, and rotation preserves the same close framing.
 * The saved zoom remains effective; desktop framing is unchanged.
 */
export function cameraViewSize(viewHeight=22,aspect=1,touch=false){
 const base=Number.isFinite(viewHeight)?Math.max(14,Math.min(32,viewHeight)):22;
 const ratio=Number.isFinite(aspect)&&aspect>0?aspect:1;
 const shortSpan=base*.6;
 const height=touch?shortSpan/Math.min(1,Math.max(.2,ratio)):base;
 return {height,width:height*ratio};
}
/** Smooth zoom only, never the viewport aspect: rotation must not stretch actors. */
export function createCameraFraming(){
 let current=null;
 return {update(zoom,aspect,touch,dt=0,{snap=false}={}){
  const target=Number.isFinite(zoom)?Math.max(14,Math.min(32,zoom)):22;
  if(current===null||snap)current=target;
  else current+=(target-current)*(1-Math.exp(-10*Math.max(0,Math.min(.1,Number(dt)||0))));
  if(Math.abs(target-current)<.001)current=target;
  return cameraViewSize(current,aspect,touch);
 }};
}

/** Respect high-density screens while bounding the render buffer's GPU cost. */
export function renderPixelRatio(quality='medium',{width=1,height=1,pixelRatio=1}={}){
 const presets={low:{ratio:.75,pixels:1000000},medium:{ratio:2,pixels:2400000},high:{ratio:3,pixels:4000000}},preset=presets[quality]??presets.medium;
 const w=Number.isFinite(width)&&width>0?width:1,h=Number.isFinite(height)&&height>0?height:1,dpr=Number.isFinite(pixelRatio)&&pixelRatio>0?pixelRatio:1;
 return Math.min(dpr,preset.ratio,Math.sqrt(preset.pixels/(w*h)));
}
