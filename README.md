# Al Mannai Gym — Website

Static implementation of `Website Design/Al Mannai Gym Website.dc.html`,
plus an interactive layer. No build step, no backend — host the folder
anywhere (any static host or web server), or open `index.html` directly.

## Interactive layer

- **Live "Open now" chip** (home hero + contact) — real Bahrain clock, pulsing dot
- **"Pick an hour" slider** (home) — drag through 24 hours to see what the gym
  is like at that time; opens at the visitor's current hour in Bahrain
- **Count-up stats** (home) — 24/7, 3 floors, 50 kg, 4.8★ animate into view
- **Per-day price widget** (memberships) — plan + standard/loyalty toggles,
  animated BHD/day figure
- **FAQ accordion** (memberships) — six questions answered from the brand facts
- **Micro-interactions** — cursor-following red glare on cards, button sheen
  sweep, ticker pauses on hover, staggered hero entrance, faint engineering
  grid over the hero, scroll progress bar, page crossfades (View Transitions
  in Chrome/Edge), floating WhatsApp button on every page
- All motion respects `prefers-reduced-motion`.

## Pages

| File | Page |
|---|---|
| `index.html` | Home |
| `memberships.html` | Memberships & prices |
| `join.html` | Join / reserve a plan — reads `?plan=1m\|3m\|6m\|1y\|plat` (defaults to `1y`) |
| `facilities.html` | Facilities |
| `trial.html` | Free trial booking |
| `corporate.html` | Corporate & groups |
| `about.html` | About |
| `contact.html` | Contact & map |

Shared: `css/site.css`, `js/site.js`, `assets/`.

## How forms work

There is no backend. "Request my session", "Send enquiry" and "Reserve this
plan" compose a pre-filled WhatsApp message to reception (+973 3333 5681) and
open it in the visitor's own WhatsApp. Card fields on the join page are
**disabled** until a payment provider / merchant account exists (the design
flags this too).

## Before launch — outstanding placeholders

- **Trainer hours** on `facilities.html` are marked "Placeholder — confirm real hours".
- **Payment** on `join.html` needs a real payment provider; until then members pay at reception.
- Review count / rating ("4.8 · 15 reviews · July 2026") — update as reviews grow.

## Local preview

```bash
python -m http.server 8123 --directory "D:\Al Manai Gym\website"
```

Then open http://localhost:8123

## Showing the client (no hosting yet)

1. **Zip → open directly.** Send `Al-Mannai-Gym_Website_Preview.zip`; the
   client extracts it and double-clicks `index.html`. Everything works from
   disk (fonts and the map need internet).
2. **Free temporary hosting (recommended for a real link).** Drag the
   `website` folder onto https://app.netlify.com/drop — you get a live URL
   in ~30 seconds, free, no code. Cloudflare Pages / Vercel / GitHub Pages
   work too. Delete or replace it whenever.
3. **In person.** Run the local preview command above and walk through it
   on your laptop — the slider, calculator and WhatsApp flow demo best live.
