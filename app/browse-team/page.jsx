import CompanyInfoPage from '@/components/CompanyInfoPage';
import {companyPages} from '@/lib/companyPages';

export const metadata = {
  title: 'Browse Team | MyCricket Web',
  description: 'Browse team information and match context.',
};

const BrowseTeamPage = () => {
  return <CompanyInfoPage {...companyPages.browseTeam} />;
};

export default BrowseTeamPage;
