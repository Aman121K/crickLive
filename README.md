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

- Set `SPORTMONKS_AUTH_TOKEN` for cricket.sportmonks.com endpoints.
- If SportMonks auth token is missing/invalid, match, team, and ranking requests can fall back to placeholder/mock data.
- If backend is unavailable, website falls back to mock news data.

## SportMonks Curl Reference

Base URL:

`https://cricket.sportmonks.com/api/v2.0`

- Teams: `curl --location 'https://cricket.sportmonks.com/api/v2.0/teams' --header 'Authorization: YOUR_API_TOKEN'`
- Live scores: `curl --location 'https://cricket.sportmonks.com/api/v2.0/livescores' --header 'Authorization: YOUR_API_TOKEN'`
- Live + scoreboards: `curl --location 'https://cricket.sportmonks.com/api/v2.0/livescores?include=scoreboards' --header 'Authorization: YOUR_API_TOKEN'`
- Live + teams + league: `curl --location 'https://cricket.sportmonks.com/api/v2.0/livescores?include=localteam,visitorteam,league' --header 'Authorization: YOUR_API_TOKEN'`
- Fixtures: `curl --location 'https://cricket.sportmonks.com/api/v2.0/fixtures' --header 'Authorization: YOUR_API_TOKEN'`
- Fixture by id: `curl --location 'https://cricket.sportmonks.com/api/v2.0/fixtures/{fixture_id}' --header 'Authorization: YOUR_API_TOKEN'`
- Leagues: `curl --location 'https://cricket.sportmonks.com/api/v2.0/leagues' --header 'Authorization: YOUR_API_TOKEN'`
- Standings: `curl --location 'https://cricket.sportmonks.com/api/v2.0/standings/season/{season_id}' --header 'Authorization: YOUR_API_TOKEN'`
- Players: `curl --location 'https://cricket.sportmonks.com/api/v2.0/players' --header 'Authorization: YOUR_API_TOKEN'`

## Vercel Deployment

- Add these env vars in Vercel Project Settings:
  - `SPORTMONKS_AUTH_TOKEN`
  - `SPORTMONKS_BASE_URL=https://cricket.sportmonks.com/api/v2.0`
- Redeploy after updating env vars.
- Use `GET /api/rapid-health` on your deployed domain to verify key presence and live upstream status (200/429/etc).
