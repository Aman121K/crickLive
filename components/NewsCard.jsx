import Link from 'next/link';

const NewsCard = ({item, featured = false}) => {
  const image = item.imageUrl || item.thumbnailUrl;
  const newsId = encodeURIComponent(String(item.id || 'news'));

  return (
    <Link href={`/news/${newsId}`} className={`newsCardLink ${featured ? 'newsFeatured' : ''}`}>
      <article className="newsCard">
        {image ? <img src={image} alt={item.title} className="newsImage" /> : <div className="newsImagePlaceholder" />}
        <div className="newsBody">
          <p className="newsMeta">{item.tag} • {item.time}</p>
          <h3>{item.title}</h3>
          {item.summary ? <p className="newsSummary">{item.summary}</p> : null}
        </div>
      </article>
    </Link>
  );
};

export default NewsCard;
