# Nomad Edition art direction

The user supplied three visual references: an orange alien desert with a crashed starship, a practical weapon-and-gear sheet, and a hooded desert Nomad. The updated game keeps detailed 16-bit pixel rendering and follows that palette and character design.

Generation mode: **builtin ImageGen**, with the supplied images as references. Original generated PNGs are bundled directly; sprite extraction, scaling, palette overlays, and terrain tiling happen in the game's canvas renderer.

| Asset | Dimensions | Purpose |
| --- | --- | --- |
| `assets/nomad-wastes.png` | 2172 × 724 | Planet, dunes, rock spires, and buried starship panorama |
| `assets/nomad-hero.png` | 1774 × 887 | Eight transparent Nomad movement/combat frames |
| `assets/nomad-terrain.png` | 2172 × 724 | Sand and stratified sandstone ground strip |

The enemy and extraction-mech artwork from the previous edition remains in use. Platforms, foreground debris, dust, HUD, and page colors were adjusted to complement the new environment. Each player frame has its own rifle muzzle position; supply crates remain targetable from the taller firing stance.

## Background prompt

Use case: style-transfer. Asset type: production background panorama for a detailed 16-bit side-scrolling arcade game. Expand and re-render the attached desert reference as one beautiful 3:1 ultrawide landscape, 3072x1024 if possible. Keep its distinctive burnt-orange alien desert, enormous partially cropped planet in the upper-left sky, layered distant needle-like rock citadels, rolling copper dunes, glowing ochre clouds, and the dark broken hull of a huge crashed starship half buried in the midground. The wreck is the focal point near the middle, sloping upward to the left, its ribs and plates weathered and sandblasted. Maintain open sandy valleys and layered atmospheric depth, with a lower horizon so the ominous sky reads. Rich hand-painted PIXEL ART in the detailed 16-bit arcade tradition: crisp stepped edges, controlled small pixel clusters, dithered gradients, many warm amber/rust/sand shades, rich maroon-brown shadows. The whole image is the distant scenery only, extending all the way to the bottom in sand, with NO side-view platform floor or ground cutaway. No people, no game HUD, no text, no borders, no blue or teal sky, no green vegetation, no modern city. Keep the reference's warm palette and striking composition while adding production-quality detail.

## Nomad prompt

Use case: identity-preserve. Asset type: transparent production character animation sprite atlas for a detailed 16-bit side-scrolling run-and-gun game. Replace the reference character sheet with EXACTLY EIGHT full-body game sprites of this SAME NOMAD, laid out in a strict 4 columns by 2 rows grid on a transparent canvas, 2048x1024 wide. Each 512-square cell contains ONE sprite, isolated, ample 32px padding, no overlap. All eight sprites face RIGHT in the same mostly side-on three-quarter arcade view, same proportions, same size, same overhead warm lighting. Preserve his recognisable tan hood, deep black face wrap, small dark goggles with tiny amber lenses, voluminous sand scarf, charcoal fitted torso armor, distressed tan trousers, worn brown leather straps, dark gloves, knee plates, heavy brown boots, and torn scarf tails trailing to the LEFT. Give him the exact style of black compact assault rifle from image 2, small worn tan/black radio backpack and belt utility pouch. The dark rifle is held in BOTH hands, barrel to the right, at chest height, clearly separated from torso. Detailed shaded PIXEL ART with crisp outlines, rich 16-bit pixel clusters and intricate cloth folds; not vector, not a 3D render, not chibi. Grid order left-to-right: TOP row = idle aiming, running left foot forward, running feet passing, running right foot forward. BOTTOM row = running second passing phase, standing firing/recoil (NO muzzle flame baked in), airborne jump with knees bent and rifle aiming, low forward dash with scarf streaming left. Keep torso pivot and head consistent across the run frames and soles on same baseline. Natural adult proportions as reference. Entire transparent background including between sprites. No captions, no labels, no portrait panels, no palette, no floor, no cast shadows.

## Terrain prompt

