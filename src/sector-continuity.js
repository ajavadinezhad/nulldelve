const CONNECTED=['breach','command','research','containment','nest'];
/** A live completed departure may continue only into its adjacent facility sector. */
export function canContinueSector(departure,next){const i=CONNECTED.indexOf(departure?.operation);return i>=0&&i<CONNECTED.length-1&&next?.mission==='campaign'&&next.operation===CONNECTED[i+1]&&next.difficulty===departure.difficulty&&!!next.remix===!!departure.remix;}
