# Skyline Sprint - Final Game Project

A side-scrolling game built with p5.js as a final course submission.

## Features implemented

### Base game requirements
- Player movement and jump interaction
- Canyon interaction with plummeting/fall state
- Collectable (coin-orb) interaction with scoring
- Scrollable world with world-position tracking
- Lives and score counters
- Win state (flagpole reached)
- Game over state (lives depleted)

### Extensions
- Sounds: procedural jump, collect, hit, and win effects using `p5.sound`
- Platforms: implemented using a factory function pattern
- Enemies: implemented using a constructor function with patrol AI and collision
- Double jump: press `Space` again in mid-air to clear wider gaps

## Controls
- Move: `A` / `D` or arrow keys
- Jump / Double Jump / Start / Restart: `Space`

## Run
Open `index.html` in a browser with internet access (CDN scripts for `p5.js` and `p5.sound`).
Link to site https://dambai212.github.io/p5-platform-game/

## Submission note
A draft commentary is included in `commentary.md` and can be exported to PDF for the second upload area.
