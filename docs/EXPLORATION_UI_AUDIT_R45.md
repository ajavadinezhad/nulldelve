# Exploration, regression, and navigation pass — r45

## Added exploration

Three optional one-entry service recesses extend Hospital Triage, Freight Cold Chain, and Signal Transmission Core into the northern map margin. The original room/door IDs remain stable. Secret cash is finite18/22/24 and flows through the same durable campaign-profile reward ledger, pending journal, and checkpoint cash-preservation paths as existing salvage. Discovery fog hides recess props/cash until seen. Steam, dust, and relay events are local, non-damaging, one-shot observations with checkpoint state and reduced-effects support.

## Confirmed fixes

- Spitter/Mender cash was missing from economy and durable-recovery validation. They now pay10/12; validation is shared across live claims and recovery.
- Quick Fire taps between simulation ticks could disappear. Accepted pointerdown now fires once immediately; held fire still uses normal cooldown. Pointer release outside controls clears only the owning finger, including when capture fails.
- Large portrait controls crowded the four-button utility row. Large portrait now uses a two-row cluster; landscape retains the wide row.
- Failed backup imports no longer reset the active session. Failed previews do not show ready confirmation.

## Navigation

All submenus have a single44px Back control and title in a fixed shell row outside the content scroller. Duplicate bottom Back controls and duplicate titles are removed. Main/pause action rails remain intact. Field notes use two tabs; compact skill Tree return sits before the description. Backup Download/Restore controls use matching icons and a compact two-button confirmation; filename display is bounded.

## Verification

87 test files passed. Agent audit included48 campaign and12 arena authored traversal/checkpoint variants. New tests cover every mutation payout, pending reward recovery, earned-cash preservation, all three real secret pickup callbacks and duplicate claims after reload, optional-event state validation, fog gating, reduced effects, quick Fire taps, independent pointer release, fixed navigation ownership, preview rejection, and failed import session preservation.

External Chrome loaded the actual game without console errors, deployed an isolated Breach run, and verified movement tap30/30→30/30 and Fire tap30/30→29/30. Geometry checks on the active tab confirmed no overlap among large touch controls at320×740,393×740,667×320. Back retained44px height and fixed top position while settings/armory content scrolled; settings content reached scrollTop1632 without moving Back. Backup confirmation geometry before the final cosmetic polish had no visible control intersections or horizontal page overflow at320×740,667×320,1440×900. The final styled Download/Restore actions were observed in the DOM, but the final native file-picker interaction lost the browser continuation and could not be certified. Functional preview/import tests pass.

This was not a physical-phone test or manual completion of all missions/new secrets. Temporary in-memory fixture removed. All changes remain local pending publication.
