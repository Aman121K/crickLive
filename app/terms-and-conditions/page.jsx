import CompanyInfoPage from '@/components/CompanyInfoPage';
import {companyPages} from '@/lib/companyPages';

export const metadata = {
  title: 'Terms & Conditions | MyCricket Web',
  description: 'Terms and conditions summary and source links.',
};

const TermsAndConditionsPage = () => {
  return <CompanyInfoPage {...companyPages.terms} />;
};

export default TermsAndConditionsPage;
