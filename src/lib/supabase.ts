'use client';

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseCredentials {
  url: string;
  anonKey: string;
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
}

const CREDS_KEY = 'qsql_supabase_creds';
const PROJECTS_KEY = 'qsql_projects';

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

export function getProjects(): Project[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(PROJECTS_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveProjects(projects: Project[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  }
}

export function createProject(name: string): Project {
  const projects = getProjects();
  const project: Project = {
    id: crypto.randomUUID(),
    name,
    createdAt: new Date().toISOString(),
  };
  projects.push(project);
  saveProjects(projects);
  return project;
}

export function renameProject(id: string, newName: string): void {
  const projects = getProjects();
  const project = projects.find((p) => p.id === id);
  if (project) {
    project.name = newName;
    saveProjects(projects);
  }
}

export function deleteProject(id: string): void {
  const projects = getProjects().filter((p) => p.id !== id);
  saveProjects(projects);
  // Also clean up project-specific query history
  if (typeof window !== 'undefined') {
    localStorage.removeItem(`qsql_history_${id}`);
  }
}

export function getQueryHistory(projectId: string): string[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(`qsql_history_${projectId}`);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveQueryToHistory(projectId: string, query: string): void {
  if (typeof window === 'undefined') return;
  const history = getQueryHistory(projectId);
  // Avoid duplicates at the top
  const filtered = history.filter((q) => q !== query);
  filtered.unshift(query);
  // Keep last 50 queries
  const trimmed = filtered.slice(0, 50);
  localStorage.setItem(`qsql_history_${projectId}`, JSON.stringify(trimmed));
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
      // Fallback: try using the REST API directly for simple queries
      return await executeSQLDirect(client, query, start);
    }

    const rows = Array.isArray(data) ? data : data ? [data] : [];
    return { data: rows, error: null, rowCount: rows.length, duration };
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
    // Use the Supabase SQL endpoint via fetch
    const supabaseUrl = (client as unknown as { supabaseUrl: string }).supabaseUrl
      || extractUrlFromClient(client);
    const supabaseKey = (client as unknown as { supabaseKey: string }).supabaseKey
      || extractKeyFromClient(client);

    if (!supabaseUrl || !supabaseKey) {
      return {
        data: null,
        error: 'Unable to extract Supabase credentials from client',
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
      return { data: null, error: message, rowCount: 0, duration };
    }

    const result = await response.json();
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

function extractUrlFromClient(client: SupabaseClient): string {
  // Try to get URL from credentials stored in localStorage
  const creds = getCredentials();
  return creds?.url || '';
}

function extractKeyFromClient(client: SupabaseClient): string {
  const creds = getCredentials();
  return creds?.anonKey || '';
}

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
