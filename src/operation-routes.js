/** Authored return routes. Only the current operation's devices can be used. */
export const OPERATION_ROUTES=Object.freeze([
 {id:'route-manifest',task:'breachManifest',operation:'breach',x:5,z:12,label:'RECOVER ARCHIVE ACCESS MANIFEST',requires:'security',hint:'Return through Security to the Archive. Recover its access manifest from the western terminal.'},
 {id:'route-auth',task:'breachAuth',operation:'breach',x:26,z:29,label:'AUTHORIZE STORAGE TRANSFER',previous:'breachManifest',requires:'storage',hint:'Carry the Archive manifest south through Security to the southeast Storage terminal.'},
 {id:'route-regulator',task:'commandRegulator',operation:'command',x:6,z:59,label:'RECOVER BACKUP REGULATOR',requires:'generator',hint:'After the restart defense, search southwest Maintenance for the backup regulator.'},
 {id:'route-backup',task:'commandBackup',operation:'command',x:42,z:29,label:'STABILIZE EXTRACTION SUPPLY',previous:'commandRegulator',requires:'generator',hint:'Bring the regulator east through Generator, then north into Extraction to stabilize the supply.'},
 {id:'route-sample',task:'researchSample',operation:'research',x:64,z:13,label:'SECURE SEALED BIO SAMPLE',requires:'lab',hint:'Recover the sealed sample in southeast Bio Lab before leaving the research wing.'},
 {id:'route-dispatch',task:'researchDispatch',operation:'research',x:55,z:59,label:'DISPATCH SAMPLE CANISTER',previous:'researchSample',requires:'transit',hint:'Take the sample south through Reactor into southwest Transit. Dispatch it after the purge.'},
 {id:'route-isolate',task:'containmentIsolate',operation:'containment',x:80,z:28,label:'ISOLATE CONTAMINATED RETURN',requires:'containment',hint:'Isolate the northwest Containment return line after releasing its pressure.'},
 {id:'route-scrub',task:'containmentScrub',operation:'containment',x:79,z:57,label:'FLUSH EVACUATION AIRLOCK',previous:'containmentIsolate',requires:'evacuation',hint:'Go south to the western Evacuation scrubber and flush the airlock after the lockdown.'},
 {id:'route-blackbox',task:'nestBlackbox',operation:'nest',x:80,z:13,label:'RECOVER NEST BLACK BOX',requires:'nest',hint:'Recover the black box from southwest Nest Core after destroying the core.'},
 {id:'route-uplink',task:'nestUplink',operation:'nest',x:91,z:48,label:'TRANSMIT BLACK BOX',previous:'nestBlackbox',requires:'nest',hint:'Carry the black box south through Containment to the northeast Evacuation uplink.'},
].map(Object.freeze));
export function operationRouteComplete(id,tasks){return OPERATION_ROUTES.filter(route=>route.operation===id).every(route=>tasks[route.task]===true);}
