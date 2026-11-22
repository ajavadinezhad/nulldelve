/** Stable map revisions. Existing rooms and object IDs never move. */
export const WORLD_WIDTH=251,WORLD_HEIGHT=69,WORLD_DOOR_COUNT=38;
export const FREIGHT_WIDTH=201,FREIGHT_HEIGHT=69,FREIGHT_DOOR_COUNT=32;
export const PREVIOUS_WIDTH=151,PREVIOUS_HEIGHT=69,PREVIOUS_DOOR_COUNT=26;
export const LEGACY_WIDTH=101,LEGACY_HEIGHT=69,LEGACY_DOOR_COUNT=18;
/** Expand an already-validated checkpoint without mutating its source. */
export function upgradeWorldSnapshot(data){
 const width=data?.world?.[0],count=width===LEGACY_WIDTH?LEGACY_DOOR_COUNT:width===PREVIOUS_WIDTH?PREVIOUS_DOOR_COUNT:width===FREIGHT_WIDTH?FREIGHT_DOOR_COUNT:null;
 if(count===null||data.world[1]!==WORLD_HEIGHT||data.doors?.length!==count)return data;
 return {...data,world:[WORLD_WIDTH,WORLD_HEIGHT],doors:[...data.doors,...Array.from({length:WORLD_DOOR_COUNT-count},()=>({open:false,slide:0,unlocked:false}))],explored:data.explored.map(index=>Math.floor(index/width)*WORLD_WIDTH+index%width)};
}
