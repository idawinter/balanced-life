# Devlog — Balanced Life

This log documents weekly progress, decisions, challenges, and screenshots.

---

## Week 1 — Proposal & Planning
**Planned**
- Idea: Menopause-focused wellness tracker (mobile-first).
- Users: People in menopause who want simple daily logs + symptom focus.
- Stack: Expo/React Native (mobile), Node/Express + TypeScript (API), MongoDB Atlas.
- Differentiator: Menopause-specific fields; wearable integration later.

**Done**
- Wrote proposal and received instructor approval.

**Notes / Screenshots**
- _Add proposal screenshot if desired._

---

## Week 2 — Design
**Architecture**
- Mobile: Today (form) + History (list + chart).
- API: `/daily` routes, Zod validation, Mongoose models.
- Data flow: Mobile → API → MongoDB; History fetch for last 14 days.

**Decisions**
- Manual entry first (keep space for future Oura integration).
- Auth deferred (single demo user for capstone).

**Notes / Screenshots**
- _Add a quick sketch/diagram screenshot if available._

---

## Week 3 — Development
**Server**
- Express + TypeScript.
- Mongoose model `DailyMetrics`.
- Routes:
  - `POST /daily/:date` (upsert)
  - `GET /daily?from=YYYY-MM-DD&to=YYYY-MM-DD`
- Validation: Zod schemas.

**Mobile**
- Expo scaffold.
- Today form with `react-hook-form`.
- History list + 14-day line chart (Sleep/Mood toggle).

**Challenges & Fixes**
- MongoDB Atlas URI/auth (fixed creds + SRV string).
- TypeScript config and editor type errors.

**Notes / Screenshots**
- _Add Today form and History screen with chart._

---

## Week 4 — Testing & Deployment
**Testing**
- Jest + Supertest setup.
- Test: `GET /health` returns `ok: true`.

**Deployment**
- API on Render.
- Mobile uses `EXPO_PUBLIC_API_URL` (live API).

**Challenges**
- Render build: missing `@types/*` → installed + ensured dev deps install.
- Node version EOL → set `NODE_VERSION=20`.

**Notes / Screenshots**
- _Add Render dashboard screenshot (service running)._
- _Add test run screenshot (1 test passed)._

---

## Learnings & Next Steps
**Learned**
- End-to-end flow: mobile → API → DB → chart.
- TypeScript configs for Node/Express + Jest.
- Cloud deploy/CORS troubleshooting.

**Planned Improvements**
- Auth (lightweight header or provider).
- Wearable integration (Oura OAuth).
- More charts (HRV, symptom correlations).
- More tests for `/daily` POST/GET and validation paths.

---

## Milestones (dates)
- **2025-10-18–19:** Mobile scaffold, Today form, server routes, MongoDB connect.
- **2025-10-19:** History chart + toggle; Render deploy; first Jest test.
