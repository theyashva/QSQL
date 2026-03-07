import Link from 'next/link';
import { Github, Heart, GitFork, Star, BookOpen, Scale, Users, Code2, ArrowRight, ExternalLink } from 'lucide-react';

const techStack = [
  { name: 'Next.js 16', desc: 'React framework', icon: '⚡', bg: 'bg-gray-500/10' },
  { name: 'TypeScript', desc: 'Type safety', icon: '📘', bg: 'bg-blue-500/10' },
  { name: 'Tailwind CSS', desc: 'Utility-first CSS', icon: '🎨', bg: 'bg-cyan-500/10' },
  { name: 'Supabase', desc: 'PostgreSQL database', icon: '🟢', bg: 'bg-emerald-500/10' },
  { name: 'Monaco Editor', desc: 'Code editor', icon: '💜', bg: 'bg-violet-500/10' },
  { name: 'Lucide Icons', desc: 'Icon library', icon: '✨', bg: 'bg-amber-500/10' },
];

const contributingSteps = [
  { step: '1', title: 'Fork the Repository', desc: 'Create your own copy of QSQL on GitHub.' },
  { step: '2', title: 'Clone & Install', desc: 'Clone your fork and run npm install.' },
  { step: '3', title: 'Create a Branch', desc: 'git checkout -b feature/my-feature' },
  { step: '4', title: 'Make Changes', desc: 'Follow the existing code style and conventions.' },
  { step: '5', title: 'Submit a Pull Request', desc: 'Push and open a PR with a clear description.' },
];

export default function OpenSourcePage() {
  return (
    <div className="max-w-[56rem] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 pb-24 animate-fade-in">
      {/* Hero */}
      <div className="text-center mb-14">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500/15 to-red-500/15 border border-pink-500/10 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-pink-500/10">
          <Heart className="w-8 h-8 text-pink-500" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-foreground mb-3">
          Open Source &amp; Community Driven
        </h1>
        <p className="text-lg text-muted-foreground max-w-[42rem] mx-auto">
          QSQL is fully open source under the MIT License. Built for the community.
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-14">
        {[
          { href: 'https://github.com/theyashva/QSQL', icon: Github, title: 'GitHub Repo', desc: 'View source code', color: 'text-foreground' },
          { href: 'https://github.com/theyashva/QSQL', icon: Star, title: 'Star Project', desc: 'Show your support', color: 'text-amber-500' },
          { href: 'https://github.com/theyashva/QSQL/fork', icon: GitFork, title: 'Fork & Contribute', desc: 'Make it yours', color: 'text-violet-500' },
        ].map(({ href, icon: Icon, title, desc, color }) => (
          <a key={title} href={href} target="_blank" rel="noopener noreferrer" className="premium-card p-5 flex items-center gap-4 group">
            <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                {title}
                <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          </a>
        ))}
      </div>

      {/* About */}
      <section className="mb-12">
        <h2 className="text-xl font-black text-foreground mb-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center"><BookOpen className="w-4.5 h-4.5 text-blue-500" /></div>
          About QSQL
        </h2>
        <div className="premium-card p-6 space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>QSQL is a real-time SQL editor that connects to your own Supabase PostgreSQL database. It supports table creation, CRUD operations, joins, keys, indexes, constraints, aggregations, window functions, CTEs, and much more.</p>
          <p>Built with Next.js, Tailwind CSS, and Monaco Editor (the same editor behind VS Code), QSQL offers a professional coding experience right in your browser.</p>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="mb-12">
        <h2 className="text-xl font-black text-foreground mb-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center"><Code2 className="w-4.5 h-4.5 text-violet-500" /></div>
          Tech Stack
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {techStack.map(({ name, desc, icon, bg }) => (
            <div key={name} className="premium-card p-5">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3 text-lg`}>{icon}</div>
              <p className="font-bold text-foreground text-sm">{name}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* License */}
      <section className="mb-12">
        <h2 className="text-xl font-black text-foreground mb-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center"><Scale className="w-4.5 h-4.5 text-emerald-500" /></div>
          MIT License
        </h2>
        <div className="premium-card overflow-hidden">
          <div className="px-6 py-3 border-b border-border bg-muted/20">
            <span className="text-xs font-bold text-muted-foreground">LICENSE</span>
          </div>
          <pre className="p-6 text-xs font-mono text-muted-foreground whitespace-pre-wrap leading-relaxed">{`MIT License

Copyright (c) ${new Date().getFullYear()} QSQL Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.`}</pre>
        </div>
      </section>

      {/* Contributing */}
      <section className="mb-12">
        <h2 className="text-xl font-black text-foreground mb-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center"><Users className="w-4.5 h-4.5 text-amber-500" /></div>
          Contributing
        </h2>
        <div className="space-y-3">
          {contributingSteps.map(({ step, title, desc }, i) => (
            <div key={step} className="relative">
              {i < contributingSteps.length - 1 && (
                <div className="absolute left-[18px] top-[52px] bottom-[-12px] w-[2px] bg-gradient-to-b from-primary/20 to-border z-0" />
              )}
              <div className="relative premium-card p-5 flex items-start gap-4 z-10">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-primary font-bold text-xs">{step}</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">{title}</h3>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Dev Setup */}
      <section className="mb-12">
        <h2 className="text-xl font-black text-foreground mb-4">Development Setup</h2>
        <div className="premium-card overflow-hidden">
          <div className="p-6 space-y-4">
            {[
              { label: '1. Clone the repo', code: 'git clone https://github.com/theyashva/QSQL.git\ncd QSQL' },
              { label: '2. Install deps', code: 'npm install' },
              { label: '3. Start dev server', code: 'npm run dev' },
              { label: '4. Open browser', code: 'http://localhost:3000' },
            ].map(({ label, code }) => (
              <div key={label}>
                <p className="text-sm font-bold text-foreground mb-2">{label}</p>
                <pre className="text-xs font-mono text-muted-foreground bg-muted/30 p-3.5 rounded-xl leading-relaxed border border-border/50">{code}</pre>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="text-center py-10 border-t border-border">
        <p className="text-sm text-muted-foreground mb-4">
          Made with <Heart className="w-4 h-4 inline text-pink-500" /> by the community
        </p>
        <div className="flex items-center justify-center gap-5 text-sm font-medium">
          <Link href="/guide" className="text-primary hover:underline">Setup Guide</Link>
          <span className="text-border">·</span>
          <Link href="/docs" className="text-primary hover:underline">Documentation</Link>
          <span className="text-border">·</span>
          <Link href="/playground" className="text-primary hover:underline inline-flex items-center gap-1">Playground <ArrowRight className="w-3 h-3" /></Link>
        </div>
      </div>
    </div>
  );
}
