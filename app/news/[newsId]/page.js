import Link from 'next/link';
import {notFound} from 'next/navigation';
import {getNewsDetails} from '@/lib/api';

export default async function NewsDetailsPage({params}) {
  const newsId = decodeURIComponent(String(params?.newsId || ''));
  const news = await getNewsDetails(newsId);

  if (!news) {
    notFound();
  }

  const image = news.imageUrl || news.thumbnailUrl;

  return (
    <main className="pageShell detailsShell">
      <header className="detailsHeader">
        <div>
          <p className="heroTag">News Details</p>
          <h1>{news.title}</h1>
          <p className="heroCopy">
            {news.tag} • {news.time}
          </p>
        </div>
        <div className="detailsActions">
          <Link href="/" className="primaryBtn">
            Back to Home
          </Link>
        </div>
      </header>

      <section className="sectionBlock">
        {image ? <img src={image} alt={news.title} className="newsDetailImage" /> : null}

        {news.summary ? (
          <article className="newsDetailBlock">
            <h2>Summary</h2>
            <p>{news.summary}</p>
          </article>
        ) : null}

        <article className="newsDetailBlock">
          <h2>Full Details</h2>
          <p>{news.content || news.summary || 'Full details are not available for this news item yet.'}</p>
        </article>
      </section>
    </main>
  );
}
