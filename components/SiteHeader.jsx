'use client';

import Link from 'next/link';
import {useEffect, useState} from 'react';
import {usePathname} from 'next/navigation';
import AuthHeaderAction from '@/components/AuthHeaderAction';

const navLinks = [
  {label: 'Home', href: '/'},
  {label: 'Live Score', href: '/live-scores'},
  {label: 'Shedule', href: '/upcoming-series'},
  {label: 'News', href: '/?view=news'},
  {label: 'Series', href: '/browse-series'},
  {label: 'Teams', href: '/browse-team'},
  {label: 'Ranking', href: '/ranking'},
];

const legalLinks = [
  {label: 'About Us', href: '/about-us'},
  {label: 'Terms & Conditions', href: '/terms-and-conditions'},
  {label: 'Privacy Policy', href: '/privacy-notice'},
];

const SiteHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className="siteHeader">
      <div className="headerTop">
        <button
          className="menuBtn"
          type="button"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-site-menu"
          onClick={() => setMenuOpen(value => !value)}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 6h18v2H3V6Zm0 5h18v2H3v-2Zm0 5h18v2H3v-2Z" />
          </svg>
        </button>

        <Link href="/" className="brandLogo" aria-label="Criclive home">
          criclive
        </Link>

        <AuthHeaderAction />
      </div>

      <nav className="desktopNav" aria-label="Main">
        {navLinks.map(link => (
          <Link key={link.label} href={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>

      <button
        type="button"
        className={`mobileMenuOverlay ${menuOpen ? 'open' : ''}`}
        aria-label="Close menu"
        onClick={() => setMenuOpen(false)}
      />
      <nav id="mobile-site-menu" className={`mobileMenuPanel ${menuOpen ? 'open' : ''}`} aria-label="Mobile main">
        {navLinks.map(link => (
          <Link key={link.label} href={link.href} onClick={() => setMenuOpen(false)}>
            {link.label}
          </Link>
        ))}
        <div className="mobileMenuLegal">
          {legalLinks.map(link => (
            <Link key={link.label} href={link.href} onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
};

export default SiteHeader;
