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

## Actions and capture r9

Retired the low-frame-rate automated gameplay GIF; it is not promotional footage. Optional `?capture=1` mode records continuous clean gameplay and game audio at 1080p/4K with60fps targets, subject to hardware. Browser playback validated actual1920×1080 and3840×2160 MP4 files. The final promotional run still needs a human player. No microphone or screen sharing is used.

Added articulated reload hands and removable magazines; charged grenade controls, visible aim arc, windup and projectile travel; compact checkpoint-first results with expandable statistics. Grenade charging cancels on lost input or pause, and safe checkpoints defer while a throw is pending.

R9 automated validation: **299 checks across 56 files pass**. Browser checks verified charged input/inventory, compact failure layout, and continuous video playback at both export resolutions.

## Balance audit r11

Three focused agent reviews covered mission progression and duration, weapons and ammunition economy, and stronger enemies. All58 regression test files pass. Coverage includes42 collision-aware mission configurations and420 ammunition projections at75–80% modeled accuracy. Fixed Command interaction overlap, post-phase respite timing, collision-authorized charger damage/full warning footprint, checkpoint health/cooldown compatibility, TWIN close-range spread, and Hard-only emergency ammo starvation. See [mission balance audit](MISSION_BALANCE_AUDIT.md) for estimated durations, methodology and limitations. These are automated tests and models, not completed human playtests.

## Crate recovery r12

Added held Interact dragging on keyboard/touch without adding another action button. Tested wall/corner recovery, body/crate/connector collision, seated crate locking, reset and input cancellation, checkpoint grip clearing and recovery into the opening door solution. Browser input reproduced the second crate trapped against the Insertion north wall, then pulled it free using held E plus backward movement and verified release stopped dragging. All58 regression files pass. Physical phone multi-finger validation remains pending.

## High-density rendering r13

The previous Medium phone default forced1× CSS-resolution rendering; High capped at1.5×. Balanced now supports up to2× screen density and Sharp up to3×, bounded to2.4M/4M framebuffer pixels; Battery saver retains the0.75× option and a1M limit. Resize recomputes resolution, including orientation/display-density changes. Shadow resolution changes dispose/rebuild the old map. Unit checks cover393×707 high-density policy and large-display budgets; external-browser checks at393×707 verified preset switching, canvas buffer resize and no errors on the available1× desktop display. This is not a measurement of the user’s physical phone performance. All58 test files pass.

## Rotation framing r14

Touch framing now applies symmetric aspect compensation in portrait and landscape. With a393×707 viewport rotated to707×393 at base zoom22, both orientations render approximately23.96 CSS pixels per world unit; previously landscape fell to17.86. Tests cover multiple phone/tablet dimensions and all saved zoom endpoints, preserving desktop framing and bounding extreme aspect ratios. Landscape training feedback moved below the operator to avoid obscuring the play center. All58 regression files pass; browser viewport checks verified both orientations without errors.

## r15 hospital expansion

61 test files pass. Coverage includes 36 campaign and 12 legacy arena configurations, 648 ammunition projections, hospital collision-aware puzzle traversal/checkpoint restoration, finite supply no-farming, new weapon purchase/upgrades and mutation attack/cooldown behavior. Legacy 101×69 snapshots migrate into 151×69 while preserving exploration coordinates, inventory and existing door identities. Browser startup caught frozen hospital door definitions being mutated; live doors now clone definitions, with a regression check. External Chrome starts the hospital without console errors and exposes the sixth operation and armory. Automated traversal instantly removes enemy HP to exercise progression; it does not replace human combat playtesting or real-phone performance validation.

## r18 review fixes

Three agents reviewed skills/progression, combat/economy and mission UX. Fixed Hospital record filtering, Hospital requested hints/discovery, disproportionate ordinary precision-ammo drops, per-weapon magazine increments with legacy capacity preservation, and reload cancellation when switching weapons. Regression checks cover canonical operation records, Remix hint order, nearby-visible discovery, paid magazine migration, shop arrows, all 648 ammo projections and switching without free ammo or shot-cooldown resets. Human combat feel and phone checks remain outstanding. See GAMEPLAY_REVIEW.md for prioritized missing features.

## r19 gameplay systems

Implemented field skills, trade-off attachments, Generator sabotage defense, encountered mutation notes and Hospital pressure interlock with matching discovered preset. Normal/Remix cycle settings and timers, jam repair, leave-room pause and legacy completed-state migration have regression coverage. Actual session roundtrip verifies attachment modifiers do not compound and the active skill survives restoration; deployment transfer covers blocked storage. Mutation discovery rejects dead, delayed or fog-hidden enemies. Demolition fire visuals/damage radius survive checkpoints and bounded radius validation. Browser checks verify selection and attachment stat changes. Supply models now include 648 baseline + 1296 attachment configurations; puzzle preset coverage includes 1008 combinations. These are automated models, not human combat or real-phone performance evidence.

## r20 focused armory

Replaced expanded rows and competing skill cards with a compact browsing roster and one selected-weapon workbench. Inspecting does not purchase or equip. Only the equipped primary/sidearm has upgrade actions; attachment controls are separate. Supplies and field skills have dedicated categories. Static actual-model thumbnails are cached, their temporary renderers disposed without disposing shared gameplay materials or geometry. Phone layout uses an internal horizontal roster and internal menu scrolling. Browser checks verify desktop and390×844 layout, inspect-only selection and attachment navigation. Regression checks cover exact purchase IDs, upgrade ownership, disabled/full states, magazine migration and independent category actions.

