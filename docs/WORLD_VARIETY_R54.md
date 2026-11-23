# Distinct annex routes and consequential secrets

## Authored floor changes

Freight's walkable arrival narrows into a loading spine with separate cargo courts. The Loading Yard has a protected west dock beside a divider and an exposed central trolley lane; Rail Control has an L-shaped approach. A pump island splits Pump Hall firing lanes. All existing devices, enemy spawn corners, door indices and chapter gates retain their coordinates.

Signal instead has a split feeder gallery, a perimeter antenna hall with a central crossing, and an extended service-exit perimeter. The walkable mask differs from Freight by more than 150 translated floor cells; the distinction is actual collision geometry, not names and prop colors.

The room metadata remains a bounding box for discovery, spawning and old checkpoints. The exported FREIGHT_FLOOR and SIGNAL_FLOOR arrays are the actual walkable masks. Future edits must not reintroduce carving every metadata rectangle as a full arena.

## Discoveries with persistent consequences

Existing secret cache claims now also release physical service gates. They use the existing durable reward ledger, so no new reward identity, currency payout, or save schema is introduced.

- Freight opens the cargo divider cross-cut at (183,30), shortening a return from the western loading dock to the dispatch spine.
- Signal opens the service cut at (236,50), shortening the long perimeter return to the departure area.
- Hospital opens a covered return loop from the linen recess into Triage.

Additional local service loops remain within their original arena. They never connect across a powered doorway or battle lockdown. Freight and Signal shortcuts have measured shorter tile routes in collision-aware tests with props and player radius. Hospital's covered loop is an alternate approach, not advertised as the shortest path.

`explorationShortcutBlocked` must be included in runtime collision using the same claimed-reward callback as `createExplorationArt`. The gate art retracts and changes its status lamp when that reward is owned. Unseen gates stay behind fog. A clue/solution is not printed on these objects.

## Existing saves

`recoverWorldPosition` recovers only a blocked legacy position inside a reshaped Freight or Signal room. It selects legal floor within that same original room, preserves combat/inventory state and refuses to move a checkpoint from a sector doorway across its gate. Call it after restoring player, doors, barrels and operation state.

## Checks and limits

Exploration tests cover discovered-floor requirements, bounded cash, persistent claims, reduced-effects behavior, actual recess approaches and operation scenery changes. World-variety tests cover distinct walkable masks, shorter released routes, locked/unlocked gate collision and matching art, persistent no-repeat rewards and legacy save recovery.

Collision traversal across all 48 campaign variants and 12 legacy arena variants now passes with the new floor masks, closed unclaimed shortcut gates, actual physical apparatus solving and the escorted cargo transfer. Five older operation routes also pass their actual path checks. No physical-phone or full manual combat playthrough was performed for this map pass.

Matching sector coordinates alone are not seamless world persistence. The root integration owns actual inter-operation transfers and the freight escort objective; this document does not claim those are provided by geometry or atmospheric effects.
