# Cash and specialist stock — r22

Cash now comes from three sources: modest combat income, two finite exploration stashes per operation, and one first-clear contract. Stashes use authored identities and positions; contracts use `contract.<operation>`. A persisted claim ledger makes each reward payable once. The profile transaction checks the current ledger under its existing synchronization, owns its revision increase, and preserves the earned balance and claim history across older checkpoint loads.

Old saved balances and purchased upgrades are retained. Future kill payouts are $2 workers, $3 runners, $8 brutes, $10 chargers, $14 sentinels, $12 screechers, $9 leapers and $40 matriarchs. Stashes hold $20–45 and contracts pay $45–180. Since r24, repeated authored kills, stashes and first-clear contracts cannot be farmed by reload or replay.

## First-play Normal income model

Assumes every authored creature is defeated and both accessible cash stashes are collected. This is a gross-income model, not a survival or player-spending observation. Missed stashes and consumable spending reduce the available budget; repeat clears omit finite sources.

| Operation | Creatures | Combat | Finite exploration + contract | Gross income |
|---|---:|---:|---:|---:|
| Breach | 30 | $72 | $90 | $162 |
| Command | 70 | $261 | $115 | $376 |
| Research | 150 | $562 | $140 | $702 |
| Containment | 156 | $645 | $170 | $815 |
| Nest | 112 | $522 | $205 | $727 |
| Hospital | 140 | $587 | $230 | $817 |
| Flooded freight | 144 | $539 | $265 | $804 |

Starting $150 plus Breach income affords the $220 SMG and one $60 medkit, leaving $32. Command income affords a $300 pump gun and one medkit, leaving $16 before carried savings. Later operations support roughly one mid/high-tier gun or a combination of upgrades and supplies. A $100 damage upgrade competes with a $60 medkit, $90 frag or $100 armor refill; buying every option remains costly.

## Specialist stock

JACKAL Riot Slug costs $780 and unlocks after Command. Its four-round close-range launcher deals four damage with high stagger; its short reach and long reload trade damage throughput for interruption/control. It starts with 30 reserve rounds, matching the DMR's total 34-round initial budget when loaded rounds are included.

VESPER Needle Carbine costs $1,150 and unlocks after Containment. It combines long reach and controlled stagger with fast low-damage shots, but has a 24-round magazine and three-second reload. It starts with 72 reserve rounds. Both have distinct models, independent upgrades and normal single-projectile attachment choices. Milestones gate new purchases, never weapons the player already owns.

## Supply validation

924 baseline projections and 1,848 attachment projections cover 11 primaries × 7 operations × 3 difficulties × base/+1 damage × 75%/80% modeled accuracy, plus two nonstandard attachments. They collect all drops and allow sidearm fallback. Two finite freight resupplies retain the existing 64 base-damage-equivalent primary allotment plus 18 sidearm rounds. Testing rejected arbitrary larger allotments and instead reduced repeated late armored targets to one authored sentinel; freight remains 144 baseline creatures with its boss, leapers and screechers.

The projections do not simulate human aiming, dodging, survival, reachable drop timing or enjoyment. Human combat and phone testing remain necessary.

## r23 transaction review

Weapon upgrades now require the owned, equipped primary at the transaction boundary, matching the armory flow. Rejected requests leave cash, upgrade levels and profile revision untouched; the sidearm remains independently upgradeable. A two-tab simultaneous Freight cache test verifies one payment and the same persisted wallet/claim ledger after reload.

The review retained current prices: JACKAL's short reach, four-round magazine and slow reload trade damage throughput for stagger; VESPER buys reach and suppression rather than a direct damage tier. Supply projections pass for both, but these checks do not establish human willingness to buy them or actual survival difficulty. The ordinary-kill replay limitation identified in that review is addressed by the r24 ledger below.

## r24 permanent enemy reward claims

Every authored encounter slot has a stable cash identity, shared across checkpoint restores, difficulty/Remix changes and fresh deployments. Defeating the same slot again still counts as a gameplay kill and produces normal supply drops, but pays no additional cash. Successful payouts advance the durable profile revision. Checkpoint restores preserve the current wallet exactly, including purchases already deducted; they never select the larger of two balances.

Each pending payout is journaled before asynchronous profile locking. Closing the page after a final kill can recover the payout on next startup; claims and journal recovery are idempotent and synchronized across tabs. If browser storage is unavailable, cash remains protected only within the current session, consistent with the existing persistence warning.

Existing balances are never reduced. Profiles created before the ledger mark completed operations' enemy slots paid once, and legacy checkpoints mark recorded dead enemies/cleared encounters paid without issuing replacement cash. An old profile cannot reconstruct unrecorded historical kills in an unfinished operation before this update; protection is exact for all kills recorded by the new ledger. New wave snapshots also save pending reward ordinals so missing-reference recovery does not reuse a surviving enemy's cash identity.

## r27 payout interruption review

Enemy, exploration and first-clear contract rewards now share a durable pending-payout queue. Claiming a reward records the pending identity before any asynchronous profile lock; startup recovers every reward type. This closes the first-clear/departure gap where progress could be saved before the contract payment finished. Backup export can flush the queue before capturing the wallet.

A duplicate claim after a storage quota failure no longer deletes its recovery journal simply because the reward exists in memory. Journal cleanup now requires the stored profile to confirm the claim. Enemy retries also retain the original pending mutation payout rather than replacing it with a different amount after replay. Regression cases cover quota failure → duplicate → reopen, real pending contract interruption, exploration recovery, and a delayed backup flush. Existing prices and bonus strengths are unchanged.

## r31 replay allowance

A fresh replay of an already completed operation pays only at its actual successful exit: Breach$30, Command$40, Research$45, Containment$55, Nest$65, Hospital$75, Freight$90. This is a modest consumable allowance, not renewed kill income. The durable deployment token survives checkpoints and pays once. A newly started replay invalidates older tokens; an earned payout still being saved prevents replacement. First clears continue using their one-time contract.
