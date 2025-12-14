'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Navigation structure organized by content type
const NAV_SECTIONS = {
  catalogs: {
    label: 'Catalogs',
    items: [
      { href: '/bph', label: 'Hermetic Library', description: '28,000 esoteric works with IA links' },
      { href: '/explore', label: 'USTC Data', description: '500,000 Latin works from 1450-1700' },
    ],
  },
  tools: {
    label: 'Tools',
    items: [
      { href: '/translate', label: 'AI Translator', description: 'Translate Latin texts with AI' },
      { href: '/digitizer', label: 'Digitizer', description: 'OCR and transcription' },
      { href: '/validate', label: 'Verify Matches', description: 'Help validate IA book links' },
    ],
  },
  research: {
    label: 'Research',
    items: [
      { href: '/blog', label: 'Essays', description: 'Research articles and findings' },
      { href: '/rivers', label: 'Rivers of Life', description: 'Animated flow of esoteric traditions' },
      { href: '/timelines', label: 'Timelines', description: 'Charts of Latin printing history' },
      { href: '/map', label: 'Printing Map', description: 'Animated map of printing centers' },
      { href: '/data', label: 'Data Dashboard', description: 'Statistics and coverage' },
    ],
  },
  about: {
    label: 'About',
    items: [
      { href: '/about', label: 'About', description: 'The project and team' },
      { href: '/contribute', label: 'Contribute', description: 'Ways to help the project' },
    ],
  },
};

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.nav-container')) {
        setIsOpen(false);
        setOpenDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const toggleDropdown = (key: string) => {
    setOpenDropdown(openDropdown === key ? null : key);
  };

  return (
    <nav className="nav-container" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      background: 'rgba(253, 252, 249, 0.97)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #e8e4dc',
      zIndex: 1000,
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 24px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link href="/" style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '12px',
          fontWeight: 500,
          letterSpacing: '0.08em',
          color: '#1a1612',
          textDecoration: 'none',
          whiteSpace: 'nowrap',
        }}>
          SECOND RENAISSANCE
        </Link>

        {/* Desktop Navigation */}
        <div className="desktop-nav" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          {/* Section Dropdowns */}
          {Object.entries(NAV_SECTIONS).map(([key, section]) => (
            <div key={key} style={{ position: 'relative' }}>
              <button
                onClick={() => toggleDropdown(key)}
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '13px',
                  color: '#555',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0,0,0,0.04)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {section.label}
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{
                  transform: openDropdown === key ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                }}>
                  <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {/* Dropdown Menu */}
              {openDropdown === key && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: '0',
                  marginTop: '4px',
                  background: '#fff',
                  border: '1px solid #e8e4dc',
                  borderRadius: '8px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  minWidth: '240px',
                  padding: '8px',
                  zIndex: 1001,
                }}>
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      style={{
                        display: 'block',
                        padding: '10px 12px',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f5f0e8';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <div style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: pathname === item.href ? '#9e4a3a' : '#1a1612',
                        marginBottom: '2px',
                      }}>
                        {item.label}
                      </div>
                      <div style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '12px',
                        color: '#888',
                      }}>
                        {item.description}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Support Button (Desktop) */}
          <a
            href="https://www.ancientwisdomtrust.org/become-a-patron"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '12px',
              fontWeight: 500,
              color: '#fff',
              background: '#9e4a3a',
              padding: '8px 16px',
              borderRadius: '6px',
              textDecoration: 'none',
              marginLeft: '8px',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#8a4033';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#9e4a3a';
            }}
          >
            Support
          </a>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            marginRight: '-8px',
          }}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            {isOpen ? (
              <path d="M6 6L18 18M6 18L18 6" stroke="#1a1612" strokeWidth="2" strokeLinecap="round"/>
            ) : (
              <>
                <path d="M4 7H20" stroke="#1a1612" strokeWidth="2" strokeLinecap="round"/>
                <path d="M4 12H20" stroke="#1a1612" strokeWidth="2" strokeLinecap="round"/>
                <path d="M4 17H20" stroke="#1a1612" strokeWidth="2" strokeLinecap="round"/>
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="mobile-overlay"
          style={{
            position: 'fixed',
            top: '64px',
            left: 0,
            right: 0,
            bottom: 0,
            background: '#fdfcf9',
            overflowY: 'auto',
            padding: '16px 24px 100px',
          }}
        >
          {/* Mobile Navigation Sections */}
          {Object.entries(NAV_SECTIONS).map(([key, section]) => (
            <div key={key} style={{ marginBottom: '24px' }}>
              <div style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                color: '#888',
                textTransform: 'uppercase',
                marginBottom: '12px',
                padding: '0 4px',
              }}>
                {section.label}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    style={{
                      display: 'block',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      background: pathname === item.href ? '#f5f0e8' : 'transparent',
                    }}
                  >
                    <div style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '15px',
                      fontWeight: 500,
                      color: pathname === item.href ? '#9e4a3a' : '#1a1612',
                      marginBottom: '2px',
                    }}>
                      {item.label}
                    </div>
                    <div style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '13px',
                      color: '#888',
                    }}>
                      {item.description}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {/* Mobile Support Button */}
          <div style={{ marginTop: '32px', padding: '0 4px' }}>
            <a
              href="https://www.ancientwisdomtrust.org/become-a-patron"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                fontFamily: 'Inter, sans-serif',
                fontSize: '15px',
                fontWeight: 500,
                color: '#fff',
                background: '#9e4a3a',
                padding: '16px',
                borderRadius: '8px',
                textDecoration: 'none',
                textAlign: 'center',
              }}
            >
              Support This Work
            </a>
          </div>
        </div>
      )}

      {/* Responsive Styles */}
      <style jsx>{`
        @media (max-width: 900px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
        }
        @media (min-width: 901px) {
          .mobile-overlay {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
}
