# Dead Moon Syndicate

A browser-based pixel-art run-and-gun. Play at https://gitnickbot.github.io/dustbyte/

Press Start, select a route, then Confirm. Both routes are available immediately:
- Glass Dunes: Nomad, desert wreck field, extraction mech.
- Black Rain Citadel: Street Rogue, dense multilevel city: service street, rooftops, lower maintenance works, skybridge and flying Warden gunship. Near buildings, parallax towers, foreground columns and overhangs give the route depth. Solid roofs block movement and bullets; double-jump up the ledges.

The four locked destinations are future content, not playable levels. Cleared routes are remembered locally in the browser. No account required.

WASD or arrow keys: move and aim in eight directions. Down: duck. Down + sideways: crawl and shoot forward. Aim downward while airborne. Up no longer jumps. Space: double jump. J: fire. K: grenade. Shift: dash. Esc: pause. M: sound. Touch controls: drag the eight-way circular stick with your left thumb, hold Fire with your right. A center dead zone stops movement; leaving the circle keeps the selected direction until release. Jump, Grenade and Dash have separate buttons. Ducking/crawling reduce the hitbox, and low ceilings prevent standing up. Return to the sector map from the pause or victory screen.

Run with any static HTTP server. No build step or external dependencies. Assets load from assets/.

Armor health (both characters): start at Armor04 with 3 hits in that tier, then Armor03 with 2, Armor02 with 1, and Armor01 with 1 final hit before death. Seven hits total. Full plating → damaged hooded armor → hooded undersuit → exposed head / undersuit. The outfit and HUD portrait change together, including running, aiming, ducking and crawling. Armor breaks scatter plate fragments. Repair pickups restore up to 2 hits and rebuild the appropriate tier; the relay and retry restore all 7. Existing brief invulnerability after a hit and dash protection still apply.
