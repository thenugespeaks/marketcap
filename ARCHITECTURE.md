# MarketCap — Architecture

A technical reference for developers. For a user-facing overview, see [README.md](README.md).

---

## Core Library Files (`lib/`)

| File | Role |
|---|---|
| `lib/yahoo.ts` | Server-only wrapper around `yahoo-finance2`. Exports `getQuote`, `getQuoteSummary`, `getHistory`, `searchTickers`, `getMultipleQuotes`. Marked `"server-only"` so it never leaks into client bundles. |
| `lib/finnhub.ts` | Fetch wrapper for the Finnhub REST API. Provides `getMarketNews` (general) and `getStockNews` (ticker-specific, 7-day window). |
| `lib/auth.ts` | NextAuth v5 config. Google OAuth + email/password Credentials providers. JWT session strategy — no DB session rows for credential logins. |
| `lib/db.ts` | Singleton PrismaClient stored on `globalThis` to survive hot-reloads in dev. |
| `lib/constants.ts` | Static ticker lists: `INDEX_TICKERS` (5 indices) and `TRENDING_TICKERS` (8 large-caps). Separated from `yahoo.ts` so client-side components can import them without pulling in server-only code. |
| `lib/utils.ts` | Pure formatting helpers: `formatPrice`, `formatChange`, `formatPercent`, `formatLargeNumber`, `formatVolume`, `isPositive`, `cn`. |

---

## App Shell

| File | Role |
|---|---|
| `app/layout.tsx` | Root layout. Wraps everything in `<Providers>`, renders `<Navbar>` and footer on every page. |
| `app/providers.tsx` | Client-side `SessionProvider` (NextAuth React context) — makes `useSession()` work throughout the app. |
| `app/globals.css` | Tailwind base styles + class-based dark mode config (`@variant dark`). |

---

## Pages

| File | Type | Role |
|---|---|---|
| `app/page.tsx` | Server Component | Homepage. Lays out `IndicesBar`, `MoversTable`, `TrendingStrip`, and `NewsSection`. Each component fetches its own data. |
| `app/stock/[ticker]/page.tsx` | Server Component | Stock detail page. Calls `getQuote` + `getQuoteSummary` **directly** at render time (no internal HTTP hop). Passes data to `PriceChart`, `StatsGrid`, `WatchlistButton`, `NewsSection`. |
| `app/login/page.tsx` | Client Component | Tabbed Sign In / Register form. Calls `/api/auth/register` then `signIn("credentials")`, or `signIn("google")`. |
| `app/watchlist/page.tsx` | Client Component | Fetches saved tickers from `/api/watchlist`, then calls `/api/stock/{ticker}` for each to get live prices. Auth-gated. |
| `app/portfolio/page.tsx` | Client Component | Fetches holdings from `/api/portfolio`, enriches each with live price, computes P&L, renders a table and Recharts PieChart. Auth-gated. |

---

## API Routes (`app/api/`)

| File | Method | Cache | Role |
|---|---|---|---|
| `api/auth/register/route.ts` | POST | — | Creates a new user with bcrypt-hashed password. Returns 409 if email taken. |
| `api/stock/[ticker]/route.ts` | GET | 60s | Returns a flattened stock object. Used by Watchlist and Portfolio pages. |
| `api/stock/[ticker]/history/route.ts` | GET | 300s | Accepts `?range=1D\|5D\|1M\|6M\|1Y\|5Y`, returns OHLCV array for the price chart. |
| `api/market/indices/route.ts` | GET | 60s | Live data for the 5 market indices (S&P 500, Dow, Nasdaq, Russell, VIX). |
| `api/market/movers/route.ts` | GET | 120s | 24 tickers sorted by `?tab=active\|gainers\|losers`, returns top 10. |
| `api/news/route.ts` | GET | 300s | Up to 20 general market news items from Finnhub. |
| `api/news/[ticker]/route.ts` | GET | 300s | Stock-specific news from Finnhub, or general market news for index tickers (`^` prefix). |
| `api/search/route.ts` | GET | none | Yahoo Finance search — up to 8 matching EQUITYs/ETFs/Crypto. |
| `api/watchlist/route.ts` | GET/POST/DELETE | — | Auth-gated. Reads, adds, or removes `WatchlistItem` rows via Prisma. |
| `api/portfolio/route.ts` | GET/POST/DELETE | — | Auth-gated. Reads, adds, or removes `PortfolioHolding` rows via Prisma. |

---

## Components

### Layout

| File | Role |
|---|---|
| `components/layout/Navbar.tsx` | Sticky nav with logo, debounced search (300ms → `/api/search`), nav links, `ThemeToggle`, user avatar/sign-out dropdown. |
| `components/layout/ThemeToggle.tsx` | Moon/sun button. Toggles `dark` class on `<html>` and persists to `localStorage`. |

### Market

| File | Role |
|---|---|
| `components/market/IndicesBar.tsx` | Fetches `/api/market/indices` on mount. Renders 5 clickable index cards. |
| `components/market/MoversTable.tsx` | Three-tab table. Fetches `/api/market/movers?tab=...` on tab change. |
| `components/market/TrendingStrip.tsx` | 8 parallel fetches to `/api/stock/{ticker}` for trending tickers, rendered as `StockCard`s. |
| `components/market/NewsSection.tsx` | Accepts optional `ticker` prop. Fetches `/api/news/{ticker}` or `/api/news`. Used on homepage and stock detail. |

