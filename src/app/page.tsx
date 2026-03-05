import Link from 'next/link';
import { Database, Zap, Shield, Code2, ArrowRight, Github } from 'lucide-react';

const features = [
  {
    icon: Database,
    title: 'Full RDBMS Support',
    desc: 'CREATE, INSERT, UPDATE, DELETE, JOINs, keys, indexes, constraints, aggregations, subqueries, and more.',
  },
  {
    icon: Zap,
    title: 'Real-time Results',
    desc: 'Execute SQL instantly against your Supabase PostgreSQL database with clean tabular output.',
  },
  {
    icon: Shield,
    title: 'Your Data, Your Control',
    desc: 'Connect your own Supabase. Credentials stored locally — nothing sent to third parties.',
  },
  {
    icon: Code2,
    title: 'Monaco Editor',
    desc: 'VS Code-quality editing with syntax highlighting, autocomplete, and keyboard shortcuts.',
  },
  {
    icon: Github,
    title: 'Open Source',
    desc: 'MIT licensed. Fork it, extend it, contribute to it. Built for the community.',
  },
  {
    icon: Database,
    title: 'Multi-Tab Editor',
    desc: 'Open multiple query tabs side by side. Each tab has its own editor and results panel.',
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-border/50 animate-fade-in">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/8 border border-primary/15 text-primary text-xs font-semibold tracking-wide uppercase mb-8">
            <Zap className="w-3.5 h-3.5" />
            Open Source SQL Playground
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight leading-[1.1] mb-6">
            Write SQL.{' '}
            <span className="text-primary">See Results.</span>
            <br />
            In Real Time.
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
            A minimalistic SQL editor powered by your own Supabase database.
            Full RDBMS support — keys, joins, aggregations, and more.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/playground"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm active:scale-[0.97]"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-foreground text-sm font-medium hover:bg-secondary/60 transition-colors"
            >
              Read the Docs
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-border/50 animate-fade-in animate-delay-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-foreground mb-12">
            Everything you need
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="p-6 rounded-xl border border-border/50 bg-card hover:border-primary/25 transition-colors card-hover"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/8 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="animate-fade-in animate-delay-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Ready to start querying?
          </h2>
          <p className="text-base text-muted-foreground mb-8 max-w-lg mx-auto">
            Connect your Supabase database and start writing SQL in minutes.
          </p>
          <Link
            href="/playground"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm active:scale-[0.97]"
          >
            Launch Editor
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-muted-foreground">
          QSQL is open source under the MIT License.{' '}
          <Link href="/open-source" className="text-primary hover:underline">
            Learn more
          </Link>
        </div>
      </footer>
    </>
  );
}
