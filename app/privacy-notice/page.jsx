import CompanyInfoPage from '@/components/CompanyInfoPage';
import {companyPages} from '@/lib/companyPages';

export const metadata = {
  title: 'Privacy Notice | MyCricket Web',
  description: 'Privacy notice summary and source links.',
};

const PrivacyNoticePage = () => {
  return <CompanyInfoPage {...companyPages.privacy} />;
};

export default PrivacyNoticePage;
