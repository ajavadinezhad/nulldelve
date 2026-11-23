# Progression and armory balance review — r46

Three reviewers audited encounter progression, weapon value, and the economy. This follows the secret cash and menu navigation audit. Changes are local; publication is separate.

## Findings and changes

- Late annex encounters reset to mostly ordinary creatures. Their final encounters now replace some ordinary bodies with durable and priority mutations. Opening annex rooms retain their breather role. Enemy totals, simultaneous caps, reward IDs and saved queues remain unchanged.
- Final-wave health budgets on Normal changed: Nest 392→463, Hospital Isolation 287→335, Freight Cold Chain 221→263, Signal Uplink 190→226 (about17–19%). These are sums of generated enemy health, not observed player damage or completion time.
- Reinforcement intervals now tighten by phase: Normal3→2.7→2.34seconds, with the same difficulty multipliers, caps and full6second inter-phase rests. Breach Security retains its opening pace. Active caps can delay arrivals; these intervals do not describe uncapped live enemy counts.
- Four expensive specialists had poor sustained output. Faster recovery/reload makes ORISON, VESPER, LANCET and TWIN useful in their respective burst, suppression, penetration and close-range roles. Base damage did not increase. Reload-inclusive model gains are about45%,33%,40% and31%; actual output depends on aim, range, pellet intersections and aligned targets.
- A flat100 first damage upgrade doubled automatic starter damage immediately from the150 starting allowance. Future automatic/burst damage tiers cost180/300/450; pellet weapons200/325/475. Other damage prices, ammunition, cash rewards and supplies are unchanged. Already purchased levels and cash are preserved. Normal Breach's kills plus first-clear contract leave267 before optional caches or spending: enough for first carbine damage tuning plus a60 medkit.

## Verification and limits

The ammunition model exercises generated encounter queues and actual loot functions with misses, finite magazines/reserves, sidearm and finite route supplies. All base weapons remain supported on Easy/Normal at75/80% model accuracy; late Hard is checked with the first damage investment. Removed the blanket requirement that every unupgraded gun must finish late Hard without any grenades, barrels or melee. An added regression checks the shot/reload benefit of damage investment on late encounters. The projection assumes recoverable drops are collected and does not simulate enemy attacks or player movement; it is not proof of human difficulty or a manual playthrough.

Secret regressions cover all three caches, checkpoint cash/spending preservation, replay, duplicate and simultaneous claims, interrupted writes and recovery. No confirmed farming defect was found. Exploration checks cover collision-safe access, fog/operation gating and restored events.

Menu confirmation fix: Back first cancels pending backup/training reset confirmation; leaving/reopening clears it. Back remains outside the scrolling content. No new browser or physical-phone layout pass was performed in this review.

Final full suite:88 test files passed; syntax and whitespace checks passed. Human desktop/phone playtesting remains necessary to judge the revised difficulty curve. Skillful starter-only clears are not artificially blocked; upgrades now provide a substantial advantage against stronger late opposition.
