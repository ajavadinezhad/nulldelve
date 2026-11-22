const {test}=require('node:test'),assert=require('node:assert/strict');
const {campaignDebrief}=require('../src/campaign-story.js');
const {CAMPAIGN_OPERATIONS}=require('../src/campaign-operations.js');
test('every operation has an outcome, with no optional research required to continue the story',()=>{
 for(const operation of CAMPAIGN_OPERATIONS){const report=campaignDebrief({mission:'campaign',operation:operation.id});assert.ok(report.heading&&report.body);assert.equal(report.finale,false);}
 const nest=campaignDebrief({mission:'campaign',operation:'nest'}),hospital=campaignDebrief({mission:'campaign',operation:'hospital'});
 assert.match(nest.body,/hospital/i);assert.match(hospital.body,/freight/i);assert.equal(nest.evidence,null);
});
test('the finale requires all seven completed operations, not just a direct last-sector deployment',()=>{
 const config={mission:'campaign',operation:'freight'},completed=CAMPAIGN_OPERATIONS.map(o=>o.id);
 assert.equal(campaignDebrief(config,completed).finale,true);
 for(const omitted of completed)assert.equal(campaignDebrief(config,completed.filter(id=>id!==omitted)).finale,false);
 assert.equal(campaignDebrief({...config,operation:'hospital'},completed).finale,false);
});
test('optional research adds evidence only when all three distinct records were recovered',()=>{
 const config={mission:'campaign',operation:'nest'};
 assert.equal(campaignDebrief(config,[],['log-lab','log-lab','log-nest']).evidence,null);
 assert.ok(campaignDebrief(config,[],['log-lab','log-containment','log-nest']).evidence);
 assert.equal(campaignDebrief({mission:'siege',operation:'nest'}),null);
 assert.equal(campaignDebrief({mission:'campaign',operation:'unknown'}),null);
});
