# Integrated fixes and verification — r55

This pass addresses the comprehensive r54 review. It is not a claim of a complete human campaign playthrough or physical-device certification.

## Changes
- Preserve Freight and Signal floor masks in the actual main map initializer; retain intended shortcuts and gates. Move two Signal props off its narrow route. Restore the missing Hospital-to-Freight landing aisle without filling adjacent walls.
- Convert checkpoint ammunition by base projectile value when the purchased primary changes; preserve purchases and earned cash. Reject invalid ability saves before mutating live state.
- Fix touch first-shot direction, Fire drag steering and cancellation; distinguish hybrid desktop input from phone input.
- Give Hospital pressure, Freight track and Signal feeder puzzles observable physical constraints. Paid assistance remains separate from normal puzzle displays.
- Restore concise objectives and mission checklist intent without solution strings. Remove hidden logical-control and collected-item minimap duplicates.
- Preserve completed optional tasks across connected sectors. Reveal physical environmental changes for recovered evidence.
- Gate finite Freight defenders on cargo progress; require Hospital records during its defense rather than after all combat.
- Prevent release/burst sprint exploits, add enemy body pressure and finite heavy turning, and show brief shell/rear/recovery hit cues.
- Add bounded branch abilities, inherited by descendants: escape, temporary protection, or a grenade-consuming remote charge. Preserve cooldowns across checkpoints and reject malformed cooldowns.
- Make ammo delivery deterministic and capped, with finite Hospital pistol supplies. Avoid rewarding lower accuracy through refill thresholds.
- Permit safe checkpoints in real wave regroup intervals. Avoid rewriting unchanged HUD state every frame.

## Running-game checks
External Chrome, isolated localhost test profile:
- Unmodified production entry: startup, movement, escape ability, pause and resume; no console errors observed.
- Actual main/renderer/controllers with temporary scenario setup: composed map wall cells, LMG-to-MANTIS checkpoint restore (5 loaded + 17 reserve, cash preserved), Freight panel interaction and movement/ability.
- Phone-sized rendered scenarios at 320 and 393 pixels and 667×320 landscape: Hospital lever cycle, accepted Signal feeder test, Freight dispatch and escort objective. Fixed Close/Test remained visible with internal scrolling; no horizontal overflow observed.
- Rotation exposed a rail-diagram defect; responsive percentage geometry replaced stale measured angles, then landscape was rechecked.

Temporary scenario controls and copied runtime were removed. Tests use real module/controller behavior and the actual map initializer where applicable. Physical phone touch feel, sustained device performance, and complete manual campaign playthroughs remain outside this pass.

## Final automated verification
All 107 test files passed with zero failures (`node --test tests/*.test.cjs`). This includes 1,248 ammo accuracy comparisons, the actual composed map and Freight entrance connection, checkpoint ammo conversion and cash preservation, ability persistence, and unchanged-HUD write checks. JavaScript syntax and whitespace checks passed.
