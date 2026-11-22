# Menu layout audit — r35

Three parallel source reviews covered armory/skills, campaign/settings, and Field notes/touch overlays. Browser checks used external Chrome with desktop 1680×1050, medium 1000×740, phone portrait 393×707 and 320×740, and landscape 707×393 and 667×320 viewports.

## Fixes

- Prevented the phone pause objective panel from sharing the navigation row. A later desktop rule overrode the mobile row placement; removed that redundant override.
- Allowed long weapon stats, upgrade values, and attachment controls to wrap without crowding purchase controls.
- Kept campaign map labels compact inside narrow panes and settings controls above their values on narrow screens.
- Bounded backup filenames and confirmation controls.
- Improved Field notes headers, diagrams, short landscape layouts, and focus after selecting an entry.
- Hid touch sticks beneath Help and expanded map overlays; adjusted small-phone action spacing.

## Browser coverage

Main menu, new operation entry, campaign map and late operation briefing, four settings tabs, keyboard capture cancellation, weapon inspection (including ORISON, LANCET, MANTIS), equipped upgrades, attachments, supplies, skill tree and reset confirmation, pause menu, both Field notes tabs, mutation detail selection, success/failure results and expanded statistics.

Used isolated in-memory profile fixtures with all operations, weapons, large cash/item values, and developed skill branches. Fixtures were removed after checking. The actual result rendering was tested with large statistics. No user progress was changed.

Visible-control intersections and selected text overflow were measured, with viewport and clipping taken into account. The confirmed phone pause overlap disappeared after the stylesheet fix and cache refresh. Other checked states reported no visible button intersections or horizontal page overflow.

## Limits

Chrome responsive viewport checks are not physical iOS/Android device tests. This pass checks menu layout; it does not certify every gameplay state or every possible font/browser combination. Help/map touch overlay changes received source review and targeted automated checks, not a fresh physical-device playthrough.
