# DUSTBYTE — Run the Wastes

A small desert-punk run-and-gun game with detailed 16-bit-style sprites, neon machinery, double jumps, grenades, and an extraction-mech boss.

The game runs entirely in the browser. All graphics ship with the game; no account, API key, backend, or build step is required.

## Play

**[Play DUSTBYTE in your browser](https://gitnickbot.github.io/dustbyte/)**

Select **Enter the Wastes** to start. Sound is optional and can be enabled with the sound button or **M**.

| Action | Keyboard |
| --- | --- |
| Move | A / D or left / right arrows |
| Jump / double jump | Space, W, or up arrow |
| Fire | J or Z |
| Grenade | K or X |
| Dash | Shift |
| Pause | Escape |
| Toggle sound | M |

On a phone, use the on-screen controls. Double-tap a movement arrow to dash. Landscape orientation gives a wider view.

## Run locally

Serve this directory with any static web server. For example, with Python installed:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000` in your browser.

## GitHub Pages

In the repository's **Settings → Pages**, choose **Deploy from a branch**, then **main** and **/ (root)**. Save and wait for the deployment to finish. GitHub will show the public play URL there.

The `.nojekyll` file enables plain static hosting. All game assets use relative paths, so the game also works under a project subdirectory.

## Files

- `index.html` — game page and controls
- `style.css` — layout and presentation
- `game.js` — gameplay, rendering, input, and audio
- `art.js` — sprite loading and frame definitions
- `assets/` — bundled environment and sprite artwork

High scores are stored only in the player's browser.
