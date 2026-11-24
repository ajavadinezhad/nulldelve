import {puzzleAccessVisible} from './puzzle-access.js?v=operator-profile-r58';
const BANKS={glyph:'breach',relay:'breach',power:'research',valve:'containment',wire:'command'};
const TASKS={commandFuse:'command',commandRepair:'command',researchCoolant:'research',evacPower:'containment',nestStart:'nest',nestLink:'nest',nestDecode:'nest'};
export function worldLandmarkVisible(device,{operation}={}){
 if(!device||device.kind==='clue'||!puzzleAccessVisible(device))return false;
 if(['log','artifact'].includes(device.kind))return !device.active;
 if(device.kind==='task'){const owner=device.operation??TASKS[device.task]??(['hospital','freight','signal'].find(prefix=>device.task?.startsWith(prefix)));return !owner||!operation||owner===operation;}
 return !BANKS[device.kind]||!operation||BANKS[device.kind]===operation;
}
