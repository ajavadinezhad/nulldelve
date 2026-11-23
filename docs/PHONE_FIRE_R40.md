# Separate phone firing — r40

Movement and aiming sticks never set firing. A separate hold-to-fire button sits above the aiming stick and mirrors with handedness. The aiming stick retains its touch-relative origin and the game retains the last aim direction after release. Aiming can therefore precede firing without holding three fingers at once.

Fire has its own pointer owner, pointer capture, release/cancel/lost-capture handling, keyboard click activation, and pressed appearance. Pause/input reset, resize, visibility loss, and blur clear held fire with the other controls. No outer-edge firing remains. Help/training reflect the new control.

Input tests cover full-deflection aiming without firing, independent held fire, wrong-pointer release rejection, cancellation, simultaneous movement/aiming, and resize clearing fire. Physical phone comfort remains to be confirmed.

## Movement-facing follow-up — r41

The movement stick also sets facing. Independent aim takes priority while deflected; releasing it returns facing to movement. Releasing both preserves the game's last facing. Fire remains independent and no stick gesture consumes ammunition. Direction tests cover diagonals, aim priority, release, idle, and invalid input.

## Two-control layout — r42

Removed the separate aim stick. The combined move/facing stick defaults to the right; Fire occupies the left thumb position. The existing side-swap accessibility setting mirrors both controls, and its labels now match the displayed side. Input-reset tests verify the removed aim control does not remain in the DOM and Fire still releases independently.
