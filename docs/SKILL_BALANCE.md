# Field skill balance — r26

Twelve nodes form three depth-three branches. The existing first and second ranks remain unchanged; each second rank leads to two specializations. Every node costs one point. Seven unique operation clears yield seven points, so one campaign cannot develop all twelve. One developed skill is equipped per deployment; parents unlock children but their effects do not stack.

| Branch | Prerequisite spine | Specialization | Gameplay effect |
|---|---|---|---|
| Medicine | Field Medic → Trauma Specialist | Reactive Plating | Absorbed damage spends 20% less existing armor. No reduction without armor; overflow still damages health. |
| Medicine | Field Medic → Trauma Specialist | Emergency Triage | One kit heals up to 85, capped by missing health. No regeneration or free kits. |
| Mobility | Rapid Response → Pathfinder | Tactical Reload | Reload duration ×0.88, minimum 0.5 seconds; both guns, no ammo or damage increase. |
| Mobility | Rapid Response → Pathfinder | Close Quarters | Knife damage 2 rather than 1; reach, target checks and 0.55-second cooldown unchanged. |
| Demolition | Demolition Harness → Ordnance Specialist | Quick Cast | Full-range charge takes 1 second rather than 1.25; animation and projectile flight timing unchanged. |
| Demolition | Demolition Harness → Ordnance Specialist | Blast Control | Frag and ground-fire radius ×1.25, including danger to the operator. No additional damage per target or free grenades. |

Specializations require their parent and late campaign milestones. Existing skills and balances are preserved. Changing equipped skills remains a base action, not a mid-combat toggle. Imported stale development cannot displace already-developed skills when the point budget is full.

Regression checks exercise real game functions for healing, armor, melee and reloads, real grenade actions and fire-zone persistence, graph prerequisites, non-stacking effects, point limits and stale-import protection. These checks establish implementation bounds, not human enjoyment or survival difficulty. Physical-phone and extended human combat playtesting remain useful follow-up work.

## Review changes and evidence

Close Quarters and Blast Control now unlock after Hospital, allowing first-clear use during Freight. Effects were not numerically increased or reduced: all skills retain resource costs, one-equipped limits and prerequisites. Reload full-cycle projections for base guns show approximately 3.8–7.5% sustained-fire benefit, with the 0.5-second duration floor and no changes to damage, magazine size or weapon stats. Armor still protects only while existing armor remains.

Runtime coverage now includes 252 double-checkpoint combinations (12 skills × seven deployed operations × three difficulties). Restored run development is retained separately from newer base development, so a fresh/imported checkpoint does not lose its skill on the next save. Backups include base development and selection, with rollback on failed import; old backups without skill data remain accepted. Phone node inspection brings its detail/action into view and provides a return-to-tree control. Short landscape screens use a compact skill-menu frame.

These are deterministic runtime, availability, resource-bound and persistence checks. They do not establish human mission survival, optimal play or equal player preference among skills.

## r31 specialization continuity

Training can be reset at base after confirmation, refunding all earned points. Reset revisions prevent stale deployment links from restoring old development. Specializations replace rather than stack their leaf bonuses, retaining only these bounded parent benefits: Reactive Plating heals65; Tactical Reload and Close Quarters retain10% sprint; Quick Cast retains15% explosive radius. Other leaf values remain unchanged. Armory/combat share effective reload calculations and upgrade previews preserve the0.5s floor.
