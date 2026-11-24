# Nulldelve 0.1.3 (4): device and closed-test plan

Prepared November24,2026. This is a plan, not evidence that tests or Console steps have been completed. Do not submit a build or invite testers without the owner's authorization.

## Build gate before inviting anyone

- [ ] Rebuild signed APK and AAB from the final reviewed source, version0.1.3/code4.
- [ ] Verify signatures, release lint, permissions, and packaged runtime hashes against that source. Preserve upload signing material privately.
- [ ] Install the actual release APK, not a local website or layout fixture.
- [ ] Record device model, Android version, Android System WebView version, build/version code, navigation mode and test date.
- [ ] Confirm the privacy policy, support address, app-access answers, deletion flow and Data safety draft describe the exact configured build. If optional email/cloud saves are not configured and verified, keep them disabled and omit that listing claim.

## Minimum useful device matrix

| Device | Required checks | Status |
| --- | --- | --- |
| Owner's Samsung phone | Current release, both orientations, normal/large controls, gesture and three-button navigation | Pending current build |
| Lower-performance Android phone, API26–30 if available | Updated WebView, startup, 30-minute late-wave run, heat, audio, memory pressure | Pending |
| Recent Android phone, API35/36 | Cutout, transient system bars, predictive Back, app switching, rotation | Pending |
| Tablet or foldable/large resizable window | Landscape, resize, menus, skill tree, supplies and pause controls | Pending |

Phone browser-size checks at320/393 portrait and667×320 landscape supplement this matrix; they do not replace installed-device tests.

## Repeatable sessions

### First launch and controls

- [ ] Launch in airplane mode; start without an account. No blank canvas or network-required dead end.
- [ ] Move while holding Fire; retreat, steer across facing, release, and move again. No unwanted shots when only moving; no abrupt180-degree drag reversal.
- [ ] Use every action: Interact/drag crate, Reload, Swap, Melee, medkit, held grenade, grenade-type switch and field ability.
- [ ] Test right/left movement-stick placement and Normal/Large controls. Smallest actions measure at least48CSSpx, never overlap, and remain clear of cutouts/system gestures.
- [ ] Rotate while holding controls. All held input releases. Check HUD and mission objective after rotation and after returning from a menu.
- [ ] Open Help, map, pause, armory, skills, settings and backup screens. Reach Back/Close with touch and native Back. Long content scrolls internally; page does not scroll.
- [ ] Use TalkBack/Accessibility Scanner for menu labels, hit regions and focus; document any gameplay accessibility limits honestly.

### Lifecycle, progress and stability

- [ ] Background during firing, reload, grenade charging, puzzle controls and a lift ride; return paused with audio quiet and no stuck input.
- [ ] Lock/unlock, take an audio interruption and reopen after app switching.
- [ ] Reach a checkpoint, force-stop, reopen and Continue. Cash and purchases survive; repeating old kills/secrets does not repay them.
- [ ] Upgrade a gun after a checkpoint, restore it, and confirm ammo value is conserved.
- [ ] Update the installed signed app over the previous version without clearing data. Continue and check settings, purchases and checkpoint migration.
- [ ] Export/import a disposable backup through Android's document picker. Cancel each picker once, then complete a valid transfer. Reject malformed files without changing progress.
- [ ] Run a representative late swarm for30minutes, recording crashes, frozen frames, heat, readability and control comfort. Record observed FPS/temperature only if measured.
- [ ] In a debug build, simulate renderer termination and graphics loss; recovery must offer a fresh usable WebView/checkpoint rather than a crash loop. Never run diagnostic crash URLs in the published game.

### Conditional email/cloud service

Run only when the final build actually enables the configured service, using disposable authorized test accounts.

- [ ] Verify sign-up/email verification, login, logout and offline fallback without losing local progress.
- [ ] Use two test devices: sync, reconnect after offline play and confirm the conflict behavior does not erase newer purchases or pay rewards twice.
- [ ] Exercise failed network/authentication, expired session and account deletion. Confirm the UI explains the scope of deletion and the backend enforces it.
- [ ] Check published privacy/deletion URLs from the installed app and the store draft. Do not claim cloud deletion solely because local data was cleared.

## Closed testing schedule

Google's current rule for applicable new personal accounts is at least12 testers continuously opted in for14days before applying for production access. Verify the actual Console tasks; elapsed time alone is not approval. Testers should use the app and provide real feedback. Keep a few additional willing testers available for dropouts; never manufacture engagement or opt-ins.

| Period | Focus and evidence |
| --- | --- |
| Before Day1 | Owner authorizes tester list; testers opt in through the real closed-test link and install the Play-delivered build. Record opt-in continuity without publishing private email lists. |
| Days1–2 | First launch, early puzzles and phone controls; collect device/version and first-session confusion. |
| Days3–5 | Armory, cash, upgrades and skill branches; assign different builds/play styles across volunteers. |
| Days6–9 | Hospital, Freight and Signal, late mutations, larger waves and portrait/landscape play. At least two testers cover each later operation. |
| Days10–12 | Checkpoint replay, offline launch, update, backup and conditional cloud conflict/deletion. Fix and retest reproducible issues. |
| Days13–14 | Regression on the candidate build; gather honest feedback and verify at least12 uninterrupted14-day opt-ins. Do not claim readiness with unresolved blockers. |
| After qualifying test | Owner reviews feedback, changes, remaining limitations and production-access questions. Applying for access and publishing remain separate explicit actions. |

Feedback template: build / device / Android / WebView / navigation mode / operation / expected behavior / actual behavior / reproduction steps / screenshot or short clip if useful. Keep secrets, passwords, personal backups and unrelated user information out of public bug reports.

## Exit criteria

- No unresolved startup failures, crashes, progression blockers, cash duplication or lost purchases.
- All required controls work on the tested physical phones; menus and objectives do not overlap.
- Offline operation and all enabled account/cloud behavior match the public descriptions.
- Current screenshots and artwork pass visual review; support, privacy and account-deletion destinations work.
- Remaining limitations and device coverage are recorded. Console requirements are verified by the owner, not inferred from this checklist.

Sources checked November24,2026:
- [New personal-account testing requirements](https://support.google.com/googleplay/android-developer/answer/14151465)
- [Store graphic specifications](https://support.google.com/googleplay/android-developer/answer/9866151)
- [Android touch-target guidance](https://support.google.com/accessibility/android/answer/7101858)
