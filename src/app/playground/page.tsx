'use client';

import { useState, useEffect, useRef } from 'react';
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
  getDraft,
  saveDraft,
  pushClosedTab,
  popClosedTab,
  getClosedTabs,
  saveTabs,
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
  Undo2,
  Pencil,
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
  const [hasClosedTabs, setHasClosedTabs] = useState(false);
  const [dragTabId, setDragTabId] = useState<string | null>(null);
  const [dragOverTabId, setDragOverTabId] = useState<string | null>(null);
  const dragCounter = useRef(0);

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
    setHasClosedTabs(getClosedTabs().length > 0);
  }, []);

  // Keyboard shortcut: Ctrl+Shift+T to reopen last closed tab
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        handleUndoCloseTab();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

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
    if (!confirm('This will permanently delete ALL tables, data, schemas, functions, sequences, types, and local history from your database and disconnect. This cannot be undone. Continue?')) return;

    const currentCreds = getCredentials();
    if (currentCreds) {
      const client = createSupabaseClient(currentCreds);
      // Drop all user tables
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
      // Drop user-created schemas
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
      // Drop all user-defined functions in public schema
      const dropFunctionsSQL = `DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT ns.nspname || '.' || p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')' AS func_sig
    FROM pg_proc p
    JOIN pg_namespace ns ON p.pronamespace = ns.oid
    WHERE ns.nspname = 'public'
  ) LOOP
    EXECUTE 'DROP FUNCTION IF EXISTS ' || r.func_sig || ' CASCADE';
  END LOOP;
END $$;`;
      // Drop all sequences in public schema
      const dropSequencesSQL = `DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT sequence_name FROM information_schema.sequences
    WHERE sequence_schema = 'public'
  ) LOOP
    EXECUTE 'DROP SEQUENCE IF EXISTS public.' || quote_ident(r.sequence_name) || ' CASCADE';
  END LOOP;
END $$;`;
      // Drop all user-created types/enums in public schema
      const dropTypesSQL = `DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT t.typname
    FROM pg_type t
    JOIN pg_namespace n ON t.typnamespace = n.oid
    WHERE n.nspname = 'public'
    AND t.typtype IN ('e','c')
  ) LOOP
    EXECUTE 'DROP TYPE IF EXISTS public.' || quote_ident(r.typname) || ' CASCADE';
  END LOOP;
END $$;`;
      await executeSQL(client, dropTablesSQL);
      await executeSQL(client, dropSchemasSQL);
      await executeSQL(client, dropFunctionsSQL);
      await executeSQL(client, dropSequencesSQL);
      await executeSQL(client, dropTypesSQL);
    }

    clearAllData();
    clearCredentials();
    setCreds(null);
    setTabs([]);
    setActiveTabId(null);
    setHasClosedTabs(false);
    toast.success('All resources cleared — database wiped & disconnected');
  };

  const getUniqueName = (base: string, excludeId?: string) => {
    const existing = new Set(tabs.filter((t) => t.id !== excludeId).map((t) => t.name));
    if (!existing.has(base)) return base;
    let i = 2;
    while (existing.has(`${base} (${i})`)) i++;
    return `${base} (${i})`;
  };

  const handleAddTab = () => {
    const name = getUniqueName(`Query ${tabs.length + 1}`);
    const tab = createTab(name);
    setTabs(getTabs());
    setActiveTabId(tab.id);
  };

  const handleCloseTab = (id: string) => {
    if (tabs.length <= 1) return;
    const tab = tabs.find((t) => t.id === id);
    if (!tab) return;
    // Save tab + draft to closed tabs stack before deleting
    const draft = getDraft(id);
    pushClosedTab(tab, draft);
    setHasClosedTabs(true);
    const idx = tabs.findIndex((t) => t.id === id);
    deleteTab(id);
    // Now remove the draft from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`qsql_draft_${id}`);
    }
    const updated = getTabs();
    setTabs(updated);
    if (activeTabId === id) {
      const newIdx = Math.min(idx, updated.length - 1);
      setActiveTabId(updated[newIdx]?.id || null);
    }
    toast('Tab closed', { description: 'Press Ctrl+Shift+T to reopen' });
  };

  const handleDragStart = (e: React.DragEvent, tabId: string) => {
    setDragTabId(tabId);
    e.dataTransfer.effectAllowed = 'move';
    // Use a minimal transparent drag image
    const el = e.currentTarget as HTMLElement;
    e.dataTransfer.setDragImage(el, el.offsetWidth / 2, el.offsetHeight / 2);
  };

  const handleDragEnter = (tabId: string) => {
    dragCounter.current++;
    setDragOverTabId(tabId);
  };

  const handleDragLeave = () => {
    dragCounter.current--;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setDragOverTabId(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetTabId: string) => {
    e.preventDefault();
    dragCounter.current = 0;
    setDragOverTabId(null);
    if (!dragTabId || dragTabId === targetTabId) {
      setDragTabId(null);
      return;
    }
    const fromIdx = tabs.findIndex((t) => t.id === dragTabId);
    const toIdx = tabs.findIndex((t) => t.id === targetTabId);
    if (fromIdx === -1 || toIdx === -1) { setDragTabId(null); return; }
    const reordered = [...tabs];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    setTabs(reordered);
    saveTabs(reordered);
    setDragTabId(null);
  };

  const handleDragEnd = () => {
    setDragTabId(null);
    setDragOverTabId(null);
    dragCounter.current = 0;
  };

  const handleUndoCloseTab = () => {
    const closed = popClosedTab();
    if (!closed) {
      toast.info('No recently closed tabs');
      return;
    }
    // Restore the tab and its draft, ensuring unique name
    const currentTabs = getTabs();
    const existingNames = new Set(currentTabs.map((t) => t.name));
    if (existingNames.has(closed.tab.name)) {
      let i = 2;
      while (existingNames.has(`${closed.tab.name} (${i})`)) i++;
      closed.tab.name = `${closed.tab.name} (${i})`;
    }
    currentTabs.push(closed.tab);
    saveTabs(currentTabs);
    if (closed.draft) {
      saveDraft(closed.tab.id, closed.draft);
    }
    setTabs(currentTabs);
    setActiveTabId(closed.tab.id);
    setHasClosedTabs(getClosedTabs().length > 0);
    toast.success(`Restored tab "${closed.tab.name}"`);
  };

  const handleRenameTab = (id: string) => {
    const trimmed = editName.trim();
    if (!trimmed) { setEditingTabId(null); return; }
    const duplicate = tabs.find((t) => t.id !== id && t.name === trimmed);
    if (duplicate) {
      toast.error(`A tab named "${trimmed}" already exists`);
      return;
    }
    renameTab(id, trimmed);
    setTabs(getTabs());
    setEditingTabId(null);
    setEditName('');
  };

  if (!mounted) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center animate-soft-pulse">
            <Database className="w-5 h-5 text-primary" />
          </div>
          <span className="text-sm text-muted-foreground font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  /* ═══ CONNECTION SCREEN ═══ */
  if (!creds) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-background">
        {/* Background layers */}
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 grid-pattern" />

        <div className="relative flex items-center justify-center min-h-screen px-4">
          <div className="w-full max-w-[28rem] animate-fade-in">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/15 to-violet-500/15 border border-primary/10 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/10">
                <Database className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-foreground mb-3">
                Connect Your Database
              </h1>
              <p className="text-base text-muted-foreground max-w-[24rem] mx-auto">
                Enter your Supabase credentials to start writing SQL.
              </p>
            </div>

            {/* Form card */}
            <div className="elevated-card p-8 sm:p-10">
              <ConnectionForm onConnected={handleConnected} />
            </div>

            {/* Help link */}
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Need help?{' '}
              <a href="/guide" className="text-primary hover:underline font-semibold">
                Read the setup guide →
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ═══ EDITOR SCREEN ═══ */
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Tab bar */}
      <div className="flex items-center h-11 border-b border-border bg-card shrink-0">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 px-4 h-full border-r border-border hover:bg-muted/40 transition-colors shrink-0"
        >
          <span className="text-base font-black tracking-tight gradient-text">QSQL</span>
        </Link>

        {/* Tabs */}
        <div className="flex-1 flex items-center overflow-x-auto h-full min-w-0">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              draggable={editingTabId !== tab.id}
              onDragStart={(e) => handleDragStart(e, tab.id)}
              onDragEnter={() => handleDragEnter(tab.id)}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, tab.id)}
              onDragEnd={handleDragEnd}
              onClick={() => setActiveTabId(tab.id)}
              className={`relative flex items-center gap-2 px-4 h-full text-xs font-semibold border-r border-border/50 cursor-pointer transition-all duration-200 whitespace-nowrap shrink-0 ${tab.id === activeTabId
                ? 'bg-background text-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                }${dragTabId === tab.id ? ' opacity-40' : ''}${dragOverTabId === tab.id && dragTabId !== tab.id ? ' ring-2 ring-primary/50 ring-inset' : ''}`}
            >
              <FileCode2 className="w-3.5 h-3.5 shrink-0 opacity-50" />
              {editingTabId === tab.id ? (
                <form
                  onSubmit={(e) => { e.preventDefault(); handleRenameTab(tab.id); }}
                  className="flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-24 px-1.5 py-0.5 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring/30"
                    autoFocus
                    onBlur={() => handleRenameTab(tab.id)}
                    onKeyDown={(e) => { if (e.key === 'Escape') { setEditingTabId(null); setEditName(''); } }}
                  />
                  <button type="submit" className="p-0.5 rounded text-emerald-500 hover:bg-emerald-500/10"><Check className="w-3 h-3" /></button>
                </form>
              ) : (
                <span
                  onDoubleClick={(e) => { e.stopPropagation(); setEditingTabId(tab.id); setEditName(tab.name); }}
                  className="select-none"
                >
                  {tab.name}
                </span>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); setEditingTabId(tab.id); setEditName(tab.name); }}
                className="p-0.5 rounded-md text-muted-foreground/40 hover:text-foreground hover:bg-muted/60 transition-colors"
                title="Rename tab"
              >
                <Pencil className="w-2.5 h-2.5" />
              </button>
              {tabs.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleCloseTab(tab.id); }}
                  className="p-0.5 rounded-md text-muted-foreground/40 hover:text-foreground hover:bg-muted/60 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
              {tab.id === activeTabId && (
                <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-primary rounded-full" />
              )}
            </div>
          ))}
          <button
            onClick={handleAddTab}
            className="flex items-center justify-center px-3 h-full text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors shrink-0"
            title="New tab"
          >
            <Plus className="w-4 h-4" />
          </button>
          {hasClosedTabs && (
            <button
              onClick={handleUndoCloseTab}
              className="flex items-center justify-center px-3 h-full text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors shrink-0"
              title="Reopen closed tab (Ctrl+Shift+T)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2 px-3 border-l border-border h-full shrink-0">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-soft-pulse" />
            Connected: {creds.url.replace('https://', '').split('.')[0].slice(0, 8)}…
          </span>
          <ThemeToggle />
          <button
            onClick={handleFreeResources}
            className="p-2 rounded-xl text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 transition-all duration-200"
            title="Free resources — delete all tables, drafts & history"
          >
            <Trash className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDisconnect}
            className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
            title="Disconnect"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-0">
        {activeTabId && <SQLEditor tabId={activeTabId} key={activeTabId} />}
      </div>
    </div>
  );
}
