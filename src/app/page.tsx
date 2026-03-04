import Link from 'next/link';
import { Database, Zap, Shield, Code2, ArrowRight, Github } from 'lucide-react';

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="py-20 sm:py-32 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          <Zap className="w-3.5 h-3.5" />
          Open Source SQL Playground
        </div>
        <h1 className="text-4xl sm:text-6xl font-bold text-foreground tracking-tight">
          Write SQL.{' '}
          <span className="text-primary">See Results.</span>
          <br />
          In Real Time.
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          A minimalistic SQL editor powered by your own Supabase database. Full RDBMS
          support with keys, joins, aggregations, and everything you need.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-foreground font-medium hover:bg-secondary transition-all"
          >
            Read the Docs
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t border-border">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-foreground mb-12">
          Everything you need
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Database,
              title: 'Full RDBMS Support',
              desc: 'CREATE, INSERT, UPDATE, DELETE, JOINs, keys, indexes, constraints, aggregations, subqueries, and more.',
            },
            {
              icon: Zap,
              title: 'Real-time Results',
              desc: 'Execute SQL instantly against your Supabase PostgreSQL database and see results in a clean tabular format.',
            },
            {
              icon: Shield,
              title: 'Your Data, Your Control',
              desc: 'Connect your own Supabase project. Credentials are stored locally. Nothing is sent to third-party servers.',
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
              title: 'Project Isolation',
              desc: 'Create multiple projects. Each project has its own query history. One project never affects another.',
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="p-6 rounded-2xl border border-border bg-card hover:border-primary/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-border text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
          Ready to start querying?
        </h2>
        <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
          Connect your Supabase database, create a project, and start writing SQL in minutes.
        </p>
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all"
        >
          Launch Editor
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border text-center text-sm text-muted-foreground">
        <p>
          Q SQL is open source under the MIT License.{' '}
          <Link href="/open-source" className="text-primary hover:underline">
            Learn more
          </Link>
        </p>
      </footer>
    </div>
  );
}
