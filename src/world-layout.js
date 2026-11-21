/** Stable map revisions. Existing rooms and object IDs never move. */
export const WORLD_WIDTH=151,WORLD_HEIGHT=69,WORLD_DOOR_COUNT=26;
export const LEGACY_WIDTH=101,LEGACY_HEIGHT=69,LEGACY_DOOR_COUNT=18;
/** Expand an already-validated legacy checkpoint without mutating its source. */
export function upgradeWorldSnapshot(data){
 if(data?.world?.[0]!==LEGACY_WIDTH||data.world[1]!==LEGACY_HEIGHT||data.doors?.length!==LEGACY_DOOR_COUNT)return data;
 return {...data,world:[WORLD_WIDTH,WORLD_HEIGHT],doors:[...data.doors,...Array.from({length:WORLD_DOOR_COUNT-LEGACY_DOOR_COUNT},()=>({open:false,slide:0,unlocked:false}))],explored:data.explored.map(index=>Math.floor(index/LEGACY_WIDTH)*WORLD_WIDTH+index%LEGACY_WIDTH)};
}
