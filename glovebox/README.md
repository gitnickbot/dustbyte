# Glovebox

A small web app for keeping the repair history of a few vehicles: what was fixed, who did it, what it cost, where the parts came from, which warranties are still good, and a photo of every receipt.

Live at https://gitnickbot.github.io/dustbyte/glovebox/ (once this folder is on `main`).

## What it does

- **Garage**: each vehicle with its odometer, what's being worked on right now, and the last service.
- **Log work**: repair, maintenance, part bought, inspection. Status can be Done, In progress or Waiting on parts.
- **Receipts**: take a photo or pick one; it's saved with the record (private storage, full size).
- **Warranties**: length presets (90 days to lifetime) and/or a mileage limit. Anything ending within 60 days, or within 1,000 miles, is flagged.
- **Reminders**: "next oil change by a date or odometer reading", marked done when the next one is logged.
- **Shops**: every shop and parts store, with what they did and what was spent.
- **Search** across everything, and **Copy** a vehicle's history as text for a mechanic or buyer.
- Installable: on a phone, open the page and use the browser's "Add to Home Screen".

## Accounts

There is no public sign-up. Create each person's login in Supabase:

1. Supabase dashboard → the **groundbreaking** project → **Authentication** → **Users** → **Add user** → **Create new user**.
2. Enter their email and a starting password, tick **Auto Confirm User**, and create.
3. Send them the link and the password. They can change it under **Change password** at the bottom of the Garage screen.

Each person only ever sees their own vehicles, records and photos (row-level security on every table and on the photo bucket).

Note: groundbreaking's sign-up trigger gives every new login a game profile named "Digger". It's harmless; the Glovebox user just never plays.

## How it's built

Static files, no build step: `index.html`, `style.css`, `app.js`, `vehicles-data.js`, `config.js`, and a pinned copy of supabase-js in `vendor/`.

Data lives in the **groundbreaking** Supabase project, kept apart from the game by name:

- `glovebox_vehicles`, `glovebox_records`: one row per vehicle/record, the details in a `data` JSON column, owned by `user_id`.
- `glovebox-receipts` storage bucket (private): photos at `<user id>/<photo id>.jpg`, shown through short-lived signed links.

SQL is in `supabase/`: `schema.sql` (tables, policies, bucket), then `02-members-only.sql` (keeps the game's anonymous sessions out of Glovebox).

`config.js` holds the project URL and publishable key. Both are meant to be public; the access rules above protect the data.

## Credits

Year, make and model lists: [US Car Models Data](https://github.com/abhionlyone/us-car-models-data) (1992–2026), CC BY 4.0. The free dataset stopped updating after 2024, so 2025–2027 lists carry recent models forward, and every list has "Other" to type one in.
