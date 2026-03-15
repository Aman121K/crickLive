import {
  fallbackFinishedMatches,
  fallbackLiveMatches,
  fallbackNews,
  fallbackScorecards,
  fallbackUpcomingMatches,
} from '@/lib/fallbackData';

const RAPID_BASE_URL = 'https://cricbuzz-cricket.p.rapidapi.com';
const RAPID_API_HOST = process.env.RAPID_API_HOST || 'cricbuzz-cricket.p.rapidapi.com';
const TEAM_RAPID_BASE_URL = 'https://cricket-live-line-advance.p.rapidapi.com';
const TEAM_RAPID_API_HOST =
  process.env.TEAM_RAPID_API_HOST || 'cricket-live-line-advance.p.rapidapi.com';
const RAPID_API_KEY = process.env.RAPID_API_KEY || process.env.NEXT_PUBLIC_RAPID_API_KEY || '';
const TEAM_RAPID_API_KEY = process.env.TEAM_RAPID_API_KEY || RAPID_API_KEY;
const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.criclive.app').replace(/\/$/, '');

const toArray = value => (Array.isArray(value) ? value : []);
const toNumber = value => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatInnings = innings => {
  if (!innings) {
    return '';
  }

  const runs = innings.runs ?? '-';
  const wickets = innings.wickets ?? '-';
  const overs = innings.overs != null ? ` (${innings.overs})` : '';

  return `${runs}/${wickets}${overs}`;
};

const formatMatchStart = startDate => {
  if (!startDate) {
    return '-';
  }

  const timestamp = Number(startDate);
  if (Number.isNaN(timestamp)) {
    return '-';
  }

  return new Date(timestamp).toLocaleString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    day: '2-digit',
    month: 'short',
    timeZone: 'Asia/Kolkata',
  });
};

const mapStatus = (state, fallback) => {
  const normalized = String(state || '').toLowerCase();

  if (normalized.includes('live') || normalized.includes('in progress')) {
    return 'LIVE';
  }

  if (normalized.includes('complete') || normalized.includes('result') || normalized.includes('stumps')) {
    return 'RESULT';
  }

  if (normalized.includes('preview') || normalized.includes('upcoming')) {
    return 'UPCOMING';
  }

  return fallback;
};

const mapMatchFromApi = (item, fallbackStatus) => {
  const matchInfo = item?.matchInfo || item || {};
  const matchScore = item?.matchScore || {};
  const team1 = matchInfo.team1 || {};
  const team2 = matchInfo.team2 || {};

  const team1Name = team1.teamSName || team1.teamName || 'TBD';
  const team2Name = team2.teamSName || team2.teamName || 'TBD';

  const team1Score = formatInnings(matchScore?.team1Score?.inngs1 || matchScore?.team1Score?.inngs2);
  const team2Score = formatInnings(matchScore?.team2Score?.inngs1 || matchScore?.team2Score?.inngs2);

  const score1 = team1Score || formatMatchStart(matchInfo.startDate);
  const score2 = team2Score || (fallbackStatus === 'UPCOMING' ? 'Upcoming' : '-');

  const venueInfo = matchInfo.venueInfo || {};
  const venue = [venueInfo.ground, venueInfo.city].filter(Boolean).join(', ') || 'Venue TBA';

  return {
    id: String(matchInfo.matchId || `${team1Name}-${team2Name}-${matchInfo.startDate || Math.random()}`),
    series: matchInfo.seriesName || matchInfo.matchDesc || 'Match',
    status: mapStatus(matchInfo.state, fallbackStatus),
    teams: [team1Name, team2Name],
    scores: [score1, score2],
    venue,
  };
};

const mapMatchFromTeamApi = (item, fallbackStatus) => {
  const teamA = item?.teama || {};
  const teamB = item?.teamb || {};
  const competition = item?.competition || {};
  const venue = item?.venue || {};

  const team1Name = teamA.short_name || teamA.name || 'TBD';
  const team2Name = teamB.short_name || teamB.name || 'TBD';

  const statusText = String(item?.status_str || '').toLowerCase();
  const derivedStatus =
    statusText === 'live'
      ? 'LIVE'
      : statusText === 'completed' || statusText === 'cancelled'
        ? 'RESULT'
        : statusText === 'scheduled'
          ? 'UPCOMING'
          : fallbackStatus;

  const startTimestamp = Number(item?.timestamp_start);
  const startTime = Number.isFinite(startTimestamp)
    ? formatMatchStart(startTimestamp * 1000)
    : String(item?.date_start_ist || '').trim() || '-';

  const score1 = String(teamA?.scores_full || '').trim() || (derivedStatus === 'UPCOMING' ? startTime : '-');
  const score2 =
    String(teamB?.scores_full || '').trim() ||
    String(item?.result || item?.live || item?.status_note || '').trim() ||
    (derivedStatus === 'UPCOMING' ? 'Upcoming' : '-');

  return {
    id: String(item?.match_id || `${team1Name}-${team2Name}-${item?.timestamp_start || Math.random()}`),
    series: competition?.title || item?.subtitle || item?.title || 'Match',
    status: derivedStatus,
    teams: [team1Name, team2Name],
    scores: [score1, score2],
    venue: [venue?.name, venue?.location].filter(Boolean).join(', ') || 'Venue TBA',
  };
};

