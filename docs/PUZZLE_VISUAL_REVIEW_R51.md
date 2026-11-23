# Playable puzzle visual review — r51

Three parallel reviewers covered world equipment, controller behavior and modal UI. The final pass keeps one industrial steel/brass/cyan/coral visual language, with physical controls rather than generic settings forms. No solution sequences, desired values, next-correct inputs or required junction orientations are passed to the interfaces. Optional paid camera assistance remains the source of requested next-step help.

| Mechanism | Result |
| --- | --- |
| Crates and pressure plates | Retained direct physical pushing/pulling and seating feedback; equipment palette aligned. No modal added to movement puzzles. |
| Archive symbols | Physical engraved input keys in a readable bank. Only accepted/rejected actions light indicators; no sequence display. |
| Reactor routing | Mechanical breaker bank; handles mirror accepted current inputs. |
| Containment valves | Quarter-turn handwheels with state lamps, sharing the same metal equipment frame. |
| Cross-room generator cable | Close-up of the selected coupling's current ports only. Rotation remains a real controller action; the larger network still spans rooms. Unpowered mechanical pre-rotation remains allowed. |
| Hospital pressure | Existing three physical levers retained; world instrument now has three needles/current readings. |
| Freight routing | Two point levers, actual current track orientations and interlock states. World point handles follow switch state. |
| Signal feeders | Existing physical feeder levers retained. Current choices remain accessible; no desired assignment is exposed. |
| Timed relays | World decimal timer and bounded remaining-charge bar; no modal interrupts the required movement. |
| Restart defense | World state/fault and bounded progress instrument; no written tactic/order hints. |
| Three relic seals | Physical metal socket collars and collected-state illumination. Hidden relic locations remain hidden. |
| Keys/fuses/logs and simple task devices | Kept direct interactions; no unnecessary confirmation screens. Collected logs still disappear. |

New panels delegate to the existing main interaction pipeline so milestones, supplies, puzzle state and checkpoints remain effective. Actions are proximity/operation checked, invalid modes/indices are rejected, and locked/completed settings do not change. Freight dispatch still grants its finite supply allotment once. The UI does not solve puzzles automatically.

Confirmed review fixes: invalid setting modes could throw after new action panels were added; hidden Test could break keyboard focus wrapping; retained closed controls could invoke late actions. These are fixed and covered by regressions. Current-only coupling ports do not indicate whether an individual rotation is correct. Archive redundant symbol-name labels are visually omitted while accessible names remain.

Verification:93 test files passed. New controller audit covers14 cases across normal/remix sequences, all9 couplings, freight dispatch/interlocks, partial-state restoration, main milestone handling and one-time supply grants. Four UI regressions cover feedback, focus, stale actions and current-only/disabled controls. World regressions cover live gauges/meters, physical switch/valve transforms, collected logs and sockets.

Chrome exercised the actual shared UI against real controllers in a temporary isolated fixture: rejected/accepted symbol and breaker presses, wheel actuation, coupling rotation, successful freight dispatch, keyboard wrapping, and320×740 /393×740 /667×320 /1440×900 layout checks. Actual Breach runtime loaded with no console errors. This was not a full manual mission playthrough or physical-phone test. Temporary fixture removed. Screenshot: /tmp/nulldelve-puzzle-hardware-r51.jpg.

Local changes only; not published yet.
