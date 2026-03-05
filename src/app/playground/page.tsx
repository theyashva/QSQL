'use client';

import { useState, useEffect } from 'react';
import {
  getCredentials,
  clearCredentials,
  getTabs,
  createTab,
  deleteTab,
  renameTab,
  clearAllData,
  createSupabaseClient,
  executeSQL,
  type EditorTab,
  type SupabaseCredentials,
} from '@/lib/supabase';
import { ConnectionForm } from '@/components/ConnectionForm';
import { SQLEditor } from '@/components/SQLEditor';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  Plus,
  X,
  Database,
  LogOut,
  FileCode2,
  Check,
  Trash,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function PlaygroundPage() {
  const [creds, setCreds] = useState<SupabaseCredentials | null>(null);
  const [tabs, setTabs] = useState<EditorTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    setMounted(true);
    setCreds(getCredentials());
    const savedTabs = getTabs();
    if (savedTabs.length === 0) {
      const tab = createTab('Query 1');
      setTabs([tab]);
      setActiveTabId(tab.id);
    } else {
      setTabs(savedTabs);
      setActiveTabId(savedTabs[0].id);
    }
  }, []);

  const handleConnected = () => {
    setCreds(getCredentials());
    toast.success('Connected to Supabase!');
  };

  const handleDisconnect = () => {
    clearCredentials();
    setCreds(null);
    toast.success('Disconnected from Supabase');
  };

  const handleFreeResources = async () => {
    if (!confirm('This will permanently delete ALL tables, data, schemas, and local history from your database. This cannot be undone. Continue?')) return;

    const currentCreds = getCredentials();
    if (currentCreds) {
      const client = createSupabaseClient(currentCreds);

      // Drop all user tables in public schema
      const dropTablesSQL = `DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename != 'schema_migrations'
  ) LOOP
    EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
  END LOOP;
END $$;`;

      // Drop all user-created schemas (not system ones)
      const dropSchemasSQL = `DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT schema_name FROM information_schema.schemata
    WHERE schema_name NOT IN ('public','information_schema','pg_catalog','pg_toast','auth','storage','extensions','realtime','supabase_migrations','graphql','graphql_public','pgsodium','pgsodium_masks','vault','net','_realtime','supabase_functions','_analytics')
    AND schema_name NOT LIKE 'pg_%'
  ) LOOP
    EXECUTE 'DROP SCHEMA IF EXISTS ' || quote_ident(r.schema_name) || ' CASCADE';
  END LOOP;
END $$;`;

      await executeSQL(client, dropTablesSQL);
      await executeSQL(client, dropSchemasSQL);
    }

    clearAllData();
    const tab = createTab('Query 1');
    setTabs([tab]);
    setActiveTabId(tab.id);
    toast.success('All resources cleared — tables, data & history deleted');
  };

  const handleAddTab = () => {
    const num = tabs.length + 1;
    const tab = createTab(`Query ${num}`);
    setTabs(getTabs());
    setActiveTabId(tab.id);
  };

  const handleCloseTab = (id: string) => {
    if (tabs.length <= 1) return;
    const idx = tabs.findIndex((t) => t.id === id);
    deleteTab(id);
    const updated = getTabs();
    setTabs(updated);
    if (activeTabId === id) {
      const newIdx = Math.min(idx, updated.length - 1);
      setActiveTabId(updated[newIdx]?.id || null);
    }
  };

  const handleRenameTab = (id: string) => {
    const trimmed = editName.trim();
    if (!trimmed) {
      setEditingTabId(null);
      return;
    }
    renameTab(id, trimmed);
    setTabs(getTabs());
    setEditingTabId(null);
    setEditName('');
  };

  if (!mounted) {
    return (
      <div className="h-screen flex items-center justify-center text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!creds) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 sm:py-32 animate-fade-in">
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-xl bg-primary/8 flex items-center justify-center mx-auto mb-4">
            <Database className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Connect Your Database
          </h1>
          <p className="text-base text-muted-foreground">
            Enter your Supabase credentials to start the playground.
          </p>
        </div>
        <div className="p-6 rounded-xl border border-border/50 bg-card">
          <ConnectionForm onConnected={handleConnected} />
        </div>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Need help?{' '}
          <a href="/guide" className="text-primary hover:underline font-medium">
            Read the setup guide
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Top bar with tabs */}
      <div className="flex items-center h-10 border-b border-border/40 bg-card/80 backdrop-blur-md shrink-0">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-1.5 px-3 h-full border-r border-border/40 hover:bg-muted/40 transition-colors shrink-0"
        >
          <div className="w-5 h-5 rounded bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-[10px]">Q</span>
          </div>
          <span className="font-bold text-xs text-foreground hidden sm:inline">QSQL</span>
        </Link>

        {/* Tabs */}
        <div className="flex-1 flex items-center overflow-x-auto h-full min-w-0">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`flex items-center gap-1.5 px-3 h-full text-xs font-medium border-r border-border/30 cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
                tab.id === activeTabId
                  ? 'bg-background text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
              }`}
            >
              <FileCode2 className="w-3 h-3 shrink-0" />
              {editingTabId === tab.id ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleRenameTab(tab.id);
                  }}
                  className="flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-24 px-1 py-0.5 text-xs bg-background border border-input rounded focus:outline-none focus:ring-1 focus:ring-ring/30"
                    autoFocus
                    onBlur={() => handleRenameTab(tab.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setEditingTabId(null);
                        setEditName('');
                      }
                    }}
                  />
                  <button
                    type="submit"
                    className="p-0.5 rounded text-emerald-500 hover:bg-emerald-500/10"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                </form>
              ) : (
                <span
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setEditingTabId(tab.id);
                    setEditName(tab.name);
                  }}
                  className="select-none"
                >
                  {tab.name}
                </span>
              )}
              {tabs.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCloseTab(tab.id);
                  }}
                  className="p-0.5 rounded-sm text-muted-foreground/50 hover:text-foreground hover:bg-muted/60 transition-colors ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={handleAddTab}
            className="flex items-center justify-center px-2.5 h-full text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors shrink-0"
            title="New tab"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1 px-2.5 border-l border-border/40 h-full shrink-0">
          <span className="text-[10px] text-muted-foreground/60 font-mono hidden sm:inline mr-1">
            {creds.url.replace('https://', '').split('.')[0]}
          </span>
          <ThemeToggle />
          <button
            onClick={handleFreeResources}
            className="p-1.5 rounded-md text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 transition-colors"
            title="Free resources — delete all tabs, drafts & history"
          >
            <Trash className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDisconnect}
            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Disconnect"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Active tab indicator line */}
      <div className="h-[2px] bg-border/20 shrink-0 relative">
        {/* The active tab gets a primary-colored bottom border via its bg-background which visually separates it */}
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-0">
        {activeTabId && <SQLEditor tabId={activeTabId} key={activeTabId} />}
      </div>
    </div>
  );
}
