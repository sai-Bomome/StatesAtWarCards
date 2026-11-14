# States at War — Card Front

Separate prototype copied from StatesAtWar. Two-player, card-driven territory conquest using the existing procedural SVG island and PeerJS multiplayer.

## Play

Run `npm install` then `npm run dev`. Choose Local multiplayer for same-screen pass-and-play, or Host a game and share the invite link. Guests need a reachable hosted URL, not the host's localhost address. Both browsers must stay open. No reconnect or host migration; network traversal depends on the peers' networks.

The current workstation uses a node_modules junction to the original project's installed dependencies. For an independent checkout, install the dependencies normally.

## Rules

- Two players, 16 provinces, actual shared-edge adjacency. Start with one province and 2 active troops each.
- Default shared deck: 59 cards. Reinforcements +1 ×10, +2 ×5, +5 ×2, +10 ×1; Double ×2; Barracks ×3; Monument ×3; Sabotage ×3; Demolish ×3; Attack ×20; Siege ×2; Capture ×2; Break Siege ×3.
- Host/local setup exposes 0–100 copies of every card, live deck total, individual resets and full reset. At least 12 cards required. Settings are locked into the authoritative match and shared in guest snapshots. Fewer than 3 Monument cards makes prosperity unavailable; with extra copies, holding any 3 wins.
- Deal 5 each, draw 2 at turn start (including opener), play up to 3, discard to 7 before passing. Discarding costs no action. Played/discarded cards recycle.
- Reinforce adds its printed value in active troops. Attach Double before tapping the destination, in either selection order; both cards together cost 2 plays. No stacking doublers.
- One building per province. Barracks produces +1 active troop at each future owner-turn start. Monuments require 5 active troops to build, without spending them; that requirement is checked only when building.
- Built cards stay on their province, outside the draw/discard piles. Capturing preserves the actual card; demolished barracks return to discard. This prevents duplicate monuments through recycling.
- Attack sends active troops into adjacent neutral/enemy land, leaving 1 behind. Combat cancels 1:1; surviving attackers capture. Ties retain the defending ownership. Attack demolishes barracks and cannot target monuments.
- Sabotage removes up to 3 active troops from an adjacent enemy, leaving buildings/ownership/blocked troops unchanged. Demolish destroys an adjacent enemy barracks only.
- Siege targets either enemy building next to your land. Defender explicitly chooses Break Siege (a free out-of-turn reaction) or Allow Siege. Attacker cannot continue until the response. No timer or animation controls this decision. Local play privately hands the screen to the defender and back.
- Allowed Siege blocks floor(active troops / 2), leaving the larger half active. Blocked troops remain present but cannot fight or move. Only one siege per province. Reinforcements and barracks gains arrive active.
- Capture requires a besieged adjacent enemy province, uses normal active-troop combat, retains its building on success, and removes all blocked defenders. Siege → Capture can therefore preserve a barracks as well as a monument.
- Break Siege on your turn costs 1 play and reactivates blocked troops. As an immediate response it cancels Siege without spending the defender's future actions.
- Immediate victory: control 3 built monuments or eliminate the opponent's last province. The previous majority rule is removed. Maximum-round scoring remains a future design decision; no round cap is implemented.
- No free movement, gold, building health or defensive combat modifiers.

## Implementation and validation

`game.js` is the authoritative rules engine. `main.js` contains UI, local handoff and the copied PeerJS host/guest flow, using a separate protocol prefix. Commands validate turn, revision, card ownership, targets and troop commitment. Per-player network snapshots hide other hands, draw order and random-generator state. The host is trusted and can inspect the complete game; this is not a competitive anti-cheat architecture. Local pass-and-play hides hand markup during handoff but assumes players respect screen privacy.

Run `npm test` for card rules tests; `node --test tests/island-map.test.js` for inherited geometry checks; `npm run build` for production output in dist.

The borrowed card counts are a playtest starting point. Attack now defaults to 20 copies to support expansion and repeated conquest.

## Game frame

All match actions and details belong inside the single viewport-bounded game frame. The hand fits with overlap and no scrollbar; rules/history may scroll inside their panel. Handoff and victory overlays are anchored to the frame. See AGENTS.md for the persistent layout requirement.

Clarification: “game frame” specifically means the ocean-and-island map surface. All controls, cards and match information float within that surface; there is no separate page header, sidebar or hand section outside it.

