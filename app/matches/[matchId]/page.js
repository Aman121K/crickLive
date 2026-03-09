import Link from 'next/link';
import {getMatchScorecardData} from '@/lib/api';

const formatRate = value => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed.toFixed(2) : '-';
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

export default async function MatchDetailsPage({params}) {
  const matchId = decodeURIComponent(String(params?.matchId || '40381'));
  const scorecard = await getMatchScorecardData(matchId);

  return (
    <main className="pageShell detailsShell">
      <header className="detailsHeader">
        <div>
          <p className="heroTag">Match Details</p>
          <h1>{scorecard.title}</h1>
          <p className="heroCopy">{scorecard.subtitle}</p>
          <p className="statusLine">{scorecard.status}</p>
        </div>
        <div className="detailsActions">
          <a href="#scorecard" className="primaryBtn">
            View Scorecard
          </a>
          <Link href="/" className="ghostBtn">
            Back to Dashboard
          </Link>
        </div>
      </header>

      <section id="scorecard" className="sectionBlock">
        <div className="sectionHeader">
          <div>
            <p className="sectionEyebrow">Detailed Scorecard</p>
            <h2>All Player Scores (Both Teams)</h2>
          </div>
        </div>

        {!scorecard.innings.length ? (
          <article className="emptyCard">
            <p>Scorecard is not available for this match yet.</p>
          </article>
        ) : null}

        {scorecard.innings.map(innings => (
          <article key={innings.id} className="inningsCard">
            <div className="inningsHeader">
              <h3>
                {innings.team} - {innings.score}
              </h3>
              <p>Run Rate: {formatRate(innings.runRate)}</p>
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
              rows={innings.batting.map(item => ({
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
              rows={innings.bowling.map(item => ({
                ...item,
                economy: formatRate(item.economy),
              }))}
            />
          </article>
        ))}
      </section>
    </main>
  );
}
