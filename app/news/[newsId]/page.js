import Link from 'next/link';
import {notFound} from 'next/navigation';
import {getNewsDetails} from '@/lib/api';

const parseSelectedNews = value => {
  if (!value || typeof value !== 'string') {
    return null;
  }

  try {
    return JSON.parse(decodeURIComponent(value));
  } catch {
    return null;
  }
};

export default async function NewsDetailsPage({params, searchParams}) {
  const newsId = decodeURIComponent(String(params?.newsId || ''));
  const selectedNews = parseSelectedNews(searchParams?.selected);
  const apiNews = selectedNews ? null : await getNewsDetails(newsId);
  const news = selectedNews || apiNews;

  if (!news) {
    notFound();
  }

  const image = news.imageUrl || news.thumbnailUrl;
  const contentHtml = String(news.content || '').trim();

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

        <article className="newsDetailBlock">
          <h2>Full Details</h2>
          {contentHtml ? (
            <div className="newsDetailRichContent" dangerouslySetInnerHTML={{__html: contentHtml}} />
          ) : (
            <p>Full details are not available for this news item yet.</p>
          )}
        </article>
      </section>
    </main>
  );
}
