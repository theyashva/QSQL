'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';
import { Menu, X, Github } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setMobileOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (pathname.startsWith('/playground')) return null;

  const links = [
    { href: '/', label: 'Home' },
    { href: '/playground', label: 'Playground' },
    { href: '/docs', label: 'Docs' },
    { href: '/guide', label: 'Guide' },
    { href: '/open-source', label: 'Open Source' },
  ];

  return (
    <nav className={`sticky top-0 z-50 glass-nav transition-all duration-300 ${scrolled ? 'shadow-md shadow-foreground/[0.03] dark:shadow-black/20' : ''}`}>
      <div className="max-w-[72rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo — text-only gradient */}
          <Link href="/" className="group flex items-center">
            <span className="text-2xl font-black tracking-tight gradient-text transition-opacity duration-200 group-hover:opacity-80">
              QSQL
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-2">
            {links.map(({ href, label }) => {
              const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 group ${isActive
                    ? 'text-primary bg-primary/8'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  {label}
                  {/* Active indicator */}
                  {isActive && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-5 h-[2.5px] rounded-full bg-primary" />
                  )}
                  {/* Hover underline (non-active only) */}
                  {!isActive && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-[2px] rounded-full bg-foreground/40 w-0 group-hover:w-5 transition-all duration-300" />
                  )}
                </Link>
              );
            })}

            <div className="ml-3 flex items-center gap-1.5 border-l border-border pl-3">
              <a
                href="https://github.com/theyashva/QSQL"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl hover:bg-secondary transition-all duration-200 active:scale-95"
                aria-label="GitHub"
              >
                <Github className="w-[18px] h-[18px] text-muted-foreground hover:text-foreground transition-colors" />
              </a>
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile controls */}
          <div className="flex md:hidden items-center gap-1">
            <a href="https://github.com/theyashva/QSQL" target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl hover:bg-secondary transition-all" aria-label="GitHub">
              <Github className="w-[18px] h-[18px] text-muted-foreground" />
            </a>
            <ThemeToggle />
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-xl hover:bg-secondary transition-colors" aria-label="Toggle menu">
              {mobileOpen ? <X className="w-5 h-5 text-foreground" /> : <Menu className="w-5 h-5 text-foreground" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border glass-nav animate-slide-down">
          <div className="px-4 py-3 space-y-1">
            {links.map(({ href, label }) => {
              const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-all ${isActive ? 'bg-primary/8 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
