import {getSeriesData} from '@/lib/api';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Upcoming Series | MyCricket Web',
  description: 'Latest upcoming cricket matches and series.',
};

const UpcomingSeriesPage = async () => {
  const series = await getSeriesData({year: new Date().getFullYear(), perPage: 120});

  const parseDate = value => {
    const parsed = new Date(String(value || '').trim());
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const formatMonth = date =>
    new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric',
    }).format(date);

  const formatDate = date =>
    new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
    }).format(date);

  const normalized = series
    .map(item => {
      const [rangeStart = '', rangeEnd = ''] = String(item?.dateRange || '').split(' to ');
      const startDate = parseDate(item?.startDate || rangeStart);
      const endDate = parseDate(item?.endDate || rangeEnd);
      const sortDate = startDate || endDate;
      const rangeLabel =
        startDate && endDate
          ? `${formatDate(startDate)} - ${formatDate(endDate)}`
          : startDate
            ? `${formatDate(startDate)}`
            : endDate
              ? `${formatDate(endDate)}`
              : 'Dates to be announced';

      return {
        id: item.id,
        title: item.title,
        monthLabel: sortDate ? formatMonth(sortDate) : 'TBA',
        sortTime: sortDate ? sortDate.getTime() : Number.MAX_SAFE_INTEGER,
        rangeLabel,
      };
    })
    .sort((a, b) => a.sortTime - b.sortTime || a.title.localeCompare(b.title));

  const grouped = normalized.reduce((acc, item) => {
    const key = item.monthLabel;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});

  const orderedMonthKeys = Object.keys(grouped).sort((a, b) => {
    if (a === 'TBA') {
      return 1;
    }
    if (b === 'TBA') {
      return -1;
    }
    const firstA = grouped[a]?.[0]?.sortTime || Number.MAX_SAFE_INTEGER;
    const firstB = grouped[b]?.[0]?.sortTime || Number.MAX_SAFE_INTEGER;
    return firstA - firstB;
  });

  return (
    <main className="pageShell liveScoresShell">
      <div className="liveScoresGrid">
        <section className="sectionBlock scheduleSeriesMain">
          <div className="sectionHeader">
            <div>
              <p className="sectionEyebrow">Schedule</p>
              <h2>Current & Future Series</h2>
            </div>
            <p>Month wise</p>
          </div>

          {orderedMonthKeys.length ? (
            <div className="scheduleSeriesTableWrap">
              <table className="scheduleSeriesTable">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Series Name</th>
                  </tr>
                </thead>
                <tbody>
                  {orderedMonthKeys.map(month =>
                    grouped[month].map((item, index) => (
                      <tr key={`${month}-${item.id}`}>
                        {index === 0 ? (
                          <th rowSpan={grouped[month].length} className="scheduleMonthCell">
                            {month}
                          </th>
                        ) : null}
                        <td>
                          <p className="scheduleSeriesTitle">{item.title}</p>
                          <p className="scheduleSeriesDate">{item.rangeLabel}</p>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <article className="emptyCard">
              <p>No upcoming series available right now.</p>
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

export default UpcomingSeriesPage;
