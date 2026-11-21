# Gameplay and interface review — 21 November 2026

Reviewed the HUD, menus, field notes, combat, enemy behavior, supplies, economy, saves, puzzle locks, guidance and operation routes in parallel.

## Fixed

- Grenade throw and grenade type selection no longer divide the same narrow inventory slot. Medkit, grenade, and selector have independent slots; icons, counts, and shortcuts stay aligned.
- All HUD actions have at least 44 × 44 pixel hit areas. Larger header actions no longer cover the objective or map.
- Short landscape uses a compact minimap above the combat strip, so Expand does not overlap the inventory.
- Field notes accepts Escape from inside its embedded view and returns to the parent menu. Keyboard users can reach the embedded view through the modal focus order.
- Field notes has one progressive, optional hint action. Removed the unsolicited instructions below its reference diagrams.
- Removed automatic room-entry puzzle tips, second-by-second signal hint rewrites, repeated default puzzle explanations, and automatic camera interruptions. Camera leads remain available by request and can be repeated.
- Camera leads follow the actual missing prerequisite: fuse, supply, cable section, charged relay destination, then decoder.
- Corrected a Reactor success message that described the legacy siege instead of the campaign.
- Lethal barrel explosions stop further shotgun pellets, grenade damage processing, and simulation work in the same frame.
- Loading a sidearm save during a rifle reload restores the correct selected weapon and saved reload timer.
- Repaired duplicate or missing pickup IDs in older/imported saves, preventing supplies sharing a visual. Invalid saved supply counters are sanitized.

## Verification

- 271 checks across 49 test files passed; no failures.
- Solving, saving and restoring all 20 preset controllers remains covered, including 960 seeded/variant/difficulty combinations.
- Physical routes through all five operations pass against the furnished map and live barrel obstacles. Required consoles, wiring, relics and exits remain reachable; the timed signal route fits its time limit.
- Browser checks: 360 × 740 portrait and 740 × 360 landscape with HUD at 150%; medkit, throw and type selector are disjoint, within the viewport, and have no internal horizontal overflow.
- Landscape map ends at y145.8 and combat HUD begins at y189.5, leaving a clear gap.
- At 360px, checked main menu and armory for horizontal overflow; none found.
- Clicked an optional field-note hint and verified Escape returns from inside the embedded journal.
- Temporary viewport overrides were reset after verification.

These checks cover the reviewed paths and regressions; they do not assert that every possible play session is bug-free.

## Additional independent review

- Fixed gameplay focus after using HUD buttons, closing the map, or resuming a menu. Native button Space/Enter behavior remains intact; movement shortcuts work while a HUD button is focused.
- Centered aim preserves the operator's last facing direction, allowing reliable firing when the cursor is over the operator.
- Failed safe checkpoints keep their pending milestone, retry at five-second intervals and show the failure once instead of every frame. Continue validates the checkpoint before enabling restoration.
- Campaign progress merges earned unlocks, logs and relics before persistence, preventing stale tabs from erasing newer progress.
- Fire and chained barrel callbacks stop granting rewards after the run has ended. Enemy rewards cannot be applied twice.
- Imported maximum pickup-ID counters wrap safely without generating duplicate IDs.
- Field-note reference diagrams have no solver buttons or keyboard actions, including controller-provided inline actions. Hiding a hint resets the optional help state.
- Live browser verification: clicked an unavailable grenade, fired with Space immediately afterward, exhausted all magazines and reserves through real firing/reloads, confirmed the visible toast stayed empty, then resumed pause and verified canvas focus.

## Nulldelve release preparation

Renamed browser titles, menus, map captions, field notes, exports and documentation. Existing checkpoints, unlocks, weapons, settings and older backups remain readable through the isolated storage compatibility module. A fresh preview replaces the old branded image. Browser modules share a release revision to avoid mixed cached builds.

## Story, gameplay, usability and visual critic pass

Three independent reviewers completed targeted passes and follow-up checks. Fixed wrong-sector checkpoint restart, hidden minimap state after pausing, missing touch sprint, stale cash after damage-over-time kills, inaccurate capped healing feedback, empty grenade type fallback, contradictory Nest lock guidance, and phone keyboard settings reflow. Short campaign briefings connect adjacent sectors. Difficulty/remix selections and debriefs share the graphite/amber theme; phone utility icons use consistent SVG shapes. Green cash and world/power indicators remain semantic.

Validated 271 checks across 49 files, including new item-use, touch sprint, checkpoint matching, story hints, and settings expansion regressions. Browser checks cover campaign selection, actual difficulty rules, compact phone settings and startup. The suggested boss-pulse balance change was deferred as a design choice, not treated as a proven bug.

## Preview r8 release follow-up

Implemented touch-first once-only training, contextual touch action labels, portrait camera compensation with continuous zoom, conservative first-run touch quality, graphics-loss checkpoint recovery, isolated normal/remix records, and a boss pulse safe wedge that requires reacting. Field Notes diagrams and atlas selections use the shared graphite/amber/blue vocabulary. Startup displays an accessible loading state. Main/pause menus expose the early-preview revision and a GitHub feedback link. Social metadata, a real gameplay poster and a silent captured gameplay GIF are included.

Manual acceptance checklist (pending human/device access, not claimed as completed):
- Fresh desktop and phone players: open insertion door without coaching; identify objective, reload/swap/loot and resume the correct checkpoint.
- Record opening completion time, deaths, hints, ammunition and cash; tune from observed play rather than ideal-damage arithmetic.
- Physical Android and iPhone: simultaneous movement/aim, sprint, audio after first gesture, background/resume, portrait/landscape and sustained large-wave performance.
- Keep mobile labelled experimental until these checks pass. No accounts or additional campaign content are needed for this early preview.

Final automated validation: **284 checks across 52 files pass**. Browser verification covered touch training layout, the preview/footer flow, startup/loading replacement, and captured real gameplay. Physical-device and uncoached-human checks above remain pending.
