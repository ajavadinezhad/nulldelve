# Gameplay review — November 21, 2026

Three independent source reviews covered player progression/skills, weapons/economy, and missions/puzzles/UX. Findings were checked against authored code and automated tests. This is not a human playtest or a physical-phone usability study.

## Fixed in this pass

- Hospital personal bests and completion records use the canonical operation catalog instead of a stale five-operation allowlist. Invalid negative times cannot mark an operation complete.
- Hospital emergency power, diagnostics and sterilization have local, player-requested layered hints. Explicit sterilization help follows the actual Remix order. Nearby visible fuse equipment unlocks its encountered Field notes entry; unimplemented mechanics are not presented as playable puzzles.
- Weapon switching cancels a reload without refilling a magazine, consuming reserve or resetting the shared shot cooldown. Selecting the same weapon leaves its reload intact.
- Ordinary primary-ammo drops now scale with base weapon value, with a bounded normalization cap to preserve precision-weapon viability. On a heavy kill, MANTIS receives two rounds rather than six. Hard-only emergency aid remains gated on both guns being low. New magazine purchases use weapon-specific increments (MANTIS +1, pump/DMR/TWIN/sidearm +2, HUSH +3, KESTREL +4, carbine/SMG +6, LMG +10). Explicit saved bonuses preserve legacy paid magazine capacity and loaded-round budgets.

## Next features, in order

| Priority | Feature | Player benefit | Constraints |
|---|---|---|---|
| 1 | One equipped field skill, chosen at base | Creates a build choice without an XP grind | Unlock through existing milestones; one slot; no new permanent HUD panel or recurring free items |
| 2 | One modification slot on each weapon | Creates meaningful gun choices | Choke versus spread; faster magazine versus capacity; stability versus cadence; preserve paid upgrades |
| 3 | An authored restore-under-pressure encounter | Breaks the repeated kill-all-room rhythm | A readable machine target, a sabotage creature, a defensible position and a safe checkpoint/escape route |
| 4 | Encountered mutation notes | Teaches existing counterplay | Unlock on first sight; silhouette, warning shape and one short counter; no undiscovered spoilers |
| 5 | A genuine Hospital sample/airlock puzzle | Gives the clinical setting a distinct mechanic | Physical sample traits or pressure interlocks, rather than another fixed three-console sequence |
| 6 | Optional mastery objectives | Improves replayability | Optional branch, interrupted rush or consumable restraint; no repeat cash farming |

Field skill candidates: Field Medic (more efficient finite medkits), Demolition Harness (better throw control with self-damage retained), and a mobility/handling choice with an explicit cost. Fast sidearm switching is treated as a basic combat control, not a paid skill. Final numerical effects require supply, save and combat checks before implementation.

## Other design findings

Mandatory collection/return tasks extend every operation in the same way. Replace selected routes with hazards, optional intel branches or shortcuts before adding more travel. Normal objective copy still exposes exact routes too often; keep the active objective concise and put detailed directions behind requested hints or the repeatable camera lead. The Hospital ledger also needs a narrative payoff visible to all completers, with optional research supplying additional context.

## Verification limits

Collision-aware mission traversal removes enemy HP instantly to exercise progression and checkpoints. Ammo projections assume their declared accuracy, collected drops and sidearm fallback. Neither establishes survival, enjoyment, natural playtime, touch comfort or real-device frame rate. Those need human combat and phone testing.
