import Link from 'next/link';

const statusClass = {
  LIVE: 'statusLive',
  UPCOMING: 'statusUpcoming',
  RESULT: 'statusResult',
};

const MatchCard = ({match}) => {
  const cssClass = statusClass[match.status] || 'statusResult';
  const matchId = encodeURIComponent(String(match.id || '40381'));

  return (
    <Link href={`/matches/${matchId}`} className="matchCardLink">
      <article className="matchCard">
        <div className="matchTop">
          <p className="series">{match.series}</p>
          <span className={`statusPill ${cssClass}`}>{match.status}</span>
        </div>

        <div className="teamsWrap">
          <div className="teamRow">
            <span>{match.teams[0]}</span>
            <strong>{match.scores[0]}</strong>
          </div>
          <div className="teamRow">
            <span>{match.teams[1]}</span>
            <strong>{match.scores[1]}</strong>
          </div>
        </div>

        <p className="venue">{match.venue}</p>

        <p className="cardCta">Match Details & Scorecard</p>
      </article>
    </Link>
  );
};

export default MatchCard;
