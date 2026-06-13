# Stock Market Game

A paper trading simulator that uses real market prices (via Yahoo Finance) with $100,000 in simulated starting cash. No real money, no broker integration.

> **Simulation disclaimer:** This is an educational game. All trades use fake money and do not represent real investments.

---

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

**Firebase Client SDK** (from Firebase Console → Project Settings → Your apps → Web app):
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

**Firebase Admin SDK** (from Firebase Console → Project Settings → Service Accounts → Generate new private key):
```
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

> The `FIREBASE_PRIVATE_KEY` value must be wrapped in double quotes and have literal `\n` characters (not actual newlines) when pasted into `.env.local`.

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14, App Router, TypeScript |
| Styling | Tailwind CSS (dark mode by default) |
| Auth | Firebase Authentication — Google Sign-In only |
| Database | Cloud Firestore |
| Charts | Recharts |
| Validation | Zod |
| Data fetching | TanStack Query v5 |
| Testing | Vitest + React Testing Library |
| Market data | `yahoo-finance2` (server-side only, via Route Handlers) |

---

## Firestore Data Model

```
users/{userId}
  uid            string
  displayName    string
  email          string
  photoURL       string | null
  createdAt      timestamp
  updatedAt      timestamp

portfolios/{userId}
  cashBalance    number       — available cash (starts at $100,000)
  totalInvested  number       — sum of all open position costs
  createdAt      timestamp
  updatedAt      timestamp

portfolios/{userId}/holdings/{symbol}
  symbol         string       — e.g. "AAPL"
  quantity       number       — shares held
  averageCost    number       — weighted average purchase price
  totalCost      number       — quantity × averageCost
  createdAt      timestamp
  updatedAt      timestamp

portfolios/{userId}/transactions/{transactionId}
  type           "BUY" | "SELL"
  symbol         string
  quantity       number
  price          number       — execution price per share
  totalValue     number       — quantity × price
  timestamp      timestamp

portfolios/{userId}/watchlist/{symbol}
  symbol         string
  addedAt        timestamp

portfolios/{userId}/snapshots/{snapshotId}
  totalValue     number       — cashBalance + investedValue at time of snapshot
  cashBalance    number
  investedValue  number
  timestamp      timestamp
```

**Access rules:** Each user may only read and write their own `users/{userId}` and `portfolios/{userId}/**` documents. No public read.

---

## Architecture Notes

- **Market data is server-side only.** All Yahoo Finance calls happen in Next.js Route Handlers (`/app/api/market/`). The browser never touches the market data provider directly.
- **Firebase client SDK is lazily initialized.** `getFirebaseAuth()` and `getFirebaseDb()` are called inside React components/event handlers, never at module load time. This prevents build-time errors.
- **Firebase Admin SDK is server-only.** It lives in `src/lib/firebase/admin.ts` and is imported only by Route Handlers and server repository functions. Never import it in client components.
- **All buy/sell operations use Firestore `runTransaction`.** This ensures cash balance and holdings are updated atomically.

---

## Scripts

```bash
npm run dev        # start dev server
npm run build      # production build
npm run test       # run tests in watch mode
npm run test:run   # run tests once
npm run lint       # ESLint
npm run format     # Prettier
```

---

## Deploy

```bash
npm run build
firebase deploy
```

> For full SSR support on Firebase Hosting, use Firebase App Hosting or Cloud Functions with the Next.js adapter.

---

## Known Limitations

- Market data refreshes every 60 seconds — prices shown may be slightly stale.
- Yahoo Finance data is unofficial and subject to rate limits or availability changes.
- No real-time WebSocket price streaming; the app polls on a timer.
- Portfolio snapshots are written at most once per minute per trade to avoid excessive Firestore writes.
