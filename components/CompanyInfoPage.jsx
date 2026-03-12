import Link from 'next/link';

const CompanyInfoPage = ({title, intro, sections = [], sourceLinks = [], tag = 'Company Information'}) => {
  return (
    <main className="pageShell infoShell">
      <section className="infoCard">
        <p className="heroTag">{tag}</p>
        <h1>{title}</h1>
        <p className="infoIntro">{intro}</p>

        <div className="infoSections">
          {sections.map(section => (
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

        <article className="infoBlock">
          <h2>Sources</h2>
          <ul>
            {sourceLinks.map(link => (
              <li key={link.href}>
                <a href={link.href} target="_blank" rel="noreferrer">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </article>

        {/* <Link href="/" className="ghostBtn infoBackLink">
          Back to Home
        </Link> */}
      </section>
    </main>
  );
};

export default CompanyInfoPage;
