'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import { useTheme } from 'next-themes';
import {
  Play,
  Loader2,
  Clock,
  Table2,
  AlertCircle,
  History,
  Trash2,
  Copy,
  Download,
  ChevronDown,
  X,
} from 'lucide-react';
import {
  executeSQL,
  getQueryHistory,
  saveQueryToHistory,
  getCredentials,
  createSupabaseClient,
} from '@/lib/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

interface SQLEditorProps {
  projectId: string;
}

interface QueryResult {
  data: Record<string, unknown>[] | null;
  error: string | null;
  rowCount: number;
  duration: number;
  query: string;
}

export function SQLEditor({ projectId }: SQLEditorProps) {
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<QueryResult[]>([]);
  const [activeResultIdx, setActiveResultIdx] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const clientRef = useRef<SupabaseClient | null>(null);
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  useEffect(() => {
    setMounted(true);
    const creds = getCredentials();
    if (creds) {
      clientRef.current = createSupabaseClient(creds);
    }
    setHistory(getQueryHistory(projectId));
  }, [projectId]);

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
    // Add Ctrl+Enter shortcut
    editor.addAction({
      id: 'run-query',
      label: 'Run Query',
      keybindings: [2048 | 3], // Ctrl+Enter
      run: () => handleRun(),
    });
  };

  const handleRun = useCallback(async () => {
    const trimmed = query.trim();
    if (!trimmed || !clientRef.current) return;

    setRunning(true);

    // Split by semicolons for multi-statement execution
    const statements = trimmed
      .split(/;\s*(?=(?:[^']*'[^']*')*[^']*$)/) // split on ; but not inside quotes
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const newResults: QueryResult[] = [];

    for (const stmt of statements) {
      const result = await executeSQL(clientRef.current, stmt);
      newResults.push({ ...result, query: stmt });
      saveQueryToHistory(projectId, stmt);
    }

    setResults(newResults);
    setActiveResultIdx(0);
    setHistory(getQueryHistory(projectId));
    setRunning(false);
  }, [query, projectId]);

  const handleCopyResults = () => {
    const result = results[activeResultIdx];
    if (!result?.data) return;
    const text = JSON.stringify(result.data, null, 2);
    navigator.clipboard.writeText(text);
  };

  const handleExportCSV = () => {
    const result = results[activeResultIdx];
    if (!result?.data?.length) return;

    const headers = Object.keys(result.data[0]);
    const csvRows = [
      headers.join(','),
      ...result.data.map((row) =>
        headers.map((h) => {
          const val = row[h];
          const str = val === null ? '' : String(val);
          return str.includes(',') || str.includes('"') || str.includes('\n')
            ? `"${str.replace(/"/g, '""')}"`
            : str;
        }).join(',')
      ),
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query-result-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleHistoryClick = (q: string) => {
    setQuery(q);
    setShowHistory(false);
    if (editorRef.current) {
      editorRef.current.setValue(q);
    }
  };

  const activeResult = results[activeResultIdx];

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Editor toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handleRun}
            disabled={running || !query.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
          >
            {running ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            Run Query
          </button>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            Ctrl + Enter
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">History</span>
          </button>
          <button
            onClick={() => {
              setQuery('');
              editorRef.current?.setValue('');
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* History panel */}
      {showHistory && (
        <div className="border border-border rounded-xl bg-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-medium text-foreground">Query History</h3>
            <button
              onClick={() => setShowHistory(false)}
              className="p-1 rounded hover:bg-secondary"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {history.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No queries yet.</p>
            ) : (
              history.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleHistoryClick(q)}
                  className="w-full text-left px-4 py-2 text-sm font-mono text-foreground hover:bg-secondary transition-colors border-b border-border last:border-0 truncate"
                >
                  {q}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Monaco editor */}
      <div className="border border-border rounded-xl overflow-hidden bg-card" style={{ minHeight: 250 }}>
        <Editor
          height="250px"
          defaultLanguage="sql"
          value={query}
          onChange={(val) => setQuery(val || '')}
          onMount={handleEditorMount}
          theme={theme === 'dark' ? 'vs-dark' : 'vs'}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            padding: { top: 12, bottom: 12 },
            renderLineHighlight: 'gutter',
            automaticLayout: true,
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            tabSize: 2,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
            fontLigatures: true,
          }}
        />
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="border border-border rounded-xl bg-card overflow-hidden flex-1 min-h-0">
          {/* Result tabs */}
          {results.length > 1 && (
            <div className="flex items-center gap-1 px-3 pt-2 border-b border-border overflow-x-auto">
              {results.map((r, i) => (
                <button
                  key={i}
                  onClick={() => setActiveResultIdx(i)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-t-lg transition-colors ${
                    i === activeResultIdx
                      ? 'bg-background text-foreground border border-border border-b-0'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Result {i + 1}
                </button>
              ))}
            </div>
          )}

          {/* Result header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
            <div className="flex items-center gap-4">
              {activeResult?.error ? (
                <span className="flex items-center gap-1.5 text-xs text-destructive">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Error
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs text-foreground">
                  <Table2 className="w-3.5 h-3.5" />
                  {activeResult?.rowCount || 0} rows
                </span>
              )}
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                {activeResult?.duration || 0}ms
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleCopyResults}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                title="Copy JSON"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleExportCSV}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                title="Export CSV"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Result body */}
          <div className="overflow-auto max-h-96">
            {activeResult?.error ? (
              <div className="p-4">
                <pre className="text-sm text-destructive font-mono whitespace-pre-wrap">
                  {activeResult.error}
                </pre>
                <p className="mt-3 text-xs text-muted-foreground font-mono bg-muted/50 p-2 rounded-lg">
                  {activeResult.query}
                </p>
              </div>
            ) : activeResult?.data && activeResult.data.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {Object.keys(activeResult.data[0]).map((col) => (
                      <th
                        key={col}
                        className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeResult.data.map((row, rowIdx) => (
                    <tr
                      key={rowIdx}
                      className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                    >
                      {Object.values(row).map((val, colIdx) => (
                        <td
                          key={colIdx}
                          className="px-4 py-2 text-foreground whitespace-nowrap font-mono text-xs"
                        >
                          {val === null ? (
                            <span className="text-muted-foreground italic">NULL</span>
                          ) : typeof val === 'object' ? (
                            JSON.stringify(val)
                          ) : (
                            String(val)
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-4 text-sm text-muted-foreground">
                Query executed successfully. No rows returned.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick reference */}
      <details className="border border-border rounded-xl bg-card">
        <summary className="px-4 py-3 text-sm font-medium text-foreground cursor-pointer flex items-center gap-2 hover:bg-muted/30 transition-colors rounded-xl">
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
          SQL Quick Reference
        </summary>
        <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { title: 'Create Table', sql: "CREATE TABLE users (\n  id SERIAL PRIMARY KEY,\n  name TEXT NOT NULL,\n  email TEXT UNIQUE\n);" },
            { title: 'Insert', sql: "INSERT INTO users (name, email)\nVALUES ('John', 'john@example.com');" },
            { title: 'Select', sql: "SELECT * FROM users\nWHERE name LIKE '%John%'\nORDER BY id DESC;" },
            { title: 'Update', sql: "UPDATE users\nSET name = 'Jane'\nWHERE id = 1;" },
            { title: 'Delete', sql: "DELETE FROM users\nWHERE id = 1;" },
            { title: 'Join', sql: "SELECT u.name, o.total\nFROM users u\nINNER JOIN orders o\nON u.id = o.user_id;" },
            { title: 'Foreign Key', sql: "CREATE TABLE orders (\n  id SERIAL PRIMARY KEY,\n  user_id INT REFERENCES users(id),\n  total DECIMAL(10,2)\n);" },
            { title: 'Index', sql: "CREATE INDEX idx_users_email\nON users(email);" },
            { title: 'Aggregate', sql: "SELECT COUNT(*), AVG(total)\nFROM orders\nGROUP BY user_id\nHAVING COUNT(*) > 1;" },
          ].map(({ title, sql }) => (
            <button
              key={title}
              onClick={() => {
                setQuery(sql);
                editorRef.current?.setValue(sql);
              }}
              className="text-left p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
            >
              <p className="text-xs font-medium text-foreground mb-1">{title}</p>
              <pre className="text-xs text-muted-foreground font-mono whitespace-pre-wrap">{sql}</pre>
            </button>
          ))}
        </div>
      </details>
    </div>
  );
}
