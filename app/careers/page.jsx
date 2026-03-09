import CompanyInfoPage from '@/components/CompanyInfoPage';
import {companyPages} from '@/lib/companyPages';

export const metadata = {
  title: 'Careers | MyCricket Web',
  description: 'Career opportunities and hiring information.',
};

const CareersPage = () => {
  return <CompanyInfoPage {...companyPages.careers} />;
};

export default CareersPage;
