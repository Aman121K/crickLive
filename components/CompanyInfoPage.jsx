import Link from 'next/link';

const CompanyInfoPage = ({title, intro, sections = [], sourceLinks = [], tag = 'Company Information'}) => {
  const safeSections = Array.isArray(sections)
    ? sections.filter(section => section && section.heading && Array.isArray(section.points) && section.points.length)
    : [];
  const safeSourceLinks = Array.isArray(sourceLinks)
    ? sourceLinks.filter(link => link && link.href && link.label)
    : [];

  return (
    <main className="pageShell infoShell">
      <section className="infoCard">
        <p className="heroTag">{tag}</p>
        <h1>{title}</h1>
        <p className="infoIntro">{intro || ''}</p>

        <div className="infoSections">
          {safeSections.map(section => (
            <article key={section.heading} className="infoBlock">
              <h2>{section.heading}</h2>
              <ul>
                {section.points.map(point => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        {safeSourceLinks.length ? (
          <article className="infoBlock">
            <h2>Sources</h2>
            <ul>
              {safeSourceLinks.map(link => (
                <li key={link.href}>
                  <a href={link.href} target="_blank" rel="noreferrer">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </article>
        ) : null}

        {/* <Link href="/" className="ghostBtn infoBackLink">
          Back to Home
        </Link> */}
      </section>
    </main>
  );
};

export default CompanyInfoPage;
