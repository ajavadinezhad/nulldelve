# Preview gap review — r31

Three independent agents reviewed gameplay, progression/economy, and desktop/phone/Android usability. Read-only source review; no new human playthrough or physical-device validation. Findings are proposals, not implemented fixes.

## Concrete defects and access gaps

1. **P1 Android Back:** MainActivity.java:174 dispatches Escape on window, bypassing game-menu.js:232 submenu handling; main.js:241,267 can resume gameplay instead of navigating back. Use shared navigation handling.
2. **P2 Progress backups unreachable:** game-menu.js:117–145 renders export/import only in legacy drawSlots; main/pause menus have no normal route there. Add Settings → Progress backup without reintroducing manual saves.
3. **P3 Armory effective reload mismatch:** campaign-profile.js:45 and shop-ui.js:59–64 omit the equipped Tactical Reload multiplier applied in combat. Share final effective-stat calculations while preserving upgrade deltas.

## Progression and balance decisions

- **P2 Skill reset:** twelve nodes, seven finite points and no respec prevent trying other branches after completion. Endgame copy still promises a next first clear (field-skills.js:16–30,89; game-menu.js:178–180). Add base-only respec and accurate endgame copy.
- **P2 Branch continuity:** leaves replace all parent effects (field-skills.js:32–50). This is disclosed and intentional, but weakens the sense of developing a branch. Decide between modest inherited effects and clearer mutually exclusive specialization presentation.
- **P2 Finite purchasing budget:** enemy, cache and contract payments are all one-time while supplies consume cash. This is a replay starvation risk, not a demonstrated soft lock or new duplicate-cash exploit. Consider a capped full-operation replay reward or basic resupply; preserve checkpoint anti-farming.

## Gameplay and presentation gaps

- **P2 Route repetition:** six operations enforce paired collection/return terminals (operation-routes.js:3; campaign-operations.js:52). Replace selected mandatory backtracks with shortcuts, hazards or optional evidence.
- **P2 Late bosses:** Nest receives a special pulse mechanic, while Hospital/Freight share generic boss pursuit/bites (main.js:146; progression.js:230). Give later bosses distinct readable counterplay.
- **P2 Passive waits:** cleared Freight dispatch waits eight seconds, Hospital sterilization twelve (progression.js:278,364,375). Add visible meaningful action or shorten passive waits.
- **P2 Mobile weapon recognition:** touch-controls.css:23 hides the weapon preview, leaving a tiny truncated name. Use a compact silhouette.
- **P3 Mobile ergonomics:** fixed controls lack handedness and size/opacity options (touch-controls.css:1; game-menu.js:201).
- **P3 Story closure:** optional Nest lore points beneath the facility while Freight closes shipping evidence (campaign-story.js:10,18). Clarify that distinction or resolve the remaining source hook.

## Validation still needed

Physical phone simultaneous move/aim/fire and held grenade/Interact; rotation while held; app switching; checkpoint continuation after update; native Back through every submenu; later mission human combat balance. APK 0.1.1 has not received its own device sign-off. Existing automated checks are not substitutes for these.

## Strengths

No new campaign progression blocker or checkpoint cash replay exploit was established. Reward journaling/deduplication, wallet preservation, per-gun upgrades, sequential missions, crate recovery, explicit exits, regroup breaks, compact touch targets, focus handling and offline Android packaging already have meaningful protections.

## Implementation outcome

The listed source defects and design changes are implemented locally in preview-polish-r31:

- Shared Back navigation consumes submenu actions before Android considers root exit. Backgrounding an already paused settings screen preserves it. Progress backup/restore is reachable in Settings without manual save slots.
- Phone framing uses 13.2 world units across the short axis at default zoom (rather than area-based compensation), with smooth zoom transitions. Portrait browser-bar changes preserve horizontal actor scale; rotation swaps visible axes. Touch wheel gestures cannot unexpectedly change game zoom.
- Compact weapon silhouettes remain visible. Landscape ammo has its own full middle-column row; mirrored controls and larger stick options fit small screens. Training/help describes sticks by function, not a hard-coded side.
- Base-only confirmed training reset refunds all points. Advanced specializations retain modest branch effects; effective reload calculations are shared between combat and upgrade previews.
- Fresh, completed-operation replay deployments create durable attempt identities and pay $30–$90 at the actual exit. Checkpoint retries retain the identity, duplicate exits cannot pay again, and new attempts invalidate older tokens. Pending earned payouts cannot be superseded. Enemy/cache/first-clear cash protections remain.
- Command backup-regulator and Research dispatch return detours are optional. Hospital has a radial shriek boss; Freight a direction-locked rush with warning geometry and cover/dodge counterplay. Freight dispatch takes3s and Hospital cycle4s; old longer running snapshots remain valid.
- Finale closes the buried-conduit/relay hook; Sentinel notes describe its actual bite/stagger behavior.

Verification: all79 test files passed; targeted checks passed after final help-copy/background-pause changes. External Chrome checked393×707 portrait and707×393 landscape, rotation, compact weapon/ammo presentation, Settings backup access, Escape navigation, larger mirrored controls and startup without logged errors. Screenshot: /tmp/nulldelve-r31-phone.jpg. These are desktop viewport checks, not physical multitouch validation or full campaign human sign-off. The physical-device validation items above remain outstanding.
