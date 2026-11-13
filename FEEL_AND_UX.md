# Card Front feel and UX notes

## Observed baseline

Browser/Vite/JavaScript, procedural SVG map, PeerJS host authority, mouse/touch-style taps and keyboard-accessible buttons. A fixed overview camera; no camera motion was added. Intended character: clear, deliberate, responsive. No measured frame-time/input-latency budget or physical-device baseline is available.

Claim/Army formerly required card, target and remote confirmation. Attack shared the same distant control panel and required source selection when ambiguous. The presentation hook was empty, so troop/owner changes lacked a spatial explanation. Existing mute and reduced-motion toggles were available.

## Intervention

- Proximity/recognition: Claim/Army use card → province (2 clicks instead of 3). Attack uses card → enemy → adjacent confirm (3 clicks; ambiguous sources now suggested automatically). Source and amount remain editable. All are cancellable before commitment.
- Intent versus result: selection outlines and dashed source/target arrows are previews. Public semantic events are constructed only after applyCommand accepts a move. The host broadcasts these alongside redacted state.
- Causality: source commitment, movement path, loss/capture marks, owner color and actual troop counts explain the move. A written last-result recap survives the short cosmetic tail; Recent orders retains earlier events.
- Restraint: one event at a time, at most one path and two result marks per move. Spatial effects last 4.5 seconds and never block the next command. No camera shake or full-screen flash. Feedback expiry removes only cosmetic nodes, preserving focused controls and previews.
- Accessibility: motion off retains static paths, marks and recap, removes troop travel/pulses. Meaning does not require audio or team hue alone. Blank neutrals; helmet/count on owned land; optional coordinates.

## Validation

16 automated rules, geometry, semantic-feedback and suggestion tests pass. Production build passes. Browser checks verified direct Claim/Army, coordinate toggle with blank neutral labels, local attack preview, cancel without spending, capture result, and reduced-motion static feedback. Performance and subjective feel on target mobile devices remain unmeasured. This is an implementation/comprehension check, not a user-preference study.

Online browser validation: two PeerJS clients connected. A guest Claim produced the same accepted territory update, flag/count mark and last-move recap on the observing host. Network feedback was verified with an actual public signaling connection, not just simulated packets.
