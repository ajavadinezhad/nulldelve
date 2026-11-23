# Critic review implementation

## World and missions

Freight uses an asymmetric loading spine, cargo courts, split dock approaches and L-shaped Rail Control. Signal uses split feeder aisles, a perimeter antenna route and a longer service exit. Device coordinates, world bounds, and indexed gate prerequisites stay compatible. An older checkpoint inside a newly shaped wall recovers to legal floor in its original room, preserving health and inventory.

Each existing secret claim now opens a physical service route. Freight and Signal gates shorten return paths; Hospital opens a covered linen route. Unlocks use the existing durable claim ledger and do not award duplicate cash. Collision and gate art use that same ledger.

The first five facility sectors can now continue in the live scene, through the existing departure/map/armory UI, rather than reloading the page. A successful departure token only permits the immediately adjacent sector with matching difficulty and puzzle variation. Health, discovered map, live props, open doors and remaining drops persist. New sector checkpoints capture that world. Replays, changed difficulty and the three annex deployments still start independently; this is not a fully seamless open world.

Freight cargo can be dispatched while the Yard defense is active. Its visible trolley moves through the loading spine only with the operator nearby and its immediate path clear of creatures; delivery cannot release Cold Chain while Yard enemies remain. No new respawn or cash loop was added. Signal's final evidence console can be activated during the Core defense for a finite route resupply, but the exit still requires clearing the defense.

## Combat and preparation

Health now uses explicit mutation/tier budgets rather than rounding tiny percentage changes: ordinary workers have 2/2/3/3/4/4/5/5 base health through the eight operations. Runners have 1/1/1/2/2/2/3/3. Heavy/special mutations have their own rising budgets. Existing difficulty multipliers apply afterward; player maximum health and bite damage do not scale against purchases.

Firing uses a walking stance; release Fire to sprint. This creates an escape-versus-offense choice without a stamina bar. The phone's requested right movement/facing stick and left Fire layout remain: holding Fire locks facing for retreat/strafe, releasing restores movement-facing. Resets and pointer cancellation clear it.

Damage and reload tiers now depend on weapon family. Precision guns receive larger per-shot gains and better shell penetration; fast automatics and pellet guns receive smaller damage increments. Heavy guns receive more useful reload reductions. Shell-bearing creatures take reduced frontal damage; rear approaches bypass the shell and earn a small bonus. Shop previews use the actual next offer increment. Purchased tiers, money and magazine bonuses remain saved.

Special mutations recover from repeated stagger for eight seconds after an interrupt. A 0.75-second recovery was tested and rejected because continuous Vesper fire could still cancel every warning. The final trace lets spitter and screecher actions resolve while continuously suppressed. Boss and Sentinel rules remain separate.

Critical ammunition aid is bounded by nearby pending pickups and base weapon value. Late ordinary enemies can qualify based on their actual health cost; Hard aid considers the next heavy fight before the sidearm is almost empty. Signal's extra finite console supply supports the extended final fight. These aids are not cash or permanent inventory farming surfaces.

Skill descendants retain their parent healing, sprint and grenade benefits. A compact deployment strip shows the equipped gun, upgrade tiers, armor and specialization without another purchase gate or tutorial paragraph.

## Puzzles

Archive uses rotating keyed discs and visible sockets. Reactor uses a current meter and breaker loads. Containment uses coupled pressure relief/feed controls with an observable flow interlock. Inputs change persistent physical settings; there is no wrong-prefix reset. Normal views receive current apparatus geometry and operating bands rather than solution sequences. Paid guidance identifies just one appropriate control. Legacy solved puzzles migrate to a consistent solved apparatus; partial new states validate and round-trip.

## Validation

100 test files pass before the final cache revision. Navigation covers 48 campaign difficulty/variation routes and 12 legacy arenas, including gates, cargo escort and checkpoint restoration. Browser checks covered 320px, 393px, short landscape and desktop puzzle/deployment layouts; startup and Pause were smoke-tested in Chrome.

New deterministic combat comparisons include stock, damage, handling and precision builds in the same encounters. They use actual weapon tuning, shell damage, mutation AI, player hurt grace/armor, firing movement policy, cadence and reload timers. They report time, shots, reload exposure and incoming damage. They do not require stock failure or skip stock builds. Supply projections compare every weapon at all damage ranks, including stock; they remain models rather than proof of human survival or enjoyment.

Limits: no complete new human campaign playthrough or physical-phone test. The combat arena does not model full navigation, body separation, looting, grenades or healing. The game still has eight operations; these changes improve existing content rather than claiming additional chapters or a complete open-world conversion.