## Direct actions and feedback

Reinforcement, building and disruption cards resolve by selecting a card and tapping a highlighted province. Attack and Capture use a nearby adjustable troop confirmation. The strongest adjacent source is suggested, with just enough armies for a capture when possible. Click another adjacent owned source or use the local army stepper to change the plan. Escape, water or Cancel dismisses the plan without spending a card/play.

Dashed arrows are previews. Solid paths, brief troop travel, province emphasis and compact count/flag markers accompany accepted moves only. All peers receive the same public semantic event; opponent hands remain redacted. The last-move recap and Recent orders retain the explanation after spatial effects clear. Results resolve immediately, without waiting for animations. Reduced motion substitutes static marks and paths; sounds remain optional. Coordinates can be toggled with the grid icon and start off. Empty provinces have no text or dots; owned provinces show a helmet and count.


## Seed-growth map experiment

The current experiment uses one fixed rounded island outline. Sixteen random seeds are placed inside it with minimum spacing. Each receives a deterministic speed from 0.78× to 1.28×. A competing arrival-time frontier grows outward into free land, stopping against other provinces and the coast. Seed positions are not relaxed toward equal-sized cells. Shared borders are smoothed once and reused by both provinces. The resulting graph drives claims and attacks.

The fixed land boundary separates province-generation quality from coastline generation. Speed and available space both affect area, so a fast but crowded seed can still end with a small province. Layout and speeds change with the match seed. The island stays flat 2D and has no offshore decoration.

Interactive study: http://localhost:5174/tools/province-growth.html — replay growth, scrub through time, inspect speeds and generate a new arrangement. This diagnostic uses colored provinces and seed dots; those extra labels do not appear in the match UI.

Variant gallery: http://localhost:5174/tools/island-gallery.html (development diagnostic).

Prior terrain research: https://www.redblobgames.com/maps/terrain-from-noise/ and https://www.redblobgames.com/maps/noisy-edges/ . No added dependency.


### Match-start formation

A new match visualizes the actual seeded arrival-time field: dots appear, regions expand at their assigned speeds, shared borders settle, then the normal owned/neutral map appears. The sequence lasts about 4.2 seconds and has an immediate Skip control inside the ocean frame. Reduced motion uses a brief static seed view (0.7 seconds). Local pass-and-play reveals the first player's hand only after the formation/handoff; online clients run the same seeded visualization. Any incoming accepted move ends a still-running intro, preventing stale presentation. Animation never modifies cards, troops, ownership or turn state.

## Agreed victory redesign

SAW's intended victory paths are complete annihilation, better stats at a maximum round, or reaching prosperity independently of round count. Prosperity now means controlling 3 monuments; prosperity and annihilation are implemented. Maximum-round stat comparison remains undefined. See VICTORY_DESIGN.md.

## Host rule controls

Host and local setup expose monument minimum active troops (5), barracks production per future turn (1), sabotage damage (3), siege block percent (50), monuments to win (3), starting troops (2), starting hand (5), draw per turn (2), plays per turn (3), and hand limit (7). Every field has a reset, plus a rule-group reset. Card-copy settings remain separate. Host validation enforces whole-number bounds and enough cards for both starting hands plus the opening draw. Card descriptions, siege preview, action dots, prosperity target, discard rules and feedback use the locked match configuration. No maximum-round scoring is added.

## Card presentation

Cards use centered names, a corner category badge and diamond divider, medieval silhouettes, bold borderless copy with separate highlighted requirements, and subtle category-colored waves along the bottom. The rendered requirement values follow match configuration. Hover/focus shows a gold outline; selected cards lift 28 pixels. Reduced motion preserves the static selected position without a transition.

Match HUD: End Turn is centered above the bottom hand, remaining card plays have their own small tray beside the upper-left profiles, and the round indicator is centered at the top.

## Optional passive troop growth

Setup exposes troops per owned province (0 disables it), timing (each owner turn start or every N completed rounds), and the round interval. Turn timing includes the opening turn and affects only the incoming owner. Round timing grows both players’ currently owned provinces once after N complete rounds: N=2 first triggers when round 3 begins. Neutral land never grows. Troops arrive active, blocked counts stay unchanged, and barracks production stacks on top. Host snapshots carry these settings; accepted end-turn events show troop gains on the map.
