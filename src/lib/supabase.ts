'use client';

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseCredentials {
  url: string;
  anonKey: string;
}

export interface EditorTab {
  id: string;
  name: string;
  createdAt: string;
}

const CREDS_KEY = 'qsql_supabase_creds';
const TABS_KEY = 'qsql_tabs';

export const EXEC_SQL_MISSING = '__EXEC_SQL_MISSING__';

export const EXEC_SQL_FUNCTION = `CREATE OR REPLACE FUNCTION exec_sql(query_text TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  is_select BOOLEAN;
  affected INT;
  clean_query TEXT;
BEGIN
  -- Strip leading single-line comments (-- ...)
  clean_query := query_text;
  WHILE clean_query ~ '^\\s*--' LOOP
    clean_query := REGEXP_REPLACE(clean_query, '^\\s*--[^\\n]*\\n?', '', '');
  END LOOP;
  -- Strip leading block comments (/* ... */)
  WHILE clean_query ~ '^\\s*/\\*' LOOP
    clean_query := REGEXP_REPLACE(clean_query, '^\\s*/\\*.*?\\*/', '', 's');
  END LOOP;
  clean_query := LTRIM(clean_query);

  is_select := UPPER(clean_query) ~ '^(SELECT|WITH|TABLE|VALUES|SHOW|EXPLAIN)';

  IF is_select THEN
    EXECUTE 'SELECT COALESCE(json_agg(row_to_json(t)), ''[]''::json) FROM ('
      || query_text || ') t'
    INTO result;
    RETURN result;
  ELSE
    EXECUTE query_text;
    GET DIAGNOSTICS affected = ROW_COUNT;
    RETURN json_build_object(
      'status', 'success',
      'message', 'Query executed successfully',
      'rows_affected', affected
    );
  END IF;
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'status', 'error',
    'message', SQLERRM
  );
END;
$$;`;

export function saveCredentials(creds: SupabaseCredentials): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CREDS_KEY, JSON.stringify(creds));
  }
}

export function getCredentials(): SupabaseCredentials | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(CREDS_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function clearCredentials(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CREDS_KEY);
  }
}

export function createSupabaseClient(creds: SupabaseCredentials): SupabaseClient {
  return createClient(creds.url, creds.anonKey);
}

export function getTabs(): EditorTab[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(TABS_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveTabs(tabs: EditorTab[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TABS_KEY, JSON.stringify(tabs));
  }
}

export function createTab(name: string): EditorTab {
  const tabs = getTabs();
  const tab: EditorTab = {
    id: crypto.randomUUID(),
    name,
    createdAt: new Date().toISOString(),
  };
  tabs.push(tab);
  saveTabs(tabs);
  return tab;
}

export function renameTab(id: string, newName: string): void {
  const tabs = getTabs();
  const tab = tabs.find((t) => t.id === id);
  if (tab) {
    tab.name = newName;
    saveTabs(tabs);
  }
}

export function deleteTab(id: string): void {
  const tabs = getTabs().filter((t) => t.id !== id);
  saveTabs(tabs);
  if (typeof window !== 'undefined') {
    localStorage.removeItem(`qsql_draft_${id}`);
  }
}

export function clearAllData(): void {
  if (typeof window === 'undefined') return;
  const tabs = getTabs();
  for (const tab of tabs) {
    localStorage.removeItem(`qsql_draft_${tab.id}`);
  }
  localStorage.removeItem(TABS_KEY);
  localStorage.removeItem('qsql_history');
}

// --- Editor draft persistence ---

export function saveDraft(projectId: string, content: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`qsql_draft_${projectId}`, content);
  }
}

export function getDraft(projectId: string): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(`qsql_draft_${projectId}`) || '';
}

