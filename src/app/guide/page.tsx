import Link from 'next/link';
import { ArrowRight, CheckCircle2, ExternalLink, Copy, ChevronRight } from 'lucide-react';

export default function GuidePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 pb-20 animate-fade-in">
      <div className="mb-12 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
          Supabase Setup Guide
        </h1>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto">
          Follow these steps to create and connect your Supabase database to QSQL.
          It only takes a few minutes.
        </p>
      </div>

      <div className="space-y-5">
        {/* Step 1 */}
        <div className="border border-border/50 rounded-lg bg-card overflow-hidden">
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border/50 bg-muted/20">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">1</span>
            </div>
            <h2 className="text-sm font-bold text-foreground">Create a Supabase Account</h2>
          </div>
          <div className="p-4 space-y-3 text-sm text-muted-foreground">
            <p>If you don&apos;t already have one, sign up for a free Supabase account:</p>
            <ol className="list-decimal list-inside space-y-1.5 ml-2">
              <li>Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">supabase.com <ExternalLink className="w-3 h-3" /></a></li>
              <li>Click <strong className="text-foreground">&quot;Start your project&quot;</strong></li>
              <li>Sign up with GitHub, Google, or email</li>
            </ol>
            <div className="flex items-start gap-2 p-2.5 rounded-md bg-emerald-500/8 border border-emerald-500/15 text-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
              <p>The free tier includes 500MB database, 1GB file storage, and 50,000 monthly active users — more than enough for development and learning.</p>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="border border-border/50 rounded-lg bg-card overflow-hidden">
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border/50 bg-muted/20">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">2</span>
            </div>
            <h2 className="text-sm font-bold text-foreground">Create a New Project</h2>
          </div>
          <div className="p-4 space-y-3 text-sm text-muted-foreground">
            <ol className="list-decimal list-inside space-y-1.5 ml-2">
              <li>From the Supabase Dashboard, click <strong className="text-foreground">&quot;New Project&quot;</strong></li>
              <li>Choose your organization (or create one)</li>
              <li>Enter a <strong className="text-foreground">project name</strong> (e.g., &quot;q-sql-playground&quot;)</li>
              <li>Set a <strong className="text-foreground">database password</strong> (save it securely)</li>
              <li>Choose a <strong className="text-foreground">region</strong> closest to you</li>
              <li>Click <strong className="text-foreground">&quot;Create new project&quot;</strong></li>
            </ol>
            <p>Wait for the project to finish setting up (usually under 2 minutes).</p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="border border-border/50 rounded-lg bg-card overflow-hidden">
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border/50 bg-muted/20">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">3</span>
            </div>
            <h2 className="text-sm font-bold text-foreground">Create the SQL Execution Function</h2>
          </div>
          <div className="p-4 space-y-3 text-sm text-muted-foreground">
            <p>
              QSQL needs a special PostgreSQL function to execute arbitrary SQL. You&apos;ll create it using
              Supabase&apos;s built-in SQL Editor.
            </p>
            <ol className="list-decimal list-inside space-y-1.5 ml-2">
              <li>In your Supabase Dashboard, go to <strong className="text-foreground">SQL Editor</strong> (left sidebar)</li>
              <li>Click <strong className="text-foreground">&quot;New query&quot;</strong></li>
              <li>Paste the following SQL and click <strong className="text-foreground">&quot;Run&quot;</strong>:</li>
            </ol>
            <div className="bg-card border border-border/50 rounded-md p-3 overflow-x-auto">
              <pre className="text-xs font-mono text-foreground whitespace-pre leading-relaxed">{`CREATE OR REPLACE FUNCTION exec_sql(query_text TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  is_select BOOLEAN;
BEGIN
  -- Check if this is a SELECT/WITH query that returns rows
  is_select := UPPER(LTRIM(query_text)) ~ '^(SELECT|WITH|TABLE|VALUES|SHOW|EXPLAIN)';

  IF is_select THEN
    EXECUTE 'SELECT COALESCE(json_agg(row_to_json(t)), ''[]''::json) FROM ('
      || query_text || ') t'
    INTO result;
    RETURN result;
  ELSE
    EXECUTE query_text;
    RETURN json_build_object(
      'status', 'success',
      'message', 'Query executed successfully'
    );
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION '%', SQLERRM;
END;
$$;`}</pre>
            </div>
            <div className="flex items-start gap-2 p-2.5 rounded-md bg-emerald-500/8 border border-emerald-500/15 text-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
              <p>You should see <strong className="text-foreground">&quot;Success. No rows returned&quot;</strong> — this means the function was created.</p>
            </div>
          </div>
        </div>

        {/* Step 4 */}
        <div className="border border-border/50 rounded-lg bg-card overflow-hidden">
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border/50 bg-muted/20">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">4</span>
            </div>
            <h2 className="text-sm font-bold text-foreground">Get Your API Credentials</h2>
          </div>
          <div className="p-4 space-y-3 text-sm text-muted-foreground">
            <ol className="list-decimal list-inside space-y-1.5 ml-2">
              <li>In the Supabase Dashboard, go to <strong className="text-foreground">Project Settings</strong> (gear icon in sidebar)</li>
              <li>Click on <strong className="text-foreground">&quot;API&quot;</strong> under Configuration</li>
              <li>You&apos;ll find two values you need:
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li><strong className="text-foreground">Project URL</strong> — looks like <code className="px-1 py-0.5 rounded bg-muted text-foreground text-xs font-mono">https://xxxxx.supabase.co</code></li>
                  <li><strong className="text-foreground">anon / public key</strong> — a long JWT token starting with <code className="px-1 py-0.5 rounded bg-muted text-foreground text-xs font-mono">eyJ...</code></li>
                </ul>
              </li>
            </ol>
            <div className="flex items-start gap-2 p-2.5 rounded-md bg-amber-500/8 border border-amber-500/15 text-sm">
              <span className="text-amber-500 font-bold mt-0.5">⚠️</span>
              <p>Only use the <strong className="text-foreground">anon/public</strong> key, NOT the service_role key. The anon key is safe for client-side use and respects Row Level Security.</p>
            </div>
          </div>
        </div>

        {/* Step 5 */}
        <div className="border border-border/50 rounded-lg bg-card overflow-hidden">
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border/50 bg-muted/20">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">5</span>
            </div>
            <h2 className="text-sm font-bold text-foreground">Connect to QSQL</h2>
          </div>
          <div className="p-4 space-y-3 text-sm text-muted-foreground">
            <ol className="list-decimal list-inside space-y-1.5 ml-2">
              <li>Go to the <Link href="/playground" className="text-primary hover:underline">Playground</Link></li>
              <li>Paste your <strong className="text-foreground">Project URL</strong> and <strong className="text-foreground">anon key</strong></li>
              <li>Click <strong className="text-foreground">&quot;Connect to Supabase&quot;</strong></li>
              <li>Once connected, start writing SQL in the editor tabs!</li>
            </ol>
          </div>
        </div>

        {/* Step 6 */}
        <div className="border border-border/50 rounded-lg bg-card overflow-hidden">
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border/50 bg-muted/20">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">6</span>
            </div>
            <h2 className="text-sm font-bold text-foreground">Try It Out!</h2>
          </div>
          <div className="p-4 space-y-3 text-sm text-muted-foreground">
            <p>Here&apos;s a quick test to make sure everything works. Paste this into the QSQL editor:</p>
            <div className="bg-card border border-border/50 rounded-md p-3 overflow-x-auto">
              <pre className="text-xs font-mono text-foreground whitespace-pre leading-relaxed">{`-- Create a test table
CREATE TABLE test_table (
  id SERIAL PRIMARY KEY,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);`}</pre>
            </div>
            <p>Then run this to insert and query data:</p>
            <div className="bg-card border border-border/50 rounded-md p-3">
              <pre className="text-xs font-mono text-foreground whitespace-pre leading-relaxed">{`INSERT INTO test_table (message)
VALUES ('Hello from QSQL!');`}</pre>
            </div>
            <div className="bg-card border border-border/50 rounded-md p-3">
              <pre className="text-xs font-mono text-foreground whitespace-pre leading-relaxed">{`SELECT * FROM test_table;`}</pre>
            </div>
            <div className="flex items-start gap-2 p-2.5 rounded-md bg-emerald-500/8 border border-emerald-500/15 text-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
              <p>If you see your data in the results table, you&apos;re all set!</p>
            </div>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="border border-border/50 rounded-lg bg-card overflow-hidden">
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border/50 bg-muted/20">
            <h2 className="text-sm font-bold text-foreground">Troubleshooting</h2>
          </div>
          <div className="p-4 space-y-3">
            {[
              {
                q: 'Connection failed',
                a: 'Double-check your Project URL (should include https://) and anon key. Make sure your Supabase project is active and not paused.',
              },
              {
                q: '"function exec_sql does not exist"',
                a: 'You need to create the exec_sql function first. Go back to Step 3 and run the SQL in your Supabase SQL Editor.',
              },
              {
                q: 'Permission denied',
                a: 'Make sure you\'re using SECURITY DEFINER in the function. If you have RLS enabled, you may need to create appropriate policies.',
              },
              {
                q: 'Query returns empty results',
                a: 'Make sure your table has data. Try running an INSERT statement first, then SELECT.',
              },
            ].map(({ q, a }) => (
              <div key={q} className="border-b border-border/40 last:border-0 pb-3 last:pb-0">
                <p className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-primary shrink-0" />
                  {q}
                </p>
                <p className="text-sm text-muted-foreground ml-5 mt-0.5">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-10 text-center">
        <Link
          href="/playground"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all text-sm active:scale-[0.97]"
        >
          Start Using QSQL
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
