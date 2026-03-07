'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="w-9 h-9" />;
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative p-2 rounded-lg hover:bg-secondary/80 transition-all duration-200 active:scale-90 group"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div className="relative w-4 h-4">
        {/* Sun icon */}
        <Sun
          className={`w-4 h-4 absolute inset-0 text-amber-500 transition-all duration-300 ${isDark
              ? 'opacity-100 rotate-0 scale-100'
              : 'opacity-0 rotate-90 scale-0'
            }`}
        />
        {/* Moon icon */}
        <Moon
          className={`w-4 h-4 absolute inset-0 text-indigo-400 transition-all duration-300 ${isDark
              ? 'opacity-0 -rotate-90 scale-0'
              : 'opacity-100 rotate-0 scale-100'
            }`}
        />
      </div>
    </button>
  );
}
