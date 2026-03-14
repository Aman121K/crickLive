import MatchCard from '@/components/MatchCard';
import {getMatchesData} from '@/lib/api';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Upcoming Series | MyCricket Web',
  description: 'Latest upcoming cricket matches and series.',
};

const UpcomingSeriesPage = async () => {
  const matches = await getMatchesData();
  const upcoming = matches?.upcoming || [];

  return (
    <main className="pageShell">
      <section className="sectionBlock">
        <div className="sectionHeader">
          <div>
            <p className="sectionEyebrow">Schedule</p>
            <h2>Upcoming Matches</h2>
          </div>
          <p>Latest fixtures</p>
        </div>

        {upcoming.length ? (
          <div className="matchListVertical">
            {upcoming.map(match => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        ) : (
          <article className="emptyCard">
            <p>No upcoming matches available right now.</p>
          </article>
        )}
      </section>
    </main>
  );
};

export default UpcomingSeriesPage;
