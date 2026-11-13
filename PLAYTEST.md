# Prototype validation

- 12 automated rules/geometry tests pass (`npm test`).
- Production bundle builds (`npm run build`).
- Browser verified: local setup, handoff hiding, revealing a hand, Claim targeting/confirmation, territory ownership, card consumption and plays remaining.
- Two real PeerJS browser clients connected using the isolated Card Front protocol. Host capture synchronized to guest; host end-turn drew two for guest; guest capture was validated by host and synchronized back.
- Desktop layout visually checked. Physical mobile devices and separate-network NAT traversal have not been tested.
- Balance has not been established. Next human playtest should assess hand stalls, +1 reinforcement pacing, first-player advantage and time to majority.

Feel/UX follow-up: 16 tests pass, including public semantic feedback and attack suggestions. Browser verified direct Claim/Army, target-local attack preview and cancellation, successful capture, reduced-motion static result markers, blank neutral provinces and coordinate toggle. Two connected browser clients verified that guest moves display feedback on the host. See FEEL_AND_UX.md.
