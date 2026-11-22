# UI stability pass — r37

Three review agents covered menus/settings/campaign, armory/skills, and touch HUD. Fixed changing selection border widths, inconsistent weapon status heading height, phantom third phone inventory column when grenade switching unlocks, sticky touch hover effects, and counter-width changes.

Shared changes preserve scroll after menu refresh, reserve bounded feedback space, use a persistent personal-best row, and render a preview slot for every briefing. Short landscapes hide repeated brand/footer chrome while preserving navigation within the content.

External Chrome checks used isolated in-memory purchase data at 393×740, 320×740, 667×320, and 1440×900. Repeated upgrades preserved scrollTop 389 and content height 521 at 393×740; feedback height stayed44. Short landscape content increased110→261 pixels with a34px feedback row. Campaign markers measured48×48 at all checked sizes. No horizontal document overflow was observed. This is responsive browser verification, not physical-phone certification. Temporary fixture removed after verification.
