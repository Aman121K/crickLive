import Link from 'next/link';
import Script from 'next/script';
import SiteHeader from '@/components/SiteHeader';
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
    href: '/live-scores',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M15.7 3.3c.4 0 .8.2 1.1.5l2.4 2.4c.6.6.6 1.6 0 2.2l-1.3 1.3-4.6-4.6 1.3-1.3c.3-.3.7-.5 1.1-.5Zm-3.4 2.9 4.6 4.6-6.8 6.8-2.8.4.4-2.8 4.6-4.6Zm-6.8 10.2-.5 3.4 3.4-.5-2.9-2.9Z" />
        <circle cx="6.6" cy="6.7" r="2.1" />
      </svg>
    ),
  },
  {
    label: 'Series',
    href: '/browse-series',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 4h8v2a4 4 0 0 1-2.8 3.8A3.5 3.5 0 0 1 15 13v1h2a1 1 0 0 1 1 1v1H6v-1a1 1 0 0 1 1-1h2v-1a3.5 3.5 0 0 1 1.8-3.2A4 4 0 0 1 8 6V4Zm2 2a2 2 0 0 0 4 0H10Z" />
        <path d="M5 6h2a3 3 0 0 1-3 3V8a2 2 0 0 0 1-2Zm14 0h-2a3 3 0 0 0 3 3V8a2 2 0 0 1-1-2Z" />
        <rect x="9" y="17" width="6" height="2" rx="1" />
      </svg>
    ),
  },
  {
    label: 'News',
    href: '/?view=news',
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
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5715868535815636"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <div className="bgPattern" />
        <SiteHeader />
        <div className="siteContent">{children}</div>

        <footer className="desktopFooter">
          <div className="footerInner">
            <div className="footerCol footerBrand">
              <h3>criclive</h3>
              <p>Live scores, scorecards, stories and match updates in one place.</p>
            </div>

            <div className="footerCol footerApps">
              <h4>Apps</h4>
              <a href="#">Android</a>
              <a href="#">iOS</a>
            </div>

            <div className="footerCol footerFollow">
              <h4>Follow Us</h4>
              <a href="#">Facebook</a>
              <a href="#">Twitter</a>
              <a href="#">YouTube</a>
              <a href="#">Pinterest</a>
            </div>

            <div className="footerCol footerMore">
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
            © 2026 Criclive Platforms Limited. All rights reserved. Unauthorized use, reproduction, or distribution
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
