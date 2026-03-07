'use client';

import { useState } from 'react';
import { saveCredentials, testConnection, type SupabaseCredentials } from '@/lib/supabase';
import { Loader2, CheckCircle2, XCircle, Link2, KeyRound, ArrowRight } from 'lucide-react';

interface ConnectionFormProps {
  onConnected: () => void;
  initialCreds?: SupabaseCredentials | null;
}

export function ConnectionForm({ onConnected, initialCreds }: ConnectionFormProps) {
  const [url, setUrl] = useState(initialCreds?.url || '');
  const [anonKey, setAnonKey] = useState(initialCreds?.anonKey || '');
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUrl = url.trim().replace(/\/$/, '');
    const trimmedKey = anonKey.trim();
    if (!trimmedUrl || !trimmedKey) return;

    setTesting(true);
    setStatus('idle');
    setErrorMsg('');

    const result = await testConnection({ url: trimmedUrl, anonKey: trimmedKey });
    if (result.success) {
      setStatus('success');
      saveCredentials({ url: trimmedUrl, anonKey: trimmedKey });
      setTimeout(() => onConnected(), 600);
    } else {
      setStatus('error');
      setErrorMsg(result.error || 'Connection failed');
    }
    setTesting(false);
  };

  return (
    <form onSubmit={handleConnect} className="space-y-6">
      {/* URL */}
      <div>
        <label htmlFor="supabase-url" className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2.5">
          <Link2 className="w-3.5 h-3.5" />
          Supabase Project URL
        </label>
        <input
          id="supabase-url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://your-project.supabase.co"
          className="premium-input w-full px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/40"
          required
        />
      </div>

      {/* Anon Key */}
      <div>
        <label htmlFor="anon-key" className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2.5">
          <KeyRound className="w-3.5 h-3.5" />
          Anon / Public Key
        </label>
        <input
          id="anon-key"
          type="password"
          value={anonKey}
          onChange={(e) => setAnonKey(e.target.value)}
          placeholder="eyJhbGciOiJIUzI1NiIs..."
          className="premium-input w-full px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/40 font-mono"
          required
        />
      </div>

      {/* Error */}
      {status === 'error' && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 animate-scale-in">
          <XCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400 font-medium">{errorMsg}</p>
        </div>
      )}

      {/* Success */}
      {status === 'success' && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 animate-scale-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <p className="text-sm text-emerald-600 dark:text-emerald-400 font-bold">Connected successfully!</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={testing || !url.trim() || !anonKey.trim()}
        className="btn-primary w-full py-4 px-6 rounded-2xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none transition-all flex items-center justify-center gap-2.5"
      >
        {testing ? (
          <><Loader2 className="w-4.5 h-4.5 animate-spin" /> Testing Connection...</>
        ) : status === 'success' ? (
          <><CheckCircle2 className="w-4.5 h-4.5" /> Connected!</>
        ) : (
          <>Connect to Supabase <ArrowRight className="w-4 h-4" /></>
        )}
      </button>
    </form>
  );
}
