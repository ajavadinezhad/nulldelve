import {CAMPAIGN_OPERATIONS} from './campaign-operations.js?v=completion-r30';

const reports=Object.freeze({
 breach:{heading:'A way inside',body:'The access manifest points toward Command. The doors were locked from inside; this was more than an equipment failure.'},
 command:{heading:'The facility is listening',body:'Power is restored, but the swarm fought to keep it off. The research wing may explain why the colony is drawn to the supply network.'},
 research:{heading:'Specimen 07',body:'The research records connect the outbreak to an electrically responsive specimen. Containment holds the next piece of the experiment.'},
 containment:{heading:'An opened cage',body:'The containment locks failed from within. With an evacuation route secured, you can reach the Nest and recover the source records.'},
 nest:{heading:'The relay falls silent',body:'The Nest was a relay, not the origin of the outbreak. Its black box points to the hospital annex. The quarantine records may reveal how the specimens arrived.'},
 hospital:{heading:'Patients became cargo',body:'The patient ledger links the quarantined specimens to refrigerated freight. The shipping manifest is the missing link between the hospital and the facility.'},
 freight:{heading:'Origin confirmed',body:'The cold-chain manifest completes the trail: specimens reached the facility through the hospital freight route. You escaped with the records that expose it. The operation is over; the evidence is out.'},
});

/** Story follows actual exits; optional logs enrich it without hiding the next chapter. */
export function campaignDebrief(config,completed=[],logs=[]){
 if(config?.mission!=='campaign'||!Object.hasOwn(reports,config.operation))return null;
 const finale=config.operation===CAMPAIGN_OPERATIONS.at(-1).id&&CAMPAIGN_OPERATIONS.every(operation=>completed.includes(operation.id));
 const evidence=config.operation==='nest'&&['log-lab','log-containment','log-nest'].every(id=>logs.includes(id))
  ?'Complete research recovered: the power network carried the colony’s signals. The Nest relayed instructions from beneath the facility.'
  :null;
 return {...reports[config.operation],finale,evidence};
}
