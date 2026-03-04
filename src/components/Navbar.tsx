'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';
import { Database, BookOpen, Github, Home } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/projects', label: 'Projects', icon: Database },
    { href: '/docs', label: 'Docs', icon: BookOpen },
    { href: '/open-source', label: 'Open Source', icon: Github },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">Q</span>
            </div>
            <span className="font-semibold text-lg text-foreground">
              Q SQL
            </span>
          </Link>

          <div className="flex items-center gap-1">
            {links.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              );
            })}
            <div className="ml-2 border-l border-border pl-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
