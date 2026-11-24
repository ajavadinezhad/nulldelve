#!/usr/bin/env bash
set -euo pipefail
project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$project_root/android"
if [[ -n "${JAVA_HOME:-}" ]]; then export PATH="$JAVA_HOME/bin:$PATH"; fi
gradle_args=(--no-daemon)
if [[ "${NULLDELVE_GRADLE_OFFLINE:-0}" == 1 ]]; then gradle_args+=(--offline); fi
case "${1:-debug}" in
  debug)
    ./gradlew "${gradle_args[@]}" lintDebug assembleDebug
    python3 "$project_root/tools/verify-android-assets.py" app/build/outputs/apk/debug/app-debug.apk
    ;;
  release)
    # Gradle verifies each setting without displaying its value, including when
    # signing.properties exists but is incomplete. Never fall back to unsigned.
    ./gradlew "${gradle_args[@]}" lintRelease assembleRelease bundleRelease
    apk="app/build/outputs/apk/release/app-release.apk"
    bundle="app/build/outputs/bundle/release/app-release.aab"
    python3 "$project_root/tools/verify-android-assets.py" "$apk" "$bundle"
    signer="$(command -v apksigner || true)"
    if [[ -z "$signer" && -n "${ANDROID_HOME:-}" ]]; then
      signer="$(find "$ANDROID_HOME/build-tools" -mindepth 2 -maxdepth 2 -name apksigner -type f | sort -V | tail -1)"
    fi
    if [[ -z "$signer" ]]; then echo 'Android signature verifier is unavailable; release was not copied.' >&2; exit 1; fi
    "$signer" verify "$apk" >/dev/null
    verifier="${JAVA_HOME:+$JAVA_HOME/bin/}jarsigner"
    signature_log="$(mktemp)"
    trap 'rm -f "$signature_log"' EXIT
    "$verifier" -verify "$bundle" >"$signature_log" 2>&1
    if ! grep -q 'jar verified' "$signature_log"; then echo 'Play Bundle signature verification failed; release was not copied.' >&2; exit 1; fi
    version="$(python3 -c 'import json; print(json.load(open("app/build/outputs/apk/release/output-metadata.json"))["elements"][0]["versionName"])')"
    mkdir -p "$project_root/dist/android"
    cp "$apk" "$project_root/dist/android/nulldelve-$version-release.apk"
    cp "$bundle" "$project_root/dist/android/nulldelve-$version-play.aab"
    echo "Verified APK and Play Bundle: $version"
    ;;
  *) echo 'Usage: tools/build-android.sh [debug|release]' >&2; exit 1 ;;
esac
