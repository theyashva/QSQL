import Link from 'next/link';
import { Database, Zap, Shield, Code2, ArrowRight, Github, Sparkles, Terminal } from 'lucide-react';

const features = [
  {
    icon: Database,
    title: 'Full RDBMS Support',
    desc: 'CREATE, INSERT, UPDATE, DELETE, JOINs, keys, indexes, constraints, aggregations, subqueries, and more.',
    gradient: 'from-blue-500 to-indigo-600',
    bg: 'bg-blue-500/10',
  },
  {
    icon: Zap,
    title: 'Real-time Results',
    desc: 'Execute SQL instantly against your Supabase PostgreSQL database with clean tabular output.',
    gradient: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-500/10',
  },
  {
    icon: Shield,
    title: 'Your Data, Your Control',
    desc: 'Connect your own Supabase instance. Credentials stored locally — nothing sent to third parties.',
    gradient: 'from-emerald-500 to-green-600',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: Code2,
    title: 'Monaco Editor',
    desc: 'VS Code-quality editing with syntax highlighting, autocomplete, and keyboard shortcuts.',
    gradient: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-500/10',
  },
  {
    icon: Github,
    title: 'Open Source',
    desc: 'MIT licensed. Fork it, extend it, contribute to it. Built for the community.',
    gradient: 'from-gray-500 to-slate-600',
    bg: 'bg-gray-500/10',
  },
  {
    icon: Terminal,
    title: 'Multi-Tab Editor',
    desc: 'Open multiple query tabs side by side. Each tab has its own editor and results panel.',
    gradient: 'from-cyan-500 to-sky-600',
    bg: 'bg-cyan-500/10',
  },
];

