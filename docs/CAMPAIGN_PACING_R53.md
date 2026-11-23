# Campaign pacing pass

- Command, Research, Containment and Nest start at the preceding sector's actual exit coordinates. Direct deployments and retries keep that approach, rather than placing the player in the next arena.
- Authored encounter toughness progresses independently of the player's purchases. Health multipliers added to the difficulty baseline: 0%, 5%, 10%, 15%, 20%, 50%, 55%, 60%. Movement ramps to at most +12%; normal opposition gains flanking in Containment and later. Easy retains direct pursuit. Player health and enemy hit damage stay unchanged.
- Normal workers in Hospital require three stock-carbine hits versus two in Breach. One damage upgrade reduces that to two. Mutations retain their individual attacks and readable warning durations. No purchase gate or scaling against the player's chosen gun.
- Current saved health is preserved. Restored movement/behavior use the same encounter policy as fresh enemies; old checkpoints do not heal enemies.
- Ten small one-shot vent, dust and electrical route events supplement the three existing recess events. These are atmosphere, not additional fights, damage, camera takeovers, or rewards. Seen events persist in checkpoints.
- Research sample recovery, Containment isolation and Nest signal decode now grant one finite standard ammunition allotment using their existing durable completion flags.
- Critical ammunition aid now works on all difficulties when both guns run low. Its trigger and quantity use base weapon value rather than purchased damage; damage upgrades must not silently shrink aid. Nearby pending drops suppress repeated assistance. Precision weapons have a bounded emergency reserve; pellet aid no longer assumes every pellet lands.

## Validation and limits

The ammunition projection now uses actual encounter toughness. It models a first damage investment by Research and two by the annexes; it no longer promises every unmodified gun can clear all eight missions. It assumes 75–80% accuracy, all reachable drops recovered, no damage, grenades or melee, and conservative pellet hits at three meters. It is a supply check, not a human combat playthrough or proof of ideal difficulty. Traversal checks still cover all campaign/difficulty/remix combinations.

This does not turn the campaign into a seamless open world. The operation selection and result screens remain, and the Hospital/Freight/Signal annexes still use separate deployments. The rooms' footprints are unchanged. Longer bespoke corridors, set pieces and varied traversal need authored map work; this pass only adds continuous facility approach points and route atmosphere. Do not advertise it as a full map redesign or measured longer human playtime.
