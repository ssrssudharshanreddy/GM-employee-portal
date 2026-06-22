# GangaMaxx CRM — Employee Portal (Standalone)

A standalone React + Vite frontend for the GangaMaxx CRM Employee Portal.

## Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- A running GangaMaxx API backend

## Setup

```bash
# Install dependencies
npm install

# Copy env file and configure
cp .env.example .env
# Edit .env and set VITE_API_URL to your backend URL

# Start development server
npm run dev
```

Open http://localhost:5173 in your browser.

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `https://api.gangamaxx.com/api` |

## Build for Production

```bash
npm run build
# Output is in dist/ — deploy to Netlify, Vercel, Cloudflare Pages, etc.
```

## Deploy

### Netlify / Vercel
Set `VITE_API_URL` as an environment variable in your project settings, then push this folder as your repository root.

### GitHub Pages / Static hosts
Run `npm run build` and deploy the `dist/` folder.

## Roles

| Role | Home Page | Description |
|---|---|---|
| CEO | /ceo | Executive dashboard + full access |
| CRE | /cre | Customer Relations Executive — applications, team |
| CREM | /crem | Customer Relations Manager — customers, visits, leads |
| AE | /ae | Accounts Executive — invoices, payments, credit |
| WE | /we | Warehouse Executive — inventory, orders, fulfilment |
| WS | /ws | Warehouse Staff — delivery + PIN verification |

## Tech Stack

- React 19 + Vite
- Tailwind CSS v4
- wouter (routing)
- TanStack Query
- Recharts
- lucide-react
