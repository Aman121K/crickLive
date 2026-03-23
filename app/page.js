import MatchCard from '@/components/MatchCard';
import NewsCard from '@/components/NewsCard';
import Link from 'next/link';
import {redirect} from 'next/navigation';
import {getMatchesData, getNewsData, getSeriesData, getTopTeamsData} from '@/lib/api';

export const dynamic = 'force-dynamic';

const MatchSection = ({id, title, subtitle, matches, horizontal = false}) => (
  <section className="sectionBlock" id={id}>
    <div className="sectionHeader">
      <div>
        <p className="sectionEyebrow">Match Center</p>
        <h2>{title}</h2>
      </div>
      <p>{subtitle}</p>
    </div>

    <div className={horizontal ? 'matchGridHorizontal' : 'matchListVertical'}>
      {matches.map(match => (
        <MatchCard key={match.id} match={match} />
      ))}
    </div>
  </section>
);

const parseView = searchParams => {
  const raw = Array.isArray(searchParams?.view) ? searchParams.view[0] : searchParams?.view;
  const value = String(raw || '').trim().toLowerCase();
  if (value === 'matches' || value === 'news') {
    return value;
  }
  return 'all';
};

export default async function HomePage({searchParams}) {
  const view = parseView(searchParams);
  if (view === 'matches') {
    redirect('/live-scores');
  }

  const [matches, news, teams, series] = await Promise.all([
    getMatchesData(),
    getNewsData(),
    getTopTeamsData(),
    getSeriesData({year: new Date().getFullYear(), perPage: 20}),
  ]);
  const topStories = news.slice(0, 8);
  const homeLiveCards = matches.live || [];
  const topTeams = teams.slice(0, 8);
  const topSeries = series.slice(0, 8);

  return (
    <main className="pageShell">
      {/* <header className="hero">
        <div>
          <p className="heroTag">MyCricket Platform</p>
          <h1>One place for live scores, full scorecards and trusted cricket news.</h1>
          <p className="heroCopy">
            This web experience is connected to your existing app stack: live/upcoming/finished matches, detailed
            scorecards, and admin-published news with Cloudflare R2 image URLs.
          </p>
        </div>
        <div className="heroStats">
          <article>
            <p>Live Matches</p>
            <strong>{matches.live.length}</strong>
          </article>
          <article>
            <p>Upcoming</p>
            <strong>{matches.upcoming.length}</strong>
          </article>
          <article>
            <p>Recent Results</p>
            <strong>{matches.finished.length}</strong>
          </article>
        </div>
      </header> */}

      {view !== 'news' ? (
        <MatchSection id="matches" title="Live Matches" subtitle="" matches={homeLiveCards} horizontal />
      ) : null}

      {view !== 'news' ? (
        <section className="sectionBlock" id="series">
          <div className="sectionHeader">
            <div>
              {/* <p className="sectionEyebrow">Series</p> */}
              <h2>Series</h2>
            </div>
            <Link href="/browse-series" className="sectionSeeAll">
              See all
            </Link>
          </div>
          {topSeries.length ? (
            <div className="detailsInfoGrid">
              {topSeries.map(item => (
                <article key={item.id} className="detailsInfoCard">
                  <p>{item.season ? `Season ${item.season}` : 'Competition'}</p>
                  <strong>{item.title}</strong>
                </article>
              ))}
            </div>
          ) : (
            <article className="emptyCard">
              <p>No series response from SportMonks right now.</p>
            </article>
          )}
        </section>
      ) : null}

      {view !== 'news' ? (
        <section className="sectionBlock" id="teams">
          <div className="sectionHeader">
            <div>
              {/* <p className="sectionEyebrow">Teams</p> */}
              <h2>Teams</h2>
            </div>
            <Link href="/browse-team" className="sectionSeeAll">
              See all
            </Link>
          </div>
          {topTeams.length ? (
            <div className="detailsInfoGrid">
              {topTeams.map(team => (
                <article key={team.id} className="detailsInfoCard">
                  <p>{team.shortName || 'Team'}</p>
                  <strong>{team.name}</strong>
                </article>
              ))}
            </div>
          ) : (
            <article className="emptyCard">
              <p>No team response from SportMonks right now.</p>
            </article>
          )}
        </section>
      ) : null}

      {view !== 'matches' ? (
        <section className="sectionBlock" id="news">
          <div className="sectionHeader">
            <div>
              {/* <p className="sectionEyebrow">News</p> */}
              <h2>News</h2>
            </div>
            <Link href="/news" className="sectionSeeAll">
              See all
            </Link>
          </div>

          <div className="topStoriesGrid">
            {topStories.map(item => (
              <NewsCard key={item.id} item={item} compact />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
