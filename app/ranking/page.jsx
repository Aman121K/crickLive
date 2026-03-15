import {getNewsData, getRankingsData} from '@/lib/api';

export const metadata = {
  title: 'Ranking | MyCricket Web',
  description: 'Team and player ranking overview.',
};

export const dynamic = 'force-dynamic';

const toInitials = name => {
  const value = String(name || '').trim();
  if (!value) {
    return 'P';
  }
  const parts = value.split(/\s+/).slice(0, 2);
  return parts.map(part => part[0]).join('').toUpperCase();
};

const RankingPage = async () => {
  const [rankings, news] = await Promise.all([getRankingsData(), getNewsData()]);

  const categories = [
    {id: 'batting', label: 'Batting', rows: rankings?.batting || []},
    {id: 'bowling', label: 'Bowling', rows: rankings?.bowling || []},
    {id: 'allRounders', label: 'All Rounder', rows: rankings?.allRounders || []},
    {id: 'teams', label: 'Teams', rows: rankings?.teams || []},
  ];

  const activeCategory = categories.find(item => item.rows.length) || categories[0];
  const rows = (activeCategory.rows || []).slice(0, 10);
  const latestNews = (news || []).slice(0, 4);

  return (
    <main className="pageShell rankingShell">
      <section className="rankingBoard">
        <header className="rankingHead">
          <h1>ICC men&apos;s Cricket Rankings</h1>
          <nav className="rankingCategoryTabs" aria-label="Ranking categories">
            {categories.map(item => (
              <span key={item.id} className={item.id === activeCategory.id ? 'active' : ''}>
                {item.label}
              </span>
            ))}
          </nav>
        </header>

        <div className="rankingBodyGrid">
          <section className="rankingMain">
            <div className="rankingFormatPills" aria-label="Formats">
              <span>TEST</span>
              <span className="active">ODI</span>
              <span>T20</span>
            </div>

            <div className="rankingTableWrap">
              <div className="rankingTableHead">
                <span>Rank</span>
                <span>Player</span>
                <span>Points</span>
              </div>

              {rows.length ? (
                rows.map((item, index) => (
                  <article key={`${item.name}-${index}`} className="rankingRow">
                    <p className="rankCol">{item.rank || index + 1}</p>
                    <div className="playerCol">
                      <span className="playerAvatar">{toInitials(item.name)}</span>
                      <div>
                        <strong>{item.name}</strong>
                        <p>{item.format || 'ODI'}</p>
                      </div>
                    </div>
                    <p className="pointsCol">{item.rating || '-'}</p>
                  </article>
                ))
              ) : (
                <article className="rankingRow">
                  <p className="rankCol">-</p>
                  <div className="playerCol">
                    <span className="playerAvatar">-</span>
                    <div>
                      <strong>No ranking response right now</strong>
                      <p>Try again shortly</p>
                    </div>
                  </div>
                  <p className="pointsCol">-</p>
                </article>
              )}
            </div>
          </section>

          <aside className="rankingSide">
            <article className="rankingAdCard">
              <div className="rankingAdMock">Ad Space</div>
            </article>

            <article className="rankingNewsCard">
              <h2>Latest News</h2>
              <div className="rankingNewsList">
                {latestNews.length ? (
                  latestNews.map(item => (
                    <article key={item.id} className="rankingNewsItem">
                      {item.imageUrl || item.thumbnailUrl ? (
                        <img src={item.imageUrl || item.thumbnailUrl} alt={item.title} />
                      ) : (
                        <div className="rankingNewsThumbPlaceholder" />
                      )}
                      <div>
                        <strong>{item.title}</strong>
                        <p>{item.time || 'Recently'}</p>
                      </div>
                    </article>
                  ))
                ) : (
                  <p className="rankingNewsEmpty">No latest news available.</p>
                )}
              </div>
            </article>
          </aside>
        </div>
      </section>
    </main>
  );
};

export default RankingPage;
