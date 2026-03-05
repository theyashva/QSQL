import Link from 'next/link';
import { Github, Heart, GitFork, Star, BookOpen, Scale, Users, Code2 } from 'lucide-react';

export default function OpenSourcePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 pb-20 animate-fade-in">
      {/* Hero */}
      <div className="text-center mb-14">
        <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center mx-auto mb-4">
          <Heart className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
          Open Source &amp; Community Driven
        </h1>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto">
          QSQL is fully open source under the MIT License. We believe in building tools
          that empower developers and learners alike.
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-14">
        <a
          href="https://github.com/theyashva/QSQL"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 p-3.5 rounded-lg border border-border/50 bg-card hover:border-primary/30 transition-all"
        >
          <Github className="w-4 h-4 text-primary" />
          <div>
            <h3 className="text-sm font-semibold text-foreground">GitHub Repository</h3>
            <p className="text-sm text-muted-foreground">View source code</p>
          </div>
        </a>
        <a
          href="https://github.com/theyashva/QSQL"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 p-3.5 rounded-lg border border-border/50 bg-card hover:border-primary/30 transition-all"
        >
          <Star className="w-4 h-4 text-primary" />
          <div>
            <h3 className="text-sm font-semibold text-foreground">Star the Project</h3>
            <p className="text-sm text-muted-foreground">Show your support</p>
          </div>
        </a>
        <a
          href="https://github.com/theyashva/QSQL/fork"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 p-3.5 rounded-lg border border-border/50 bg-card hover:border-primary/30 transition-all"
        >
          <GitFork className="w-4 h-4 text-primary" />
          <div>
            <h3 className="text-sm font-semibold text-foreground">Fork &amp; Contribute</h3>
            <p className="text-sm text-muted-foreground">Make it yours</p>
          </div>
        </a>
      </div>

      {/* About */}
      <section className="mb-10">
        <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" />
          About QSQL
        </h2>
        <div className="space-y-2.5 text-sm text-muted-foreground leading-relaxed">
          <p>
            QSQL is a real-time SQL editor and playground that connects to your own Supabase
            PostgreSQL database. It provides full RDBMS functionality including table creation,
            CRUD operations, joins, keys, indexes, constraints, aggregations, window functions,
            CTEs, and much more.
          </p>
          <p>
            Built with Next.js, Tailwind CSS, and Monaco Editor (the same editor that powers
            VS Code), QSQL offers a professional-grade coding experience right in your browser.
          </p>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="mb-10">
        <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
          <Code2 className="w-4 h-4 text-primary" />
          Tech Stack
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { name: 'Next.js 15', desc: 'React framework' },
            { name: 'TypeScript', desc: 'Type safety' },
            { name: 'Tailwind CSS', desc: 'Utility-first CSS' },
            { name: 'Supabase', desc: 'PostgreSQL database' },
            { name: 'Monaco Editor', desc: 'Code editor' },
            { name: 'Lucide Icons', desc: 'Icon library' },
          ].map(({ name, desc }) => (
            <div key={name} className="p-3 rounded-lg border border-border/50 bg-card">
              <p className="font-semibold text-foreground text-sm">{name}</p>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* License */}
      <section className="mb-10">
        <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
          <Scale className="w-4 h-4 text-primary" />
          MIT License
        </h2>
        <div className="border border-border/50 rounded-lg bg-card p-4">
          <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap leading-relaxed">{`MIT License

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
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`}</pre>
        </div>
      </section>

      {/* Contributing */}
      <section className="mb-10">
        <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          Contributing
        </h2>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            We welcome contributions from the community! Here&apos;s how you can help:
          </p>
          <div className="grid gap-2">
            {[
              {
                step: '1',
                title: 'Fork the Repository',
                desc: 'Create your own copy of QSQL on GitHub.',
              },
              {
                step: '2',
                title: 'Clone & Install',
                desc: 'Clone your fork and run npm install to set up locally.',
              },
              {
                step: '3',
                title: 'Create a Branch',
                desc: 'Create a feature branch: git checkout -b feature/my-feature',
              },
              {
                step: '4',
                title: 'Make Changes',
                desc: 'Implement your feature or fix. Follow the existing code style.',
              },
              {
                step: '5',
                title: 'Submit a Pull Request',
                desc: 'Push your branch and open a PR with a clear description.',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card">
                <div className="w-6 h-6 rounded-md bg-primary/8 flex items-center justify-center shrink-0">
                  <span className="text-primary font-bold text-xs">{step}</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Development Setup */}
      <section className="mb-10">
        <h2 className="text-base font-bold text-foreground mb-3">Development Setup</h2>
        <div className="border border-border/50 rounded-lg bg-card p-4 space-y-3">
          <div>
            <p className="text-sm font-semibold text-foreground mb-1.5">1. Clone the repository</p>
            <pre className="text-xs font-mono text-muted-foreground bg-muted/25 p-2.5 rounded-md leading-relaxed">git clone https://github.com/theyashva/QSQL.git
cd QSQL</pre>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground mb-1.5">2. Install dependencies</p>
            <pre className="text-xs font-mono text-muted-foreground bg-muted/25 p-2.5 rounded-md">npm install</pre>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground mb-1.5">3. Start development server</p>
            <pre className="text-xs font-mono text-muted-foreground bg-muted/25 p-2.5 rounded-md">npm run dev</pre>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground mb-1.5">4. Open in browser</p>
            <pre className="text-xs font-mono text-muted-foreground bg-muted/25 p-2.5 rounded-md">http://localhost:3000</pre>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="text-center py-8 border-t border-border/50">
        <p className="text-sm text-muted-foreground">
          Made with{' '}
          <Heart className="w-3.5 h-3.5 inline text-destructive" />{' '}
          by the community
        </p>
        <p className="text-sm text-muted-foreground mt-1.5">
          <Link href="/guide" className="text-primary hover:underline">Setup Guide</Link>
          {' · '}
          <Link href="/docs" className="text-primary hover:underline">Documentation</Link>
        </p>
      </div>
    </div>
  );
}
