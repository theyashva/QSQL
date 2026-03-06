'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Editor, { type OnMount, loader } from '@monaco-editor/react';
import type * as MonacoType from 'monaco-editor';
import { useTheme } from 'next-themes';
import {
  Play,
  Loader2,
  Clock,
  AlertCircle,
  History,
  Trash2,
  Copy,
  Download,
  X,
  CheckCircle2,
  FileCode2,
  TerminalSquare,
  ChevronRight,
  Maximize2,
  Minimize2,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';
import {
  executeSQL,
  getQueryHistory,
  saveQueryToHistory,
  getCredentials,
  createSupabaseClient,
  getDraft,
  saveDraft,
  EXEC_SQL_MISSING,
  EXEC_SQL_FUNCTION,
} from '@/lib/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

interface SQLEditorProps {
  tabId: string;
}

interface QueryResult {
  data: Record<string, unknown>[] | null;
  error: string | null;
  rowCount: number;
  duration: number;
  query: string;
}

// Register custom Monaco themes on load (only in browser)
if (typeof window !== 'undefined') {
  loader.init().then((monaco: typeof MonacoType) => {
  monaco.editor.defineTheme('qsql-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: '569cd6', fontStyle: 'bold' },
      { token: 'string', foreground: 'ce9178' },
      { token: 'number', foreground: 'b5cea8' },
      { token: 'comment', foreground: '6a9955', fontStyle: 'italic' },
      { token: 'type', foreground: '4ec9b0' },
      { token: 'operator', foreground: 'd4d4d4' },
    ],
    colors: {
      'editor.background': '#0d1117',
      'editor.foreground': '#e6edf3',
      'editorCursor.foreground': '#58a6ff',
      'editor.lineHighlightBackground': '#161b2240',
      'editor.selectionBackground': '#264f7840',
      'editor.inactiveSelectionBackground': '#264f7820',
      'editorLineNumber.foreground': '#484f58',
      'editorLineNumber.activeForeground': '#e6edf3',
      'editorGutter.background': '#0d1117',
      'editorIndentGuide.background': '#21262d',
      'editorIndentGuide.activeBackground': '#30363d',
      'editorBracketMatch.background': '#264f7830',
      'editorBracketMatch.border': '#58a6ff50',
    },
  });

  monaco.editor.defineTheme('qsql-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: '0550ae', fontStyle: 'bold' },
      { token: 'string', foreground: '0a3069' },
      { token: 'number', foreground: '0550ae' },
      { token: 'comment', foreground: '6e7781', fontStyle: 'italic' },
      { token: 'type', foreground: '953800' },
      { token: 'operator', foreground: '24292f' },
    ],
    colors: {
      'editor.background': '#ffffff',
      'editor.foreground': '#24292f',
      'editorCursor.foreground': '#0969da',
      'editor.lineHighlightBackground': '#f6f8fa',
      'editor.selectionBackground': '#0969da20',
      'editor.inactiveSelectionBackground': '#0969da10',
      'editorLineNumber.foreground': '#8c959f',
      'editorLineNumber.activeForeground': '#24292f',
      'editorGutter.background': '#ffffff',
      'editorIndentGuide.background': '#d8dee4',
      'editorIndentGuide.activeBackground': '#afb8c1',
      'editorBracketMatch.background': '#0969da15',
      'editorBracketMatch.border': '#0969da40',
    },
  });
});
}

/** Strip single-line (--) and block (/* *​/) SQL comments while preserving string literals */
function stripSQLComments(sql: string): string {
  let result = '';
  let i = 0;
  while (i < sql.length) {
    // Single-quoted string literal — preserve as-is
    if (sql[i] === "'") {
      result += sql[i++];
      while (i < sql.length) {
        if (sql[i] === "'" && i + 1 < sql.length && sql[i + 1] === "'") {
          result += "''";
          i += 2;
        } else if (sql[i] === "'") {
          result += sql[i++];
          break;
        } else {
          result += sql[i++];
        }
      }
    }
    // Single-line comment (--) — skip to end of line, keep newline
    else if (sql[i] === '-' && i + 1 < sql.length && sql[i + 1] === '-') {
      i += 2;
      while (i < sql.length && sql[i] !== '\n') i++;
    }
    // Block comment (/* ... */) — skip entirely
    else if (sql[i] === '/' && i + 1 < sql.length && sql[i + 1] === '*') {
      i += 2;
      while (i < sql.length - 1 && !(sql[i] === '*' && sql[i + 1] === '/')) i++;
      if (i < sql.length - 1) i += 2;
    }
    // Normal character
    else {
      result += sql[i++];
    }
  }
  return result;
}

