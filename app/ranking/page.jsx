import CompanyInfoPage from '@/components/CompanyInfoPage';
import {companyPages} from '@/lib/companyPages';

export const metadata = {
  title: 'Ranking | MyCricket Web',
  description: 'Team and player ranking overview.',
};

const RankingPage = () => {
  return <CompanyInfoPage {...companyPages.ranking} />;
};

export default RankingPage;
