import CompanyInfoPage from '@/components/CompanyInfoPage';
import {getTeamSearchData} from '@/lib/api';
import {companyPages} from '@/lib/companyPages';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Browse Team | MyCricket Web',
  description: 'Browse team information and match context.',
};

const buildTeamLine = team => {
  const suffix = [team.shortName ? `(${team.shortName})` : '', team.country].filter(Boolean).join(' ');
  return suffix ? `${team.name} ${suffix}` : team.name;
};

const BrowseTeamPage = async () => {
  const teams = await getTeamSearchData({search: 'india', perPage: 50, paged: 1});

  const sections = teams.length
    ? [
        {
          heading: 'Live Team API Response',
          points: [`Showing ${teams.length} team records for search query "india".`],
        },
        {
          heading: 'Teams',
          points: teams.map(buildTeamLine),
        },
      ]
    : [
        ...companyPages.browseTeam.sections,
        {
          heading: 'Live Team API Response',
          points: ['No team data is available right now from the teams endpoint.'],
        },
      ];

  return (
    <CompanyInfoPage
      {...companyPages.browseTeam}
      intro="Live team data powered by RapidAPI endpoint: /teams?search=india&per_page=50&paged=1"
      sections={sections}
      sourceLinks={[
        {label: 'Teams API Endpoint', href: 'https://cricket-live-line-advance.p.rapidapi.com/teams'},
        ...companyPages.browseTeam.sourceLinks,
      ]}
    />
  );
};

export default BrowseTeamPage;
