# Physical apparatus instead of remembered input orders

Archive, Reactor and Containment no longer require a hidden sequence of button presses. Their persistent state is a small `mechanism.positions` array; each input changes only its own control. The controls wrap around, so every possible state remains recoverable without restarting the puzzle.

- Archive keys rotate inside visible asymmetric sockets. The tab and aperture can be compared directly, including the circular key. Input order is irrelevant.
- Reactor breakers carry visible current loads. The instrument shows the actual combined current against an operating band. Switching one breaker does not erase another. The player observes the electrical consequence instead of following a displayed order.
- Containment wheels control pressure relief and incoming flow. The pressure needle responds to both; the flow indicator also has to be active. An apparently safe pressure with no flow does not satisfy the apparatus.

Only physical geometry, control identity, current setting, live readings and equipment operating limits enter the normal panel. It does not receive an ordered answer, a next-control index, or a green highlight marking the next input. The paid camera resolver can separately request a shortest next action; this helper never enters the panel payload.

The existing metal controls, fixed close header, keyboard focus loop and compact landscape layout remain. New instruments share the scrollable control area rather than adding an overlay over gameplay. Keyboard users receive current dial settings, current readings and the operating band through accessible labels.

Existing completion flags and legacy completion markers remain compatible. Legacy solved apparatus receives a solved mechanical state during migration; legacy unfinished sequence attempts start in the new apparatus' default state. Malformed arrays and contradictory completed states are rejected. Current wheel geometry must match its saved quarter-turn position after restoring a checkpoint.

Automated tests enumerate all mechanical states in both variants, check recovery and independent actions, reject malformed states, check gauges and sockets, verify the actual main interaction path, checkpoint migration, no repeated completion grants, and existing modal focus/cancellation behavior. These checks do not substitute for a human puzzle playtest or physical phone testing.
