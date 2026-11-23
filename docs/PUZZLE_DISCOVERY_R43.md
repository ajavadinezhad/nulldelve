# Puzzle discovery and answer-leak review — r43

Three agents reviewed world art, progression prompts/camera leads, and optional help/reference notes. Removed printed glyph, power, and valve sequences; hospital/freight target-setting plaques; pressure/door A/B and wire A–I labels; and letter-order console instructions. Neutral mechanism symbols and actual accepted/completed state remain. Electrical motor loads and feeder capacities remain as problem constraints rather than assignments.

Removed camera selection based on the first incorrect wire or untested target match. Camera leads identify a relevant area/console without identifying the incorrect component. Freight indicators show idle/running/delivered rather than hidden per-switch correctness before testing.

All optional live hint stages now give process/observation clues, not exact sequences, settings, coordinates, or rotations. Field notes use neutral control/status schematics instead of seed1 puzzle instances. The standalone reference library no longer creates hidden solution lists or solver/demo controls. Main help labels no longer promise a solution. Automatic legacy mission guidance no longer points to removed answer plaques.

Sequence puzzles retain accepted/rejected input feedback. Hospital/freight retain explicit test validation. This prevents answer disclosure but does not add richer authored environmental deduction; sequence discovery can involve trial and feedback. No new hidden objectives or impossible tests were introduced.

Three.js checks verified art does not redraw an answer when hidden sequences change, status changes still update art, and real capacity constraints remain visible. Regression checks cover normal/remixed answer-free clues, neutral camera leads, bounded optional clues, and reference notes. No browser or physical-device playthrough was performed for this pass.

Attempt feedback uses a green check/red cross at the interaction prompt for accepted/rejected inputs and rejected route/distribution/pressure tests. Full messages remain in the screen-reader status. Opposite verdicts replace each other immediately; stale timers cannot clear a newer verdict.