export function SQLEditor({ tabId }: SQLEditorProps) {
  const { theme } = useTheme();
  const queryRef = useRef('');
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<QueryResult[]>([]);
  const [activeResultIdx, setActiveResultIdx] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [splitPercent, setSplitPercent] = useState(55);
  const [hasSelection, setHasSelection] = useState(false);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [charCount, setCharCount] = useState(0);
  const clientRef = useRef<SupabaseClient | null>(null);
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
    const creds = getCredentials();
    if (creds) {
      clientRef.current = createSupabaseClient(creds);
    }
    setHistory(getQueryHistory());

    // Load saved draft
    const draft = getDraft(tabId);
    if (draft) {
      queryRef.current = draft;
      setCharCount(draft.length);
    }

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [tabId]);

  // Debounced auto-save of editor content
  const handleEditorChange = useCallback((val: string | undefined) => {
    queryRef.current = val || '';
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveDraft(tabId, queryRef.current);
    }, 500);
  }, [tabId]);

  const getQueryText = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return queryRef.current.trim();

    // If there's a selection, run only the selected text (like SSMS)
    const selection = editor.getSelection();
    if (selection && !selection.isEmpty()) {
      const selectedText = editor.getModel()?.getValueInRange(selection) || '';
      if (selectedText.trim().length > 0) {
        return selectedText.trim();
      }
    }

    // Otherwise run the full editor content
    return queryRef.current.trim();
  }, []);

  const handleRun = useCallback(async () => {
    const trimmed = getQueryText();
    if (!trimmed || !clientRef.current) return;

    setRunning(true);

    // Strip SQL comments (-- and /* */) before splitting, preserving string literals
    const stripped = stripSQLComments(trimmed);

    const statements = stripped
      .split(/;\s*(?=(?:[^']*'[^']*')*[^']*$)/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const newResults: QueryResult[] = [];

    for (const stmt of statements) {
      const result = await executeSQL(clientRef.current, stmt);
      newResults.push({ ...result, query: stmt });
      saveQueryToHistory(stmt);
    }

    setResults(newResults);
    setActiveResultIdx(0);
    setHistory(getQueryHistory());
    setRunning(false);
  }, [tabId, getQueryText]);

  // Keep a stable ref to the latest handleRun for editor actions
  const handleRunRef = useRef(handleRun);
  useEffect(() => { handleRunRef.current = handleRun; }, [handleRun]);

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
    editor.focus();

    editor.addAction({
      id: 'run-query',
      label: 'Run Query (Ctrl+Enter)',
      keybindings: [2048 | 3], // Ctrl+Enter
      run: () => {
        handleRunRef.current();
      },
    });

    // F5 like SSMS
    editor.addAction({
      id: 'run-query-f5',
      label: 'Run Query (F5)',
      keybindings: [3168], // F5
      run: () => {
        handleRunRef.current();
      },
    });

    // Track cursor position
    editor.onDidChangeCursorPosition((e) => {
      setCursorPos({ line: e.position.lineNumber, col: e.position.column });
    });

    // Track selection changes
    editor.onDidChangeCursorSelection((e) => {
      const sel = e.selection;
      const hasText = sel && !sel.isEmpty() && (editor.getModel()?.getValueInRange(sel) || '').trim().length > 0;
      setHasSelection(!!hasText);
    });

    // Track character count
    editor.onDidChangeModelContent(() => {
      setCharCount(editor.getValue().length);
    });
  };

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
    queryRef.current = q;
    setShowHistory(false);
    if (editorRef.current) {
      editorRef.current.setValue(q);
      editorRef.current.focus();
    }
  };

  // Drag-to-resize split pane
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    draggingRef.current = true;

    const onMouseMove = (ev: MouseEvent) => {
      if (!draggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((ev.clientY - rect.top) / rect.height) * 100;
      setSplitPercent(Math.max(5, Math.min(95, pct)));
    };

    const onMouseUp = () => {
      draggingRef.current = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, []);

  const activeResult = results[activeResultIdx];
  const hasResults = results.length > 0;

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleResetSplit = useCallback(() => {
    setSplitPercent(55);
  }, []);

  const handleMaximizeResults = useCallback(() => {
    setSplitPercent(5);
  }, []);

  const handleMinimizeResults = useCallback(() => {
    setSplitPercent(95);
  }, []);

  return (
    <div ref={containerRef} className="flex flex-col h-full overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 h-11 border-b border-border/40 bg-card/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRun}
            disabled={running}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-[13px] active:scale-[0.97] shadow-sm hover:shadow-md"
          >
            {running ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
            {hasSelection ? 'Run Selection' : 'Run'}
          </button>
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/40 border border-border/30">
            <kbd className="text-[10px] text-muted-foreground font-mono tracking-wide">{hasSelection ? 'Sel · ' : ''}Ctrl+↵</kbd>
            <span className="text-[9px] text-muted-foreground/40">/</span>
            <kbd className="text-[10px] text-muted-foreground font-mono tracking-wide">F5</kbd>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              showHistory ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            }`}
            title="Query History"
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">History</span>
          </button>
          <div className="w-px h-4 bg-border/40 mx-0.5" />
          <button
            onClick={() => {
              queryRef.current = '';
              editorRef.current?.setValue('');
              editorRef.current?.focus();
              setCharCount(0);
              saveDraft(tabId, '');
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            title="Clear Editor"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* History panel (overlay) */}
      {showHistory && (
        <div className="absolute right-3 top-[3.25rem] z-30 w-96 max-h-72 border border-border/40 rounded-xl bg-card shadow-xl overflow-hidden animate-fade-in">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/40 bg-muted/30">
            <div className="flex items-center gap-2">
              <History className="w-3.5 h-3.5 text-primary" />
              <h3 className="text-xs font-semibold text-foreground">Query History</h3>
            </div>
            <button
              onClick={() => setShowHistory(false)}
              className="p-1 rounded-md hover:bg-secondary/60 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
          <div className="overflow-y-auto max-h-56">
            {history.length === 0 ? (
              <div className="flex flex-col items-center py-6 text-muted-foreground">
                <History className="w-5 h-5 mb-1.5 opacity-40" />
                <p className="text-xs">No queries yet</p>
              </div>
            ) : (
              history.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleHistoryClick(q)}
                  className="w-full text-left px-4 py-2 text-[11px] font-mono text-foreground hover:bg-primary/5 transition-colors border-b border-border/20 last:border-0 truncate group"
                >
                  <span className="text-muted-foreground/40 mr-2 text-[10px]">{i + 1}.</span>
                  <span className="group-hover:text-primary transition-colors">{q}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Main content: editor + results */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        {/* Editor pane */}
        <div
          className="overflow-hidden relative"
          style={{ height: hasResults ? `${splitPercent}%` : '100%' }}
        >
          <Editor
            height="100%"
            defaultLanguage="sql"
            defaultValue={getDraft(tabId)}
            onChange={handleEditorChange}
            onMount={handleEditorMount}
            theme={theme === 'dark' ? 'qsql-dark' : 'qsql-light'}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineHeight: 22,
              lineNumbers: 'on',
              wordWrap: 'on',
              scrollBeyondLastLine: false,
              padding: { top: 16, bottom: 16 },
              renderLineHighlight: 'all',
              renderLineHighlightOnlyWhenFocus: false,
              automaticLayout: true,
              suggestOnTriggerCharacters: true,
              quickSuggestions: true,
              tabSize: 2,
              fontFamily: "'Cascadia Code', 'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
              fontLigatures: true,
              cursorBlinking: 'expand',
              cursorSmoothCaretAnimation: 'on',
              cursorStyle: 'line',
              cursorWidth: 2,
              smoothScrolling: true,
              contextmenu: true,
              folding: true,
              bracketPairColorization: { enabled: true },
              matchBrackets: 'always',
              renderWhitespace: 'selection',
              guides: { indentation: true, bracketPairs: true },
              stickyScroll: { enabled: false },
              overviewRulerLanes: 0,
              hideCursorInOverviewRuler: true,
              scrollbar: {
                vertical: 'auto',
                horizontal: 'auto',
                verticalScrollbarSize: 8,
                horizontalScrollbarSize: 8,
                useShadows: false,
              },
            }}
          />
        </div>

        {/* Resize handle */}
        {hasResults && (
          <div
            className="h-[5px] cursor-row-resize flex items-center justify-center hover:bg-primary/10 transition-all shrink-0 group relative"
            onMouseDown={handleDragStart}
          >
            <div className="absolute inset-x-0 -top-1.5 -bottom-1.5 z-10" />
            <div className="w-10 h-[3px] rounded-full bg-border group-hover:bg-primary/60 transition-colors" />
          </div>
        )}

        {/* Results pane */}
        {hasResults && (
          <div
            className="flex flex-col min-h-0 overflow-hidden"
            style={{ height: `${100 - splitPercent}%` }}
          >
            {/* Result tabs + info bar */}
            <div className="flex items-center justify-between px-2.5 h-9 border-b border-border/40 bg-card/80 backdrop-blur-md shrink-0">
              <div className="flex items-center gap-2 overflow-x-auto">
                <div className="flex items-center gap-1.5 pr-2 border-r border-border/30">
                  <TerminalSquare className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-[11px] font-semibold text-muted-foreground">Output</span>
                </div>
                {results.length > 1 &&
                  results.map((r, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveResultIdx(i)}
                      className={`flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-md transition-colors ${
                        i === activeResultIdx
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                      }`}
                    >
                      <ChevronRight className="w-2.5 h-2.5" />
                      Query {i + 1}
                    </button>
                  ))}
                <div className="w-px h-3.5 bg-border/40" />
                {activeResult?.error ? (
                  <span className="flex items-center gap-1 text-[11px] text-destructive font-medium">
                    <AlertCircle className="w-3 h-3" />
                    Error
                  </span>
                ) : (() => {
                  const isNonSelect = activeResult?.data?.length === 1 && 'status' in (activeResult.data[0] || {}) && activeResult.data[0].status === 'success';
                  const affected = isNonSelect && typeof activeResult?.data?.[0]?.rows_affected === 'number' ? activeResult.data[0].rows_affected as number : null;
                  return (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-500 font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      {isNonSelect 
                        ? `${affected ?? 0} ${(affected ?? 0) === 1 ? 'row' : 'rows'} affected`
                        : `${activeResult?.rowCount || 0} rows`
                      }
                    </span>
                  );
                })()}
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {activeResult?.duration || 0}ms
                </span>
              </div>
              <div className="flex items-center gap-0.5">
                <button
                  onClick={handleMaximizeResults}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                  title="Maximize output"
                >
                  <Maximize2 className="w-3 h-3" />
                </button>
                <button
                  onClick={handleMinimizeResults}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                  title="Minimize output"
                >
                  <Minimize2 className="w-3 h-3" />
                </button>
                <button
                  onClick={handleResetSplit}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                  title="Reset split"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
                <div className="w-px h-3.5 bg-border/40 mx-0.5" />
                <button
                  onClick={handleCopyResults}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                  title="Copy as JSON"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleExportCSV}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                  title="Export as CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Result body */}
            <div className="flex-1 overflow-auto">
              {activeResult?.error === EXEC_SQL_MISSING ? (
                <div className="p-4 space-y-4">
                  <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-amber-500/8 border border-amber-500/20">
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-foreground mb-1">Database function not found</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        QSQL requires a <code className="px-1 py-0.5 rounded bg-muted text-foreground text-[11px] font-mono">exec_sql</code> function in your Supabase database. 
                        Copy the SQL below and run it in your Supabase SQL Editor.
                      </p>
                    </div>
                  </div>

                  {/* Link to Supabase SQL Editor */}
                  {(() => {
                    const creds = getCredentials();
                    const supabaseHost = creds?.url?.replace('https://', '').split('.')[0] || '';
                    const sqlEditorUrl = supabaseHost 
                      ? `https://supabase.com/dashboard/project/${supabaseHost}/sql/new`
                      : 'https://supabase.com/dashboard';
                    return (
                      <a
                        href={sqlEditorUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
                      >
                        Open Supabase SQL Editor
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    );
                  })()}

                  {/* Copyable SQL snippet */}
                  <div className="relative rounded-lg border border-border/50 bg-card overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-border/40 bg-muted/30">
                      <span className="text-[11px] font-semibold text-muted-foreground">Run this in Supabase SQL Editor</span>
                      <button
                        onClick={() => navigator.clipboard.writeText(EXEC_SQL_FUNCTION)}
                        className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                      >
                        <Copy className="w-3 h-3" />
                        Copy
                      </button>
                    </div>
                    <pre className="p-3 text-[11px] font-mono text-foreground overflow-x-auto leading-relaxed max-h-64 overflow-y-auto">{EXEC_SQL_FUNCTION}</pre>
                  </div>

                  <p className="text-[11px] text-muted-foreground">
                    After running the function, come back here and re-run your query.
                  </p>
                </div>
              ) : activeResult?.error ? (
                <div className="p-4">
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                    <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    <pre className="text-xs text-destructive font-mono whitespace-pre-wrap flex-1">
                      {activeResult.error}
                    </pre>
                  </div>
                  <p className="mt-2 text-[11px] text-muted-foreground font-mono bg-muted/30 p-2.5 rounded-md border border-border/30">
                    <span className="text-muted-foreground/60 mr-1">Query:</span> {activeResult.query}
                  </p>
                </div>
              ) : activeResult?.data && activeResult.data.length > 0 ? (
                (() => {
                  const isStatusResult = activeResult.data.length === 1 && 'status' in activeResult.data[0] && activeResult.data[0].status === 'success';
                  if (isStatusResult) {
                    const row = activeResult.data![0];
                    const rowsAffected = typeof row.rows_affected === 'number' ? row.rows_affected : null;
                    return (
                      <div className="p-4">
                        <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-emerald-500/8 border border-emerald-500/20">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-foreground">Query executed successfully</p>
                            {rowsAffected !== null && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {rowsAffected} {rowsAffected === 1 ? 'row' : 'rows'} affected
                              </p>
                            )}
                          </div>
                        </div>
                        <table className="w-full text-xs mt-3 rounded-lg border border-border/40 overflow-hidden">
                          <thead>
                            <tr className="border-b border-border/50 bg-card">
                              <th className="text-left px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider bg-card">Property</th>
                              <th className="text-left px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider bg-card">Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-border/20">
                              <td className="px-3 py-1.5 text-muted-foreground font-mono">status</td>
                              <td className="px-3 py-1.5 text-emerald-500 font-mono font-medium">success</td>
                            </tr>
                            <tr className="border-b border-border/20 bg-muted/10">
                              <td className="px-3 py-1.5 text-muted-foreground font-mono">message</td>
                              <td className="px-3 py-1.5 text-foreground font-mono">{String(row.message || '')}</td>
                            </tr>
                            {rowsAffected !== null && (
                              <tr className="border-b border-border/20">
                                <td className="px-3 py-1.5 text-muted-foreground font-mono">rows_affected</td>
                                <td className="px-3 py-1.5 font-mono"><span className="text-blue-500">{rowsAffected}</span></td>
                              </tr>
                            )}
                            <tr className={rowsAffected !== null ? 'bg-muted/10' : ''}>
                              <td className="px-3 py-1.5 text-muted-foreground font-mono">duration</td>
                              <td className="px-3 py-1.5 font-mono"><span className="text-blue-500">{activeResult.duration}</span><span className="text-muted-foreground">ms</span></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    );
                  }
                  return (
                <table className="w-full text-xs">
                  <thead className="sticky top-0 z-10">
                    <tr className="border-b border-border/50 bg-card">
                      <th className="text-center px-2 py-1.5 text-[10px] font-semibold text-muted-foreground/50 bg-card w-10 border-r border-border/30">#</th>
                      {Object.keys(activeResult.data[0]).map((col) => (
                        <th
                          key={col}
                          className="text-left px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap bg-card"
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
                        className={`border-b border-border/20 last:border-0 hover:bg-primary/[0.03] transition-colors ${
                          rowIdx % 2 === 1 ? 'bg-muted/10' : ''
                        }`}
                      >
                        <td className="text-center px-2 py-1 text-[10px] text-muted-foreground/40 font-mono border-r border-border/20 select-none w-10">{rowIdx + 1}</td>
                        {Object.values(row).map((val, colIdx) => (
                          <td
                            key={colIdx}
                            className="px-3 py-1.5 text-foreground whitespace-nowrap font-mono text-xs"
                          >
                            {val === null ? (
                              <span className="text-muted-foreground/50 italic text-[10px] px-1 py-0.5 bg-muted/30 rounded">NULL</span>
                            ) : typeof val === 'object' ? (
                              <span className="text-amber-500">{JSON.stringify(val)}</span>
                            ) : typeof val === 'number' ? (
                              <span className="text-blue-500">{String(val)}</span>
                            ) : (
                              String(val)
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                  );
                })()
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500/50 mb-2" />
                  <p className="text-sm font-medium text-foreground/70">Query executed successfully</p>
                  <p className="text-xs text-muted-foreground mt-0.5">No rows returned.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-3 h-[22px] border-t border-border/30 bg-card/90 shrink-0 select-none">
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] text-muted-foreground/80 font-mono">
            Ln {cursorPos.line}, Col {cursorPos.col}
          </span>
          <span className="w-px h-2.5 bg-border/40" />
          <span className="text-[10px] text-muted-foreground/80 font-mono">
            {charCount} chars
          </span>
          {hasSelection && (
            <>
              <span className="w-px h-2.5 bg-border/40" />
              <span className="text-[10px] text-primary/80 font-mono font-medium">Selection</span>
            </>
          )}
          {hasResults && !activeResult?.error && (
            <>
              <span className="w-px h-2.5 bg-border/40" />
              <span className="text-[10px] text-emerald-500/80 font-mono">
                {activeResult?.rowCount || 0} rows · {activeResult?.duration || 0}ms
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <FileCode2 className="w-3 h-3 text-muted-foreground/50" />
          <span className="text-[10px] text-muted-foreground/70 font-mono">SQL</span>
        </div>
      </div>
    </div>
  );
}
