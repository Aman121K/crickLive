import CompanyInfoPage from '@/components/CompanyInfoPage';
import {getRankingsData} from '@/lib/api';
import {companyPages} from '@/lib/companyPages';

export const metadata = {
  title: 'Ranking | MyCricket Web',
  description: 'Team and player ranking overview.',
};

export const dynamic = 'force-dynamic';

const toPoint = item => {
  const label = `#${item.rank || '-'} ${item.name}`;
  return item.rating && item.rating !== '-' ? `${label} (${item.rating})` : label;
};

const RankingPage = async () => {
  const rankings = await getRankingsData();

  const sections = [
    {
      heading: 'Team Rankings',
      points: (rankings.teams || []).slice(0, 10).map(toPoint),
    },
    {
      heading: 'Batting Rankings',
      points: (rankings.batting || []).slice(0, 10).map(toPoint),
    },
    {
      heading: 'Bowling Rankings',
      points: (rankings.bowling || []).slice(0, 10).map(toPoint),
    },
    {
      heading: 'All-Rounder Rankings',
      points: (rankings.allRounders || []).slice(0, 10).map(toPoint),
    },
  ].filter(section => section.points.length);

  return (
    <CompanyInfoPage
      {...companyPages.ranking}
      intro="Live ranking data from RapidAPI."
      sections={
        sections.length
          ? sections
          : [
              {
                heading: 'Ranking API Response',
                points: ['No ranking response from RapidAPI right now.'],
              },
            ]
      }
    />
  );
};

export default RankingPage;