export function getQueryHistory(): string[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('qsql_history');
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveQueryToHistory(query: string): void {
  if (typeof window === 'undefined') return;
  const history = getQueryHistory();
  // Avoid duplicates at the top
  const filtered = history.filter((q) => q !== query);
  filtered.unshift(query);
  // Keep last 50 queries
  const trimmed = filtered.slice(0, 50);
  localStorage.setItem('qsql_history', JSON.stringify(trimmed));
}

export async function executeSQL(
  client: SupabaseClient,
  query: string
): Promise<{ data: Record<string, unknown>[] | null; error: string | null; rowCount: number; duration: number }> {
  const start = performance.now();
  try {
    const { data, error } = await client.rpc('exec_sql', { query_text: query });
    const duration = Math.round(performance.now() - start);

    if (error) {
      if (error.message.includes('Could not find the function') || error.message.includes('exec_sql')) {
        return { data: null, error: EXEC_SQL_MISSING, rowCount: 0, duration };
      }
      return { data: null, error: error.message, rowCount: 0, duration };
    }

    // Handle the response from exec_sql
    if (data === null || data === undefined) {
      return { data: null, error: null, rowCount: 0, duration };
    }

    // If the function returned a "success" object for non-SELECT statements
    // e.g. { status: "success", message: "Query executed successfully" }
    // Strip comments before checking query type
    const cleanedQuery = query.replace(/--[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
    const isNonSelect = /^\s*(INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|TRUNCATE|GRANT|REVOKE|BEGIN|COMMIT|ROLLBACK|SET|DO)\b/i.test(cleanedQuery);

    if (!Array.isArray(data)) {
      // Single object returned
      const obj = data as Record<string, unknown>;
      if (obj.status === 'success' && isNonSelect) {
        // Non-SELECT statement succeeded — show as a success message row
        return { data: [obj], error: null, rowCount: 1, duration };
      }
      if (obj.status === 'success' && !isNonSelect) {
        // This is a SELECT but exec_sql fell into the EXCEPTION handler
        // and executed it without returning rows. This means the exec_sql
        // function is broken for this query. Try the direct approach.
        return await executeSQLDirect(client, query, start);
      }
      // Otherwise it's a single-row result
      return { data: [obj], error: null, rowCount: 1, duration };
    }

    // Array result — normal SELECT rows
    return { data, error: null, rowCount: data.length, duration };
  } catch {
    return await executeSQLDirect(client, query, start);
  }
}

async function executeSQLDirect(
  client: SupabaseClient,
  query: string,
  startTime: number
): Promise<{ data: Record<string, unknown>[] | null; error: string | null; rowCount: number; duration: number }> {
  try {
    const creds = getCredentials();
    const supabaseUrl = creds?.url || '';
    const supabaseKey = creds?.anonKey || '';

    if (!supabaseUrl || !supabaseKey) {
      return {
        data: null,
        error: 'Unable to retrieve Supabase credentials',
        rowCount: 0,
        duration: Math.round(performance.now() - startTime),
      };
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({ query_text: query }),
    });

    const duration = Math.round(performance.now() - startTime);

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      const message = (errBody as { message?: string }).message || (errBody as { error?: string }).error || response.statusText;
      if (message.includes('Could not find the function') || message.includes('exec_sql') || response.status === 404) {
        return { data: null, error: EXEC_SQL_MISSING, rowCount: 0, duration };
      }
      return { data: null, error: message, rowCount: 0, duration };
    }

    const result = await response.json();

    // Same logic as main handler: detect false success for SELECT queries
    // Strip comments before checking query type
    const cleanedQuery = query.replace(/--[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
    const isNonSelect = /^\s*(INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|TRUNCATE|GRANT|REVOKE|BEGIN|COMMIT|ROLLBACK|SET|DO)\b/i.test(cleanedQuery);

    if (result && !Array.isArray(result) && result.status === 'success' && !isNonSelect) {
      return {
        data: null,
        error: 'Your exec_sql function needs to be updated. Please run the updated CREATE FUNCTION from the Docs page in your Supabase SQL Editor, then try again.',
        rowCount: 0,
        duration,
      };
    }

    const rows = Array.isArray(result) ? result : result ? [result] : [];
    return { data: rows, error: null, rowCount: rows.length, duration };
  } catch (err) {
    const duration = Math.round(performance.now() - startTime);
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown error occurred',
      rowCount: 0,
      duration,
    };
  }
}

// Credentials are now accessed directly via getCredentials() in executeSQLDirect

export async function testConnection(creds: SupabaseCredentials): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${creds.url}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': creds.anonKey,
        'Authorization': `Bearer ${creds.anonKey}`,
      },
    });

    if (response.ok || response.status === 200) {
      return { success: true };
    }

    return { success: false, error: `Connection failed: ${response.statusText}` };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to connect to Supabase',
    };
  }
}
