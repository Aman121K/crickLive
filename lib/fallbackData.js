export const fallbackLiveMatches = [
  {
    id: '40381',
    series: 'India Tour of Australia, 2nd ODI',
    status: 'LIVE',
    teams: ['India', 'Australia'],
    scores: ['278/6 (46.2)', '241/10 (48.4)'],
    venue: 'Melbourne Cricket Ground',
  },
  {
    id: '40382',
    series: 'PSL 2026, Match 11',
    status: 'LIVE',
    teams: ['Lahore Qalandars', 'Karachi Kings'],
    scores: ['166/8 (20)', '74/2 (9.1)'],
    venue: 'Lahore',
  },
];

export const fallbackUpcomingMatches = [
  {
    id: '40383',
    series: 'IPL 2026',
    status: 'UPCOMING',
    teams: ['Chennai Super Kings', 'Delhi Capitals'],
    scores: ['19:30 IST', 'Today'],
    venue: 'Chepauk',
  },
  {
    id: '40384',
    series: 'SA20',
    status: 'UPCOMING',
    teams: ['MI Cape Town', 'Pretoria Capitals'],
    scores: ['21:00 IST', 'Tomorrow'],
    venue: 'Cape Town',
  },
];

export const fallbackFinishedMatches = [
  {
    id: '40385',
    series: 'BNZ vs SA, 1st T20I',
    status: 'RESULT',
    teams: ['New Zealand', 'South Africa'],
    scores: ['159/6', '154/9'],
    venue: 'Auckland',
  },
  {
    id: '40386',
    series: 'Bangladesh Premier League',
    status: 'RESULT',
    teams: ['Comilla Victorians', 'Sylhet Strikers'],
    scores: ['181/7', '177/8'],
    venue: 'Dhaka',
  },
];

export const fallbackScorecards = {
  '40381': {
    id: '40381',
    title: 'India vs Australia',
    subtitle: 'India Tour of Australia, 2nd ODI',
    status: 'India won by 37 runs',
    innings: [
      {
        id: '40381-1',
        team: 'India',
        score: '278 / 6 (46.2)',
        runRate: 6.0,
        batting: [
          {id: 'i1', name: 'R. Sharma', dismissal: 'c Carey b Starc', runs: 96, balls: 89, fours: 10, sixes: 2},
          {id: 'i2', name: 'S. Gill', dismissal: 'lbw b Cummins', runs: 54, balls: 62, fours: 6, sixes: 1},
          {id: 'i3', name: 'V. Kohli', dismissal: 'not out', runs: 71, balls: 66, fours: 5, sixes: 2},
          {id: 'i4', name: 'S. Iyer', dismissal: 'b Zampa', runs: 32, balls: 28, fours: 2, sixes: 1},
        ],
        bowling: [
          {id: 'ib1', name: 'M. Starc', overs: '9.2', runs: 58, wickets: 2, economy: 6.2},
          {id: 'ib2', name: 'P. Cummins', overs: '9', runs: 49, wickets: 1, economy: 5.4},
          {id: 'ib3', name: 'A. Zampa', overs: '10', runs: 52, wickets: 1, economy: 5.2},
        ],
      },
      {
        id: '40381-2',
        team: 'Australia',
        score: '241 / 10 (48.4)',
        runRate: 4.9,
        batting: [
          {id: 'a1', name: 'D. Warner', dismissal: 'c Rahul b Bumrah', runs: 61, balls: 73, fours: 7, sixes: 0},
          {id: 'a2', name: 'S. Smith', dismissal: 'b Kuldeep', runs: 48, balls: 55, fours: 4, sixes: 0},
          {id: 'a3', name: 'M. Labuschagne', dismissal: 'c Jadeja b Siraj', runs: 39, balls: 46, fours: 2, sixes: 0},
          {id: 'a4', name: 'A. Carey', dismissal: 'not out', runs: 27, balls: 24, fours: 2, sixes: 0},
        ],
        bowling: [
          {id: 'ab1', name: 'J. Bumrah', overs: '10', runs: 41, wickets: 3, economy: 4.1},
          {id: 'ab2', name: 'M. Siraj', overs: '9.4', runs: 46, wickets: 2, economy: 4.8},
          {id: 'ab3', name: 'K. Yadav', overs: '10', runs: 44, wickets: 2, economy: 4.4},
        ],
      },
    ],
  },
  '40382': {
    id: '40382',
    title: 'Lahore Qalandars vs Karachi Kings',
    subtitle: 'PSL 2026, Match 11',
    status: 'Lahore Qalandars won by 18 runs',
    innings: [
      {
        id: '40382-1',
        team: 'Lahore Qalandars',
        score: '166 / 8 (20)',
        runRate: 8.3,
        batting: [
          {id: 'l1', name: 'F. Zaman', dismissal: 'c deep midwicket b Mir Hamza', runs: 45, balls: 31, fours: 5, sixes: 1},
          {id: 'l2', name: 'S. Raza', dismissal: 'b Hasan Ali', runs: 34, balls: 22, fours: 3, sixes: 1},
          {id: 'l3', name: 'D. Wiese', dismissal: 'not out', runs: 28, balls: 18, fours: 2, sixes: 1},
        ],
        bowling: [
          {id: 'lb1', name: 'Hasan Ali', overs: '4', runs: 29, wickets: 2, economy: 7.2},
          {id: 'lb2', name: 'Mir Hamza', overs: '4', runs: 35, wickets: 1, economy: 8.8},
          {id: 'lb3', name: 'Aamir Yamin', overs: '4', runs: 31, wickets: 1, economy: 7.8},
        ],
      },
      {
        id: '40382-2',
        team: 'Karachi Kings',
        score: '148 / 9 (20)',
        runRate: 7.4,
        batting: [
          {id: 'k1', name: 'S. Malik', dismissal: 'c long-on b Shaheen', runs: 39, balls: 29, fours: 4, sixes: 1},
          {id: 'k2', name: 'J. Vince', dismissal: 'b Rashid Khan', runs: 26, balls: 20, fours: 3, sixes: 0},
          {id: 'k3', name: 'I. Ahmed', dismissal: 'run out', runs: 21, balls: 19, fours: 1, sixes: 1},
        ],
        bowling: [
          {id: 'kb1', name: 'Shaheen Afridi', overs: '4', runs: 24, wickets: 2, economy: 6.0},
          {id: 'kb2', name: 'Rashid Khan', overs: '4', runs: 21, wickets: 2, economy: 5.2},
          {id: 'kb3', name: 'Haris Rauf', overs: '4', runs: 30, wickets: 2, economy: 7.5},
        ],
      },
    ],
  },
};

export const fallbackNews = [
  {
    id: 'n1',
    title: 'Rohit powers Mumbai with a sublime hundred in a run-fest',
    summary: 'A high-scoring thriller finished with Mumbai dominating the death overs.',
    tag: 'MATCH REPORT',
    time: '2h ago',
    imageUrl: '',
    thumbnailUrl: '',
  },
  {
    id: 'n2',
    title: 'England name uncapped pacer for the Sri Lanka ODI series',
    summary: 'Selectors have included two fresh faces for the away schedule.',
    tag: 'BREAKING',
    time: '4h ago',
    imageUrl: '',
    thumbnailUrl: '',
  },
  {
    id: 'n3',
    title: 'WTC standings tighten after dramatic final-day collapse',
    summary: 'Points table race gets tighter after late wickets changed the result.',
    tag: 'ANALYSIS',
    time: '6h ago',
    imageUrl: '',
    thumbnailUrl: '',
  },
];
