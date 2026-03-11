import MatchCard from '@/components/MatchCard';
import NewsCard from '@/components/NewsCard';
import Link from 'next/link';
import {redirect} from 'next/navigation';
import {getMatchesData, getNewsData} from '@/lib/api';

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

  const [matches, news] = await Promise.all([getMatchesData(), getNewsData()]);
  const topStories = news.slice(0, 8);
  const homeLiveCards = matches.live || [];

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
