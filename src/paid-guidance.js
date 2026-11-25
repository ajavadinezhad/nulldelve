import {nextAnnexMechanismAction} from './annex-mechanisms.js?v=mandatory-google-r61';
import {freightEscortPoint} from './freight-escort.js?v=mandatory-google-r61';
import {initialMechanism,nextMechanismAction} from './physical-puzzles.js?v=mandatory-google-r61';
import {campaignOperationGuidance,campaignOperationExit} from './campaign-operations.js?v=mandatory-google-r61';
import {missionGuidance} from './session-rules.js?v=mandatory-google-r61';
import {ARTIFACTS,hospitalAirlockTarget,freightTrackTarget} from './progression.js?v=mandatory-google-r61';
import {WIRE_LAYOUT,WIRE_SOLUTION} from './wire-circuit.js?v=mandatory-google-r61';
export {GUIDANCE_COST} from './economy.js?v=mandatory-google-r61';
const ZONES={security:[23,10],storage:[23,26],command:[38,10],generator:[35,53],lab:[59,10],reactor:[59,30],transit:[59,55],containment:[86,30],evacuation:[86,53],nest:[86,10],'hospital-triage':[112,10],'hospital-ward':[136,10],'hospital-isolation':[136,52],'freight-pumps':[162,30],'freight-yard':[186,30],'freight-cold':[186,10],'signal-yard':[212,30],'signal-relay':[236,30],'signal-uplink':[236,10]};
/** Resolve one live action, without changing a puzzle or relying on proximity to a door. */
export function nextGuidanceStep({operation,mission='campaign',player,puzzle,progression}){
 const s=progression.state??progression,t=s.operationTasks??{},devices=s.devices??[],zone=id=>s.zones?.find(z=>z.id===id);
 const point=(id,p,text)=>p&&Number.isFinite(p.x)&&Number.isFinite(p.z)?{id,x:p.x,z:p.z,label:text}:null;
 const use=(task,text)=>{const d=devices.find(d=>d.id===task||d.task===task);return point(task,d,text??`Use ${d?.label?.toLowerCase()??'this control'}.`);};
 const fight=id=>{const xy=ZONES[id];return xy?point('fight-'+id,{x:xy[0],z:xy[1]},zone(id)?.status==='active'?'Defeat the remaining creatures in this room.':'Enter this room and clear its outbreak.'):null;};
 const sequence=(key)=>{const kind={archive:'glyphs',power:'routing',valves:'valves'}[key],deviceKind={archive:'glyph',power:'power',valves:'valve'}[key],i=nextMechanismAction(kind,s[key]?.mechanism??initialMechanism(kind),s.remix);const d=devices.filter(d=>d.kind===deviceKind)[i??0];const control=key==='archive'?`${d?.glyph??'key'} dial`:key==='power'?['West breaker','North breaker','East breaker'][i??0]:['West valve','East valve'][i??0];return use(d?.id,`Adjust the ${control} once, then inspect the apparatus.`);};
 const wire=()=>{const c=s.circuit;if(!c?.powered)return use('commandRepair','Finish the Power House restart before connecting its cable.');for(let i=0;i<WIRE_LAYOUT.length;i++){const period=WIRE_LAYOUT[i].kind==='straight'?2:4;if(c.rotations[i]%period!==WIRE_SOLUTION[i]%period)return point('wire-'+i,WIRE_LAYOUT[i],'Rotate this junction once, then follow the cable.');}return use('commandRepair','Return to the restored supply console.');};
 if(operation==='freight'&&t.freightRoute?.running)return point('cargo-escort',freightEscortPoint(t.freightRoute.remaining),'Stay near the cargo and keep creatures away from its path.');
 if(operation==='hospital'&&s.zones?.find(z=>z.id==='hospital-isolation')?.status==='active'&&!t.hospitalRecords)return use('hospitalRecords','Recover the sealed patient ledger.');
 const battle=s.zones?.find(z=>z.status==='active');
 // A jam needs a player action even while its defense wave is active.
 if(operation==='command'&&t.generatorDefense?.jammed)return use('commandRepair','Repair the jammed restart console.');
 const cargoWaiting=operation==='freight'&&battle?.id==='freight-yard'&&battle.phaseRested&&!battle.wave?.some(enemy=>enemy.hp>0);
 if(battle&&!cargoWaiting)return fight(battle.id);
 if(cargoWaiting&&!t.freightRoute?.delivered){
  const next=nextAnnexMechanismAction('tracks',t.freightRoute?.switches??[0,0],s.remix),i=next?.index??-1;
  return i<0?use('freightDispatch','Dispatch the trolley along the prepared route.'):use(['freightSwitchA','freightSwitchB'][i],'Change this track switch once.');
 }
 const g=campaignOperationGuidance(operation,{player,puzzle,progression:s})??missionGuidance({mission,player,puzzle,progression:s});
 const label=g.steps?.find(step=>!step.done)?.label??g.title;
 if(/insertion/i.test(label)){const plate=puzzle.plates?.find(p=>!p.active);return point('insertion',plate,'Move an unseated crate onto this floor switch.');}
 if(/Archive/i.test(label)&&!/manifest|relic/i.test(label))return sequence('archive');
 if(/Security relays|security relays/i.test(label))return use(s.relay?.started?'relay-b':'relay-a',s.relay?.started?'Reach and activate this receiver before the charge expires.':'Charge this relay, then reach its receiving station.');
 if(/Reactor power|Reactor routing/i.test(label))return sequence('power');
 if(/pressure lock|Containment pressure/i.test(label))return sequence('valves');
 if(/cross-room yellow cable/i.test(label))return wire();
 if(/three socket relics/i.test(label)){const a=ARTIFACTS.find(a=>!s.artifacts?.includes(a.id));return point(a?.id,a,'Recover this relic for the Nest seal.');}
 if(/Sterilize the operating theatre/i.test(label)){
  const a=t.hospitalAirlock;if(a?.running)return use('hospitalSterile','Wait for the sterilization cycle to finish.');
  const next=nextAnnexMechanismAction('pressure',a?.settings??[0,0,0],s.remix),i=next?.index??-1,target=next?.value;
  return i<0?use('hospitalSterile','Start the sterilization cycle.'):use(['hospitalValveA','hospitalValveB','hospitalValveC'][i],`Adjust this control once to setting ${target}.`);
 }
 if(/cold-chain trolley/i.test(label)){
  const c=t.freightRoute;if(c?.running)return use('freightDispatch','Wait for the trolley to finish its transfer.');
  const next=nextAnnexMechanismAction('tracks',c?.switches??[0,0],s.remix),i=next?.index??-1;
  return i<0?use('freightDispatch','Dispatch the trolley along the prepared route.'):use(['freightSwitchA','freightSwitchB'][i],'Change this track switch once.');
 }
 if(/three motor loads/i.test(label)){
  const next=nextAnnexMechanismAction('feeders',t.signalLoadout?.feeders??[-1,-1,-1],s.remix),i=next?.index??-1,target=next?.value;
  return i<0?use('signalLoad','Test the balanced feeder distribution.'):use(['signalMotorA','signalMotorB','signalMotorC'][i],`Set this motor to feeder ${target===0?'A':'B'}.`);
 }
 if(/both antenna feeds/i.test(label))return use(!t.signalAntennaA?'signalAntennaA':'signalAntennaB','Isolate this antenna feed.');
 const tasks=[[/Maintenance fuse/i,'commandFuse'],[/Insert the Generator fuse|Power House restart/i,'commandRepair'],[/Transit coolant purge/i,'researchCoolant'],[/Evacuation power/i,'evacPower'],[/Charge the Transit signal/i,'nestStart'],[/Link the Containment/i,'nestLink'],[/Decode the Nest shield/i,'nestDecode'],[/pharmacy power fuse/i,'hospitalFuse'],[/hospital emergency power/i,'hospitalPower'],[/quarantine sample/i,'hospitalSample'],[/Authenticate the sample/i,'hospitalAuth'],[/Drain the flooded/i,'freightDrain'],[/shipping manifest/i,'freightManifest'],[/Release Rail Control/i,'freightRelease'],[/Cut the colony/i,'signalShutdown'],[/Transmit the experiment/i,'signalSent']];
 for(const [re,task]of tasks)if(re.test(label))return use(task);
 const route=devices.find(d=>d.kind==='task'&&d.operation===operation&&!d.optional&&!t[d.task]&&d.label?.toLowerCase()===label.toLowerCase());if(route)return use(route.id);
 const battles=[[/Security purge/i,'security'],[/Storage ambush/i,'storage'],[/Command mutation|Command and open/i,'command'],[/Bio Lab/i,'lab'],[/Reactor swarm/i,'reactor'],[/Transit purge/i,'transit'],[/Containment breach/i,'containment'],[/Evacuation lockdown/i,'evacuation'],[/Nest Core|nest horde/i,'nest'],[/Stabilize Triage/i,'hospital-triage'],[/patient ward/i,'hospital-ward'],[/Clear Isolation/i,'hospital-isolation'],[/Pump Hall/i,'freight-pumps'],[/Loading Yard/i,'freight-yard'],[/Cold Chain/i,'freight-cold'],[/Breaker Gallery/i,'signal-yard'],[/Antenna Hall/i,'signal-relay'],[/Transmission Core/i,'signal-uplink']];
 for(const [re,id]of battles)if(re.test(label))return fight(id);
 if(/research intel/i.test(label))return point('intel',{x:93,z:7},'Collect the research intel.');
 if(mission==='siege')return fight('reactor');
 const exit=campaignOperationExit(operation)??{x:92,z:60};return point('exit',exit,'Reach this sector exit and interact to depart.');
}
/** Only feedback/state survives outside paid assistance; never print free directions. */
export function puzzleStatusFeedback(text){
 const value=String(text??'');if(/^RESEARCH LOG/.test(value))return value;
 if(/REJECTED|MISMATCH|REFUSED/.test(value))return 'INPUT REJECTED';
 if(/EXPIRED/.test(value))return 'CHARGE EXPIRED';
 if(/HOSTILES|INCOMING|REMAINING/.test(value))return value;
 if(/LOCKED|MISSING|FIRST|BEFORE|RESTRAINT|INCOMPLETE/.test(value))return 'NOT READY';
 if(/RECOVERED|SECURED|ACCEPTED|ONLINE|COMPLETE|RESTORED|ISOLATED|RELEASED|CONNECTED|BALANCED|TRANSMITTED/.test(value))return 'ACCEPTED';
 return '';
}
