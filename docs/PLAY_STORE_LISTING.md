# Nulldelve — first internal-test release

Prepared for review, not submitted to Google Play.

## Identity

- App: Nulldelve
- Public developer name chosen during registration: ajavadinezhad
- Android application ID: com.ajavadinezhad.nulldelve
- Default language: English (United States)
- Category: Game / Action
- Pricing: Free preview; no ads or in-app purchases in this build
- Version: 0.1.3 (4) — release candidate, verify the built package
- Bundle: dist/android/nulldelve-0.1.3-play.aab (expected output; confirm after build)

## Short description

Explore dark facilities, solve puzzles, and survive mutated swarms.

## Full description

Every door leads into the unknown.

Nulldelve is a top-down tactical shooter about exploring abandoned facilities,
restoring broken systems, and surviving mutated insect swarms. Discover rooms as
you enter them, inspect physical systems throughout the facility, and find a way forward.

Fight with rifles, sidearms, shotguns and specialist weapons. Collect cash, choose
your loadout at the armory, and develop connected skill branches as you progress.
Use cover, watch your ammunition, and decide when to spend your supplies.

Progress through operations across industrial rooms, research areas, a hospital
and a freight complex. Restore power, recover keys and artifacts, move crates onto
switches, and trace connections across several rooms to open the next route.

- Explore with fog of war and a map of discovered rooms.
- Face different mutations and larger encounters as operations progress.
- Move and aim with one stick; fire separately and drag across your facing to steer.
- Continue from automatic checkpoints.
- Play offline without an account.
- Optional email accounts and cloud progress may be enabled for this release; offline play remains available.

This is an early playable preview. Bugs and balance issues may remain. Feedback
helps improve future updates.

## Internal-test release notes

<en-US>
Updated Android preview: clearer 48px touch targets, separate Fire controls, connected skills and more operations.
Automatic checkpoints and the armory remain available offline. Optional cloud progress depends on the configured release service.
Please report startup issues, control problems, display issues and progression blockers.
</en-US>

## Tester focus

1. Open the installed Play build and start an operation.
2. Move while holding Fire, drag to steer, and check reload, field ability, medkit and grenade controls.
3. Test portrait and landscape layouts, including around display cutouts.
4. Switch to another app and return; confirm the game pauses safely.
5. Reach a checkpoint, close the app and continue.
6. Test JSON backup export/import and offline launch.
7. Report device model, Android version, operation and reproduction steps.

## Remaining Console setup

Developer registration reached the payments-profile identity step. The account
has not been created and the bundle has not been uploaded. The account owner must
complete private identity/payment details and accept any required agreements.

After registration, create Nulldelve and upload the AAB under Internal testing.
Choose Play App Signing and preserve the local upload key privately. Select the
tester list; do not add or invite people without the owner's instruction.

Complete the Console's required declarations accurately. The default offline game does not require an account. Optional email accounts and cloud saves are being prepared; do not claim that all data stays on the device if that service is enabled. Before submission, inspect the final Android permissions, deployed service configuration, privacy policy and account-deletion flow. No ads, analytics or in-app purchases are intended for this release. Backup files are selected by the user; feedback opens an external browser. Data safety and app-access answers are drafts until the exact shipped build and configured services are verified.

Before public release, provide a public support contact, publish an accurate
privacy policy naming Nulldelve, prepare store graphics/screenshots, and complete
the content rating and target audience forms. Do not invent a rating or identity
details. Google may require additional testing for a new personal account; follow
the specific tasks shown in this account's Console.

The user previously confirmed an older APK on their Samsung phone. This does not validate 0.1.3 or the new account/cloud service. Current physical-device verification remains pending.

## Prepared graphics and support

- Store icon: `docs/play-store/icon-512.png` (512×512).
- Feature graphic: `docs/play-store/feature-1024x500.png` (1024×500).
- Public support email authorized by the owner: ahmadjavadi17@gmail.com.
- Website: https://ajavadinezhad.github.io/nulldelve/
- Current installed-build screenshots, privacy/account-deletion URLs, content rating and final declarations must be verified before submission.
- Closed testing and device checklist: `docs/PLAY_CLOSED_TEST_PLAN.md`.

Do not publish the conditional cloud-save sentence until the configured service works in the installed release. If the final build remains offline-only, omit that sentence and declare the offline build accurately.

## Data safety and content declarations — owner review draft

Do not submit an old “no data collected” answer after activating accounts.
For the configured cloud build, the implementation sends email addresses and
account IDs for account management, and checkpoint/gameplay progress for app
functionality. Cloud saving is optional; offline play remains available. Data
travels over HTTPS. Supabase is the service provider; review its project logging,
SMTP configuration, region and retention before finalizing the form. Google's
Data safety service-provider exception is separate from content-rating questions
about sharing user-provided information; answer each actual question accurately.
No advertising, real-money purchases, chat, public profiles or gameplay analytics
are implemented. Virtual cash is not a real-money purchase history.

Privacy URL to publish and verify:
https://ajavadinezhad.github.io/nulldelve/privacy.html
Account-deletion URL to publish and verify:
https://ajavadinezhad.github.io/nulldelve/account-deletion.html
The in-game account panel also offers permanent account deletion. Deleting a cloud
account leaves the device's offline checkpoint; clear app storage separately.

Rate the actual firearms, explosions, incendiary effects, insect killing,
mutations and frightening hospital/facility themes. Do not invent an age rating
or select a children's audience without reviewing the actual IARC questionnaire.
The owner must confirm target audience and complete identity/account requirements.

Official form guidance:
https://support.google.com/googleplay/android-developer/answer/10787469


Google account/profile follow-up (not published): sign-in now uses Google OAuth,
not email codes. Account data additionally includes chosen username, display
name and preset avatar identifier. The Google provider is not yet configured;
real OAuth/profile/cloud-save checks and native callback support are still
required before any release claims or Data safety submission.
