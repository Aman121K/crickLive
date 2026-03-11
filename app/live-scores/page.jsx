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
    <main className="pageShell liveScoresShell">
      <div className="liveScoresGrid">
        <section className="sectionBlock liveScoresMain">
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

        <aside className="liveScoresAds" aria-label="Advertisements">
          <article className="liveAdCard">
            <p className="liveAdLabel">AdSense</p>
            <div className="liveAdBox">300 x 250 Ad Slot</div>
          </article>
          <article className="liveAdCard">
            <p className="liveAdLabel">Sponsored</p>
            <div className="liveAdBox tall">300 x 600 Ad Slot</div>
          </article>
        </aside>
      </div>
    </main>
  );
};

export default LiveScoresPage;
