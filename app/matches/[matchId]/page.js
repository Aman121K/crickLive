import {getMatchScorecardData} from '@/lib/api';
import MatchCenterTabsView from '@/components/MatchCenterTabsView';

export default async function MatchDetailsPage({params}) {
  const matchId = decodeURIComponent(String(params?.matchId || '40381'));
  const scorecard = await getMatchScorecardData(matchId);

  return <MatchCenterTabsView scorecard={scorecard} />;
}
