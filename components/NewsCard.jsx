import Link from 'next/link';

const NewsCard = ({item, featured = false, compact = false}) => {
  const image = item.imageUrl || item.thumbnailUrl;
  const newsId = encodeURIComponent(String(item.id || 'news'));

  if (compact) {
    return (
      <Link href={`/news/${newsId}`} className="newsListItem">
        {image ? <img src={image} alt={item.title} className="newsListThumb" /> : <div className="newsListThumb" />}
        <div className="newsListBody">
          <p className="newsListMeta">
            {item.tag} • {item.time}
          </p>
          <h3>{item.title}</h3>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/news/${newsId}`} className={`newsCardLink ${featured ? 'newsFeatured' : ''}`}>
      <article className="newsCard">
        {image ? <img src={image} alt={item.title} className="newsImage" /> : <div className="newsImagePlaceholder" />}
        <div className="newsBody">
          <p className="newsMeta">
            {item.tag} • {item.time}
          </p>
          <h3>{item.title}</h3>
          {item.summary ? <p className="newsSummary">{item.summary}</p> : null}
        </div>
      </article>
    </Link>
  );
};

export default NewsCard;
