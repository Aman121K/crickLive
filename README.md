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

- If `RAPID_API_KEY` is missing, website falls back to mock match data.
- If backend is unavailable, website falls back to mock news data.
