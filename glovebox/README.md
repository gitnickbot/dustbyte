# Glovebox

A small web app for keeping the repair history of a few vehicles: what was fixed, who did it, what it cost, where the parts came from, which warranties are still good, and a photo of every receipt.

Live at https://gitnickbot.github.io/dustbyte/glovebox/ (once this folder is on `main`).

## What it does

- **Garage**: each vehicle with its odometer, what's being worked on right now, and the last service.
- **Log work**: repair, maintenance, part bought, inspection. Status can be Done, In progress or Waiting on parts.
- **Receipts**: take a photo or pick one; it's saved with the record.
- **Warranties**: length presets (90 days to lifetime) and/or a mileage limit. Anything ending within 60 days, or within 1,000 miles, is flagged.
- **Reminders**: "next oil change by a date or odometer reading", marked done when the next one is logged.
- **Shops**: every shop and parts store, with what they did and what was spent.
- **Search** across everything, and **Copy** a vehicle's history as text for a mechanic or buyer.
- Syncs live between phone and computer. On a phone, use the browser's "Add to Home Screen".

## One-time Firebase setup

Done for project `glovebox-d28c7` (steps kept here for reference or a rebuild). Everything stays on Firebase's free Spark plan (Authentication + Firestore; no Cloud Storage, so no card needed).

1. **Create the project**: https://console.firebase.google.com → Create a project → name it `glovebox` (Google Analytics can stay off).
2. **Sign-in methods**: Build → Authentication → Get started → Sign-in method:
   - enable **Google** (pick a support email);
   - enable **Email/Password** and turn on **Email link (passwordless sign-in)** inside it.
3. **Authorized domain**: Authentication → Settings → Authorized domains → Add domain → `gitnickbot.github.io`.
4. **Database**: Build → Firestore Database → Create database → production mode, a US location.
5. **Rules**: Firestore Database → Rules → replace everything with the contents of [`firebase/firestore.rules`](firebase/firestore.rules) → Publish.
6. **Who can use it**: Firestore Database → Data → Start collection → Collection ID `allowed` → Document ID = the person's email address in lowercase (for example `name@gmail.com`) → add any field (say `name` = their name) → Save. Add one document per person, including yourself if you want to try it.
7. **Web app settings**: Project settings (gear icon) → General → Your apps → Web (`</>`) → nickname `Glovebox` (no Hosting) → Register. Copy the `apiKey`, `authDomain`, `projectId` and `appId` values into [`config.js`](config.js).

Those config values are meant to be public. The rules are what keep data private: only signed-in people on the `allowed` list get in, and each person only ever reads and writes their own `users/<their id>/…` documents.

## Signing in

- **Continue with Google**: one tap for anyone with a Google account.
- **Email me a sign-in link**: for anyone else. The link comes from Firebase's no-reply address (check spam) and should be opened on the same device.

If someone signs in with an email that isn't on the `allowed` list, the app tells them to ask you to add it.

## How it's built

Static files, no build step: `index.html`, `style.css`, `app.js`, `vehicles-data.js`, `config.js`, and pinned copies of the Firebase JS SDK 12.19.0 (compat builds) in `vendor/`.

Firestore layout, per person:

- `users/<uid>/vehicles/<id>`: one document per vehicle.
- `users/<uid>/records/<id>`: one document per repair/service/part, with small thumbnails of its photos.
- `users/<uid>/photos/<id>`: one full receipt photo per document, compressed JPEG (kept under Firestore's 1 MB document limit).

## Credits

Year, make and model lists: [US Car Models Data](https://github.com/abhionlyone/us-car-models-data) (1992–2026), CC BY 4.0. The free dataset stopped updating after 2024, so 2025–2027 lists carry recent models forward, and every list has "Other" to type one in.
