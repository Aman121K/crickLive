import CompanyInfoPage from '@/components/CompanyInfoPage';
import {companyPages} from '@/lib/companyPages';

export const metadata = {
  title: 'Advertise With Us | MyCricket Web',
  description: 'Advertising details and contact context.',
};

const AdvertisePage = () => {
  return <CompanyInfoPage {...companyPages.advertise} />;
};

export default AdvertisePage;
