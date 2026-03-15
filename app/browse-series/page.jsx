import CompanyInfoPage from '@/components/CompanyInfoPage';
import {getSeriesData} from '@/lib/api';
import {companyPages} from '@/lib/companyPages';

export const metadata = {
  title: 'Browse Series | MyCricket Web',
  description: 'Browse cricket series information and links.',
};

export const dynamic = 'force-dynamic';

const toSeriesLine = item => {
  const suffix = [
    item.season ? `Season ${item.season}` : '',
    item.gameFormat ? item.gameFormat.toUpperCase() : '',
    item.status ? item.status.toUpperCase() : '',
  ]
    .filter(Boolean)
    .join(' | ');

  return suffix ? `${item.title} (${suffix})` : item.title;
};

const BrowseSeriesPageWithData = async () => {
  const series = await getSeriesData({year: new Date().getFullYear(), perPage: 40});

  const sections = series.length
    ? [
        {
          heading: 'Live Series API Response',
          points: [`Showing ${series.length} competitions from RapidAPI.`],
        },
        {
          heading: 'Series',
          points: series.slice(0, 30).map(toSeriesLine),
        },
      ]
    : [
        ...companyPages.browseSeries.sections,
        {
          heading: 'Live Series API Response',
          points: ['No series data is available right now from the competitions endpoint.'],
        },
      ];

  return (
    <CompanyInfoPage
      {...companyPages.browseSeries}
      intro="Live series data powered by RapidAPI endpoints: /season/{year}/competitionlist and /competitions."
      sections={sections}
      sourceLinks={[
        {label: 'Season Competition List', href: 'https://cricket-live-line-advance.p.rapidapi.com/season/2026/competitionlist'},
        {label: 'Competitions API Endpoint', href: 'https://cricket-live-line-advance.p.rapidapi.com/competitions'},
        ...companyPages.browseSeries.sourceLinks,
      ]}
    />
  );
};

export default BrowseSeriesPageWithData;
