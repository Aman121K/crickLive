const countryCodeToFlag = countryCode => {
  if (!countryCode || countryCode.length !== 2) {
    return '';
  }

  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));

  return String.fromCodePoint(...codePoints);
};

const teamCountryHints = [
  {countryCode: 'IN', keys: ['india', 'ind', 'chennai', 'mumbai', 'delhi', 'kolkata', 'rajasthan', 'punjab', 'lucknow', 'gujarat', 'hyderabad', 'bengaluru', 'bangalore']},
  {countryCode: 'AU', keys: ['australia', 'aus', 'melbourne', 'sydney', 'brisbane', 'adelaide', 'perth', 'hobart']},
  {countryCode: 'GB', keys: ['england', 'eng', 'london spirit', 'northern superchargers', 'oval invincibles', 'southern brave', 'welsh fire']},
  {countryCode: 'NZ', keys: ['new zealand', 'nz', 'auckland', 'wellington', 'canterbury', 'otago']},
  {countryCode: 'PK', keys: ['pakistan', 'pak', 'lahore', 'karachi', 'islamabad', 'multan', 'peshawar', 'quetta']},
  {countryCode: 'ZA', keys: ['south africa', 'rsa', 'sa', 'cape town', 'pretoria', 'durban', 'paarl', 'johannesburg', 'sunrisers eastern cape']},
  {countryCode: 'BD', keys: ['bangladesh', 'ban', 'dhaka', 'comilla', 'sylhet', 'rangpur', 'chattogram', 'khulna', 'barisal']},
  {countryCode: 'LK', keys: ['sri lanka', 'sl', 'colombo', 'kandy', 'galle', 'dambulla', 'jaffna']},
  {countryCode: 'AF', keys: ['afghanistan', 'afg']},
  {countryCode: 'IE', keys: ['ireland', 'ire']},
  {countryCode: 'NL', keys: ['netherlands', 'ned']},
  {countryCode: 'NP', keys: ['nepal', 'nep']},
  {countryCode: 'NA', keys: ['namibia', 'nam']},
  {countryCode: 'AE', keys: ['uae', 'united arab emirates']},
  {countryCode: 'ZW', keys: ['zimbabwe', 'zim']},
  {countryCode: 'US', keys: ['usa', 'united states', 'texas super kings', 'seattle orcas', 'la knight riders', 'mi new york', 'san francisco unicorns']},
  {countryCode: 'CA', keys: ['canada', 'can', 'toronto nationals', 'montreal tigers', 'vancouver knights', 'brampton wolves']},
];

export const getTeamFlagEmoji = teamName => {
  const normalizedName = String(teamName || '')
    .toLowerCase()
    .trim();

  if (!normalizedName) {
    return '';
  }

  const matched = teamCountryHints.find(country =>
    country.keys.some(key => normalizedName.includes(key))
  );

  return matched ? countryCodeToFlag(matched.countryCode) : '';
};
