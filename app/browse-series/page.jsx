import CompanyInfoPage from '@/components/CompanyInfoPage';
import {companyPages} from '@/lib/companyPages';

export const metadata = {
  title: 'Browse Series | MyCricket Web',
  description: 'Browse cricket series information and links.',
};

const BrowseSeriesPage = () => {
  return <CompanyInfoPage {...companyPages.browseSeries} />;
};

export default BrowseSeriesPage;
