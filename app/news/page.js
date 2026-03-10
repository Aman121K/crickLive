import NewsCard from '@/components/NewsCard';
import {getNewsData} from '@/lib/api';

export default async function NewsListingPage() {
  const news = await getNewsData();

  return (
    <main className="pageShell">
      <section className="sectionBlock">
        <div className="sectionHeader">
          <div>
            <p className="sectionEyebrow">News</p>
            <h2>All Stories</h2>
          </div>
          <p>{news.length} items</p>
        </div>

        <div className="topStoriesGrid">
          {news.map(item => (
            <NewsCard key={item.id} item={item} compact />
          ))}
        </div>
      </section>
    </main>
  );
}
