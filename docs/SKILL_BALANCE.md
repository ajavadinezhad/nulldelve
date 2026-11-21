# Field skill balance — r25

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
