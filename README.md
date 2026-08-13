# Al Mannai Gym — Website

Static site, no build step and no backend. Live at **https://almannaigym.com**.

> This file is excluded from the deploy by `.vercelignore` — it is internal.
> Keep it that way; it was publicly downloadable once.

## Deploying

```bash
npx vercel deploy --prod --yes
```

Deploys from the **local folder**, not from git, so commit after deploying or
the repo drifts behind the live site. Project is `amg25/amg-website`, linked in
`.vercel`.

⚠ Every deploy mints a new `amg-website-<hash>-amg25.vercel.app` URL, and old
ones keep serving old builds forever. **Share `almannaigym.com`**, never a
per-deployment URL. Also note `amg-website.vercel.app` (no `-amg25`) belongs to
a stranger.

## ▶ Cache versioning — read this before editing CSS or JS

Both assets are versioned in every page's markup:

```html
<link rel="stylesheet" href="css/site.css?v=20260816">
<script src="js/site.js?v=20260816"></script>
```

**Bump both dates on every CSS or JS change**, across all 18 pages:

```bash
sed -i 's/site\.css?v=[0-9]*/site.css?v=YYYYMMDD/; s/site\.js?v=[0-9]*/site.js?v=YYYYMMDD/' *.html
```

Skip it and returning visitors keep the old file — a fix will look like it
never deployed. The CSS went unversioned for a while and did exactly that.

## Pages

18 files: nine in English, nine Arabic twins.

| English | Arabic | Page |
|---|---|---|
| `index.html` | `index-ar.html` | Home |
| `memberships.html` | `memberships-ar.html` | Memberships & prices |
| `offers.html` | `offers-ar.html` | Offers + full terms — **the flyer QR target** |
| `facilities.html` | `facilities-ar.html` | Facilities |
| `corporate.html` | `corporate-ar.html` | Corporate & groups |
| `about.html` | `about-ar.html` | About |
| `contact.html` | `contact-ar.html` | Contact & map |
| `trial.html` | `trial-ar.html` | Free trial booking |
| `join.html` | `join-ar.html` | Reserve a plan — reads `?plan=1m\|3m\|6m\|1y\|easy\|plat\|grp` |

Shared: `css/site.css`, `js/site.js`, `assets/`.

## Routing (`vercel.json`)

- `cleanUrls` — `/offers` works without `.html`. **Required**: the printed QR
  has no extension.
- `www` → apex, 308, path and query preserved. Needs **two** rules — Vercel's
  `/:path*` does not match the bare `/`.
- `/offers` → `/offers-ar` (**307**) when `Accept-Language` starts with `ar`,
  skipped when a `lang` query is present.

### ⚠ Never rename or delete `/offers`

The printed flyer encodes `https://almannaigym.com/offers` in the QR *and* as
visible text, and the flyer's build script no longer exists. If the site is
restructured, leave a redirect at that path or every printed flyer 404s.

## Arabic

The Arabic copy is the **client's own deck**
(`صياغة-الموقع-العربي-نادي-المناعي.docx`), not a translation written here. If
Arabic text needs changing, change it to match that deck or get a new one.

House rules from the deck, enforced site-wide:

- «بتوقيت البحرين», never «بتوقيت سند»
- «رسوم تسجيل», not «رسوم اشتراك»
- «منطقة الكارديو» / «جناح الاستشفاء» used consistently
- **Google** and **Instagram** in Latin script
- Google review quotes stay in their original English
- **no diacritics** in Arabic text

### RTL implementation

`site.css` has a `[dir="rtl"]` layer. Two things that will bite:

- **Letter-spacing must be 0** in Arabic — tracking pulls the joined script
  apart. Every tracked class is reset there.
- **`.ltr-num`** keeps phone numbers and prices in LTR order. It sets
  `direction:ltr`, but as a flex item it is blockified to full width and the
  text then hugs the **left** edge — so it also sets `text-align:right`.
  Any new LTR run inside an RTL column needs this class.

`site.js` is language-aware via `<html lang>`: Arabic plan names, notes, hour
slider copy, per-day-price strings and WhatsApp messages.

## How forms work

No backend. "Reserve this plan", "Request my session" and "Send enquiry"
compose a pre-filled WhatsApp message to reception (+973 3333 5681) and open it
in the visitor's own WhatsApp — in Arabic on the `-ar` pages.

**Nothing on this site collects payment.** Members reserve online and pay at
reception.

▶ When the merchant account is live, build a real payment step on `join`.
**Do not re-add disabled card fields as a placeholder** — a disabled checkout
reads to a member as a broken one, which is why they were removed.

## Trainer supervision hours

The gym is open 24h. Trainers cover published windows — Sun–Thu 6–11 & 16–23,
Fri 7–11 & 16–22, Sat 8–12 & 16–23 — held in `SUPERVISION` in `site.js`, which
computes the "trainer on the floor" chip from the Bahrain weekday.

⚠ **Currently gated to Arabic only.** English still claims trainers around the
clock (4 Aug 2026 ruling) while its own facilities page shows split shifts.
Awaiting the client's ruling; when it lands, drop the `!AR ||` guard and fix
the English prose so both languages agree.

## Local preview

```bash
python -m http.server 8123 --directory "D:\Al Manai Gym\website"
```

Then http://localhost:8123 — and hard-refresh, or the versioned assets will be
served from cache while you work.

## Content that must not drift

Prices appear on **four** pages (memberships and offers, × two languages). A
rate change means editing all four. Current rate card: 38.5 / 99 / 154 / 220 /
Easy Pay 4×66 (264) / Platinum 330 / Group 176 each — renewal prices 77 / 132 /
192.5.

The Google rating block says 4.8 · 16 reviews · August 2026 on `index`,
`index-ar`, `about` and `about-ar`. Volatile — refresh it periodically.
