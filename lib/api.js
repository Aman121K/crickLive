import {
  fallbackFinishedMatches,
  fallbackLiveMatches,
  fallbackNews,
  fallbackScorecards,
  fallbackUpcomingMatches,
} from '@/lib/fallbackData';

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
const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.criclive.app').replace(/\/$/, '');
const SPORTMONKS_MATCH_INCLUDE = 'localteam,visitorteam,league,venue,runs,scoreboards,participants';

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
  const parsedDate = Number.isNaN(timestamp) ? new Date(startDate) : new Date(timestamp);
  if (Number.isNaN(parsedDate.getTime())) {
    return '-';
  }

  return parsedDate.toLocaleString('en-IN', {
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

const requestSportMonks = async (path, {revalidate = 60} = {}) => {
  if (!SPORTMONKS_AUTH_TOKEN) {
    throw new Error('SPORTMONKS_AUTH_TOKEN (or SPORTMONKS_TOKEN) is not configured');
  }

  const response = await fetch(`${SPORTMONKS_BASE_URL}${path}`, {
    method: 'GET',
    headers: {
      Authorization: SPORTMONKS_AUTH_TOKEN,
    },
    next: {revalidate},
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`SportMonks ${response.status} for ${path}${errorBody ? ` - ${errorBody.slice(0, 200)}` : ''}`);
  }

  return response.json();
};

const requestSportMonksFirstSuccess = async paths => {
  let lastError = null;

  for (const path of paths) {
    try {
      // eslint-disable-next-line no-await-in-loop
      return await requestSportMonks(path);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('All SportMonks endpoints failed');
};

const getSportMonksDataList = payload => {
  const candidates = [
    payload?.data,
    payload?.data?.data,
    payload?.response?.items,
    payload?.response,
    payload?.items,
    payload?.results,
    payload,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
    if (candidate && typeof candidate === 'object') {
      const values = Object.values(candidate);
      if (values.length && values.every(value => value && typeof value === 'object')) {
        return values;
      }
    }
  }

  return [];
};

const mapSportMonksStatus = (fixture, fallbackStatus = 'UPCOMING') => {
  const text = [
    fixture?.status,
    fixture?.live,
    fixture?.status_note,
    fixture?.note,
    fixture?.stage?.name,
    fixture?.round,
  ]
    .map(value => String(value || '').toLowerCase())
    .join(' ');

  if (fixture?.live === true || fixture?.is_live === true) {
    return 'LIVE';
  }
  if (/(live|inning|progress|delay|stump|break)/.test(text)) {
    return 'LIVE';
  }
  if (/(finished|result|won|draw|abandon|cancel|complete)/.test(text)) {
    return 'RESULT';
  }
  if (/(ns|scheduled|upcoming|not started|toss)/.test(text)) {
    return 'UPCOMING';
  }

  return fallbackStatus;
};

const getFixtureTeam = (fixture, side) => {
  const key = side === 'home' ? ['localteam', 'home', 'team1'] : ['visitorteam', 'away', 'team2'];

  for (const item of key) {
    const picked = fixture?.[item];
    if (picked?.data) {
      return picked.data;
    }
    if (picked && typeof picked === 'object') {
      return picked;
    }
  }

  const participants = toArray(fixture?.participants?.data || fixture?.participants);
  const homeParticipant = participants.find(item => String(item?.meta?.position || '').toLowerCase() === 'home');
  const awayParticipant = participants.find(item => String(item?.meta?.position || '').toLowerCase() === 'away');
  if (side === 'home' && homeParticipant) {
    return homeParticipant;
  }
  if (side === 'away' && awayParticipant) {
    return awayParticipant;
  }
  if (side === 'home' && participants[0]) {
    return participants[0];
  }
  if (side === 'away' && participants[1]) {
    return participants[1];
  }

  return {};
};

const getFixtureRuns = fixture => {
  return toArray(fixture?.runs?.data || fixture?.runs).filter(Boolean);
};

const getFixtureScoreboards = fixture => {
  return toArray(fixture?.scoreboards?.data || fixture?.scoreboards).filter(Boolean);
};

const getLatestScoreboardForTeam = (scoreboards, teamId) => {
  if (!teamId) {
    return null;
  }
  const teamBoards = scoreboards.filter(board => String(board?.team_id || board?.team?.id || '') === String(teamId));
  if (!teamBoards.length) {
    return null;
  }
  return teamBoards[teamBoards.length - 1];
};

const formatSportMonksRun = run => {
  if (!run) {
    return '';
  }
  const runs = run.score ?? run.runs;
  const wickets = run.wickets ?? run.wicket;
  const overs = run.overs;
  if (runs == null && wickets == null && overs == null) {
    return '';
  }
  return `${runs ?? '-'}${wickets != null ? `/${wickets}` : ''}${overs != null ? ` (${overs})` : ''}`;
};

const mapMatchFromSportMonks = (fixture, fallbackStatus = 'UPCOMING') => {
  const localTeam = getFixtureTeam(fixture, 'home');
  const visitorTeam = getFixtureTeam(fixture, 'away');
  const localTeamName = localTeam?.name || localTeam?.code || 'TBD';
  const visitorTeamName = visitorTeam?.name || visitorTeam?.code || 'TBD';
  const localTeamId = String(localTeam?.id || fixture?.localteam_id || '');
  const visitorTeamId = String(visitorTeam?.id || fixture?.visitorteam_id || '');
  const runs = getFixtureRuns(fixture);
  const scoreboards = getFixtureScoreboards(fixture);
  const localRun = runs.find(item => String(item?.team_id || item?.team?.id || '') === localTeamId);
  const visitorRun = runs.find(item => String(item?.team_id || item?.team?.id || '') === visitorTeamId);
  const localBoard = getLatestScoreboardForTeam(scoreboards, localTeamId);
  const visitorBoard = getLatestScoreboardForTeam(scoreboards, visitorTeamId);
  const status = mapSportMonksStatus(fixture, fallbackStatus);
  const startTime = formatMatchStart(fixture?.starting_at || fixture?.starting_at_timestamp);

  const score1 =
    formatSportMonksRun(localRun) ||
    formatSportMonksRun(localBoard) ||
    (status === 'UPCOMING' ? startTime : '-');
  const score2 =
    formatSportMonksRun(visitorRun) ||
    formatSportMonksRun(visitorBoard) ||
    String(fixture?.note || fixture?.status_note || fixture?.status || '').trim() ||
    (status === 'UPCOMING' ? 'Upcoming' : '-');

  const venue = fixture?.venue?.data || fixture?.venue || {};
  const league = fixture?.league?.data || fixture?.league || {};

  return {
    id: String(fixture?.id || `${localTeamName}-${visitorTeamName}-${fixture?.starting_at || Math.random()}`),
    series: league?.name || fixture?.round || fixture?.type || 'Match',
    status,
    teams: [localTeamName, visitorTeamName],
    scores: [score1, score2],
    venue: [venue?.name, venue?.city].filter(Boolean).join(', ') || 'Venue TBA',
  };
};

const getSportMonksFixtures = async ({filter = '', perPage = 20, include = ''} = {}) => {
  const encodedFilter = String(filter || '').trim();
  const encodedInclude = String(include || '').trim();
  const paths = [
    `/fixtures?per_page=${encodeURIComponent(String(perPage))}${
      encodedFilter ? `&filter[status]=${encodeURIComponent(encodedFilter)}` : ''
    }${encodedInclude ? `&include=${encodeURIComponent(encodedInclude)}` : ''}`,
    `/fixtures?per_page=${encodeURIComponent(String(perPage))}${encodedInclude ? `&include=${encodeURIComponent(encodedInclude)}` : ''}`,
  ];

  const payload = await requestSportMonksFirstSuccess(paths);
  return getSportMonksDataList(payload).map(item => mapMatchFromSportMonks(item, 'UPCOMING'));
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
  const countryData = item?.country?.data || item?.country || {};
  const name = item?.name || item?.team_name || item?.teamName || item?.team?.name || item?.title;
  if (!name) {
    return null;
  }

  return {
    id: String(item?.id || item?.team_id || item?.teamId || name),
    name: String(name),
    shortName: String(item?.short_code || item?.short_name || item?.shortName || item?.abbr || item?.code || '').trim(),
    country: String(countryData?.name || item?.country_name || item?.region || '').trim(),
    type: String(item?.resource || item?.type || item?.match_type || item?.format || '').trim(),
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
    return '';
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
    const include = SPORTMONKS_MATCH_INCLUDE;
    const liveRaw = await requestSportMonksFirstSuccess([
      `/livescores?include=${encodeURIComponent(include)}`,
      `/livescores?include=${encodeURIComponent('scoreboards,localteam,visitorteam,league,venue,participants')}`,
      `/fixtures?filter[status]=LIVE&per_page=20&include=${encodeURIComponent(include)}`,
      `/fixtures?per_page=60&include=${encodeURIComponent(include)}`,
    ]);
    const [upcomingRaw, recentRaw] = await Promise.all([
      requestSportMonksFirstSuccess([
        `/fixtures?filter[status]=NS&per_page=20&include=${encodeURIComponent(include)}`,
        `/fixtures?filter[status]=SCHEDULED&per_page=20&include=${encodeURIComponent(include)}`,
        `/fixtures/date/${encodeURIComponent(new Date().toISOString().slice(0, 10))}?include=${encodeURIComponent(include)}`,
      ]),
      requestSportMonksFirstSuccess([
        `/fixtures?filter[status]=FINISHED&per_page=20&include=${encodeURIComponent(include)}`,
        `/fixtures?filter[status]=COMPLETED&per_page=20&include=${encodeURIComponent(include)}`,
      ]),
    ]);

    const liveAll = getSportMonksDataList(liveRaw)
      .map(item => ({...mapMatchFromSportMonks(item, 'LIVE'), status: 'LIVE'}))
      .filter(item => item.teams?.[0] && item.teams?.[1]);
    const live = liveAll.slice(0, 6);
    const upcoming = getSportMonksDataList(upcomingRaw)
      .map(item => mapMatchFromSportMonks(item, 'UPCOMING'))
      .filter(item => item.teams?.[0] && item.teams?.[1])
      .slice(0, 6);
    const finished = getSportMonksDataList(recentRaw).map(item => mapMatchFromSportMonks(item, 'RESULT')).slice(0, 6);

    return {
      live: live.length ? live : fallbackLiveMatches,
      upcoming: upcoming.length ? upcoming : fallbackUpcomingMatches,
      finished: finished.length ? finished : fallbackFinishedMatches,
    };
  } catch (primaryError) {
    try {
      const generic = await getSportMonksFixtures({perPage: 60, include: SPORTMONKS_MATCH_INCLUDE});

      const live = generic.filter(match => match.status === 'LIVE').slice(0, 6);
      const upcoming = generic.filter(match => match.status === 'UPCOMING').slice(0, 6);
      const finished = generic.filter(match => match.status === 'RESULT').slice(0, 6);

      return {
        live: live.length ? live : fallbackLiveMatches,
        upcoming: upcoming.length ? upcoming : fallbackUpcomingMatches,
        finished: finished.length ? finished : fallbackFinishedMatches,
      };
    } catch (fallbackError) {
      console.error('getMatchesData failed:', primaryError?.message || primaryError, fallbackError?.message || fallbackError);
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
    const payload = await requestSportMonksFirstSuccess([
      `/teams?filter[name]=${encodeURIComponent(String(search))}&page=${encodeURIComponent(String(paged))}&per_page=${encodeURIComponent(String(perPage))}`,
      `/teams?search=${encodeURIComponent(String(search))}&page=${encodeURIComponent(String(paged))}&per_page=${encodeURIComponent(String(perPage))}`,
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
  const season = item?.season?.data || item?.currentseason?.data || item?.season || {};
  const title = item?.name || item?.title || item?.abbr || '';
  if (!title) {
    return null;
  }

  const start = String(season?.start_date || item?.datestart || '').trim();
  const end = String(season?.end_date || item?.dateend || '').trim();

  return {
    id: String(item?.id || item?.cid || `${title}-${season?.name || season?.id || ''}`),
    title: String(title),
    category: String(item?.resource || item?.category || '').trim(),
    status: String(item?.status || '').trim(),
    season: String(season?.name || item?.season || '').trim(),
    gameFormat: String(item?.code || item?.game_format || item?.match_format || '').trim(),
    dateRange: [start, end].filter(Boolean).join(' to '),
    totalMatches: String(item?.total_matches || item?.fixtures_count || '').trim(),
    totalTeams: String(item?.total_teams || item?.teams_count || '').trim(),
  };
};

export const getSeriesData = async ({year = new Date().getFullYear(), perPage = 40} = {}) => {
  const paths = [
    `/leagues?include=season&page=1&per_page=${encodeURIComponent(String(perPage))}`,
    `/seasons?filter[year]=${encodeURIComponent(String(year))}&page=1&per_page=${encodeURIComponent(String(perPage))}`,
  ];

  try {
    const payload = await requestSportMonksFirstSuccess(paths);
    return getSportMonksDataList(payload).map(mapSeriesItem).filter(Boolean);
  } catch {
    return [];
  }
};

const mapPlayerItem = item => {
  const countryData = item?.country?.data || item?.country || {};
  const teamData = item?.team?.data || item?.team || {};
  const name = item?.fullname || item?.name;
  if (!name) {
    return null;
  }

  return {
    id: String(item?.id || name),
    name: String(name),
    country: String(countryData?.name || '').trim(),
    team: String(teamData?.name || '').trim(),
    role: String(item?.position?.name || item?.position || '').trim(),
  };
};

export const getPlayersData = async ({search = '', perPage = 50} = {}) => {
  const nameFilter = String(search || '').trim();
  const paths = [
    nameFilter
      ? `/players?filter[fullname]=${encodeURIComponent(nameFilter)}&per_page=${encodeURIComponent(String(perPage))}`
      : '',
    `/players?per_page=${encodeURIComponent(String(perPage))}`,
  ].filter(Boolean);

  try {
    const payload = await requestSportMonksFirstSuccess(paths);
    return getSportMonksDataList(payload).map(mapPlayerItem).filter(Boolean);
  } catch (error) {
    console.error('getPlayersData failed:', error?.message || error);
    return [];
  }
};

const getFirstSeasonId = async () => {
  try {
    const payload = await requestSportMonksFirstSuccess(['/leagues?include=season&per_page=50', '/leagues?per_page=50']);
    const leagues = getSportMonksDataList(payload);
    for (const league of leagues) {
      const season = league?.season?.data || league?.currentseason?.data || league?.season;
      if (season?.id) {
        return String(season.id);
      }
      if (league?.season_id) {
        return String(league.season_id);
      }
    }
  } catch {
    // ignore
  }
  return '';
};

const mapStandingItem = item => {
  const teamData = item?.team?.data || item?.team || {};
  const name = teamData?.name || item?.name;
  if (!name) {
    return null;
  }

  return {
    rank: toNumber(item?.position || item?.rank || item?.standing || 0) || null,
    name: String(name),
    rating: String(item?.points ?? item?.total ?? item?.value ?? '-'),
    format: 'STANDINGS',
  };
};

const getRankingCategory = async (paths, category = '') => {
  try {
    const payload = await requestSportMonksFirstSuccess(paths);
    return toRankingList(payload)
      .map(item => {
        const mapped = mapRankingItem(item);
        if (!mapped) {
          return null;
        }
        if (category) {
          mapped.format = mapped.format || category.toUpperCase();
        }
        return mapped;
      })
      .filter(Boolean)
      .slice(0, 10);
  } catch {
    return [];
  }
};

export const getRankingsData = async () => {
  try {
    const [teams, batting, bowling, allRounders] = await Promise.all([
      getRankingCategory(['/team-rankings', '/rankings/teams'], 'Teams'),
      getRankingCategory(['/player-rankings?filter[type]=batsman', '/rankings/batsmen'], 'Batting'),
      getRankingCategory(['/player-rankings?filter[type]=bowler', '/rankings/bowlers'], 'Bowling'),
      getRankingCategory(['/player-rankings?filter[type]=allrounder', '/rankings/allrounders'], 'All Rounder'),
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
    const seasonId = await getFirstSeasonId();
    if (seasonId) {
      const standingsPayload = await requestSportMonksFirstSuccess([`/standings/season/${encodeURIComponent(seasonId)}`]);
      const teams = getSportMonksDataList(standingsPayload).map(mapStandingItem).filter(Boolean).slice(0, 10);
      if (teams.length) {
        return {
          teams,
          batting: [],
          bowling: [],
          allRounders: [],
        };
      }
    }
  } catch {
    // ignore and return empty below
  }

  return {
    teams: [],
    batting: [],
    bowling: [],
    allRounders: [],
  };
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

const mapSportMonksPlayerName = row => {
  return (
    row?.player?.data?.fullname ||
    row?.player?.data?.name ||
    row?.player?.fullname ||
    row?.player?.name ||
    row?.fullname ||
    row?.name ||
    'Player'
  );
};

const mapSportMonksBattingRow = (row, rowIndex, inningId) => ({
  id: String(row?.id || row?.player_id || `${inningId}-bat-${rowIndex}`),
  name: String(mapSportMonksPlayerName(row)),
  dismissal: String(row?.result || row?.how_out || row?.dismissal || 'not out'),
  runs: toNumber(row?.score ?? row?.runs),
  balls: toNumber(row?.ball ?? row?.balls),
  fours: toNumber(row?.four_x ?? row?.fours),
  sixes: toNumber(row?.six_x ?? row?.sixes),
});

const mapSportMonksBowlingRow = (row, rowIndex, inningId) => ({
  id: String(row?.id || row?.player_id || `${inningId}-bowl-${rowIndex}`),
  name: String(mapSportMonksPlayerName(row)),
  overs: String(row?.overs ?? row?.o ?? '0'),
  runs: toNumber(row?.runs),
  wickets: toNumber(row?.wickets ?? row?.w),
  economy: toNumber(row?.rate ?? row?.economy ?? row?.econ),
});

const getMatchScorecardFromTeamProvider = async matchId => {
  const payload = await requestSportMonks(
    `/fixtures/${encodeURIComponent(String(matchId))}?include=${encodeURIComponent(
      'localteam,visitorteam,runs,venue,league,batting,bowling,balls'
    )}`
  );
  const fixture = payload?.data || {};
  const localTeam = getFixtureTeam(fixture, 'home');
  const visitorTeam = getFixtureTeam(fixture, 'away');
  const localTeamName = localTeam?.name || 'Team 1';
  const visitorTeamName = visitorTeam?.name || 'Team 2';
  const localTeamId = String(localTeam?.id || fixture?.localteam_id || '');
  const visitorTeamId = String(visitorTeam?.id || fixture?.visitorteam_id || '');
  const runs = getFixtureRuns(fixture);
  const battingRows = toArray(fixture?.batting?.data || fixture?.batting);
  const bowlingRows = toArray(fixture?.bowling?.data || fixture?.bowling);

  const inningsFromRuns = runs.map((run, index) => {
    const runTeamId = String(run?.team_id || run?.team?.id || '');
    const inningId = String(run?.id || run?.inning || run?.inning_id || `${matchId}-inn-${index}`);
    const inningRef = String(run?.inning || run?.inning_id || '');
    const inningBatting = battingRows.filter(row => {
      const rowTeamId = String(row?.team_id || '');
      const rowInningRef = String(row?.inning || row?.inning_id || '');
      if (inningRef && rowInningRef) {
        return rowInningRef === inningRef;
      }
      return rowTeamId && rowTeamId === runTeamId;
    });
    const inningBowling = bowlingRows.filter(row => {
      const rowTeamId = String(row?.team_id || '');
      const rowInningRef = String(row?.inning || row?.inning_id || '');
      if (inningRef && rowInningRef) {
        return rowInningRef === inningRef && rowTeamId !== runTeamId;
      }
      return rowTeamId && rowTeamId !== runTeamId;
    });

    const teamName =
      runTeamId === localTeamId ? localTeamName : runTeamId === visitorTeamId ? visitorTeamName : `Team ${index + 1}`;

    return {
      id: inningId,
      team: teamName,
      score: `${run?.score ?? '-'} / ${run?.wickets ?? '-'} (${run?.overs ?? '-'})`,
      runRate: toNumber(run?.run_rate ?? run?.rate),
      batting: inningBatting.map((row, rowIndex) => mapSportMonksBattingRow(row, rowIndex, inningId)).slice(0, 11),
      bowling: inningBowling.map((row, rowIndex) => mapSportMonksBowlingRow(row, rowIndex, inningId)).slice(0, 11),
    };
  });

  const innings =
    inningsFromRuns.length > 0
      ? inningsFromRuns.slice(0, 2)
      : [
          buildPlaceholderInnings(`${matchId}-1`, localTeamName),
          buildPlaceholderInnings(`${matchId}-2`, visitorTeamName),
        ];

  const commentary = toArray(fixture?.balls?.data || fixture?.balls)
    .map((item, index) => ({
      id: String(item?.id || `ball-${index}`),
      over: `${item?.over ?? ''}.${item?.ball ?? ''}`.replace(/\.$/, '') || 'Update',
      text: String(item?.commentary || item?.comment || item?.note || '').trim(),
    }))
    .filter(item => item.text)
    .slice(0, 48);

  const league = fixture?.league?.data || fixture?.league || {};
  const venue = fixture?.venue?.data || fixture?.venue || {};
  const tossWinnerId = String(fixture?.toss_won_team_id || '');
  const tossWinnerName = tossWinnerId === localTeamId ? localTeamName : tossWinnerId === visitorTeamId ? visitorTeamName : '';
  const tossDecision = String(fixture?.elected || fixture?.toss_decision || '').trim();

  const information = [
    {id: 'teams', label: 'Teams', value: `${localTeamName} vs ${visitorTeamName}`},
    {id: 'series', label: 'Series', value: league?.name || 'Match Center'},
    {id: 'status', label: 'Status', value: fixture?.note || fixture?.status_note || fixture?.status || '-'},
    {id: 'venue', label: 'Venue', value: [venue?.name, venue?.city].filter(Boolean).join(', ') || 'Venue TBA'},
    {
      id: 'toss',
      label: 'Toss',
      value: tossWinnerName ? `${tossWinnerName}${tossDecision ? ` chose to ${tossDecision}` : ' won the toss'}` : 'Toss update not available',
    },
    {id: 'date', label: 'Date', value: formatMatchDateTime(fixture?.starting_at || fixture?.starting_at_timestamp)},
    {id: 'format', label: 'Format', value: fixture?.type || 'Cricket Match'},
  ].filter(item => item.value);

  return normalizeScorecardPayload({
    id: String(matchId),
    title: `${localTeamName} vs ${visitorTeamName}`,
    subtitle: league?.name || 'Match Center',
    status: fixture?.note || fixture?.status_note || fixture?.status || 'Live updates',
    teams: [localTeamName, visitorTeamName],
    information,
    innings,
    commentary,
  });
};

export const getMatchScorecardData = async matchId => {
  try {
    const response = await getMatchScorecardFromTeamProvider(matchId);
    if (response?.innings?.length) {
      return response;
    }
  } catch {
    // handled by fallback below
  }

  const fallbackById = normalizeScorecardPayload(getFallbackScorecardById(matchId));
  if (fallbackById) {
    return fallbackById;
  }

  const matches = await getMatchesData();
  const candidate = [...toArray(matches?.live), ...toArray(matches?.upcoming), ...toArray(matches?.finished)].find(
    item => String(item?.id) === String(matchId)
  );

  return buildGenericScorecard({
    matchId,
    title: candidate?.teams?.length ? `${candidate.teams[0]} vs ${candidate.teams[1]}` : 'Match Center',
    subtitle: candidate?.series || 'Scorecard generated from available match data',
    status: candidate?.scores?.[1] || 'Live updates',
    teams: candidate?.teams || [],
  });
};
