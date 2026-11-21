# Mission and combat balance audit

Automated audit of the November 21 preview update.

## Coverage

- 36 campaign traversals: six operations × three difficulties × normal/Remix.
- 12 legacy arena traversals: Reactor siege and Nest hunt × three difficulties × normal/Remix.
- Paths use the real map dimensions, authored equipment and barrel collision, door locks, crate pushes, puzzle sequences, device interactions and checkpoint restoration.
- 648 ammunition projections: nine weapons × six operations × three difficulties × base/+1 damage upgrade × 75%/80% accuracy. All complete with primary/sidearm fallback under the model.

## Estimated operation length

These are planning estimates, not recorded human completion times. Travel is measured from the collision-aware traversal. Combat and search time use explicit assumptions; familiarity, aiming, collected supplies, deaths and exploration change actual duration.

| Operation | Easy | Normal | Hard |
|---|---:|---:|---:|
| Breach | 2.7–4.7 min | 2.9–4.9 min | 3.3–5.5 min |
| Command | 4.1–6.1 min | 4.6–6.7 min | 5.7–8.3 min |
| Research | 4.4–6.7 min | 5.5–8.2 min | 8.3–12.2 min |
| Containment | 4.6–6.7 min | 5.7–8.2 min | 8.9–12.7 min |
| Nest & evacuation | 5.2–7.8 min | 6.2–9.1 min | 8.6–12.5 min |
| Silent hospital | 6.4–9.4 min | 7.5–11.0 min | 10.3–14.8 min |

Breach remains a short introductory operation. Later Normal operations are roughly five to nine minutes in this model; this does not establish that the campaign meets a longer open-world playtime target.

## Fixed findings

- Command: completed wire junctions no longer steal interaction from the pending backup supply console.
- Reinforcements: the six-second regroup period now starts after the phase is cleared and survives checkpoint restoration.
- Charger: damage follows collision-authorized movement; blocked or sliding rushes stop. Its warning covers the full swept damage footprint, including both endpoints.
- Checkpoints: Hard enemy-health validation matches live scaling; charger cooldown persists with a safe fallback for old saves.
- TWIN: tighter pellet spread makes its close-range role work at three metres while preserving weaker long-range performance and its reload trade-off.
- Hard supplies: bounded emergency ammunition considers both guns, pellet value and nearby pending drops. Ordinary drops and Easy/Normal supplies are unchanged.

## Model limits and reproduction

Traversal removes encountered enemy health instantly to isolate route, gating and spawn-scheduling behavior. It does not simulate enemy attacks, enemy-body collision, live spawn placement or a human player. The ammo projection assumes reachable drops are collected, engagements at three metres, deterministic misses, no grenades or melee, and sidearm fallback. It does not establish survival or enjoyment.

Length model: effective 3.3 enemy HP/s plus 0.6 seconds of target acquisition/kiting per enemy, travel at four world units/s, and explicit puzzle/search allowances. Remix is also traversed.

Run `node --test tests/*.test.cjs` for the full regression suite. Run `node tools/mission-length-audit.cjs` to regenerate the detailed length model in `/tmp/nulldelve-mission-length-audit.json`. Physical-phone and human playthrough checks remain outstanding.

## Hospital expansion checks

Six hospital rooms add three escalating encounters (140 baseline creatures), a fuse and emergency-power route, biological sample/diagnostics and ordered sterilisation flow. Required sample and diagnostics milestones grant one finite ammo allocation each; no loaded magazines, health or cash are granted. The ammunition model includes these allocations, collected enemy drops and sidearm fallback. Hard emergency drops retain a six-shell threshold for pellet weapons only when both guns are low. This is a supply projection, not an enemy-AI or human-accuracy simulation.

## r18 supply and upgrade adjustment

Ordinary primary drops account for base round/pellet value with a bounded divisor, reducing excess precision ammo without penalizing damage purchases. Heavy MANTIS drops change from six to two rounds. Hard emergency aid admits a six-round AMR threshold only when both guns are low (nearby pending drops count). All 648 projections pass; full eightfold normalization failed the unupgraded Hard Hospital 75% accuracy case, so it was rejected. New magazine increments vary by weapon; paid legacy capacity is saved explicitly and retained.