const extractMatchItems = data => {
  const results = [];

  toArray(data?.typeMatches).forEach(typeMatch => {
    toArray(typeMatch?.seriesMatches).forEach(seriesMatch => {
      const wrapper = seriesMatch?.seriesAdWrapper || seriesMatch;
      toArray(wrapper?.matches).forEach(match => results.push(match));
    });
  });

  toArray(data?.matchScheduleMap).forEach(scheduleGroup => {
    const wrapper = scheduleGroup?.scheduleAdWrapper || scheduleGroup;
    toArray(wrapper?.matchScheduleList).forEach(scheduleItem => {
      toArray(scheduleItem?.matchInfo).forEach(matchInfo => results.push({matchInfo}));
      if (scheduleItem?.matchInfo && !Array.isArray(scheduleItem.matchInfo)) {
        results.push({matchInfo: scheduleItem.matchInfo});
      }
    });
  });

  toArray(data?.matches).forEach(match => results.push(match));
  toArray(data?.matchList).forEach(match => results.push(match));

  return results;
};

const requestRapid = async path => {
  if (!RAPID_API_KEY) {
    throw new Error('RAPID_API_KEY (or NEXT_PUBLIC_RAPID_API_KEY) is not configured');
  }

  const response = await fetch(`${RAPID_BASE_URL}${path}`, {
    method: 'GET',
    headers: {
      'x-rapidapi-host': RAPID_API_HOST,
      'x-rapidapi-key': RAPID_API_KEY,
    },
    next: {revalidate: 30},
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`Rapid API ${response.status} for ${path}${errorBody ? ` - ${errorBody.slice(0, 200)}` : ''}`);
  }

  return response.json();
};

