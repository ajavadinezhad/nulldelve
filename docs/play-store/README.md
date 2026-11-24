# Nulldelve store artwork

Prepared artwork, not an uploaded store listing:

- `icon-512.png`: 512×512 RGBA PNG, opaque square background; Google Play applies its own corner treatment.
- `feature-1024x500.png`: 1024×500 RGB PNG, no transparency.
- Matching SVG sources derive from the existing N monogram and facility corridor palette. The feature graphic is illustrated key art, not a gameplay screenshot.

Regenerate with `python3 tools/build-play-art.py` (Pillow and DejaVu Sans Bold required). These files are under docs so they are not copied into the offline Android runtime.

Still needed before submitting: current installed-build screenshots in portrait and landscape. Show real gameplay and actual menus; do not represent key art or seeded test scenes as a human playthrough.

Official specifications checked November24,2026: https://support.google.com/googleplay/android-developer/answer/9866151

Suggested alt text:
- Icon: Gold N monogram on a dark blue square.
- Feature graphic: Nulldelve title beside a dark industrial corridor and a gold-lit doorway.
