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

const SPORTMONKS_BASE_URL =
  envFirst(['SPORTMONKS_BASE_URL', 'NEXT_PUBLIC_SPORTMONKS_BASE_URL']) || 'https://cricket.sportmonks.com/api/v2.0';
const SPORTMONKS_AUTH_TOKEN =
  envFirst(['SPORTMONKS_AUTH_TOKEN', 'SPORTMONKS_TOKEN', 'NEXT_PUBLIC_SPORTMONKS_TOKEN']) ||
  '06tC31OZQ0eRBASH6j7BHs5zFieRXDjcrhzSgBMYAJmgsJtbcpi8EeY8DSiA';

const probe = async ({url, token}) => {
  if (!token) {
    return {ok: false, status: 0, error: 'missing_key'};
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: token,
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
  const [teams, fixtures] = await Promise.all([
    probe({
      url: `${SPORTMONKS_BASE_URL}/teams`,
      token: SPORTMONKS_AUTH_TOKEN,
    }),
    probe({
      url: `${SPORTMONKS_BASE_URL}/fixtures?per_page=1`,
      token: SPORTMONKS_AUTH_TOKEN,
    }),
  ]);

  return NextResponse.json(
    {
      env: {
        sportMonksBaseUrl: SPORTMONKS_BASE_URL,
        sportMonksAuthTokenPresent: Boolean(SPORTMONKS_AUTH_TOKEN),
      },
      checks: {
        teams,
        fixtures,
      },
    },
    {status: 200}
  );
}
