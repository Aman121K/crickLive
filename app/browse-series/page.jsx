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
  const baseSourceLinks = Array.isArray(companyPages?.browseSeries?.sourceLinks) ? companyPages.browseSeries.sourceLinks : [];

  const sections = series.length
    ? [
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
      intro="Live series data powered by SportMonks endpoints: /api/v2.0/leagues and /api/v2.0/seasons."
      sections={sections}
      sourceLinks={[
        {label: 'Leagues API Endpoint', href: 'https://cricket.sportmonks.com/api/v2.0/leagues'},
        {label: 'Seasons API Endpoint', href: 'https://cricket.sportmonks.com/api/v2.0/seasons'},
        ...baseSourceLinks,
      ]}
    />
  );
};

export default BrowseSeriesPageWithData;
