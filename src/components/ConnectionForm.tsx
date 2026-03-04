'use client';

import { useState } from 'react';
import { saveCredentials, testConnection, type SupabaseCredentials } from '@/lib/supabase';
import { Loader2, CheckCircle2, XCircle, Link2 } from 'lucide-react';

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
      setTimeout(() => onConnected(), 500);
    } else {
      setStatus('error');
      setErrorMsg(result.error || 'Connection failed');
    }

    setTesting(false);
  };

  return (
    <form onSubmit={handleConnect} className="space-y-5">
      <div>
        <label htmlFor="supabase-url" className="block text-sm font-medium text-foreground mb-2">
          Supabase Project URL
        </label>
        <div className="relative">
          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            id="supabase-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://your-project.supabase.co"
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="anon-key" className="block text-sm font-medium text-foreground mb-2">
          Anon / Public Key
        </label>
        <input
          id="anon-key"
          type="password"
          value={anonKey}
          onChange={(e) => setAnonKey(e.target.value)}
          placeholder="eyJhbGciOiJIUzI1NiIs..."
          className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all font-mono text-sm"
          required
        />
      </div>

      {status === 'error' && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <XCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
          <p className="text-sm text-destructive">{errorMsg}</p>
        </div>
      )}

      {status === 'success' && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/20">
          <CheckCircle2 className="w-4 h-4 text-success" />
          <p className="text-sm text-success">Connected successfully!</p>
        </div>
      )}

      <button
        type="submit"
        disabled={testing || !url.trim() || !anonKey.trim()}
        className="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
      >
        {testing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Testing Connection...
          </>
        ) : (
          'Connect to Supabase'
        )}
      </button>
    </form>
  );
}
