# Dead Moon Syndicate

A browser-based pixel-art run-and-gun. Play at https://gitnickbot.github.io/dustbyte/

Press Start, select a route, then Confirm. Both routes are available immediately:
- Glass Dunes: Nomad, three connected stages. Stage 1 retains the wreck field and extraction walker. Defeating it opens Fangridge Ascent: an angled dune climb with nine jagged rock ledges, layered parallax formations and the Sandhollow cave full of crawling sand bugs. Exit into the panoramic Sunsea Overlook, jump warned flying beetles, and fight the giant Dune Sovereign.
- Zenith Prime: Street Rogue, three connected stages. Stage 1 keeps the dense service streets, maintenance works and skybridge. Defeating the Warden sends it crashing through the sealed wall. Stage 2 climbs fourteen staggered platforms through a guarded tower, with an armor relay and a destructible security gate. Stage 3 opens onto a panoramic rooftop: jump over warned flying traffic, then fight the Orb Sentinel's rotating three-arm spirals and three timed radial bursts.

Each new Zenith Prime stage starts a checkpoint. Death retries that stage with full armor; a long fall during the ascent returns you to your highest landed platform and costs one hit. Only defeating the final rooftop boss marks the city cleared. Glass Dunes also checkpoints at the ascent, inside the cave (with an armor refill), and at the overlook. Its giant beetle boss cycles through burrowing, a 1.5-second fixed sand-plume warning, eruption, repeated flight passes with an opening shell, and diving underground again. The closed shell blocks all damage; aim for the glowing exposed body during open-shell flight. Duck to shoot low crawling sand bugs.

The four locked destinations are future content, not playable levels. Cleared routes are remembered locally in the browser. No account required.

WASD or arrow keys: move and aim in eight directions. Down: duck. Down + sideways: crawl and shoot forward. Aim downward while airborne. Up no longer jumps. Space: double jump. J: fire. K: grenade. Shift: dash. Esc: pause. M: sound. Touch controls: drag the eight-way circular stick with your left thumb, hold Fire with your right. A center dead zone stops movement; leaving the circle keeps the selected direction until release. Jump, Grenade and Dash have separate buttons. Ducking/crawling reduce the hitbox, and low ceilings prevent standing up. Return to the sector map from the pause or victory screen.

Run with any static HTTP server. No build step or external dependencies. Assets load from assets/.

Armor health (both characters): start at Armor04 with 3 hits in that tier, then Armor03 with 2, Armor02 with 1, and Armor01 with 1 final hit before death. Seven hits total. Full plating → damaged hooded armor → hooded undersuit → exposed head / undersuit. The outfit and HUD portrait change together, including running, aiming, ducking and crawling. Armor breaks scatter plate fragments. Repair pickups restore up to 2 hits and rebuild the appropriate tier; the relay and retry restore all 7. Existing brief invulnerability after a hit and dash protection still apply.
