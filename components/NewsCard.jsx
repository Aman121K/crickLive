import Link from 'next/link';

const NewsCard = ({item, featured = false, compact = false}) => {
  const image = item.imageUrl || item.thumbnailUrl;
  const newsId = encodeURIComponent(String(item.id || 'news'));
  const selectedNewsPayload = encodeURIComponent(
    JSON.stringify({
      title: item.title || '',
      summary: item.summary || '',
      content: item.content || '',
      tag: item.tag || 'NEWS',
      time: item.time || 'Recently',
      author: item.author || 'Staff Writer',
      imageUrl: item.imageUrl || '',
      thumbnailUrl: item.thumbnailUrl || '',
    })
  );
  const detailHref = {
    pathname: `/news/${newsId}`,
    query: {selected: selectedNewsPayload},
  };

  if (compact) {
    return (
      <Link href={detailHref} className="newsListItem">
        {image ? <img src={image} alt={item.title} className="newsListThumb" /> : <div className="newsListThumb" />}
        <div className="newsListBody">
          <h3>{item.title}</h3>
          <p className="newsListMeta">
            {item.time} • {item.author || 'Staff Writer'}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link href={detailHref} className={`newsCardLink ${featured ? 'newsFeatured' : ''}`}>
      <article className="newsCard">
        {image ? <img src={image} alt={item.title} className="newsImage" /> : <div className="newsImagePlaceholder" />}
        <div className="newsBody">
          <h3>{item.title}</h3>
          <p className="newsMeta">
            {item.time} • {item.author || 'Staff Writer'}
          </p>
          {item.summary ? <p className="newsSummary">{item.summary}</p> : null}
        </div>
      </article>
    </Link>
  );
};

export default NewsCard;