const requestRapidFirstSuccess = async paths => {
  let lastError = null;

  for (const path of paths) {
    try {
      // eslint-disable-next-line no-await-in-loop
      return await requestRapid(path);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('All endpoints failed');
};

const requestRapidTeam = async path => {
  if (!TEAM_RAPID_API_KEY) {
    throw new Error('TEAM_RAPID_API_KEY (or RAPID_API_KEY) is not configured');
  }

  const response = await fetch(`${TEAM_RAPID_BASE_URL}${path}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-rapidapi-host': TEAM_RAPID_API_HOST,
      'x-rapidapi-key': TEAM_RAPID_API_KEY,
    },
    next: {revalidate: 60},
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`Team API ${response.status} for ${path}${errorBody ? ` - ${errorBody.slice(0, 200)}` : ''}`);
  }

  return response.json();
};

const requestRapidTeamFirstSuccess = async paths => {
  let lastError = null;

  for (const path of paths) {
    try {
      // eslint-disable-next-line no-await-in-loop
      return await requestRapidTeam(path);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('All team endpoints failed');
};

const getTeamProviderMatchesByStatus = async status => {
  const query = new URLSearchParams({
    paged: '1',
    per_page: '20',
    status: String(status),
  });

  const payload = await requestRapidTeamFirstSuccess([`/matches?${query.toString()}`]);
  return toArray(payload?.response?.items).map(item => mapMatchFromTeamApi(item, 'UPCOMING'));
};

const toTeamList = payload => {
  const candidateLists = [
    payload?.response?.items,
    payload?.response?.teams,
    payload?.response,
    payload?.data?.teams,
    payload?.data?.items,
    payload?.teams,
    payload?.results,
    payload?.data,
    payload,
  ];

  for (const list of candidateLists) {
    if (Array.isArray(list)) {
      return list;
    }

    if (list && typeof list === 'object') {
      const objectValues = Object.values(list);
      if (objectValues.length && objectValues.every(value => value && typeof value === 'object')) {
        return objectValues;
      }
    }
  }

  return [];
};

const mapTeamItem = item => {
  const name = item?.name || item?.team_name || item?.teamName || item?.team?.name || item?.title;
  if (!name) {
    return null;
  }

  return {
    id: String(item?.id || item?.team_id || item?.teamId || name),
    name: String(name),
    shortName: String(item?.short_name || item?.shortName || item?.abbr || item?.code || '').trim(),
    country: String(item?.country || item?.country_name || item?.region || '').trim(),
    type: String(item?.type || item?.match_type || item?.format || '').trim(),
  };
};

const toRankingList = payload => {
  const candidates = [
    payload?.rank,
    payload?.ranks,
    payload?.rankings,
    payload?.data?.rankings,
    payload?.data?.list,
    payload?.data,
    payload?.values,
    payload?.items,
    payload,
  ];

  for (const list of candidates) {
    if (Array.isArray(list)) {
      return list;
    }
  }

  return [];
};

const mapRankingItem = item => {
  const rank = Number(item?.rank ?? item?.position ?? item?.rnk ?? item?.pos ?? item?.order ?? 0);
  const name = item?.name || item?.playerName || item?.teamName || item?.team?.name || item?.country || item?.title;
  const rating = item?.rating ?? item?.points ?? item?.value ?? item?.score;
  const format = item?.format || item?.matchType || item?.type || item?.category || '';

  if (!name) {
    return null;
  }

  return {
    rank: Number.isFinite(rank) && rank > 0 ? rank : null,
    name: String(name),
    rating: rating == null || rating === '' ? '-' : String(rating),
    format: String(format || '').toUpperCase(),
  };
};

const mapRankingItemFromIcc = item => {
  const rank = Number(item?.rank ?? item?.position ?? 0);
  const name = item?.player || item?.team || item?.name;
  const rating = item?.rating ?? item?.points ?? '-';

  if (!name) {
    return null;
  }

  return {
    rank: Number.isFinite(rank) && rank > 0 ? rank : null,
    name: String(name),
    rating: rating == null || rating === '' ? '-' : String(rating),
    format: '',
  };
};

const getObjectByPath = (root, path) => {
  return path.reduce((value, key) => (value && typeof value === 'object' ? value[key] : undefined), root);
};

const getFirstArrayByPaths = (root, paths) => {
  for (const path of paths) {
    const value = getObjectByPath(root, path);
    if (Array.isArray(value) && value.length) {
      return value;
    }
  }

  return [];
};

const formatRelativeTime = createdAt => {
  if (!createdAt) {
    return 'Recently';
  }

  const timestamp = new Date(createdAt).getTime();
  if (Number.isNaN(timestamp)) {
    return 'Recently';
  }

  const diffMinutes = Math.floor((Date.now() - timestamp) / 60000);
  if (diffMinutes < 1) {
    return 'Just now';
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  return `${Math.floor(diffHours / 24)}d ago`;
};

const resolveImageUrl = raw => {
  if (!raw) {
    return '';
  }

  const value = String(raw);
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }

  if (/^\d+$/.test(value)) {
    return `${RAPID_BASE_URL}/get-image/v1/i1/c${value}/i.jpg`;
  }

  return '';
};

const mapAdminNewsItem = item => ({
  id: `admin-${String(item._id || Math.random())}`,
  title: item.title || 'Cricket update',
  summary: item.summary || '',
  content: item.content || item.summary || '',
  tag: item.tag || 'MYCRICKET',
  series: item.series || 'General',
  time: formatRelativeTime(item.createdAt),
  author: item.authorSource || item?.createdBy?.name || 'MyCricket Desk',
  imageUrl: item.thumbnailUrl || item.imageUrl || '',
  thumbnailUrl: item.thumbnailUrl || item.imageUrl || '',
});

const getAdminNewsList = async seriesName => {
  const query = new URLSearchParams();
  if (String(seriesName || '').trim()) {
    query.set('series', String(seriesName).trim());
  }

  const url = `${BACKEND_URL}/api/news/public${query.toString() ? `?${query.toString()}` : ''}`;

  return fetch(url, {next: {revalidate: 60}})
    .then(async response => {
      if (!response.ok) {
        throw new Error('Failed to fetch admin news');
      }
      const payload = await response.json();
      return toArray(payload?.items).map(mapAdminNewsItem);
    })
    .catch(() => []);
};

export const getMatchesData = async () => {
  try {
    const [liveRaw, upcomingRaw, recentRaw] = await Promise.all([
      requestRapidFirstSuccess(['/matches/v1/live', '/matches/live']),
      requestRapidFirstSuccess(['/matches/v1/upcoming', '/matches/upcoming']),
      requestRapidFirstSuccess(['/matches/v1/recent', '/matches/recent']),
    ]);

    const live = extractMatchItems(liveRaw).map(item => mapMatchFromApi(item, 'LIVE')).slice(0, 6);
    const upcoming = extractMatchItems(upcomingRaw)
      .map(item => mapMatchFromApi(item, 'UPCOMING'))
      .filter(item => item.teams?.[0] && item.teams?.[1])
      .slice(0, 6);
    const finished = extractMatchItems(recentRaw).map(item => mapMatchFromApi(item, 'RESULT')).slice(0, 6);

    return {
      live: live.length ? live : fallbackLiveMatches,
      upcoming: upcoming.length ? upcoming : fallbackUpcomingMatches,
      finished: finished.length ? finished : fallbackFinishedMatches,
    };
  } catch (rapidError) {
    try {
      const [liveRaw, upcomingRaw, finishedRaw] = await Promise.all([
        getTeamProviderMatchesByStatus(3),
        getTeamProviderMatchesByStatus(1),
        getTeamProviderMatchesByStatus(2),
      ]);

      const live = liveRaw.filter(match => match.status === 'LIVE').slice(0, 6);
      const upcoming = upcomingRaw.filter(match => match.status === 'UPCOMING').slice(0, 6);
      const finished = finishedRaw.filter(match => match.status === 'RESULT').slice(0, 6);

      return {
        live: live.length ? live : fallbackLiveMatches,
        upcoming: upcoming.length ? upcoming : fallbackUpcomingMatches,
        finished: finished.length ? finished : fallbackFinishedMatches,
      };
    } catch (teamError) {
      console.error('getMatchesData failed:', rapidError?.message || rapidError, teamError?.message || teamError);
      return {
        live: fallbackLiveMatches,
        upcoming: fallbackUpcomingMatches,
        finished: fallbackFinishedMatches,
      };
    }
  }
};

export const getTeamSearchData = async ({search = 'india', perPage = 50, paged = 1} = {}) => {
  try {
    const wpStyleQuery = new URLSearchParams({
      search: String(search),
      per_page: String(perPage),
      paged: String(paged),
    });

    const altStyleQuery = new URLSearchParams({
      search: String(search),
      limit: String(perPage),
      page: String(paged),
    });

    const searchOnlyQuery = new URLSearchParams({
      search: String(search),
    });

    const payload = await requestRapidTeamFirstSuccess([
      `/teams?${wpStyleQuery.toString()}`,
      `/teams?${altStyleQuery.toString()}`,
      `/teams?${searchOnlyQuery.toString()}`,
      '/teams',
    ]);
    return toTeamList(payload).map(mapTeamItem).filter(Boolean);
  } catch (error) {
    console.error('getTeamSearchData failed:', error?.message || error);
    return [];
  }
};

export const getTopTeamsData = async () => {
  const preferredQueries = [
    {search: '', perPage: 12, paged: 1},
    {search: 'india', perPage: 50, paged: 1},
  ];

  for (const query of preferredQueries) {
    // eslint-disable-next-line no-await-in-loop
    const list = await getTeamSearchData(query);
    if (list.length) {
      return list.slice(0, 10);
    }
  }

  return [];
};

const mapSeriesItem = item => {
  const title = item?.title || item?.abbr || '';
  if (!title) {
    return null;
  }

  const start = String(item?.datestart || '').trim();
  const end = String(item?.dateend || '').trim();

  return {
    id: String(item?.cid || `${title}-${item?.season || ''}`),
    title: String(title),
    category: String(item?.category || '').trim(),
    status: String(item?.status || '').trim(),
    season: String(item?.season || '').trim(),
    gameFormat: String(item?.game_format || item?.match_format || '').trim(),
    dateRange: [start, end].filter(Boolean).join(' to '),
    totalMatches: String(item?.total_matches || '').trim(),
    totalTeams: String(item?.total_teams || '').trim(),
  };
};

export const getSeriesData = async ({year = new Date().getFullYear(), perPage = 40} = {}) => {
  const paths = [
    `/season/${encodeURIComponent(String(year))}/competitionlist?paged=1&per_page=${encodeURIComponent(String(perPage))}`,
    `/competitions?paged=1&per_page=${encodeURIComponent(String(perPage))}`,
  ];

  try {
    const payload = await requestRapidTeamFirstSuccess(paths);
    return toArray(payload?.response?.items).map(mapSeriesItem).filter(Boolean);
  } catch {
    return [];
  }
};

const getRankingCategory = async paths => {
  try {
    const payload = await requestRapidFirstSuccess(paths);
    return toRankingList(payload).map(mapRankingItem).filter(Boolean).slice(0, 10);
  } catch {
    return [];
  }
};

export const getRankingsData = async () => {
  try {
    const [teams, batting, bowling, allRounders] = await Promise.all([
      getRankingCategory([
        '/stats/v1/rankings/teams',
        '/stats/v1/rankings/team',
        '/stats/v1/rankings/teams?formatType=odi',
      ]),
      getRankingCategory([
        '/stats/v1/rankings/batsmen',
        '/stats/v1/rankings/batting',
        '/stats/v1/rankings/batsmen?formatType=odi',
      ]),
      getRankingCategory([
        '/stats/v1/rankings/bowlers',
        '/stats/v1/rankings/bowling',
        '/stats/v1/rankings/bowlers?formatType=odi',
      ]),
      getRankingCategory([
        '/stats/v1/rankings/allrounders',
        '/stats/v1/rankings/all-rounders',
        '/stats/v1/rankings/allrounders?formatType=odi',
      ]),
    ]);

    if (teams.length || batting.length || bowling.length || allRounders.length) {
      return {
        teams,
        batting,
        bowling,
        allRounders,
      };
    }
  } catch {
    // fallback below
  }

  try {
    const payload = await requestRapidTeam('/iccranks');
    const data = payload?.response || {};

    const teams = getFirstArrayByPaths(data, [
      ['ranks', 'teams', 'odis'],
      ['ranks', 'teams', 'tests'],
      ['ranks', 'teams', 't20s'],
      ['women_ranks', 'teams', 'odis'],
      ['women_ranks', 'teams', 'tests'],
      ['women_ranks', 'teams', 't20s'],
    ])
      .map(mapRankingItemFromIcc)
      .filter(Boolean)
      .slice(0, 10);

    const batting = getFirstArrayByPaths(data, [
      ['ranks', 'batsmen', 'odis'],
      ['ranks', 'batsmen', 'tests'],
      ['ranks', 'batsmen', 't20s'],
      ['women_ranks', 'batsmen', 'odis'],
      ['women_ranks', 'batsmen', 'tests'],
      ['women_ranks', 'batsmen', 't20s'],
    ])
      .map(mapRankingItemFromIcc)
      .filter(Boolean)
      .slice(0, 10);

    const bowling = getFirstArrayByPaths(data, [
      ['ranks', 'bowlers', 'odis'],
      ['ranks', 'bowlers', 'tests'],
      ['ranks', 'bowlers', 't20s'],
      ['women_ranks', 'bowlers', 'odis'],
      ['women_ranks', 'bowlers', 'tests'],
      ['women_ranks', 'bowlers', 't20s'],
    ])
      .map(mapRankingItemFromIcc)
      .filter(Boolean)
      .slice(0, 10);

    const allRounders = getFirstArrayByPaths(data, [
      ['ranks', 'allrounders', 'odis'],
      ['ranks', 'allrounders', 'tests'],
      ['ranks', 'allrounders', 't20s'],
      ['ranks', 'all_rounders', 'odis'],
      ['ranks', 'all_rounders', 'tests'],
      ['ranks', 'all_rounders', 't20s'],
      ['women_ranks', 'allrounders', 'odis'],
      ['women_ranks', 'allrounders', 'tests'],
      ['women_ranks', 'allrounders', 't20s'],
      ['women_ranks', 'all_rounders', 'odis'],
      ['women_ranks', 'all_rounders', 'tests'],
      ['women_ranks', 'all_rounders', 't20s'],
    ])
      .map(mapRankingItemFromIcc)
      .filter(Boolean)
      .slice(0, 10);

    return {
      teams,
      batting,
      bowling,
      allRounders,
    };
  } catch {
    return {
      teams: [],
      batting: [],
      bowling: [],
      allRounders: [],
    };
  }
};

export const getNewsData = async () => {
  const adminNews = await getAdminNewsList();
  return adminNews.length ? adminNews : fallbackNews;
};

export const getNewsBySeries = async seriesName => {
  if (!String(seriesName || '').trim()) {
    return [];
  }
  return getAdminNewsList(seriesName);
};

export const getNewsDetails = async newsId => {
  const decodedId = decodeURIComponent(String(newsId || ''));
  const adminNews = await getAdminNewsList();

  const found = adminNews.find(item => item.id === decodedId);
  if (!found) {
    return null;
  }

  return {
    ...found,
    content: found.content || found.summary || '',
  };
};

const values = value => (value && typeof value === 'object' ? Object.values(value) : []);

const formatMatchDateTime = raw => {
  if (!raw) {
    return '';
  }

  const numeric = Number(raw);
  const parsed = Number.isFinite(numeric) ? new Date(numeric) : new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return parsed.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  });
};

const buildInformation = ({subtitle, status, title, teams = [], matchHeader = {}}) => {
  const venueInfo = matchHeader?.venueInfo || {};
  const venue = [venueInfo.ground, venueInfo.city].filter(Boolean).join(', ');

  const toss = [matchHeader?.tossResults?.tossWinnerName, matchHeader?.tossResults?.decision]
    .filter(Boolean)
    .join(' chose to ');

  const dateTime = formatMatchDateTime(matchHeader?.startDate || matchHeader?.matchStartTimestamp);
  const teamLine = teams.length ? teams.join(' vs ') : title;

  const entries = [
    {id: 'teams', label: 'Teams', value: teamLine},
    {id: 'series', label: 'Series', value: subtitle},
    {id: 'status', label: 'Status', value: status},
    {id: 'venue', label: 'Venue', value: venue || 'Venue TBA'},
    {id: 'toss', label: 'Toss', value: toss || 'Toss update not available'},
    {id: 'date', label: 'Date', value: dateTime || 'Date/time not available'},
    {id: 'format', label: 'Format', value: matchHeader?.matchFormat || matchHeader?.matchType || 'Cricket Match'},
  ];

  return entries.filter(item => item.value);
};

const buildCommentaryFromInnings = innings => {
  const generated = [];

  toArray(innings).forEach((inning, index) => {
    const topBatter = toArray(inning?.batting).sort((a, b) => toNumber(b?.runs) - toNumber(a?.runs))[0];
    const topBowler = toArray(inning?.bowling).sort((a, b) => toNumber(b?.wickets) - toNumber(a?.wickets))[0];
    const inningLabel = `Innings ${index + 1}`;

    if (topBatter) {
      generated.push({
        id: `${inning?.id || index}-bat`,
        over: inningLabel,
        text: `${topBatter.name} scored ${topBatter.runs} (${topBatter.balls}) for ${inning?.team || 'the batting side'}.`,
      });
    }

    if (topBowler) {
      generated.push({
        id: `${inning?.id || index}-bowl`,
        over: inningLabel,
        text: `${topBowler.name} returned ${topBowler.wickets}/${topBowler.runs} in ${topBowler.overs} overs.`,
      });
    }
  });

  if (generated.length) {
    return generated;
  }

  return [
    {
      id: 'comm-fallback-1',
      over: 'Match Update',
      text: 'Detailed ball-by-ball commentary is not available for this match yet.',
    },
  ];
};

const extractCommentary = data => {
  const list = toArray(data?.commentaryList?.commentaryList)
    .concat(toArray(data?.commentaryList))
    .concat(toArray(data?.commentary))
    .concat(toArray(data?.commLines))
    .concat(toArray(data?.overSepList));

  const mapped = list
    .map((item, index) => {
      const text =
        item?.commText ||
        item?.commentary ||
        item?.event ||
        item?.o_summary ||
        item?.headline ||
        item?.value ||
        '';

      if (!text) {
        return null;
      }

      const over = item?.overNumber ?? item?.overNum ?? item?.o_no ?? item?.inningsId ?? 'Update';
      return {
        id: String(item?.commId || item?.id || `comm-${index}`),
        over: String(over),
        text: String(text),
      };
    })
    .filter(Boolean);

  return mapped.slice(0, 36);
};

const normalizeScorecardPayload = payload => {
  const innings = toArray(payload?.innings);
  const information = toArray(payload?.information);
  const commentary = toArray(payload?.commentary);

  return {
    ...payload,
    innings,
    information: information.length
      ? information
      : buildInformation({
          subtitle: payload?.subtitle || 'Match Center',
          status: payload?.status || 'Live updates',
          title: payload?.title || 'Match',
          teams: toArray(payload?.teams),
          matchHeader: payload?.matchHeader || {},
        }),
    commentary: commentary.length ? commentary : buildCommentaryFromInnings(innings),
  };
};

const getFallbackScorecardById = matchId => {
  const exact = fallbackScorecards[String(matchId)];
  if (exact) {
    return exact;
  }
  const legacyMap = {m1: '40381', m2: '40382'};
  const mapped = fallbackScorecards[legacyMap[String(matchId)]];
  if (mapped) {
    return mapped;
  }
  return null;
};

const buildPlaceholderInnings = (idPrefix, teamName, score = '- / - (-)') => {
  return {
    id: `${idPrefix}-${teamName}`,
    team: teamName,
    score,
    runRate: 0,
    batting: [
      {
        id: `${idPrefix}-bat-1`,
        name: 'Top Order Batter',
        dismissal: 'not available',
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
      },
      {
        id: `${idPrefix}-bat-2`,
        name: 'Middle Order Batter',
        dismissal: 'not available',
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
      },
    ],
    bowling: [
      {
        id: `${idPrefix}-bowl-1`,
        name: 'Frontline Bowler',
        overs: '0',
        runs: 0,
        wickets: 0,
        economy: 0,
      },
      {
        id: `${idPrefix}-bowl-2`,
        name: 'Support Bowler',
        overs: '0',
        runs: 0,
        wickets: 0,
        economy: 0,
      },
    ],
  };
};

const buildGenericScorecard = ({matchId, title, subtitle, status, teams = []}) => {
  const teamA = teams[0] || 'Team A';
  const teamB = teams[1] || 'Team B';
  return normalizeScorecardPayload({
    id: String(matchId),
    title: title || `${teamA} vs ${teamB}`,
    subtitle: subtitle || 'Scorecard generated from available match data',
    status: status || 'Live updates',
    teams: [teamA, teamB],
    matchHeader: {},
    innings: [
      buildPlaceholderInnings(`${matchId}-1`, teamA),
      buildPlaceholderInnings(`${matchId}-2`, teamB),
    ],
  });
};

const getMatchScorecardFromTeamProvider = async matchId => {
  const [infoPayload, statsPayload] = await Promise.all([
    requestRapidTeam(`/matches/${matchId}/info`),
    requestRapidTeam(`/matches/${matchId}/statistics`),
  ]);

  const info = infoPayload?.response || {};
  const stats = statsPayload?.response || {};
  const liveData = info?.live_data || {};

  const teamById = new Map(toArray(stats?.teams).map(team => [String(team?.team_id), team]));
  const playerById = new Map(toArray(stats?.players).map(player => [String(player?.player_id), player]));
  const liveBattersById = new Map(
    toArray(liveData?.batsmen).map(player => [
      String(player?.batsman_id),
      {
        id: String(player?.batsman_id || player?.name || Math.random()),
        name: String(player?.name || playerById.get(String(player?.batsman_id))?.name || 'Batter'),
        dismissal: 'not out',
        runs: toNumber(player?.runs),
        balls: toNumber(player?.balls_faced),
        fours: toNumber(player?.fours),
        sixes: toNumber(player?.sixes),
      },
    ])
  );

  const liveBowling = toArray(liveData?.bowlers).map((player, index) => ({
    id: String(player?.bowler_id || `live-bowl-${index}`),
    name: String(player?.name || playerById.get(String(player?.bowler_id))?.name || 'Bowler'),
    overs: String(player?.overs ?? '0'),
    runs: toNumber(player?.runs_conceded),
    wickets: toNumber(player?.wickets),
    economy: toNumber(player?.econ),
  }));

  const innings = toArray(stats?.innings).map((inning, index) => {
    const battingFromFow = toArray(inning?.fows).map((dismissal, rowIndex) => ({
      id: String(dismissal?.batsman_id || `${index}-bat-${rowIndex}`),
      name: String(playerById.get(String(dismissal?.batsman_id))?.name || 'Batter'),
      dismissal: String(dismissal?.how_out || 'out'),
      runs: toNumber(dismissal?.runs),
      balls: toNumber(dismissal?.balls_faced),
      fours: 0,
      sixes: 0,
    }));

    const mergedBatting = [
      ...Array.from(liveBattersById.values()),
      ...battingFromFow.filter(item => !liveBattersById.has(String(item?.id))),
    ];

    const inningsRunRates = toArray(inning?.statistics?.runrates);
    const runRate =
      inningsRunRates.length && inningsRunRates[inningsRunRates.length - 1]?.runrate != null
        ? toNumber(inningsRunRates[inningsRunRates.length - 1]?.runrate)
        : 0;

    const teamName =
      teamById.get(String(inning?.batting_team_id))?.short_name ||
      teamById.get(String(inning?.batting_team_id))?.name ||
      `Team ${index + 1}`;

    const liveInningNumber = toNumber(liveData?.live_inning_number);
    const bowling = liveInningNumber === toNumber(inning?.number) ? liveBowling : [];

    return {
      id: String(inning?.inning_id || index),
      team: teamName,
      score: `${inning?.runs ?? '-'} / ${inning?.wickets ?? '-'} (${inning?.overs ?? '-'})`,
      runRate,
      batting: mergedBatting.slice(0, 11),
      bowling,
    };
  });

  let commentary = toArray(liveData?.commentaries)
    .map((item, index) => ({
      id: String(item?.event_id || `team-comm-${index}`),
      over: `${item?.over ?? ''}.${item?.ball ?? ''}`.replace(/\.$/, '') || 'Update',
      text: String(item?.commentary || item?.text || '').trim(),
    }))
    .filter(item => item.text)
    .slice(0, 48);

  if (!commentary.length) {
    const inningsIds = toArray(stats?.innings)
      .map(inning => inning?.inning_id)
      .filter(Boolean)
      .slice(0, 2);

    for (const inningId of inningsIds) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const payload = await requestRapidTeam(`/matches/${matchId}/innings/${inningId}/commentary`);
        const items = toArray(payload?.response?.items)
          .map((item, index) => ({
            id: String(item?.event_id || `${inningId}-comm-${index}`),
            over: `${item?.over ?? ''}.${item?.ball ?? ''}`.replace(/\.$/, '') || 'Update',
            text: String(item?.commentary || item?.text || '').trim(),
          }))
          .filter(item => item.text);

        if (items.length) {
          commentary = items.slice(0, 48);
          break;
        }
      } catch {
        // ignore and continue with derived commentary fallback
      }
    }
  }

  const team1Name = info?.teama?.name || 'Team 1';
  const team2Name = info?.teamb?.name || 'Team 2';
  const subtitle = info?.competition?.title || info?.subtitle || 'Match Center';
  const venue = [info?.venue?.name, info?.venue?.location].filter(Boolean).join(', ');
  const dateTime = formatMatchDateTime(info?.timestamp_start ? Number(info.timestamp_start) * 1000 : info?.date_start_ist);

  const information = [
    {id: 'teams', label: 'Teams', value: `${team1Name} vs ${team2Name}`},
    {id: 'series', label: 'Series', value: subtitle},
    {id: 'status', label: 'Status', value: info?.result || info?.live || info?.status_note || info?.status_str || '-'},
    {id: 'venue', label: 'Venue', value: venue || 'Venue TBA'},
    {id: 'toss', label: 'Toss', value: info?.toss?.text || 'Toss update not available'},
    {id: 'date', label: 'Date', value: dateTime || 'Date/time not available'},
    {id: 'format', label: 'Format', value: info?.format_str || 'Cricket Match'},
  ].filter(item => item.value);

  return normalizeScorecardPayload({
    id: String(matchId),
    title: info?.title || `${team1Name} vs ${team2Name}`,
    subtitle,
    status: info?.result || info?.status_note || info?.status_str || 'Live updates',
    teams: [team1Name, team2Name],
    information,
    innings,
    commentary,
  });
};

export const getMatchScorecardData = async matchId => {
  try {
    const data = await requestRapidFirstSuccess([
      `/mcenter/v1/${matchId}/scard`,
      `/mcenter/v1/${matchId}/scorecard`,
      `/mcenter/v1/${matchId}/hscard`,
    ]);

    const scoreCard = toArray(data?.scoreCard);
    const innings = scoreCard.map((inningsItem, index) => {
      const scoreDetails = inningsItem?.scoreDetails || {};
      const batTeamDetails = inningsItem?.batTeamDetails || {};
      const bowlTeamDetails = inningsItem?.bowlTeamDetails || {};

      const batting = values(batTeamDetails?.batsmenData).map((batter, batterIndex) => ({
        id: String(batter?.batId || `${index}-bat-${batterIndex}`),
        name: batter?.batName || 'Batter',
        dismissal: batter?.outDesc || batter?.outStr || 'not out',
        runs: toNumber(batter?.runs),
        balls: toNumber(batter?.balls),
        fours: toNumber(batter?.fours),
        sixes: toNumber(batter?.sixes),
      }));

      const bowling = values(bowlTeamDetails?.bowlersData).map((bowler, bowlerIndex) => ({
        id: String(bowler?.bowlId || `${index}-bowl-${bowlerIndex}`),
        name: bowler?.bowlName || 'Bowler',
        overs: String(bowler?.overs ?? '0'),
        runs: toNumber(bowler?.runs),
        wickets: toNumber(bowler?.wickets),
        economy: toNumber(bowler?.economy),
      }));

      return {
        id: String(inningsItem?.inningsId || index),
        team: batTeamDetails?.batTeamName || batTeamDetails?.batTeamShortName || `Team ${index + 1}`,
        score: `${scoreDetails?.runs ?? '-'} / ${scoreDetails?.wickets ?? '-'} (${scoreDetails?.overs ?? '-'})`,
        runRate: toNumber(scoreDetails?.runRate),
        batting,
        bowling,
      };
    });

    let commentary = [];
    try {
      const commentaryRaw = await requestRapidFirstSuccess([
        `/mcenter/v1/${matchId}/comm`,
        `/mcenter/v1/${matchId}/commentary`,
      ]);
      commentary = extractCommentary(commentaryRaw);
    } catch {
      commentary = [];
    }

    const teams = [data?.matchHeader?.team1?.name, data?.matchHeader?.team2?.name].filter(Boolean);
    const response = normalizeScorecardPayload({
      id: String(matchId),
      title: `${data?.matchHeader?.team1?.name || 'Team 1'} vs ${data?.matchHeader?.team2?.name || 'Team 2'}`,
      subtitle: data?.matchHeader?.seriesName || data?.matchHeader?.matchDescription || 'Match Center',
      status: data?.matchHeader?.status || 'Live updates',
      teams,
      matchHeader: data?.matchHeader || {},
      innings,
      commentary,
    });

    if (!response.innings.length) {
      try {
        return await getMatchScorecardFromTeamProvider(matchId);
      } catch {
        return (
          normalizeScorecardPayload(getFallbackScorecardById(matchId)) ||
          buildGenericScorecard({
            matchId,
            title: response.title,
            subtitle: response.subtitle,
            status: response.status,
            teams,
          })
        );
      }
    }

    return response;
  } catch {
    try {
      return await getMatchScorecardFromTeamProvider(matchId);
    } catch {
      return (
        normalizeScorecardPayload(getFallbackScorecardById(matchId)) ||
        buildGenericScorecard({
          matchId,
          title: 'Match Center',
          subtitle: 'Scorecard generated from fallback data',
          status: 'Live updates',
        })
      );
    }
  }
};