export default function Home() {
  return (
    <>
      {/* ═══ HERO SECTION ═══ */}
      <section className="relative overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 grid-pattern" />

        <div className="relative max-w-[72rem] mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28 sm:pt-28 sm:pb-36 text-center">
          {/* Badge */}
          <div className="animate-fade-in inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/8 border border-primary/20 text-primary text-xs font-bold tracking-wider uppercase mb-8 shimmer-badge">
            <Sparkles className="w-3.5 h-3.5" />
            Open Source SQL Playground
          </div>

          {/* Main heading */}
          <h1 className="animate-fade-in animate-delay-100 text-4xl sm:text-5xl lg:text-6xl font-black text-foreground tracking-tight leading-[1.1] mb-6">
            Write SQL.{' '}
            <span className="gradient-text">See Results.</span>
            <br className="hidden sm:block" />
            <span className="sm:block">In Real Time.</span>
          </h1>

          {/* Subtitle */}
          <p className="animate-fade-in animate-delay-200 text-lg sm:text-xl text-foreground/65 dark:text-muted-foreground max-w-[42rem] mx-auto leading-relaxed mb-10">
            A minimalistic SQL editor powered by your own Supabase database.
            Full RDBMS support — keys, joins, aggregations, and more.
          </p>

          {/* CTA buttons */}
          <div className="animate-fade-in animate-delay-300 flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Link
              href="/playground"
              className="btn-primary inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-primary text-primary-foreground text-base font-bold hover:bg-primary/90 transition-all"
            >
              Get Started
              <ArrowRight className="w-4.5 h-4.5" />
            </Link>
            <Link
              href="/docs"
              className="btn-secondary inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-foreground text-base font-semibold transition-all"
            >
              Read the Docs
            </Link>
          </div>

          {/* ═══ CODE PREVIEW WINDOW ═══ */}
          <div className="animate-fade-in animate-delay-400 max-w-[48rem] mx-auto">
            <div className="elevated-card overflow-hidden">
              {/* Window chrome bar */}
              <div className="flex items-center gap-2.5 px-5 py-3 border-b border-border bg-muted/30">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                  <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                </div>
                <div className="flex-1 flex justify-center">
                  <span className="text-xs text-muted-foreground/70 font-mono bg-muted/40 px-4 py-1 rounded-md">query.sql</span>
                </div>
              </div>

              {/* SQL Code */}
              <div className="p-6 text-left font-mono text-sm sm:text-base leading-relaxed bg-card">
                <div className="space-y-0.5">
                  <p>
                    <span className="text-blue-600 dark:text-blue-400 font-bold">SELECT</span>{' '}
                    <span className="text-foreground">name, department, salary</span>
                  </p>
                  <p>
                    <span className="text-blue-600 dark:text-blue-400 font-bold">FROM</span>{' '}
                    <span className="text-emerald-600 dark:text-emerald-400">employees</span>
                  </p>
                  <p>
                    <span className="text-blue-600 dark:text-blue-400 font-bold">WHERE</span>{' '}
                    <span className="text-foreground">salary {'>'}</span>{' '}
                    <span className="text-amber-600 dark:text-amber-400">50000</span>
                  </p>
                  <p>
                    <span className="text-blue-600 dark:text-blue-400 font-bold">ORDER BY</span>{' '}
                    <span className="text-foreground">salary</span>{' '}
                    <span className="text-blue-600 dark:text-blue-400 font-bold">DESC</span>
                    <span className="text-muted-foreground">;</span>
                  </p>
                </div>
              </div>

              {/* Results preview */}
              <div className="border-t border-border bg-muted/20 px-6 py-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-soft-pulse" />
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">3 rows · 12ms</span>
                </div>
                <div className="overflow-hidden rounded-xl border border-border bg-card">
                  <table className="result-table">
                    <thead>
                      <tr>
                        <th>name</th>
                        <th>department</th>
                        <th>salary</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="text-foreground">Alice</td>
                        <td className="text-foreground">Engineering</td>
                        <td className="text-blue-600 dark:text-blue-400 font-semibold">95000</td>
                      </tr>
                      <tr>
                        <td className="text-foreground">Bob</td>
                        <td className="text-foreground">Marketing</td>
                        <td className="text-blue-600 dark:text-blue-400 font-semibold">75000</td>
                      </tr>
                      <tr>
                        <td className="text-foreground">Carol</td>
                        <td className="text-foreground">Design</td>
                        <td className="text-blue-600 dark:text-blue-400 font-semibold">68000</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FEATURES SECTION ═══ */}
      <section className="relative">
        <div className="section-divider" />
        <div className="max-w-[72rem] mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 sm:pt-36 sm:pb-32">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-4">
              Everything you need
            </h2>
            <p className="text-lg text-muted-foreground max-w-[36rem] mx-auto">
              A complete SQL toolkit designed for developers, students, and database enthusiasts.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc, gradient, bg }, i) => (
              <div
                key={title}
                className="animate-fade-in premium-card p-7"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mb-5`}>
                  <Icon className={`w-6 h-6 bg-gradient-to-br ${gradient} bg-clip-text`} style={{ color: `var(--tw-gradient-from)` }} />
                </div>
                <h3 className="font-bold text-foreground mb-2 text-base">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA SECTION ═══ */}
      <section className="relative">
        <div className="section-divider" />
        <div className="relative max-w-[72rem] mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center">
          <div className="animate-fade-in max-w-[42rem] mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-5">
              Ready to start querying?
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              Connect your Supabase database and start writing SQL in minutes.
            </p>
            <Link
              href="/playground"
              className="btn-primary inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-primary text-primary-foreground text-base font-bold hover:bg-primary/90 transition-all"
            >
              Launch Editor
              <ArrowRight className="w-4.5 h-4.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-border bg-card/50">
        <div className="max-w-[72rem] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <span className="text-lg font-black tracking-tight gradient-text">QSQL</span>
              <span className="text-sm text-muted-foreground font-medium">
                Open source under MIT License
              </span>
            </div>
            <div className="flex items-center gap-8 text-sm font-medium">
              <Link href="/docs" className="text-muted-foreground hover:text-foreground transition-colors">Docs</Link>
              <Link href="/guide" className="text-muted-foreground hover:text-foreground transition-colors">Guide</Link>
              <Link href="/open-source" className="text-muted-foreground hover:text-foreground transition-colors">Open Source</Link>
              <a href="https://github.com/theyashva/QSQL" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5">
                <Github className="w-4 h-4" /> GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
