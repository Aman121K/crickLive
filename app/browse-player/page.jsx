import CompanyInfoPage from '@/components/CompanyInfoPage';
import {companyPages} from '@/lib/companyPages';

export const metadata = {
  title: 'Browse Player | MyCricket Web',
  description: 'Browse player information and related coverage.',
};

const BrowsePlayerPage = () => {
  return <CompanyInfoPage {...companyPages.browsePlayer} />;
};

export default BrowsePlayerPage;
