# Live world integration corrections

Freight and Signal room definitions are bounding metadata, marked `floorMask:true`.
The production map initializer now excludes these rectangles from its generic
room carving. Dedicated authored masks are the source of floor truth. The world
regression evaluates the actual main initializer and actual prop collision, not
only isolated carvers: it checks intended walls remain solid and secret release
routes shorten the real composed map.

Adjacent deployment has an explicit `continuing:true` mode. It preserves completed
historical task flags, completed apparatus state and logs while initializing the
next sector's tasks. Fresh/replay deployment still resets those tasks. Completed
optional Command regulator/backup terminals remain active after Research begins
and after checkpoint restoration.

Secret cash is physically stored beside a service-release lever. Claiming the
existing durable reward flips this lever and its remote gate; collection feedback
identifies the route release. No additional reward IDs, respawn loops or repeat
cash payouts were introduced.

Evidence objectives now have visible consequences: sample/cargo lids reveal a
shared specimen motif, backup supply indicators come online, the isolated
transmitter goes dark, and the evidence uplink lights. These use existing task
flags through the exploration-art callback, so they recover after a checkpoint
without another save format or text overlay.

Freight's original finite Yard queue is released at cargo rail checkpoints.
`freightEscortPhaseReady` permits the opening group on entry, requires dispatch
and the first rail checkpoint before the second group, and the later checkpoint
before the third. The same defender/reward identities remain. Clearing the room
before escorting cannot skip this progression. Navigation fixtures follow the
cart while removing simulated defenders; they no longer assume every threat is
removed before dispatch.

Hospital ledger retrieval is now an Isolation combat objective. Its first defender
phase begins normally; later finite batches wait until the operator reaches and
recovers the evidence inside the active room. Recovery does not unlock the exit:
the remaining defenders, dispatch and deliberate departure are still required.
The same enemy/reward identities persist through checkpoints, and repeated ledger
interaction never launches another wave. This replaces one post-combat errand
with a consequential action under pressure rather than adding enemy count.

Validation distinguishes state/navigation checks from a human combat playthrough.
The map composition, actual prop collision, task continuation, release hardware,
evidence art, cash ownership, old-save actor recovery and escort phase conditions
have direct regressions. Full phone combat and narrative impact still need
observed gameplay rather than inferred route length.
