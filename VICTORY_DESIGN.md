# SAW — victory design

## Agreed victory paths

1. **Complete annihilation:** eliminate the opponent completely. The exact elimination criterion (for example, owning no provinces) is still to be defined.
2. **Stats victory at the round limit:** when the maximum round is reached, compare the players' stats and award victory to the stronger result. The round limit, comparison method and tie handling are still to be defined.
3. **Prosperity victory:** reach a prosperity threshold, regardless of the current round. Prosperity may combine multiple stats. Its definition, threshold and evaluation timing will be defined later.

These three paths replace majority territory control as the intended victory design. Territory can contribute to stats or prosperity if later specified; simply owning nine provinces is no longer the agreed design.

## Pending implementation

The current prototype still uses its existing nine-province hold condition. No new victory behavior has been implemented yet. Define the outstanding rules before replacing the engine condition; do not invent a prosperity formula or threshold.

## Implemented card-deck revision

Prosperity is now the monuments themselves: control 3 built monuments to win immediately. Building each requires 5 active troops, not spent. Monument cards stay on the board and transfer with successful Capture. Ordinary Attack/Demolish cannot destroy them. Annihilation is also implemented; the old majority condition is removed. The maximum-round stat comparison still needs a definition and remains unimplemented.
