import CompanyInfoPage from '@/components/CompanyInfoPage';
import {getPlayersData} from '@/lib/api';
import {companyPages} from '@/lib/companyPages';

export const metadata = {
  title: 'Browse Player | MyCricket Web',
  description: 'Browse player information and related coverage.',
};

export const dynamic = 'force-dynamic';

const playerLine = player => {
  const suffix = [player.role, player.team, player.country].filter(Boolean).join(' | ');
  return suffix ? `${player.name} (${suffix})` : player.name;
};

const BrowsePlayerPage = async () => {
  const players = await getPlayersData({perPage: 50});
  const sections = players.length
    ? [
        {
          heading: 'Players',
          points: players.slice(0, 40).map(playerLine),
        },
      ]
    : [
        ...companyPages.browsePlayer.sections,
        {
          heading: 'Live Player API Response',
          points: ['No player data is available right now from the players endpoint.'],
        },
      ];

  return (
    <CompanyInfoPage
      {...companyPages.browsePlayer}
      intro="Live player data powered by SportMonks endpoint: /api/v2.0/players"
      sections={sections}
      sourceLinks={[
        {label: 'Players API Endpoint', href: 'https://cricket.sportmonks.com/api/v2.0/players'},
        ...(companyPages?.browsePlayer?.sourceLinks || []),
      ]}
    />
  );
};

export default BrowsePlayerPage;
