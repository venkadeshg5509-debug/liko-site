# LIKO Construction & Interiors — Static Website

Lightweight, mobile-first, SEO-friendly site built with HTML5, CSS3, Bootstrap 5 and vanilla JavaScript. No build step required.

## 🚀 Quick Start

Just open `index.html` in a browser, or upload the entire folder to any static host (Netlify, Vercel, GitHub Pages, cPanel, etc).

For local dev with live reload:
```bash
npx serve .
```

## 📁 Folder Structure

```
liko-construction/
├── index.html          # Home (hero + estimate + packages + services)
├── about.html
├── services.html
├── packages.html       # Full package comparison
├── projects.html       # House plans / elevations / completed
├── gallery.html        # Exterior / interior / ongoing
├── contact.html        # Form + Google Maps embed
├── admin.html          # Login + manage rates/requests/projects/gallery
├── sitemap.xml
├── robots.txt
├── css/
│   └── styles.css      # Brand design system (navy + gold)
├── js/
│   └── app.js          # Header/footer, estimator, admin logic
├── data/
│   └── site.json       # 🔧 Edit all content here
└── images/             # Logo, favicon, elevation, plans, interiors
```

## ⚙️ Editing Content

All text, prices, phone, social links, services, projects, and gallery items live in **`data/site.json`**. Edit the file → refresh → see changes.

If you've used the admin panel, browser-stored data takes precedence. Click **"Reset to JSON"** in the admin panel to reload from the file.

## 🔐 Admin Panel

URL: `/admin.html` (also linked at the bottom of the footer)

Default credentials (change them in `data/site.json` under `"admin"`):
```
username: admin
password: liko@123
```

Admin can:
- Update package rates (Prime / Essential / Signature / Elite)
- View & clear estimate requests
- Edit projects JSON
- Edit gallery JSON

> ℹ️ This is a **static site**, so admin changes are stored in the browser's `localStorage`. Estimate requests are saved per-device. For multi-device sync (real database, auth, email notifications), upgrade to a backend (Lovable Cloud / Supabase / Firebase).

## 💰 Estimate Calculator

Two modes, instant client-side calculation:
1. **By Budget** — Enter ₹ amount → see possible sq.ft per package.
2. **By Sq.Ft** — Enter area → see total cost per package.

Formula: `sqft = budget / rate` or `cost = sqft × rate`.

## 📞 Contact Info (extracted from price list PDF)

- **Company:** LIKO Construction and Interiors
- **Address:** No.888, DTK Nagar, Keerapalayam, Cuddalore, Tamilnadu - 607302
- **Phone / WhatsApp:** +91 94888 88264

## 💾 "Database" Structure

This site is JSON-only. The schemas that the JS reads/writes:

**localStorage `liko_estimates_v1`** (array of estimate requests):
```json
[{ "at":"ISO date", "name":"...", "phone":"...", "email":"...", "mode":"budget|sqft|contact", "value":"...", "message":"..." }]
```

**localStorage `liko_site_data_v1`** — full copy of `data/site.json` after any admin edit.

## 🗺️ Sitemap

See `sitemap.xml` — covers all 7 public pages.

## 🎨 Design

- **Brand colors:** Navy `#0b2545` + Gold `#c9a227`
- **Fonts:** Poppins (headings) + Inter (body)
- **Icons:** Bootstrap Icons CDN
- **No build, no bundler, no framework.** Pure HTML/CSS/JS.

## 📋 To Customize Further

1. Replace `images/logo.png` with your final logo (any PNG/SVG).
2. Update `data/site.json` → social URLs, email, Google Maps embed.
3. Add more images to `images/` and reference them in `site.json`.
4. Connect a real backend (replace `saveEstimateRequest` in `js/app.js`) when ready.
