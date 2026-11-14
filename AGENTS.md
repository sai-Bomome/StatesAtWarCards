# Layout requirements

The game frame means the ocean-and-island map surface itself, as clarified by the user's screenshot. It does NOT mean a larger page container around a separate map panel.

Render the ocean/map as the full game frame. Overlay all in-match UI inside that surface: player details, turn/card counters, hand, action controls, previews, confirmations, errors, rules, history, handoff and victory UI. Do not use an external sidebar, header band or hand area outside the ocean surface. Keep the island visible and interactive between HUD overlays.

Fit the available viewport. Long HUD content may scroll within its panel; the hand must fit without scrolling, using modest overlap when necessary. Anchor all overlays to the map frame and preserve this requirement for future changes.

Match the original SAW profile/turn language: army-colored avatar badges stacked vertically at upper left, a gold outline plus Playing/Waiting text for turn identity, and remaining-play dots in a separate small tray beside the profiles, End Turn centered above the cards, and rounds at top center. Cards should have portrait playing-card proportions, one top-left index, a bold title, a large central emblem and a short readable rule.

Keep province labels minimal: neutral provinces are blank. Owned provinces show a helmet and troop count. Coordinates are optional via the grid-icon toggle (off by default, remembered locally). Do not add permanent OPEN / ARMIES / neutral-dot labels.

Card interactions: Claim/Army execute on a legal province tap after selecting the card. Attack chooses a sensible source/commitment and opens its adjustable confirmation beside the target. Keep attack controls spatially near the target, never in a distant sidebar.

Feedback must derive from accepted authority, be delivered to all peers, never gate commands, retain meaning with sound/motion off, and avoid revealing hidden hands/deck. Use compact transient map symbols/numbers and a concise last-move recap outside the provinces.

The hand floats directly over the ocean without a background tray, border or scrollbar. Give it the full lower width. Keep End Turn centered above the bottom hand; remaining plays belong beside the profiles, and rounds at the top center. Fit all cards, including temporary hands above seven, by overlapping cards when necessary; raise hovered/focused/selected cards above their neighbours.

Do not show a hand title, card-count heading or instruction line above the cards. Stack the player profile badges vertically at the top left of the ocean frame.

Keep card faces simple, following the user's reference: a single top-left badge (+1 for Army; suit icon for Claim/Attack), title, central icon and short description. No mirrored bottom index or 1 PLAY footer. Preserve full rules in accessible labels/help.

Render the island as a flat 2D map: solid territory fills, thin borders/coastline, no extruded cliffs, raised bevel, offset terrain layer or island drop shadow.

Current map experiment: keep one fixed island boundary and scatter spaced random seeds inside it. Give each seed a deterministic individual growth speed, expand competing fronts into free land, and stop at collisions. Do not relax seeds toward equal-size regions. Preserve shared curves, connected regions, inside-cell labels and flat 2D styling.

No decorative offshore rocks, dots or white blobs. Province adjacency must match the actual shared-border graph generated with the map; do not retain an invisible square grid beneath an organic tessellation.

At match start, show the seed-growth formation inside the ocean frame. Keep it skippable, honor reduced motion, and keep presentation independent of the authoritative match state. Preserve private-hand handoff after the introduction.

Position province icons/counts using a separate interior display anchor with clearance from all borders, not the original growth seed. Prefer the broad interior pocket near the province centroid; leave breathing room around the full icon/count group. Growth dots and gameplay display anchors serve different purposes.

Approved default border style: both inland province borders and the coastline use #333333, width 0.9 SVG units, full opacity, and linked settings. Reset must restore these values.

Expose live local border appearance controls via the Borders button inside the frame. Allow inland/coastline colors and widths to be linked or edited separately, with presets and reset. Remember appearance locally; do not send visual preferences as gameplay commands or spend actions.

The textured ocean must fill the entire game frame as one continuous background layer. Keep the island SVG transparent; never confine waves/gradient to its fitted rectangular viewBox or leave flat-color bands around it.

Ocean styling uses bathymetric contour bands expanded from the actual coastline: light turquoise near shore, progressively darker offshore. Align them with the island across viewport changes, cover the full frame, and keep them beneath all land, feedback and controls. Avoid unrelated wave textures or rectangular seams.

Expose live local Ocean appearance controls for shallow/deep colors and darkening speed (higher values reach deep water closer to shore), with reset and local persistence. Keep controls inside the frame and separate from gameplay commands.

Approved ocean defaults: shallow #3DCAEC, deep #3CA8EC, darkening speed/falloff 0.65×. Reset ocean defaults must restore this palette and rate.

Ocean contours are optional and OFF by default. Render a solid #3DCAEC ocean without generating contour paths when disabled. The Ocean panel toggle remembers the local preference; reset turns contours off. Preserve the contour palette/rate for optional use.

Current cards supersede Claim/Army: the configurable 59-card default deck and building/siege rules are documented in README.md and game.js. Keep monument cards physically on the board while built, never in the recycle pile. Show active + blocked counts, a minimal building symbol, and prosperity count. Siege responses are explicit host-validated decisions; honor private local handoff and never gate them on animation or a timer. No majority victory: win immediately with 3 monuments or annihilation. Round-limit scoring remains unspecified.

Gameplay tunables are defined by RULE_FIELDS in game.js. Host/local controls, validation, rule text, card descriptions and feedback must all read the authoritative match config. Attack defaults to 20 copies.

Approved card icon system: Reinforcements category blue/helmet, Buildings green/hammer, Attack red/sword. Large icons: helmet (reinforcement and double), castle (barracks), monolith (monument), sword (attack), broken helmet (sabotage), damaged castle (demolish), castle with chain (siege), castle with flag (capture), broken chain (break siege). Values appear next to the central icon only for reinforcement cards (+value or ×2). Never put a numeric modifier on buildings. Shared face layout/icons live in card-icons.js and card-faces.css; editable standalone SVGs live in icons/cards/.

Icon art direction follows the supplied medieval silhouette reference: fuller rounded shapes, soft tower caps/bases, decorative plinths, minimal readable cutouts. Preserve category colors and flat monochrome vector rendering. The Move Troops helmet/arrow artwork exists as a preview; adding it to the deck still requires gameplay implementation.

Approved implemented face finish: centered title, original rounded corner category badge, diamond divider, large medieval icon, borderless bold dark description, separate bold warm-brown requirement line, and subtle category-tinted layered waves at the bottom. Keep waves below copy and numeric badges off buildings. Card copy uses the authoritative match config.

Card hover/focus uses a clearly visible gold outline without lifting an unselected card. Selected cards lift 28px with a stronger gold outline, including a static lift when reduced motion is enabled.

Province troop/building/siege symbols reuse cardIcon artwork: helmet, castle, monolith and siege. Preserve light map-symbol color and team-colored cutouts; do not restore sprite/emoji substitutes for these markers.

Optional passive troop growth: growthTroops (default 0), growthMode (0 owner turn starts, 1 every N completed rounds), growthEveryRounds (default 2). Turn mode includes the opener. Round mode grows both owners once when the next round begins after N completed rounds. Never grow neutral land; add active troops without touching blocked counts, and stack with barracks.
