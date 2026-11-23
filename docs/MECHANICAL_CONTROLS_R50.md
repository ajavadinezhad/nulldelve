# Mechanical puzzle controls — r50

The pressure/feeder dialog uses three physical-looking levers instead of native range inputs and plus/minus form buttons. Each has a metal shaft, ridged handle, pivot mount, detent marks and current-value readout. Only current settings are displayed; required settings remain hidden.

Drag the lever to a detent, tap its grip to move to the next position, or use arrows/Home/End from the keyboard. Pointer capture tracks the owning finger, including after dragging off the handle. Grip taps retain their original hit target when capture retargets pointer-up. Locked controls do not adjust. Test continues through the unchanged game controller; no puzzle action is performed by a decorative animation.

Node checks cover snapping/clamping, pointer ownership, grip taps under pointer capture, keyboard input, locked controls, and absence of native range inputs. Chrome confirmed a grip tap changed a current value0→1 and keyboard End moved another lever to2. Responsive checks at320×740 and667×320 showed no horizontal page overflow, with Test still visible. Screenshot: /tmp/nulldelve-mechanical-levers-r50.jpg. Physical phone dragging was not tested. The elevator and controller changes from r49 remain intact.

Temporary component preview removed. Local changes only, not published yet.
