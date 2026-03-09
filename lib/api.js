import {
  fallbackFinishedMatches,
  fallbackLiveMatches,
  fallbackNews,
  fallbackScorecards,
  fallbackUpcomingMatches,
} from '@/lib/fallbackData';

const RAPID_BASE_URL = 'https://cricbuzz-cricket.p.rapidapi.com';
const RAPID_API_HOST = process.env.RAPID_API_HOST || 'cricbuzz-cricket.p.rapidapi.com';
// Keep same default key behavior as current mobile implementation.
const RAPID_API_KEY = process.env.RAPID_API_KEY || '6969b871a9msh000521c32b1613ep15b0a9jsnc287194825bd';
const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000').replace(/\/$/, '');

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
    throw new Error('RAPID_API_KEY not configured');
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
    throw new Error(`Rapid API ${response.status}`);
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

const mapRapidNews = data => {
  const storyList = toArray(data?.storyList);
  return storyList
    .map(item => item?.story)
    .filter(Boolean)
    .map(story => ({
      id: `rapid-${String(story.id || story.storyId || Math.random())}`,
      title: story.hline || story.intro || 'Cricket update',
      summary: story.intro || '',
      content: story.intro || '',
      tag: story.source || 'NEWS',
      time: formatRelativeTime(story.pubTime),
      imageUrl: resolveImageUrl(
        story.imageId || story.imageID || story.coverImage || story.imageUrl || story.image
      ),
      thumbnailUrl: '',
    }));
};

const getRapidNewsList = async () => {
  return requestRapidFirstSuccess(['/news/list', '/news/v1/index'])
    .then(mapRapidNews)
    .catch(() => []);
};

const getAdminNewsList = async () => {
  return fetch(`${BACKEND_URL}/api/news/public`, {next: {revalidate: 60}})
    .then(async response => {
      if (!response.ok) {
        throw new Error('Failed to fetch admin news');
      }
      const payload = await response.json();
      return toArray(payload?.items).map(item => ({
        id: `admin-${String(item._id || Math.random())}`,
        title: item.title || 'Cricket update',
        summary: item.summary || '',
        content: item.content || '',
        tag: item.tag || 'MYCRICKET',
        time: formatRelativeTime(item.createdAt),
        imageUrl: item.imageUrl || '',
        thumbnailUrl: item.thumbnailUrl || '',
      }));
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
  } catch {
    return {
      live: fallbackLiveMatches,
      upcoming: fallbackUpcomingMatches,
      finished: fallbackFinishedMatches,
    };
  }
};

export const getNewsData = async () => {
  const [rapidNews, adminNews] = await Promise.all([getRapidNewsList(), getAdminNewsList()]);

  const merged = [...adminNews, ...rapidNews];
  return merged.length ? merged : fallbackNews;
};

const getRapidNewsDetail = async rapidId => {
  try {
    const detail = await requestRapidFirstSuccess([
      `/news/v1/detail/${rapidId}`,
      `/news/v1/detail?storyId=${rapidId}`,
    ]);

    const story =
      detail?.story ||
      detail?.content ||
      detail?.data ||
      detail?.storyList?.[0]?.story ||
      {};

    return {
      content:
        story?.content?.contentValue ||
        story?.content?.content ||
        story?.intro ||
        story?.hline ||
        '',
    };
  } catch {
    return {content: ''};
  }
};

export const getNewsDetails = async newsId => {
  const decodedId = decodeURIComponent(String(newsId || ''));
  const [rapidNews, adminNews] = await Promise.all([getRapidNewsList(), getAdminNewsList()]);
  const merged = [...adminNews, ...rapidNews];

  const found = merged.find(item => item.id === decodedId);
  if (!found) {
    return null;
  }

  if (decodedId.startsWith('rapid-')) {
    const rapidId = decodedId.replace('rapid-', '');
    const detail = await getRapidNewsDetail(rapidId);
    return {
      ...found,
      content: detail.content || found.content || found.summary || '',
    };
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

    return response;
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
};