### Stock

| File | Role |
|---|---|
| `components/stock/PriceChart.tsx` | Range selector (1D–5Y) + Recharts `AreaChart`. Fetches `/api/stock/{ticker}/history?range=...` on mount and range change. |
| `components/stock/StatsGrid.tsx` | Presentational grid of 10 key stats. No data fetching. |
| `components/stock/StockCard.tsx` | Compact card: ticker, name, price, % change, embedded `WatchlistButton`. |
| `components/stock/WatchlistButton.tsx` | Toggle button. Calls `POST`/`DELETE /api/watchlist`. Redirects to `/login` if unauthenticated. |
| `components/stock/NewsCard.tsx` | Single news item: thumbnail, headline, source, relative timestamp via `date-fns`. |

### UI

| File | Role |
|---|---|
| `components/ui/skeleton.tsx` | Pulsing gray loading placeholder used while data fetches. |
| `components/ui/badge.tsx` | Generic badge/chip for labels. |

---

## Data Flows

### Homepage

```
IndicesBar        → GET /api/market/indices  → lib/yahoo.ts → yahoo-finance2 (x5 parallel)
MoversTable       → GET /api/market/movers   → lib/yahoo.ts → yahoo-finance2 (x24 parallel, sorted)
TrendingStrip     → GET /api/stock/* (x8)    → lib/yahoo.ts → yahoo-finance2
NewsSection       → GET /api/news            → lib/finnhub.ts → Finnhub API
```

### Stock Detail Page

```
Server render:
  app/stock/[ticker]/page.tsx
    → getQuote() + getQuoteSummary() directly (no HTTP hop)
    → yahoo-finance2 (server-side)
    → renders HTML with data

Client hydration:
  PriceChart      → GET /api/stock/{ticker}/history → yahoo-finance2
  NewsSection     → GET /api/news/{ticker}          → Finnhub API
  WatchlistButton → POST/DELETE /api/watchlist      → Prisma → Supabase
```

### Search

```
Navbar input (debounced 300ms)
  → GET /api/search?q=...
  → lib/yahoo.ts searchTickers()
  → yahoo-finance2.search()
  → filter EQUITY/ETF/CRYPTO, max 8
  ← dropdown results → router.push("/stock/{ticker}")
```

### Watchlist & Portfolio Pages

```
Page mounts
  → GET /api/watchlist (or /api/portfolio)
  → auth() verifies JWT from cookie
  → Prisma query scoped to session.user.id
  → for each ticker: GET /api/stock/{ticker} → yahoo-finance2
  ← renders rows with live prices + P&L
```

---

## Auth Flow

```
Register:
  POST /api/auth/register {email, password}
    → bcrypt.hash(password, 12)
    → prisma.user.create()
  → signIn("credentials") → JWT cookie set

Login (credentials):
  signIn("credentials", {email, password})
    → NextAuth authorize()
    → prisma.user.findUnique
    → bcrypt.compare()
    → JWT cookie set

Login (Google):
  signIn("google")
    → Google OAuth redirect
    → NextAuth PrismaAdapter creates/links Account + User
    → JWT cookie set

Protected API pattern:
  const session = await auth()  // reads JWT from cookie
  if (!session?.user?.id) return 401
  // use session.user.id to scope all DB queries
```

---

## Database Schema

```prisma
User
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  image         String?
  password      String?  // bcrypt hash — only set for credential users
  accounts      Account[]
  sessions      Session[]
  watchlist     WatchlistItem[]
  portfolio     PortfolioHolding[]

Account                  // OAuth provider links (Google tokens)
  userId → User.id (cascade delete)
  provider + providerAccountId (unique)

Session                  // OAuth adapter sessions (not used for JWT logins)
  userId → User.id (cascade delete)

WatchlistItem
  ticker  String
  userId  String → User.id (cascade delete)
  @@unique([userId, ticker])   // prevents duplicate watchlist entries

PortfolioHolding
  ticker    String
  shares    Float
  buyPrice  Float        // average cost basis per share
  userId    String → User.id (cascade delete)
```

No market data is stored in the database. All prices and news are fetched live, with Next.js edge caching (60–300s) reducing API call volume.

---

## Key Architecture Decisions

1. **Stock detail page fetches Yahoo directly** — `app/stock/[ticker]/page.tsx` is a Server Component that calls `lib/yahoo.ts` functions directly instead of hitting its own `/api/stock/{ticker}` route, avoiding a loopback HTTP call that breaks on Vercel.

2. **`lib/yahoo.ts` is `"server-only"`** — Prevents yahoo-finance2 (which uses Node.js built-ins) from being bundled into client-side code. Client components use the `/api/*` routes instead.

3. **`lib/constants.ts` is separate from `lib/yahoo.ts`** — Allows client components to import `TRENDING_TICKERS` and `INDEX_TICKERS` without triggering the server-only guard.

4. **Theme is class-based** — `ThemeToggle` toggles `document.documentElement.classList.dark` and writes to `localStorage`. Tailwind v4 uses `@variant dark (&:where(.dark, .dark *))` to scope dark styles to the `.dark` class rather than `prefers-color-scheme`.

5. **All index tickers (`^DJI`, `^GSPC` etc.) require `encodeURIComponent`** in client fetch URLs, and `decodeURIComponent` at the top of each API route handler, since `%5E` is not auto-decoded in all environments.
