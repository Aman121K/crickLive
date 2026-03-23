import {getTeamSearchData} from '@/lib/api';
import {getTeamFlagEmoji} from '@/lib/teamFlags';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Browse Team | MyCricket Web',
  description: 'Browse all cricket teams.',
};

const normalizeLabel = value => String(value || '').trim();

const getGroupKey = name => {
  const first = normalizeLabel(name).charAt(0).toUpperCase();
  return /^[A-Z]$/.test(first) ? first : '#';
};

const formatTeamMeta = team => {
  const country = normalizeLabel(team.country);
  const type = normalizeLabel(team.type);
  const code = normalizeLabel(team.shortName);
  return [country, type, code].filter(Boolean);
};

const BrowseTeamPage = async () => {
  const teams = await getTeamSearchData({search: '', perPage: 220, paged: 1});

  const grouped = teams.reduce((acc, team) => {
    const name = normalizeLabel(team.name);
    if (!name) {
      return acc;
    }

    const key = getGroupKey(name);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(team);
    return acc;
  }, {});

  const letters = Object.keys(grouped).sort((a, b) => (a === '#' ? 1 : b === '#' ? -1 : a.localeCompare(b)));

  return (
    <main className="pageShell teamsShell">
      <section className="teamsDirectory">
        <header className="teamsDirectoryHead">
          <p className="sectionEyebrow">Teams</p>
          <h1>Browse Cricket Team</h1>
          <p>{teams.length ? `${teams.length} teams` : 'Team list is updating'}</p>
        </header>

        {letters.length ? (
          <div className="teamsGroupList">
            {letters.map(letter => (
              <section key={letter} id={`group-${letter}`} className="teamsGroup">
                <div className="teamsGroupTitle">
                  <h2>{letter}</h2>
                </div>
                <div className="teamsGrid">
                  {grouped[letter]
                    .sort((a, b) => normalizeLabel(a.name).localeCompare(normalizeLabel(b.name)))
                    .map(team => {
                      const meta = formatTeamMeta(team);
                      const flag = getTeamFlagEmoji(team.name || team.country);
                      return (
                        <article key={team.id} className="teamTile">
                          <div className="teamTileHead">
                            <span className="teamFlag" aria-hidden="true">
                              {flag || 'CR'}
                            </span>
                            <strong>{team.name}</strong>
                          </div>
                          {meta.length ? (
                            <div className="teamMeta">
                              {meta.map(value => (
                                <span key={`${team.id}-${value}`}>{value}</span>
                              ))}
                            </div>
                          ) : (
                            <p className="teamMetaEmpty">Team profile</p>
                          )}
                        </article>
                      );
                    })}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <article className="emptyCard">
            <p>No team response from SportMonks right now.</p>
          </article>
        )}
      </section>
    </main>
  );
};

export default BrowseTeamPage;