## r21 follow-up audit

Three source-review agents checked combat, mission state and armory usability. Fixed release-time grenade collision after operator movement or a closing door, hand origins inside cover, skill deployment persistence, Medic supply labels, nested weapon-roster scroll, authoritative attachment rollback after rejection/exception, stage-aware Hospital door guidance, first-gauge pressure discovery, and delayed/dead sabotage. Added regression checks for each and contradictory mission-state rejection before mutation. Existing mission traversal/supply models remain in use; this is not human combat or physical-phone validation.

## r22 content and economy expansion

Added seventh sequential Flooded freight operation, two specialist primary weapons with models, milestone purchase locks, finite authored cash caches and one-time first-clear contracts. World revision201×69/32doors accepts and migrates101/18 and151/26 profiles. Live cash pickup regression requires current-operation proximity/visibility and verifies durable one-time payment after profile reload. Hospital ledger points to freight. Existing Generator defense guidance and interlocked Hospital prompts received mission audit fixes. Automated coverage:67test files,42campaign+12legacy traversals,924baseline+1848attachment supply projections,1056puzzle preset combinations. Models do not establish human survival/playtime, cache-finding rates or phone performance.

## r23 review

Freight fresh-session checkpoint coverage spans all six difficulty/Remix combinations, including mid-transfer and missing Cold Chain enemy references. Locked track controls no longer advertise interaction. Primary upgrade transactions enforce owned/equipped guns. Cross-tab salvage claims pay once. Phone resize releases sticks and crate grip; grenade hold ownership ignores other fingers. Coarse-pointer purchase controls have 44px minimum targets.

Skills now use three two-node branches. Each unique operation completion earns one training point; advanced nodes require their earlier node and a later mission milestone. Old selected skills migrate as developed nodes. One passive remains equipped at a time. Portrait/landscape menu checks use desktop viewport emulation, not physical-phone validation. Ordinary kill-cash checkpoint replay remains an economy limitation requiring a separate durable ledger.

## r24 cash and skill review

Enemy cash uses permanent encounter/ordinal claims, shared across checkpoint retries, repeat deployments, difficulty and Remix. A durable pending journal recovers interrupted payouts; claims and wallet changes are synchronized across tabs. Checkpoint restoration preserves the actual wallet and its spending rather than taking the larger of two balances. Available legacy checkpoint records seed paid identities without awarding or subtracting cash.

Independent regression coverage includes interrupted reopen recovery, simultaneous claims, preserving earnings after reload, avoiding refunds after purchases, and migration seeds not replacing genuine pending payouts. Wave recovery preserves reward ordinals for missing enemy references.

Skills use small connected icon circles with one selected detail panel. Locked nodes can be inspected, but development requires the parent and a point. Stale deployment transfers preserve developed nodes; legacy skill IDs cannot bypass prerequisites. Browser checks cover desktop and portrait viewport emulation; physical-phone verification remains outstanding.

## r25 deeper skills

Expanded to twelve nodes with three specialization forks. Actual-function gameplay regressions cover finite healing/armor, reload duration, melee targeting/cooldown, charge timing and fire-zone radius persistence. Larger Demolition ranks now affect ground fire rather than silently clamping at the first rank. Point-budget import reconciliation prioritizes already-developed nodes. Phone branch filters keep circles readable; desktop retains all three connected trees. Full balance rationale is in SKILL_BALANCE.md.

## r26 skill audit

Three agents reviewed skill balance, runtime persistence and phone navigation. Fixed post-final-mission unlocks for two skills, invalid effect-name fallback, checkpoint recapture losing skill prerequisites, missing skill development in exported backups, and phone node details remaining below the viewport. Short landscape skill menus now devote more height to the internally scrolling content. Runtime regressions cover all twelve skills across seven missions and three difficulties (252 double roundtrips), all mutation attacks and all guns with reload upgrades/attachments. Numerical bonus strengths remain unchanged; no human difficulty or physical-phone claim is made.

## r27 whole-game audit

Three agents checked missions/combat, cash/skills/persistence, and phone/desktop menus. Fixed pending supplies behind blocked geometry suppressing nearby aid, Medicine75/85 healing labels showing50, result-dialog focus escaping into gameplay, and focus targeting CSS-hidden controls. Drop amounts and numerical weapon/skill bonuses remain unchanged.

Cash recovery now journals enemy, salvage and first-clear rewards before asynchronous transactions. A duplicate after a quota failure cannot delete an uncommitted payout; retries preserve its original amount. Backup export waits for pending rewards. Malformed journals cannot award cash or prevent backup. Large paid-enemy transfer ledgers use validated ordinal ranges; a2,880claim case shrinks from over100k characters to2,932 and roundtrips exactly, including sparse unpaid holes. Old transfer links remain supported.

Coverage retains42campaign+12legacy collision-aware route configurations,2,772ammunition projections,252skill checkpoint combinations, and the full regression suite. Browser smoke checks cover a Freight deployment, movement, virtual sticks/fire/reload, map/help/pause and portrait/landscape layouts. These are desktop browser viewport checks, not physical-phone multitouch or human full-campaign survival tests.
