'use client';

import {useMemo, useState} from 'react';
import Link from 'next/link';

const formatRate = value => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed.toFixed(2) : '-';
};

const toShortCode = teamName => {
  const value = String(teamName || '').trim();
  if (!value) {
    return 'TBD';
  }

  const parts = value.split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 3).toUpperCase();
  }

  return parts
    .map(part => part[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();
};

const findInfo = (items, label) => {
  return items.find(item => String(item?.label || '').toLowerCase() === label.toLowerCase())?.value || '-';
};

const ScoreTable = ({title, columns, rows}) => (
  <div className="scoreTableWrap">
    <h3>{title}</h3>
    <div className="scoreTable">
      <div className="scoreHead">
        {columns.map(column => (
          <span key={column.key}>{column.label}</span>
        ))}
      </div>
      {rows.map(row => (
        <div key={row.id} className="scoreRow">
          {columns.map(column => (
            <span key={column.key}>{row[column.key]}</span>
          ))}
        </div>
      ))}
    </div>
  </div>
);

const tabs = [
  {id: 'info', label: 'Info'},
  {id: 'live', label: 'Live'},
  {id: 'scorecard', label: 'Scorecard'},
  // {id: 'squads', label: 'Squads'},
  // {id: 'points', label: 'Points Table'},
  // {id: 'overs', label: 'Overs'},
  // {id: 'highlights', label: 'Highlights'},
  // {id: 'fullCommentary', label: 'Full Commentary'},
  // {id: 'news', label: 'News'},
];

const buildNewsHref = item => {
  const newsId = encodeURIComponent(String(item.id || 'news'));
  const selectedNewsPayload = encodeURIComponent(
    JSON.stringify({
      id: item.id,
      title: item.title,
      summary: item.summary || '',
      content: item.content || '',
      tag: item.tag || 'NEWS',
      time: item.time || '',
      author: item.author || '',
      imageUrl: item.imageUrl || '',
      thumbnailUrl: item.thumbnailUrl || '',
    })
  );

  return {
    pathname: `/news/${newsId}`,
    query: {selected: selectedNewsPayload},
  };
};

const MatchCenterTabsView = ({scorecard, relatedNews = []}) => {
  const [activeTab, setActiveTab] = useState('live');

  const info = Array.isArray(scorecard?.information) ? scorecard.information : [];
  const commentary = Array.isArray(scorecard?.commentary) ? scorecard.commentary : [];
  const innings = Array.isArray(scorecard?.innings) ? scorecard.innings : [];

  const series = findInfo(info, 'Series');
  const venue = findInfo(info, 'Venue');
  const dateTime = findInfo(info, 'Date');
  const teams = findInfo(info, 'Teams');

  const topBatter = innings
    .flatMap(inning => inning?.batting || [])
    .sort((a, b) => Number(b?.runs || 0) - Number(a?.runs || 0))[0];
  const playerOfMatch = topBatter?.name || 'Player update pending';

  const firstInnings = innings[0];
  const secondInnings = innings[1];

  const squads = useMemo(() => {
    return innings.map(inning => {
      const names = [...(inning?.batting || []).map(item => item.name), ...(inning?.bowling || []).map(item => item.name)]
        .filter(Boolean)
        .filter((name, idx, arr) => arr.indexOf(name) === idx);

      return {
        id: inning.id,
        team: inning.team,
        players: names,
      };
    });
  }, [innings]);

  const highlights = useMemo(() => {
    const filtered = commentary.filter(item => /four|six|wicket|out|win|won|boundary/i.test(String(item?.text || '')));
    return (filtered.length ? filtered : commentary).slice(0, 10);
  }, [commentary]);

  const overs = useMemo(() => commentary.slice(0, 20), [commentary]);

  const infoRows = useMemo(() => {
    const baseRows = [
      {label: 'Match', value: scorecard?.title || '-'},
      ...info.map(item => ({label: item.label, value: item.value})),
    ];

    const seen = new Set();
    return baseRows.filter(row => {
      const key = String(row.label || '').trim().toLowerCase();
      if (!key || seen.has(key)) {
        return false;
      }
      seen.add(key);
      return Boolean(String(row.value || '').trim());
    });
  }, [info, scorecard?.title]);

  const renderMainPanel = () => {
    if (activeTab === 'info') {
      return (
        <section className="buzzInfoCard">
          {/* <div className="buzzInfoHeader">INFO</div> */}
          <div className="buzzInfoTable">
            {infoRows.map(item => (
              <article key={item.label} className="buzzInfoRow">
                <p>{item.label}</p>
                <strong>{item.value}</strong>
              </article>
            ))}
          </div>
        </section>
      );
    }

    if (activeTab === 'scorecard') {
      return (
        <section className="sectionBlock">
          <div className="sectionHeader">
            <div>
              <p className="sectionEyebrow">Detailed Scorecard</p>
              <h2>All Player Scores (Both Teams)</h2>
            </div>
          </div>

          {!innings.length ? (
            <article className="emptyCard">
              <p>Scorecard is not available for this match yet.</p>
            </article>
          ) : null}

          {innings.map(inningsItem => (
            <article key={inningsItem.id} className="inningsCard">
              <div className="inningsHeader">
                <h3>
                  {inningsItem.team} - {inningsItem.score}
                </h3>
                <p>Run Rate: {formatRate(inningsItem.runRate)}</p>
              </div>

              <ScoreTable
                title="Batting"
                columns={[
                  {key: 'name', label: 'Player'},
                  {key: 'runs', label: 'R'},
                  {key: 'balls', label: 'B'},
                  {key: 'fours', label: '4s'},
                  {key: 'sixes', label: '6s'},
                ]}
                rows={inningsItem.batting.map(item => ({
                  ...item,
                  name: `${item.name}${item.dismissal ? ` - ${item.dismissal}` : ''}`,
                }))}
              />

              <ScoreTable
                title="Bowling"
                columns={[
                  {key: 'name', label: 'Player'},
                  {key: 'overs', label: 'O'},
                  {key: 'runs', label: 'R'},
                  {key: 'wickets', label: 'W'},
                  {key: 'economy', label: 'Econ'},
                ]}
                rows={inningsItem.bowling.map(item => ({
                  ...item,
                  economy: formatRate(item.economy),
                }))}
              />
            </article>
          ))}
        </section>
      );
    }

    if (activeTab === 'squads') {
      return (
        <section className="sectionBlock">
          <div className="sectionHeader">
            <div>
              <p className="sectionEyebrow">Teams</p>
              <h2>Squads</h2>
            </div>
          </div>
          {squads.map(team => (
            <article key={team.id} className="detailsInfoCard">
              <p>{team.team}</p>
              <strong>{team.players.join(', ') || 'Squad not available yet.'}</strong>
            </article>
          ))}
        </section>
      );
    }

    if (activeTab === 'points') {
      return (
        <section className="sectionBlock">
          <div className="sectionHeader">
            <div>
              <p className="sectionEyebrow">Tournament Snapshot</p>
              <h2>Points Table</h2>
            </div>
          </div>
          <div className="detailsInfoGrid">
            <article className="detailsInfoCard">
              <p>Series</p>
              <strong>{series}</strong>
            </article>
            <article className="detailsInfoCard">
              <p>Match</p>
              <strong>{teams}</strong>
            </article>
            <article className="detailsInfoCard">
              <p>Status</p>
              <strong>{scorecard.status}</strong>
            </article>
            <article className="detailsInfoCard">
              <p>Note</p>
              <strong>Detailed points table feed is not available from this endpoint.</strong>
            </article>
          </div>
        </section>
      );
    }

    if (activeTab === 'overs') {
      return (
        <section className="buzzCommentaryCard">
          <h2>OVERS SUMMARY</h2>
          {overs.map(item => (
            <article key={item.id} className="buzzCommentaryRow">
              <p>{item.over}</p>
              <p>{item.text}</p>
            </article>
          ))}
        </section>
      );
    }

    if (activeTab === 'highlights') {
      return (
        <section className="buzzCommentaryCard">
          <h2>MATCH HIGHLIGHTS</h2>
          {highlights.map(item => (
            <article key={item.id} className="buzzCommentaryRow">
              <p>{item.over}</p>
              <p>{item.text}</p>
            </article>
          ))}
        </section>
      );
    }

    if (activeTab === 'fullCommentary') {
      return (
        <section className="buzzCommentaryCard">
          <h2>FULL COMMENTARY</h2>
          {commentary.map(item => (
            <article key={item.id} className="buzzCommentaryRow">
              <p>{item.over}</p>
              <p>{item.text}</p>
            </article>
          ))}
        </section>
      );
    }

    if (activeTab === 'news') {
      return (
        <section className="sectionBlock">
          <div className="sectionHeader">
            <div>
              <p className="sectionEyebrow">Newsroom</p>
              <h2>Related News</h2>
            </div>
          </div>
          <article className="detailsInfoCard">
            <p>Match</p>
            <strong>{scorecard.title}</strong>
          </article>
          <article className="detailsInfoCard">
            <p>Update</p>
            <strong>{scorecard.status}</strong>
          </article>
          <Link href="/news" className="primaryBtn">
            Open Latest News
          </Link>
        </section>
      );
    }

    return (
      <>
        <section className="buzzResultCard">
          <p className="buzzWinText">{scorecard.status}</p>
          <div className="buzzScoreRows">
            <p>
              <span>{toShortCode(firstInnings?.team)}</span> {firstInnings?.score || '-'}
            </p>
            <p>
              <span>{toShortCode(secondInnings?.team)}</span> {secondInnings?.score || '-'}
            </p>
          </div>
        </section>

        <section className="buzzPomCard">
          <p>PLAYER OF THE MATCH</p>
          <div>
            <span className="buzzPlayerAvatar" aria-hidden="true">
              {playerOfMatch[0] || 'P'}
            </span>
            <strong>{playerOfMatch}</strong>
          </div>
        </section>

        <section className="buzzCommentaryCard">
          <h2>MATCH RESULT : {scorecard.status}</h2>
          {commentary.slice(0, 12).map(item => (
            <article key={item.id} className="buzzCommentaryRow">
              <p>{item.over}</p>
              <p>{item.text}</p>
            </article>
          ))}
        </section>
      </>
    );
  };

  return (
    <main className="pageShell detailsShell detailsBuzzShell">
      <header className="buzzHeaderCard">
        <h1>
          {scorecard.title}, {series} - Commentary
        </h1>

        <div className="buzzMetaRow">
          <p>
            <strong>Series:</strong> {series}
          </p>
          <p>
            <strong>Venue:</strong> {venue}
          </p>
          <p>
            <strong>Date & Time:</strong> {dateTime}
          </p>
        </div>

        <nav className="buzzTabs" aria-label="Match navigation">
          {tabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              className={activeTab === tab.id ? 'active' : ''}
              onClick={() => setActiveTab(tab.id)}>
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <div className="buzzBodyGrid">
        <div className="buzzMainColumn">{renderMainPanel()}</div>

        <aside className="buzzSideColumn">
          <article className="buzzSideCard">
            <h3>SERIES NEWS</h3>
            {relatedNews.length ? (
              <div className="seriesNewsList">
                {relatedNews.slice(0, 4).map(item => (
                  <Link key={item.id} href={buildNewsHref(item)} className="seriesNewsItem">
                    <strong>{item.title}</strong>
                    <p>{item.time}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="muted">No series-specific news published yet.</p>
            )}
            <Link href="/news" className="ghostBtn">
              Open All News
            </Link>
          </article>
          <article className="buzzSideCard">
            <div className="buzzAdMock">Ad Space</div>
          </article>
          <article className="buzzSideCard">
            <h3>FEATURED VIDEOS</h3>
            <div className="buzzVideoMock">Match Analysis Video</div>
            <p>Latest cricket highlights and post-match analysis from the newsroom.</p>
          </article>
          {/* <Link href="/" className="ghostBtn">
            Back to Dashboard
          </Link> */}
        </aside>
      </div>
    </main>
  );
};

export default MatchCenterTabsView;
