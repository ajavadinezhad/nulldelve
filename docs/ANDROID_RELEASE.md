# Android preview and Google Play builds

Initial signed outputs were built successfully and placed in `dist/android/`:
`nulldelve-0.1.0-release.apk` and `nulldelve-0.1.0-play.aab` (about 1.6 MB each).
Android release lint passed; APK and bundle signatures were verified, and packaged
runtime files were compared with the source. No private signing files, assistant
files or native libraries are in either package. Physical-device runtime testing
and a Play Console upload have not been performed.

The Android application bundles the existing game for offline use. It uses an
HTTPS asset origin, local checkpoints, hardware-accelerated WebGL, immersive
display, the game's touch controls, Android Back handling, and system document
pickers for JSON backup import/export. Browser saves and Android saves are
separate: transfer through the game's backup export/import when needed.

## Identity and requirements

- App name: Nulldelve
- Application ID: `com.ajavadinezhad.nulldelve` (confirm before the first Play upload)
- Initial version: `0.1.0`, version code `1`
- Android 8.0/API 26 minimum, API 36 target and compile SDK
- OpenGL ES 3.0 and a current Android System WebView are required
- JDK 17; pinned Gradle 8.13 and Android Gradle Plugin 8.13.2
- Install Android SDK platform 36 and build-tools 35.0.0 after accepting Google's
  SDK terms. Set `ANDROID_HOME` or an ignored `android/local.properties` file.

The wrapper is Java-only and contains no bundled native libraries. It requests no
camera, microphone, location, storage or Internet permission. External HTTPS links
open in the user's browser; remote content does not load inside the game WebView.
No login, advertising, analytics or purchases are added.

## Build

From the repository root:

```bash
bash tools/build-android.sh debug
```

Installable debug APK: `android/app/build/outputs/apk/debug/app-debug.apk`.

For release builds, provide an upload keystore and these environment variables
without committing their values:

```bash
export NULLDELVE_KEYSTORE=/absolute/path/to/upload.jks
export NULLDELVE_KEY_ALIAS=upload
read -rsp 'Keystore password: ' NULLDELVE_STORE_PASSWORD; echo
export NULLDELVE_STORE_PASSWORD
export NULLDELVE_KEY_PASSWORD="$NULLDELVE_STORE_PASSWORD"
bash tools/build-android.sh release
```

Alternatively, an ignored `android/signing.properties` can hold those same four
settings. The initial local build uses that file and an upload key inside the
ignored `android/signing/` directory. Keep both private and back them up together.

Outputs:

- `android/app/build/outputs/apk/release/app-release.apk` — signed test installation
- `android/app/build/outputs/bundle/release/app-release.aab` — signed Play upload

Keep the upload keystore and its password backed up privately. They are excluded
from Git. Never publish signing files or put passwords into shell command text.
Increment `versionCode` for every subsequent Play upload. All builds copy only
runtime assets, never the full repository, assistant files or attachments.

## Before publication

Build success alone is not device validation or Play approval. Test on a physical
phone: both orientations, simultaneous move/aim, long waves, audio interruption,
Android Back, app switching, checkpoint continuation after force-stop/update,
backup export/import and airplane mode. Check tablets and navigation-bar insets.
Browser-driven testing has not completed every mission.

Use Play Console's internal testing track first. Complete the store listing,
content rating, target audience, app-access and Data safety declarations, and
publish an accurate privacy policy. This preview stores progress on the device;
it does not implement accounts or upload gameplay. External links are handled by
the browser. Verify declarations against the final shipped build and any future
SDKs. Google Play may impose account-specific testing and verification steps.

Official references:
- https://developer.android.com/develop/ui/views/layout/webapps/load-local-content
- https://developer.android.com/google/play/requirements/target-sdk
- https://google.play/business/guides/releasewithconfidence/

## Campaign completion preview (0.1.1 / code 2)

Google Play signup and publishing are on hold at the user's request. Focus is
on the playable preview and feedback before committing to store publication.

The seven operations now have concise exit debriefs. Completing every operation
unlocks the campaign finale; optional logs add lore without hiding the next
story lead. Real wave breaks display a regroup countdown. Runtime imports use
one cache revision (`completion-r30`). All 77 test files pass. The ending layout
was checked at desktop, 390×844 portrait and 844×390 landscape sizes using a
disposable design fixture, not a claimed completed playthrough.

Signed APK and AAB builds pass verification; all 113 packaged game files match
the source. Artifacts are in `dist/android/nulldelve-0.1.1-release.apk` and
`dist/android/nulldelve-0.1.1-play.aab`. The user confirmed the prior 0.1.0 APK
works on their Samsung phone. Version 0.1.1 still needs an on-device check.
Full manual playthroughs of every mission have not been completed; see
`HANDS_ON_PLAYTEST.md` for actual coverage.
