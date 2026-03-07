'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, ExternalLink, Copy, Check, ChevronRight, Database } from 'lucide-react';

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
      {copied ? <><Check className="w-3 h-3 text-emerald-500" /><span className="text-emerald-500">Copied!</span></> : <><Copy className="w-3 h-3" /><span>Copy</span></>}
    </button>
  );
}

const sqlFunction = `CREATE OR REPLACE FUNCTION exec_sql(query_text TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  is_select BOOLEAN;
BEGIN
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
$$;`;

const steps = [
  {
    num: '1',
    title: 'Create a Supabase Account',
    content: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>Sign up for a free Supabase account:</p>
        <ol className="list-decimal list-inside space-y-1.5 ml-1 text-foreground/80">
          <li>Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold inline-flex items-center gap-1">supabase.com <ExternalLink className="w-3 h-3" /></a></li>
          <li>Click <strong className="text-foreground">&quot;Start your project&quot;</strong></li>
          <li>Sign up with GitHub, Google, or email</li>
        </ol>
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/8 border border-emerald-200 dark:border-emerald-500/20">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
          <p className="text-xs text-emerald-700 dark:text-emerald-300">The free tier includes 500MB database, 1GB file storage, and 50,000 MAU.</p>
        </div>
      </div>
    ),
  },
  {
    num: '2',
    title: 'Create a New Project',
    content: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <ol className="list-decimal list-inside space-y-1.5 ml-1 text-foreground/80">
          <li>From the Dashboard, click <strong className="text-foreground">&quot;New Project&quot;</strong></li>
          <li>Enter a <strong className="text-foreground">project name</strong></li>
          <li>Set a <strong className="text-foreground">database password</strong></li>
          <li>Choose a <strong className="text-foreground">region</strong></li>
          <li>Click <strong className="text-foreground">&quot;Create new project&quot;</strong></li>
        </ol>
        <p className="text-xs text-muted-foreground">Wait for setup to complete (about 2 minutes).</p>
      </div>
    ),
  },
  {
    num: '3',
    title: 'Create the SQL Function',
    content: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <ol className="list-decimal list-inside space-y-1.5 ml-1 text-foreground/80">
          <li>Go to <strong className="text-foreground">SQL Editor</strong> in your Supabase Dashboard</li>
          <li>Click <strong className="text-foreground">&quot;New query&quot;</strong></li>
          <li>Paste the SQL below and click <strong className="text-foreground">&quot;Run&quot;</strong></li>
        </ol>
        <div className="code-block">
          <div className="code-block-header">
            <span className="text-[11px] font-bold text-muted-foreground">exec_sql function</span>
            <CopyBtn text={sqlFunction} />
          </div>
          <pre className="max-h-64 overflow-y-auto">{sqlFunction}</pre>
        </div>
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/8 border border-emerald-200 dark:border-emerald-500/20">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
          <p className="text-xs text-emerald-700 dark:text-emerald-300">You should see &quot;Success. No rows returned&quot;</p>
        </div>
      </div>
    ),
  },
  {
    num: '4',
    title: 'Get Your API Credentials',
    content: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <ol className="list-decimal list-inside space-y-1.5 ml-1 text-foreground/80">
          <li>Go to <strong className="text-foreground">Project Settings → API</strong></li>
          <li>Copy your <strong className="text-foreground">Project URL</strong> (<code className="px-1.5 py-0.5 rounded-lg bg-muted text-xs font-mono">https://xxxxx.supabase.co</code>)</li>
          <li>Copy the <strong className="text-foreground">anon/public key</strong></li>
        </ol>
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/8 border border-amber-200 dark:border-amber-500/20">
          <span className="text-amber-500 font-bold mt-0.5">⚠️</span>
          <p className="text-xs text-amber-700 dark:text-amber-300">Only use the <strong>anon/public</strong> key, NOT the service_role key.</p>
        </div>
      </div>
    ),
  },
  {
    num: '5',
    title: 'Connect & Start Querying',
    content: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <ol className="list-decimal list-inside space-y-1.5 ml-1 text-foreground/80">
          <li>Go to the <Link href="/playground" className="text-primary hover:underline font-semibold">Playground</Link></li>
          <li>Paste your <strong className="text-foreground">Project URL</strong> and <strong className="text-foreground">anon key</strong></li>
          <li>Click <strong className="text-foreground">&quot;Connect to Supabase&quot;</strong></li>
          <li>Start writing SQL!</li>
        </ol>
        <div className="code-block">
          <pre>{`-- Quick test:\nCREATE TABLE test (id SERIAL PRIMARY KEY, msg TEXT);\nINSERT INTO test (msg) VALUES ('Hello from QSQL!');\nSELECT * FROM test;`}</pre>
        </div>
      </div>
    ),
  },
];

const troubleshooting = [
  { q: 'Connection failed', a: 'Double-check your Project URL (must include https://) and anon key. Make sure your project is not paused.' },
  { q: '"function exec_sql does not exist"', a: 'Go back to Step 3 and run the SQL in your Supabase SQL Editor.' },
  { q: 'Permission denied', a: 'Make sure the function uses SECURITY DEFINER. Add RLS policies if needed.' },
  { q: 'Empty results', a: 'Ensure the table has data. Run an INSERT first, then SELECT.' },
];

export default function GuidePage() {
  return (
    <div className="max-w-[56rem] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 pb-24 animate-fade-in">
      {/* Header */}
      <div className="mb-14 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/15 to-violet-500/15 border border-primary/10 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/10">
          <Database className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-foreground mb-3">Supabase Setup Guide</h1>
        <p className="text-lg text-muted-foreground max-w-[42rem] mx-auto">
          Follow these steps to connect your database. It only takes a few minutes.
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-5">
        {steps.map(({ num, title, content }, i) => (
          <div key={num} className="relative">
            {/* Connector line */}
            {i < steps.length - 1 && (
              <div className="absolute left-[22px] top-[60px] bottom-[-20px] w-[2px] bg-gradient-to-b from-primary/25 to-border z-0" />
            )}
            <div className="relative premium-card overflow-hidden z-10">
              <div className="flex items-center gap-4 px-6 py-4 border-b border-border bg-muted/20">
                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                  <span className="text-primary-foreground font-black text-sm">{num}</span>
                </div>
                <h2 className="text-base font-bold text-foreground">{title}</h2>
              </div>
              <div className="p-6">{content}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Troubleshooting */}
      <div className="mt-10 premium-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-muted/20">
          <h2 className="text-base font-bold text-foreground">Troubleshooting</h2>
        </div>
        <div className="p-6 space-y-4">
          {troubleshooting.map(({ q, a }) => (
            <div key={q} className="border-b border-border/30 last:border-0 pb-4 last:pb-0">
              <p className="font-bold text-foreground text-sm flex items-center gap-2 mb-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-primary shrink-0" />
                {q}
              </p>
              <p className="text-sm text-muted-foreground ml-6">{a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-12 text-center">
        <Link
          href="/playground"
          className="btn-primary inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all text-base"
        >
          Start Using QSQL
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
