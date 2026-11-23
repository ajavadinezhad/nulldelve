# Passage variety — r44

Added a36-tile ambulance service gallery south of Hospital Admission. Ledger dispatch now sits at the far end; the deliberate exit is five units away so dispatch does not auto-complete the mission. The new floor connects through Admission only: two wall rows still separate it from Isolation, preserving quarantine gates and all door IDs. Existing checkpoints retain their map dimensions and object identities.

Two stair bridges in Command and Cold Chain passages raise/lower the operative smoothly over visible treads and landings. These are raised passage geometry, not stacked playable floors.

Two optional service-lift transfers use the Pharmacy/Admission and Antenna/Core passages. Doors must already be unlocked, open, and fully slid. The transfer path is collision checked and rides are unavailable during combat. Interaction uses E or the phone Ride action. Short1.8/2.1-second transfer/fade pauses gameplay simulation, clears held fire/grenades/dragging, and preserves money/progression. Pause cancels safely to the start; a newly locked door also aborts. Lifts do not teleport past puzzle gates. These are local lift-style transfers in the existing floor plan, not a full multi-floor simulation.

Transit dressing is instanced by material and stays below fog. Tests cover gate/collision checks, both directions, cancellation, door relock, gallery isolation, stair profile, and batched geometry. The full mission traversal suite checks authored routes including the longer hospital dispatch journey. No physical device or rendered playthrough was completed for this pass.
