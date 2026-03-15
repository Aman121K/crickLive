# MyCricket Website (Next.js)

## Run

1. Install dependencies

```bash
npm --prefix website install
```

2. Configure environment

```bash
cp website/.env.example website/.env.local
```

3. Start development server

```bash
npm run website:dev
```

## Features

- Live, upcoming, finished matches dashboard
- Match details page with scorecard tables for both teams
- News feed from your backend (`/api/news/public`)
- Supports `imageUrl` + `thumbnailUrl` published from admin panel

## Notes

- Set `RAPID_API_KEY` for Cricbuzz endpoints and `TEAM_RAPID_API_KEY` for team search endpoint.
- If RapidAPI keys are missing/invalid, match, team, and ranking requests can fall back to placeholder/mock data.
- If backend is unavailable, website falls back to mock news data.

## Vercel Deployment

- Add these env vars in Vercel Project Settings:
  - `RAPID_API_KEY`
  - `TEAM_RAPID_API_KEY`
  - `RAPID_API_HOST=cricbuzz-cricket.p.rapidapi.com`
  - `TEAM_RAPID_API_HOST=cricket-live-line-advance.p.rapidapi.com`
- Redeploy after updating env vars.
- Use `GET /api/rapid-health` on your deployed domain to verify key presence and live upstream status (200/429/etc).
