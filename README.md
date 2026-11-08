# London Short-Lease Auction Map

London auction lots under £300,000 with 2+ bedrooms and leases under 130 years,
mapped and ranked by lease-extension economics.

**Live site:** https://tuobrien.github.io/auction-map/

Install on iPhone: open the link in Safari, then Share → Add to Home Screen.
It installs as "Auction Map" and runs full screen, offline, with its own icon.

## What's here

| File | |
|---|---|
| `index.html` | the whole app — data, map geometry, ranking model, no build step |
| `manifest.webmanifest` | app name, icons, standalone display |
| `sw.js` | offline cache |
| `icon-*.png` | home screen and splash icons |

## The ranking model

Prices the statutory lease extension (Leasehold Reform, Housing and Urban
Development Act 1993, s.42) and sets it against what the flat is worth once
held: capitalised ground rent, plus loss of reversion deferred at the Cadogan v
Sportelli rate for flats, plus the freeholder's half of marriage value below 80
years. Freehold values start from HM Land Registry UK House Price Index borough
flat averages, adjusted by postcode district.

It is a screening model, not a valuation. Every assumption is adjustable in the
interface, and each lot shows its full workings.

## Updating

`index.html` is refreshed weekly from the live auction catalogues. After any
change to it, bump `CACHE` at the top of `sw.js` (`auction-map-v1` → `v2`) or
browsers will keep serving the cached copy.
