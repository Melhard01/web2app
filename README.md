# EpiMinded — Web Acquisition Path

The **web funnel** from the acquisition flow: an ad-driven **Strategic Posture**
quiz (Scout / Analyst / Operator / Seeker) that builds intent to pay, a
personalized posture report (onboarding), the **Track B** pricing paywall, Polar
checkout, account provisioning with a **signed entitlement token**, and a
**multi-rail handoff** into the mobile app. Brand: navy/gold, Fraunces + Inter Tight.

```
Ad / landing  →  Quiz  →  Report  →  Paywall  →  Polar checkout
                                                      │
                                          Provision + signed token
                                                      │
                                          Multi-rail handoff
                                   (open-app · universal link · QR · email)
```

The app then verifies the token once on first open and unlocks with **no second
charge** — that mobile side is out of scope here; this repo is the web path only.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
```

Configure Polar env vars in `.env.local` to enable real checkout (see below).

## Modes

| Concern        | Unconfigured                       | Configured                                  |
| -------------- | ---------------------------------- | ------------------------------------------- |
| Payment        | Subscribe buttons disabled         | Polar Checkout (`POLAR_ACCESS_TOKEN`)       |
| Provision      | In-memory account (`provision.ts`) | Wire Polar webhook → `provisionAccount`     |
| Token          | HS256 JWT, dev secret              | Set `ENTITLEMENT_TOKEN_SECRET`              |

Copy `.env.example` → `.env.local` and fill in Polar sandbox credentials +
`POLAR_PRODUCT_*` ids. Point a Polar webhook at `/api/webhook/polar` for
authoritative provisioning.

## Content sources

- **Quiz + profiles** live in `src/lib/quiz/config.ts` (the real "Strategic
  Posture" content). Scoring counts option `key`s across scored questions and
  resolves a dominant posture with deterministic tie-breaks (`src/lib/quiz/scoring.ts`).
  To change content, edit that one config object — no component changes.
- **Pricing** (Track B retail) lives in `src/lib/config.ts`: Lite/Standard/Pro
  ($19.99 / $29.99 / $39.99, annual $199 / $299 / $399). Track A (enterprise
  per-seat) is sales-led and not exposed in this self-serve funnel.

## Layout

```
src/
  app/
    page.tsx                 Landing (ad hook → quiz)
    quiz/                    Quiz engine page
    report/                  Personalized report (onboarding payoff)
    paywall/                 Web paywall (plan selection)
    checkout/                Polar checkout redirect (GET route)
    success/                 Payment confirmation
    api/
      provision/             Mint account + entitlement token
      entitlement/verify/    Sample of what the app does on first open
      webhook/polar/         Polar webhook (authoritative provisioning)
  components/                quiz · report · paywall · handoff · ui
  lib/
    quiz/                    config · types · scoring
    funnel/store.tsx         Cross-page funnel state (sessionStorage)
    entitlement/             token (JWT) · handoff (rail links)
    provision.ts             Mock account + token minting
    config.ts                Pricing + app config
```

## Notes / guardrails carried from the flow

- **Compliance:** the web (lower) price lives only on the web and is never linked
  from inside the app; IAP stays in-app.
- **Identity:** the entitlement binds to the email captured at checkout, so it's
  portable across web/iOS/Android.
- **Recovery:** the paywall offers a **Restore** path before charging.
- **Idempotency:** provisioning is keyed by email, so webhook retries are safe.
