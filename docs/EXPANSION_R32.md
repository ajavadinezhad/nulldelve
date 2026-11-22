# Dead Signal expansion — r32

Three agents implemented weapons/skills, mission variety and mutations, with parent integration. Changes are local; the deployed page remains r31 until published.

## Content

- Dead Signal is operation eight after Freight: load distribution, antenna isolation under pressure, transmitter shutdown, evidence uplink and a service shortcut. Five communications rooms have violet industrial dressing. Waves24/44/68 use live caps10/16/20. Optional salvage and first-clear/replay payouts use existing durable payment rules.
- LANCET:8round penetration rifle, at most2 aligned targets,60% second-target damage. Walls/barrels stop rounds. ORISON:24round carbine,3round bursts with per-round spending,0.075s follow-ups and0.45s burst recovery. Swap/reload/pause/help/map/grenade/restore cancel pending follow-ups. Profiles have separate upgrades, attachments, models, purchase gates and readable workbench traits.
- Emergency Seal: medkits heal65 and repair8armor up to60; consumes one kit even for armor-only use. Blast Insulation:25% less self explosive/fire damage and15% wider grenade effects/danger. Both need Freight and earlier branch nodes. Signal earns the eighth training point; base reset remains available.
- Spitter:1.2s ground-target warning followed by one hit, with movement/cover/stagger counterplay. Mender:1.4s interruptible repair,2HP to one eligible nearby ally,3charges,6s cooldown, no resurrection. Both use bounded elite loot; ordinary drops are unchanged.

## Compatibility and fixes

World251×69 and38doors accepts101/151/201-width snapshots without moving earlier rooms. Partial feeder allocation, mutation cooldowns/remaining repair charges and live wave identities survive checkpoints. Unannounced windups reset. Fixed stale3s/4s Freight/Hospital references and freight-cart progress denominator. Changing specialist weapons cannot leak burst/penetration properties into a normal gun. Armor-only medkits report armor rather than+0health.

## Verification

84test files pass. Coverage includes48campaign collision traversals, all14skills across8operations/difficulties in checkpoint roundtrips, real shoot/medkit/self-damage source-function tests, mutation repair eligibility/caps, new geometry/telegraphs, deliberate Signal exit and partial puzzle recovery. Ammo and attachment projections pass with two conservative64damage-value/18sidearm allotments; the model assumes every Mender repair lands. These models do not prove human survival, natural playtime or physical-phone performance.

External Chrome started without logged errors, displayed the new locked weapons, and checked the three-leaf Medicine branch/details at393×707. No purchases or profile unlocks were fabricated. Screenshot:/tmp/nulldelve-r32-skills.jpg. No full manual Dead Signal playthrough or physical-phone sign-off is claimed.