Use case: stylized-concept. Asset type: seamless horizontally repeating ground tile for a rich 16-bit side-scrolling desert arcade game. Draw ONE opaque rectangular 3:1 wide strip, 1536x512 or larger. This image is ONLY a SIDE-VIEW cutaway of the ground; no sky or horizon. The very top edge is a perfectly flat horizontal walkable surface of bright ochre windblown sand with tiny scattered pebbles, low ripples and rusty shrapnel embedded flush with the sand. The top 12 percent is loose golden sand, and below that is dense stratified red sandstone, dark umber fissures, embedded black shale, compact granular earth, tiny fossil-like gravel, occasional fragments of dark brown weathered starship metal buried in rock. The bottom darkens to deep warm brown. Match the attached orange alien desert reference. Detailed hand-drawn 16-bit PIXEL ART with sharp dithered texture, many warm shades, dense dimensional rock detail and worn metal scratches. Make left and right edges tile seamlessly with identical surface level and matching strata. Orthographic side view, not perspective; no big objects protruding from the top; no transparent areas; no characters; no platforms; no text; no frames. Fill every pixel with the tile.

## Armor progression — October 2026

Gameplay numbering descends from Armor04 (full plating, three hits), Armor03 (damaged hooded armor, two hits), Armor02 (hooded undersuit, one hit), Armor01 (exposed hair, mask, undersuit, final hit). This reverses the left-to-right numbering on the approved concept boards. Both characters use seven total durability points; hit thresholds and appearance come from one shared `DeadMoonArmor.status` mapping in `armor.js`.

New built-in ImageGen assets are `assets/nomad-armor-run.png`, `assets/nomad-armor-actions.png`, `assets/rogue-armor-run.png`, and `assets/rogue-armor-actions.png`. Each contains four rows of eight poses. Atlas extraction follows actual alpha-connected silhouettes, because generated spacing is not a uniform grid. Portraits and projectile origins derive from the same current-tier sprite frames.

Generation prompt set (built-in image tool, transparent background):
- Run atlases: use the approved armor breakdown as costume reference, and the approved eight-pose run study as pose reference. Four rows, one for each costume from full heavy helmet armor through hooded damaged armor, hooded fitted undersuit without knee plates, and exposed hair with no backpack. Eight alternating contact/compress/push/flight poses per row, rifle aimed right, consistent scale. Nomad uses sand/taupe/bronze; Rogue uses black/gunmetal/crimson. Preserve the corrected near/far leg layering, especially flight frame04 and opposite compression frame06. No labels, grid, shadows or background.
- Action atlases: same four costume rows; columns idle horizontal aim, diagonal up, vertical up, airborne diagonal down, airborne vertical down, crouch, crawl A, crawl B. Same 16-bit shaded pixel style, fitted undersuits, masks, weapon identity and damage-state equipment. Fully armored poses keep the enclosed helmet even while crouching or crawling.
- Targeted corrections: replace only incorrect top-row hoods with the matching sealed helmet; preserve other equipment and poses. Final background extraction requests fully transparent empty regions and holes between limbs without changing artwork.

Validation: all 128 frames extracted; visual review of both heroes' idle, aiming and crawl states. Seven-hit damage sequence, plate fragments, repair boundaries, full-repair cap, checkpoint/retry restoration, dash and hit invulnerability are covered by the armor QA script. Existing eight-way shot angles, movement, crouch/crawl collisions, city traversal and flying-boss hits also pass.


## Zenith Prime expansion

The city retains its established stage-one environment and Street Rogue armor sprites. The tower ascent adds close facade walls, lit platform edges, numbered ledges, structural braces and a full-height security shutter. The rooftop removes near-building occluders and most rain to reveal a broad skyline.

New assets generated with builtin ImageGen:
- `zenith-skyline.png`: ultrawide detailed 16-bit pixel city panorama seen from high rooftops; blue and violet night sky, atmospheric towers, luminous cyan/magenta windows, distant cracked moon; open sky, no foreground buildings or floor, no UI or text.
- `zenith-car.png`: isolated side-profile antigravity sports car facing left; teal/gunmetal body, violet cockpit, cyan thrusters; detailed pixel clusters, transparent background, no cast shadow or labels.
- `zenith-orb.png`: isolated spherical police drone in side-on arcade view, ivory and gunmetal shell, red central lens, six radial gun ports, blue/red patrol lights; detailed 16-bit pixel art, transparent background, no text or effects baked into the attacks.

The orb's charge rings, spiraling cyan projectiles and timed pink radial volleys are rendered separately. The car sprite is mirrored to match traffic direction. Tower and rooftop gameplay geometry lives in `zenith.js`; no debug stage selectors ship in the game.
