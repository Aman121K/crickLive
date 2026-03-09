import CompanyInfoPage from '@/components/CompanyInfoPage';
import {companyPages} from '@/lib/companyPages';

export const metadata = {
  title: 'About Us | MyCricket Web',
  description: 'About Cricbuzz style company overview page.',
};

const AboutUsPage = () => {
  return <CompanyInfoPage {...companyPages.about} />;
};

export default AboutUsPage;
