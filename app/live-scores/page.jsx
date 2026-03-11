import MatchCard from '@/components/MatchCard';
import {getMatchesData} from '@/lib/api';

export const metadata = {
  title: 'Live Scores | MyCricket Web',
  description: 'Latest live cricket matches and scores.',
};

const LiveScoresPage = async () => {
  const matches = await getMatchesData();
  const liveMatches = matches?.live || [];

  return (
    <main className="pageShell">
      <section className="sectionBlock">
        <div className="sectionHeader">
          <div>
            <p className="sectionEyebrow">Live Score</p>
            <h2>Live Matches</h2>
          </div>
          <p>Currently live</p>
        </div>

        {liveMatches.length ? (
          <div className="matchListVertical">
            {liveMatches.map(match => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        ) : (
          <article className="emptyCard">
            <p>No live matches available right now.</p>
          </article>
        )}
      </section>
    </main>
  );
};

export default LiveScoresPage;
