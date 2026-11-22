# Hands-on playtest — r28

Local changes, not published. Browser-driven keyboard/mouse play, with phone-sized
portrait and landscape layouts. This was not a physical phone multitouch test.
The user ended the requirement for full mission playthroughs because browser input
and capture latency made them impractical.

## Verified coverage

- Breach, Recruit: completed the actual exit. Result: 2:53 game time, 26 creatures
  defeated, 157 shots, no medkits or grenades, $45 first-clear reward. Pressure
  crates (including pulling), Archive glyphs, Security relays and wave, Storage
  wave, access manifest and transfer authorization were played through.
- Breach, Normal: Security's eight-enemy wave cleared; mission not completed.
- Command, Recruit: 24-enemy opening encounter cleared, Maintenance fuse recovered,
  and Generator repair started. Multiple attempts reached the later groups of the
  29-enemy defense; the best reached three enemies remaining. Command was not
  completed. Do not infer mission completion or fair difficulty from these deaths.
- MK4 damage upgrade and P9 damage upgrade used in combat. P9 damage 3 killed
  ordinary enemies in one hit and the encountered Recruit heavy in two hits.
- Field Medic learned/equipped through the armory; a medkit healed 65 health in
  actual combat. Healing correctly capped at maximum health on another use.
- Cash from repeated checkpoint enemies did not repeat. Newly earned cash survived
  deaths and checkpoint retries. A naturally earned $69 balance bought a $60 kit,
  leaving $9; loading the checkpoint retained that purchased kit.
- Phone pause/main-menu action sizing and skill branch selection inspected.

Research, Containment, Nest/evacuation, Hospital and Freight were not played
through in this session. Later weapons and deeper skills have no new hands-on
sign-off from this session.

## Fixes from this session

1. Vertical phone menu actions no longer inherit oversized action-row flex bases.
2. Quick keyboard aim presses latch their direction on keydown, even when released
   before the next frame; remapped aim keys follow the same path.
3. Campaign selection preserves the current difficulty when proceeding to the next
   operation. Regression checked; a second completed operation was not available
   to verify that transition hands-on.
4. Checkpoint inventory now distinguishes purchases from cash reward revisions.
   Earning cash after using a checkpoint medkit no longer incorrectly makes that
   consumption permanent on retry. Earned cash and claimed reward identities stay
   durable. New purchases become a fresh checkpoint loadout baseline.

## Limits and follow-up

Some held browser inputs were missed and captures sometimes lagged actions. One
capture visibly shrank the game into the corner of the viewport. The temporary
viewport override was reset. These observations are tooling uncertainty, not proof
of a game input defect, and were not used to weaken enemy balance.

Future human playtesting should measure later mission completion times, the full
skill branches and late weapons, and real phone simultaneous move/aim controls.
Generator regroup intervals could communicate the next group more clearly; this
is an observed UX candidate, not an implemented change.
