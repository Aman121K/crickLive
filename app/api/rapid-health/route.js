import {NextResponse} from 'next/server';

const envFirst = names => {
  for (const name of names) {
    const value = process.env[name];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return '';
};

const RAPID_API_HOST =
  envFirst(['RAPID_API_HOST', 'RAPIDAPI_HOST', 'NEXT_PUBLIC_RAPID_API_HOST']) || 'cricbuzz-cricket.p.rapidapi.com';
const TEAM_RAPID_API_HOST =
  envFirst(['TEAM_RAPID_API_HOST', 'RAPID_TEAM_API_HOST', 'NEXT_PUBLIC_TEAM_RAPID_API_HOST']) ||
  'cricket-live-line-advance.p.rapidapi.com';
const RAPID_API_KEY = envFirst([
  'RAPID_API_KEY',
  'RAPIDAPI_KEY',
  'X_RAPIDAPI_KEY',
  'NEXT_PUBLIC_RAPID_API_KEY',
]);
const TEAM_RAPID_API_KEY = envFirst([
  'TEAM_RAPID_API_KEY',
  'RAPID_TEAM_API_KEY',
  'NEXT_PUBLIC_TEAM_RAPID_API_KEY',
  'NEXT_PUBLIC_RAPID_API_KEY',
  'RAPID_API_KEY',
  'RAPIDAPI_KEY',
  'X_RAPIDAPI_KEY',
]);

const probe = async ({url, host, key}) => {
  if (!key) {
    return {ok: false, status: 0, error: 'missing_key'};
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': host,
        'x-rapidapi-key': key,
      },
      cache: 'no-store',
    });

    const body = await response.text().catch(() => '');
    return {
      ok: response.ok,
      status: response.status,
      bodyPreview: body.slice(0, 180),
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: String(error?.message || error || 'request_failed'),
    };
  }
};

export const dynamic = 'force-dynamic';

export async function GET() {
  const [cricbuzz, teamApi] = await Promise.all([
    probe({
      url: 'https://cricbuzz-cricket.p.rapidapi.com/matches/v1/live',
      host: RAPID_API_HOST,
      key: RAPID_API_KEY,
    }),
    probe({
      url: 'https://cricket-live-line-advance.p.rapidapi.com/matches?paged=1&per_page=1&status=3',
      host: TEAM_RAPID_API_HOST,
      key: TEAM_RAPID_API_KEY,
    }),
  ]);

  return NextResponse.json(
    {
      env: {
        rapidApiHost: RAPID_API_HOST,
        teamRapidApiHost: TEAM_RAPID_API_HOST,
        rapidApiKeyPresent: Boolean(RAPID_API_KEY),
        teamRapidApiKeyPresent: Boolean(TEAM_RAPID_API_KEY),
      },
      checks: {
        cricbuzz,
        teamApi,
      },
    },
    {status: 200}
  );
}
