#!/usr/bin/env bash
set -euo pipefail
project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$project_root/android"
case "${1:-debug}" in
  debug) ./gradlew --no-daemon assembleDebug ;;
  release)
    if [[ ! -f signing.properties ]]; then
    for variable in NULLDELVE_KEYSTORE NULLDELVE_STORE_PASSWORD NULLDELVE_KEY_ALIAS NULLDELVE_KEY_PASSWORD; do
      if [[ -z "${!variable:-}" ]]; then
        echo "Missing release signing setting: $variable" >&2
        echo "See docs/ANDROID_RELEASE.md. Never use a debug key for Google Play." >&2
        exit 1
      fi
    done
    fi
    ./gradlew --no-daemon assembleRelease bundleRelease
    ;;
  *) echo "Usage: tools/build-android.sh [debug|release]" >&2; exit 1 ;;
esac
