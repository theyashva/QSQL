'use client';

import { useState } from 'react';
import { BookOpen, Terminal, Key, Database, Table2, GitFork, Shield, Copy, Check } from 'lucide-react';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200"
      title="Copy to clipboard"
    >
      {copied ? (
        <><Check className="w-3 h-3 text-emerald-500" /><span className="text-emerald-500">Copied!</span></>
      ) : (
        <><Copy className="w-3 h-3" /><span>Copy</span></>
      )}
    </button>
  );
}

function CodeBlock({ code, label }: { code: string; label?: string }) {
  return (
    <div className="code-block">
      {label && (
        <div className="code-block-header">
          <span className="text-[11px] font-bold text-muted-foreground">{label}</span>
          <CopyButton text={code} />
        </div>
      )}
      {!label && (
        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <CopyButton text={code} />
        </div>
      )}
      <pre>{code}</pre>
    </div>
  );
}

const sections = [
  { id: 'getting-started', icon: BookOpen, title: 'Getting Started', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'sql-function', icon: Terminal, title: 'Required Function', color: 'text-violet-500', bg: 'bg-violet-500/10' },
  { id: 'crud', icon: Database, title: 'CRUD Operations', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 'keys', icon: Key, title: 'Keys & Constraints', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { id: 'joins', icon: GitFork, title: 'Joins', color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
  { id: 'advanced', icon: Table2, title: 'Advanced Features', color: 'text-pink-500', bg: 'bg-pink-500/10' },
  { id: 'security', icon: Shield, title: 'Security', color: 'text-red-500', bg: 'bg-red-500/10' },
];

export default function DocsPage() {
  return (
    <div className="max-w-[72rem] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 pb-24">
      <div className="flex gap-12">
        {/* Sidebar TOC */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-24">
            <h3 className="text-[11px] font-black text-muted-foreground uppercase tracking-widest mb-4">On this page</h3>
            <nav className="space-y-1">
              {sections.map(({ id, title, icon: Icon, color }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200 font-medium"
                >
                  <Icon className={`w-3.5 h-3.5 ${color}`} />
                  <span className="truncate">{title}</span>
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="mb-14 text-center lg:text-left animate-fade-in">
            <h1 className="text-3xl sm:text-4xl font-black text-foreground mb-3">Documentation</h1>
            <p className="text-lg text-muted-foreground max-w-[36rem] lg:max-w-none">
              Everything you need to know about using QSQL effectively.
            </p>
          </div>

          <div className="space-y-14">
            {/* Getting Started */}
            <section id="getting-started" className="scroll-mt-24 animate-fade-in">
              <h2 className="text-xl font-black text-foreground mb-5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <BookOpen className="w-4.5 h-4.5 text-blue-500" />
                </div>
                Getting Started
              </h2>
              <div className="premium-card p-6 space-y-3 text-sm text-muted-foreground">
                <p>QSQL is a real-time SQL editor that connects to your own Supabase PostgreSQL database. Here&apos;s how to get started:</p>
                <ol className="list-decimal list-inside space-y-2 ml-1 text-foreground/80">
                  <li>Create a free Supabase account and project</li>
                  <li>Set up the <code className="px-2 py-0.5 rounded-lg bg-muted text-foreground text-xs font-mono font-semibold">exec_sql</code> function in your database</li>
                  <li>Connect to QSQL using your project URL and anon key</li>
                  <li>Open the playground and start writing SQL</li>
                </ol>
              </div>
            </section>

            {/* SQL Function */}
            <section id="sql-function" className="scroll-mt-24 animate-fade-in">
              <h2 className="text-xl font-black text-foreground mb-5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center">
                  <Terminal className="w-4.5 h-4.5 text-violet-500" />
                </div>
                Required Database Function
              </h2>
              <div className="space-y-4 text-sm text-muted-foreground">
                <p>QSQL executes queries through a PostgreSQL function. You <strong className="text-foreground">must</strong> create this function before using QSQL:</p>
                <CodeBlock
                  label="Run this in Supabase SQL Editor"
                  code={`CREATE OR REPLACE FUNCTION exec_sql(query_text TEXT)
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
$$;`}
                />
                <div className="premium-card p-4 border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/5">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>⚠️ Note:</strong> This function uses <code className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-500/15 text-xs font-mono">SECURITY DEFINER</code>. Only use with your anon key and consider adding RLS to your tables.
                  </p>
                </div>
              </div>
            </section>

            {/* CRUD */}
            <section id="crud" className="scroll-mt-24 animate-fade-in">
              <h2 className="text-xl font-black text-foreground mb-5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Database className="w-4.5 h-4.5 text-emerald-500" />
                </div>
                CRUD Operations
              </h2>
              <div className="grid gap-4">
                {[
                  { title: 'CREATE TABLE', desc: 'Define new tables.', sql: `CREATE TABLE employees (\n  id SERIAL PRIMARY KEY,\n  name VARCHAR(100) NOT NULL,\n  email VARCHAR(255) UNIQUE NOT NULL,\n  department VARCHAR(50),\n  salary DECIMAL(10,2) DEFAULT 0,\n  created_at TIMESTAMP DEFAULT NOW()\n);` },
                  { title: 'INSERT', desc: 'Add records.', sql: `INSERT INTO employees (name, email, department, salary)\nVALUES \n  ('Alice Johnson', 'alice@example.com', 'Engineering', 95000),\n  ('Bob Smith', 'bob@example.com', 'Marketing', 75000);` },
                  { title: 'SELECT', desc: 'Query data.', sql: `SELECT name, email, salary\nFROM employees\nWHERE department = 'Engineering'\n  AND salary > 80000\nORDER BY salary DESC\nLIMIT 10;` },
                  { title: 'UPDATE', desc: 'Modify records.', sql: `UPDATE employees\nSET salary = salary * 1.10,\n    department = 'Senior Engineering'\nWHERE department = 'Engineering'\n  AND salary > 90000;` },
                  { title: 'DELETE', desc: 'Remove records.', sql: `DELETE FROM employees\nWHERE created_at < NOW() - INTERVAL '1 year'\n  AND department = 'Inactive';` },
                ].map(({ title, desc, sql }) => (
                  <div key={title} className="premium-card p-6 group">
                    <h3 className="text-sm font-bold text-foreground mb-1">{title}</h3>
                    <p className="text-xs text-muted-foreground mb-3">{desc}</p>
                    <CodeBlock code={sql} />
                  </div>
                ))}
              </div>
            </section>

            {/* Keys */}
            <section id="keys" className="scroll-mt-24 animate-fade-in">
              <h2 className="text-xl font-black text-foreground mb-5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Key className="w-4.5 h-4.5 text-amber-500" />
                </div>
                Keys &amp; Constraints
              </h2>
              <div className="grid gap-4">
                {[
                  { title: 'Primary Key', sql: `CREATE TABLE products (\n  id SERIAL PRIMARY KEY,\n  sku VARCHAR(50) NOT NULL\n);` },
                  { title: 'Foreign Key', sql: `CREATE TABLE orders (\n  id SERIAL PRIMARY KEY,\n  product_id INT REFERENCES products(id)\n    ON DELETE CASCADE\n    ON UPDATE CASCADE,\n  quantity INT NOT NULL CHECK (quantity > 0)\n);` },
                  { title: 'Composite Key', sql: `CREATE TABLE order_items (\n  order_id INT REFERENCES orders(id),\n  product_id INT REFERENCES products(id),\n  quantity INT NOT NULL,\n  PRIMARY KEY (order_id, product_id)\n);` },
                  { title: 'Unique & Check', sql: `ALTER TABLE employees\nADD CONSTRAINT unique_email UNIQUE (email);\n\nALTER TABLE employees\nADD CONSTRAINT check_salary CHECK (salary >= 0);` },
                ].map(({ title, sql }) => (
                  <div key={title} className="premium-card p-6 group">
                    <h3 className="text-sm font-bold text-foreground mb-3">{title}</h3>
                    <CodeBlock code={sql} />
                  </div>
                ))}
              </div>
            </section>

            {/* Joins */}
            <section id="joins" className="scroll-mt-24 animate-fade-in">
              <h2 className="text-xl font-black text-foreground mb-5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                  <GitFork className="w-4.5 h-4.5 text-cyan-500" />
                </div>
                Joins
              </h2>
              <div className="grid gap-4">
                {[
                  { title: 'INNER JOIN', sql: `SELECT e.name, d.department_name\nFROM employees e\nINNER JOIN departments d ON e.department_id = d.id;` },
                  { title: 'LEFT JOIN', sql: `SELECT e.name, o.total\nFROM employees e\nLEFT JOIN orders o ON e.id = o.employee_id;` },
                  { title: 'RIGHT JOIN', sql: `SELECT e.name, d.department_name\nFROM employees e\nRIGHT JOIN departments d ON e.department_id = d.id;` },
                  { title: 'FULL OUTER JOIN', sql: `SELECT e.name, d.department_name\nFROM employees e\nFULL OUTER JOIN departments d ON e.department_id = d.id;` },
                  { title: 'Self Join', sql: `SELECT e1.name AS employee, e2.name AS manager\nFROM employees e1\nLEFT JOIN employees e2 ON e1.manager_id = e2.id;` },
                ].map(({ title, sql }) => (
                  <div key={title} className="premium-card p-6 group">
                    <h3 className="text-sm font-bold text-foreground mb-3">{title}</h3>
                    <CodeBlock code={sql} />
                  </div>
                ))}
              </div>
            </section>

            {/* Advanced */}
            <section id="advanced" className="scroll-mt-24 animate-fade-in">
              <h2 className="text-xl font-black text-foreground mb-5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-pink-500/10 flex items-center justify-center">
                  <Table2 className="w-4.5 h-4.5 text-pink-500" />
                </div>
                Advanced Features
              </h2>
              <div className="grid gap-4">
                {[
                  { title: 'Indexes', sql: `CREATE INDEX idx_emp_email ON employees(email);\nCREATE INDEX idx_emp_dept_sal ON employees(department, salary);\nCREATE UNIQUE INDEX idx_emp_unique_email ON employees(email);` },
                  { title: 'Views', sql: `CREATE VIEW active_employees AS\nSELECT id, name, email, department\nFROM employees\nWHERE status = 'active';\n\nSELECT * FROM active_employees;` },
                  { title: 'CTEs', sql: `WITH dept_avg AS (\n  SELECT department, AVG(salary) as avg_sal\n  FROM employees\n  GROUP BY department\n)\nSELECT e.name, e.salary, d.avg_sal\nFROM employees e\nJOIN dept_avg d ON e.department = d.department\nWHERE e.salary > d.avg_sal;` },
                  { title: 'Window Functions', sql: `SELECT name, department, salary,\n  RANK() OVER (PARTITION BY department ORDER BY salary DESC) as rank,\n  AVG(salary) OVER (PARTITION BY department) as dept_avg\nFROM employees;` },
                  { title: 'Aggregations', sql: `SELECT \n  department,\n  COUNT(*) as total,\n  AVG(salary) as avg_salary,\n  MIN(salary) as min_salary,\n  MAX(salary) as max_salary\nFROM employees\nGROUP BY department\nHAVING COUNT(*) > 5\nORDER BY avg_salary DESC;` },
                ].map(({ title, sql }) => (
                  <div key={title} className="premium-card p-6 group">
                    <h3 className="text-sm font-bold text-foreground mb-3">{title}</h3>
                    <CodeBlock code={sql} />
                  </div>
                ))}
              </div>
            </section>

            {/* Security */}
            <section id="security" className="scroll-mt-24 animate-fade-in">
              <h2 className="text-xl font-black text-foreground mb-5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <Shield className="w-4.5 h-4.5 text-red-500" />
                </div>
                Security Best Practices
              </h2>
              <div className="space-y-4">
                <div className="premium-card p-6 group">
                  <h3 className="text-sm font-bold text-foreground mb-3">Row Level Security (RLS)</h3>
                  <CodeBlock code={`ALTER TABLE employees ENABLE ROW LEVEL SECURITY;\n\nCREATE POLICY "Allow public read"\n  ON employees FOR SELECT\n  USING (true);`} />
                </div>
                <div className="premium-card p-6">
                  <h3 className="text-sm font-bold text-foreground mb-2">Credentials Storage</h3>
                  <p className="text-sm text-muted-foreground">
                    Your Supabase credentials are stored in your browser&apos;s localStorage. They are never sent to any server other than your own Supabase project.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
