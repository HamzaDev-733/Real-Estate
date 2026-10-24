# Aurelia Estates — Real Estate Website

React + Tailwind CSS + Framer Motion. Koi backend nahi chahiye; admin panel poora kaam karta hai (data browser mein save hota hai) aur baad mein REST backend se jud sakta hai.

## Chalane ka tareeqa

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build -> dist/
npm run preview    # build ko local test karne ke liye
```

Node 18+ chahiye. `dist/` ko `file://` se na kholein (browser module scripts block karta hai); `npm run preview` ya kisi hosting (Netlify, Vercel, GitHub Pages) par chalayein. HashRouter use hua hai, is liye hosting par koi rewrite rule nahi chahiye.

## Pages

| Route | Kya hai |
| --- | --- |
| `#/` | Hero (building photo + glass navbar), search, featured listings, projects, testimonials |
| `#/about` | Company story, values, timeline, team |
| `#/projects` | Projects & deployment tracker (5 phases, progress ring) |
| `#/investment` | 3 plans, return projector chart, FAQ |
| `#/calculator` | Mortgage calculator + Rental ROI |
| `#/listings` | Filters, sort, saved properties, detail modal, inquiry form |
| `#/meeting` | 3-step meeting scheduler, ticket-style pass, .ics calendar download |
| `#/admin` | Admin panel |

## Admin panel

Login: `admin@aurelia.com` / `admin123` (Settings se badal sakte hain; live karne se pehle login screen ka demo-credentials box hata dein).

Manage: Listings, Projects (progress), Meetings, Inquiries, AI Chatbot Q&A (test box ke saath), Settings (logo upload, hero image, contact, currency, backup export/import, reset).

## AI chatbot

Hardcoded Q&A (`src/data/seed.js` → `faqs`, ya Admin → AI Chatbot). Har entry ke `keywords` se match hota hai; Roman-Urdu words bhi chalte hain (qeemat, kiraya, qist). Answers mein `{company} {phone} {email} {address} {hours} {listings} {projects}` placeholders use ho sakte hain.

## Backend se jodna

Sara data `src/services/api.js` se guzarta hai. `.env` mein `VITE_API_URL=https://api.yourdomain.com` daalein (dekhein `.env.example`); endpoints file ke top par likhe hain. UI mein koi change nahi chahiye.

## Note

Admin login abhi sirf demo hai (browser mein). Real backend ke saath server-side authentication lagana zaroori hai. Photos Unsplash URLs se aati hain (internet chahiye); koi photo na khule to fallback dikhta hai, aur Admin se apni photo upload ho sakti hai.
