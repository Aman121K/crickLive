import {getTeamSearchData} from '@/lib/api';
import {getTeamFlagEmoji} from '@/lib/teamFlags';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Browse Team | MyCricket Web',
  description: 'Browse all cricket teams.',
};

const normalizeLabel = value => String(value || '').trim();

const BrowseTeamPage = async () => {
  const teams = await getTeamSearchData({search: '', perPage: 220, paged: 1});
  const sortedTeams = teams
    .filter(team => normalizeLabel(team.name))
    .sort((a, b) => normalizeLabel(a.name).localeCompare(normalizeLabel(b.name)));

  return (
    <main className="pageShell teamsShell">
      <div className="teamsBoardGrid">
        <section className="teamsDirectory">
          <header className="teamsDirectoryHead">
            <p className="sectionEyebrow">Teams</p>
            <h1>Cricket Teams</h1>
            <p>{sortedTeams.length ? `${sortedTeams.length} teams` : 'Team list is updating'}</p>
          </header>

          {sortedTeams.length ? (
            <div className="teamSimpleList">
              {sortedTeams.map(team => {
                const flag = getTeamFlagEmoji(team.name || team.country);
                return (
                  <article key={team.id} className="teamSimpleItem">
                    <div className="teamSimpleIdentity">
                      <span className="teamSimpleFlag" aria-hidden="true">
                        {flag || 'CR'}
                      </span>
                      <strong>{team.name}</strong>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <article className="emptyCard">
              <p>No team response from SportMonks right now.</p>
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

export default BrowseTeamPage;
