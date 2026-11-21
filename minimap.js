/** Discovery-only navigation: local readable radar, or an expanded facility map.
 * No enemy positions or unexplored room layout is ever drawn.
 */
export function createMinimap({canvas,map,width,height,explored,player,doors=[],roomDefs=[],landmarks=[],mission={intel:{x:41,z:6},exit:{x:42,z:29}}}) {
  const ctx=canvas.getContext('2d');
  const localWidth=40,localHeight=30;
  const floorCount=map.reduce((total,row)=>total+row.filter(v=>v===0).length,0);
  const count=document.querySelector('#map-progress');
  const discoveredRooms=new Set();
  let expanded=false,lastExploredSize=-1,discovered=0;
  let cell=8,originX=0,originZ=0;
  function resize(){
    cell=expanded?6:8;
    canvas.width=expanded?width*cell:320;
    canvas.height=expanded?height*cell:240;
    canvas.style.aspectRatio=`${canvas.width} / ${canvas.height}`;
    canvas.setAttribute('aria-label',expanded?'Full map of discovered areas. White arrow marks your position. Unexplored areas stay dark.':'Local map of discovered areas near you. White arrow marks your position. Press M for the full map.');
  }
  const pixel=(x,z)=>[(x-originX+.5)*cell,(z-originZ+.5)*cell];
  const inView=(x,z)=>x>=originX-1&&z>=originZ-1&&x<=originX+canvas.width/cell&&z<=originZ+canvas.height/cell;
  function marker(point,color,size){
    if(!point||!inView(point.x,point.z))return;
    const id=Math.round(point.z)*width+Math.round(point.x);
    if(!explored.has(id))return;
    const [x,z]=pixel(point.x,point.z);ctx.fillStyle=color;
    ctx.fillRect(x-size/2,z-size/2,size,size);
    ctx.strokeStyle='#080f10';ctx.lineWidth=1;ctx.strokeRect(x-size/2,z-size/2,size,size);
  }
  function discoveryProgress(){
    if(lastExploredSize===explored.size)return;
    lastExploredSize=explored.size;discovered=0;discoveredRooms.clear();
    for(const id of explored){
      const x=id%width,z=Math.floor(id/width);
      if(map[z]?.[x]!==0)continue;
      discovered++;
      const room=roomDefs.find(r=>x>=r.x&&x<r.x+r.w&&z>=r.z&&z<r.z+r.h);
      if(room)discoveredRooms.add(room);
    }
    if(count)count.textContent=`${Math.round(discovered/Math.max(1,floorCount)*100)}% MAPPED`;
  }
  function draw(visibleTiles=[]) {
    discoveryProgress();
    originX=expanded?0:Math.floor(player.x-localWidth/2);
    originZ=expanded?0:Math.floor(player.z-localHeight/2);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle='#080f10';ctx.fillRect(0,0,canvas.width,canvas.height);
    const endX=Math.min(width,Math.ceil(originX+canvas.width/cell));
    const endZ=Math.min(height,Math.ceil(originZ+canvas.height/cell));
    // The small map touches only its 40x30 tile viewport, even in a much larger level.
    for(let z=Math.max(0,originZ);z<endZ;z++)for(let x=Math.max(0,originX);x<endX;x++){
      const id=z*width+x;if(!explored.has(id))continue;
      const visible=visibleTiles[id];
      ctx.fillStyle=map[z][x]===0?(visible?'#729c83':'#344e44'):(visible?'#b0b5a0':'#5b695d');
      ctx.fillRect((x-originX)*cell,(z-originZ)*cell,cell,cell);
    }
    for(const door of doors){
      if(!inView(door.x,door.z))continue;
      const id=Math.round(door.z)*width+Math.round(door.x);
      if(!explored.has(id))continue;
      ctx.strokeStyle=door.progressLocked||(door.needsPower&&!door.unlocked)?'#e18162':door.open?'#9ce8b4':'#d1ac70';ctx.lineWidth=expanded?2:3;
      const [x,z]=pixel(door.x,door.z),half=cell*1.15;
      ctx.beginPath();
      if(door.axis==='x'){ctx.moveTo(x-half,z);ctx.lineTo(x+half,z);}else{ctx.moveTo(x,z-half);ctx.lineTo(x,z+half);}ctx.stroke();
    }
    if(expanded){
      ctx.font='bold 10px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
      for(const room of discoveredRooms){
        const [x,z]=pixel(room.x+(room.w-1)/2,room.z+(room.h-1)/2);
        const text=room.name??'';if(!text)continue;
        ctx.lineWidth=3;ctx.strokeStyle='#080f10';ctx.strokeText(text,x,z);
        ctx.fillStyle='#c2d6c6';ctx.fillText(text,x,z);
      }
    }
    for(const landmark of landmarks){const complete=landmark.complete?landmark.complete():landmark.active;marker(landmark,complete?'#a6e7af':landmark.kind==='plate'?'#deb67a':'#77cfd4',expanded?5:5);if(expanded&&inView(landmark.x,landmark.z)&&explored.has(Math.round(landmark.z)*width+Math.round(landmark.x))){const [lx,lz]=pixel(landmark.x,landmark.z);ctx.font='bold 9px monospace';ctx.textAlign='left';ctx.fillStyle='#e1eadc';ctx.fillText(landmark.kind==='glyph'?landmark.label.slice(0,1):landmark.kind==='clue'?'?':landmark.label??'E',lx+5,lz-5);}}
    if(!player.intel)marker(mission.intel,'#75e4e8',expanded?7:8);
    marker(mission.exit,'#b7f4a1',expanded?8:9);
    const [x,z]=pixel(player.x,player.z);
    ctx.save();ctx.translate(x,z);ctx.rotate(-player.angle);
    ctx.shadowColor='#bcffd1';ctx.shadowBlur=5;ctx.fillStyle='#f5fff7';
    ctx.strokeStyle='#14251b';ctx.lineWidth=1.25;
    const size=expanded?7:8;
    ctx.beginPath();ctx.moveTo(0,-size);ctx.lineTo(size*.65,size*.7);ctx.lineTo(0,size*.3);ctx.lineTo(-size*.65,size*.7);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
  }
  draw.setExpanded=value=>{const next=Boolean(value);if(next!==expanded){expanded=next;resize();}};
  draw.isExpanded=()=>expanded;
  resize();return draw;
}
