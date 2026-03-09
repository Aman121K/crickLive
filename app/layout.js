import Link from 'next/link';
import AuthHeaderAction from '@/components/AuthHeaderAction';
import './globals.css';

export const metadata = {
  title: 'MyCricket Web',
  description: 'Live, upcoming and finished cricket matches with scorecards and admin-managed news.',
};

const mobileTabs = [
  {
    label: 'Home',
    href: '/',
    active: true,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3 3 10.2V21h6.5v-6h5V21H21V10.2L12 3Z" />
      </svg>
    ),
  },
  {
    label: 'Matches',
    href: '/#matches',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9.8 3.1a7.2 7.2 0 0 0-5 2.4A7.1 7.1 0 0 0 9 17.7l6.7-12.1A7.2 7.2 0 0 0 9.8 3.1Zm4.6 3.2L7.7 18.4a7.1 7.1 0 0 0 9.8-9.4 6.9 6.9 0 0 0-3.1-2.7Z" />
      </svg>
    ),
  },
  {
    label: 'Series',
    href: '/#series',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 4h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-4.2L12 21l-1.8-3H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm1 3v2h10V7H7Zm0 4v2h10v-2H7Z" />
      </svg>
    ),
  },
  {
    label: 'News',
    href: '/#news',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 4h14a1 1 0 0 1 1 1v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 1-2Zm2 3v2h10V7H7Zm0 4v2h10v-2H7Zm0 4v2h6v-2H7Z" />
      </svg>
    ),
  },
];

export default function RootLayout({children}) {
  return (
    <html lang="en">
      <body>
        <div className="bgPattern" />
        <header className="siteHeader">
          <div className="headerTop">
            <button className="menuBtn" type="button" aria-label="Open menu">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 6h18v2H3V6Zm0 5h18v2H3v-2Zm0 5h18v2H3v-2Z" />
              </svg>
            </button>

            <Link href="/" className="brandLogo" aria-label="Cricbuzz home">
              cricbuzz
            </Link>

            <AuthHeaderAction />
          </div>

          <nav className="desktopNav" aria-label="Main">
            <Link href="/#matches">Live Scores</Link>
            <Link href="/#series">Series</Link>
            <Link href="/#matches">Matches</Link>
            <Link href="/#news">News</Link>
          </nav>
        </header>
        <div className="siteContent">{children}</div>

        <footer className="desktopFooter">
          <div className="footerInner">
            <div className="footerCol footerBrand">
              <h3>cricbuzz</h3>
              <p>Live scores, scorecards, stories and match updates in one place.</p>
            </div>

            <div className="footerCol">
              <h4>Apps</h4>
              <a href="#">Android</a>
              <a href="#">iOS</a>
            </div>

            <div className="footerCol">
              <h4>Follow Us</h4>
              <a href="#">Facebook</a>
              <a href="#">Twitter</a>
              <a href="#">YouTube</a>
              <a href="#">Pinterest</a>
            </div>

            <div className="footerCol">
              <h4>More</h4>
              <Link href="/browse-series">Browse Series</Link>
              <Link href="/browse-team">Browse Team</Link>
              <Link href="/browse-player">Browse Player</Link>
              <Link href="/upcoming-series">Upcoming Series</Link>
              <Link href="/ranking">Ranking</Link>
              <Link href="/faq">FAQ</Link>
              <Link href="/about-us">About Us</Link>
              <Link href="/privacy-notice">Privacy Policy</Link>
              <Link href="/terms-and-conditions">Terms & Condition</Link>
            </div>
          </div>
          <p className="footerCopy">
            © 2026 Cricbuzz Platforms Limited. All rights reserved. Unauthorized use, reproduction, or distribution
            of content is prohibited.
          </p>
        </footer>

        <nav className="mobileBottomTabs" aria-label="Primary">
          {mobileTabs.map(tab => (
            <Link
              key={tab.label}
              href={tab.href}
              className={`mobileTab ${tab.active ? 'active' : ''}`}
              aria-current={tab.active ? 'page' : undefined}>
              {tab.icon}
              <span>{tab.label}</span>
            </Link>
          ))}
        </nav>
      </body>
    </html>
  );
}
