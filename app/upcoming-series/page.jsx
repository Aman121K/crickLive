import CompanyInfoPage from '@/components/CompanyInfoPage';
import {companyPages} from '@/lib/companyPages';

export const metadata = {
  title: 'Upcoming Series | MyCricket Web',
  description: 'Upcoming cricket series overview.',
};

const UpcomingSeriesPage = () => {
  return <CompanyInfoPage {...companyPages.upcomingSeries} />;
};

export default UpcomingSeriesPage;
