import CompanyInfoPage from '@/components/CompanyInfoPage';
import {companyPages} from '@/lib/companyPages';

export const metadata = {
  title: 'FAQ | MyCricket Web',
  description: 'Frequently asked questions about the web platform.',
};

const FaqPage = () => {
  return <CompanyInfoPage {...companyPages.faq} />;
};

export default FaqPage;
