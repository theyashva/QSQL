import { BookOpen, Terminal, Key, Database, Table2, GitFork, Shield } from 'lucide-react';

export default function DocsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 pb-20 animate-fade-in">
      <div className="mb-12 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">Documentation</h1>
        <p className="text-base text-muted-foreground max-w-xl mx-auto">
          Learn how to use QSQL to manage your databases effectively.
        </p>
      </div>

      <div className="space-y-10">
        {/* Getting Started */}
        <section>
          <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            Getting Started
          </h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>QSQL is a real-time SQL editor that connects to your own Supabase PostgreSQL database. Here&apos;s how to get started:</p>
            <ol className="list-decimal list-inside space-y-1.5 ml-2">
              <li>Create a free Supabase account and project</li>
              <li>Set up the <code className="px-1 py-0.5 rounded bg-muted text-foreground text-xs font-mono">exec_sql</code> function in your database</li>
              <li>Connect to QSQL using your project URL and anon key</li>
              <li>Open the playground and start writing SQL</li>
            </ol>
          </div>
        </section>

        {/* SQL Function Setup */}
        <section>
          <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-primary" />
            Required Database Function
          </h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>QSQL executes queries through a PostgreSQL function. You <strong className="text-foreground">must</strong> create this function in your Supabase SQL editor before using QSQL:</p>
            <div className="bg-card border border-border/50 rounded-lg p-4 overflow-x-auto">
              <pre className="text-xs font-mono text-foreground whitespace-pre leading-relaxed">{`CREATE OR REPLACE FUNCTION exec_sql(query_text TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  is_select BOOLEAN;
BEGIN
  -- Check if this is a SELECT/WITH query that returns rows
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
$$;`}</pre>
            </div>
            <div className="bg-amber-500/8 border border-amber-500/20 rounded-lg p-3 text-sm">
              <p className="font-semibold text-foreground mb-0.5">⚠️ Security Note</p>
              <p>This function uses <code className="px-1 py-0.5 rounded bg-muted text-foreground text-xs font-mono">SECURITY DEFINER</code>, which means it runs with the privileges of the function creator. Only use this with your anon/public key and consider adding row-level security (RLS) to your tables.</p>
            </div>
          </div>
        </section>

        {/* CRUD Operations */}
        <section>
          <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
            <Database className="w-4 h-4 text-primary" />
            CRUD Operations
          </h2>
          <div className="grid gap-2.5">
            {[
              {
                title: 'CREATE TABLE',
                desc: 'Define new tables with columns, data types, and constraints.',
                sql: `CREATE TABLE employees (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  department VARCHAR(50),
  salary DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);`,
              },
              {
                title: 'INSERT',
                desc: 'Add new records to your tables.',
                sql: `INSERT INTO employees (name, email, department, salary)
VALUES 
  ('Alice Johnson', 'alice@example.com', 'Engineering', 95000),
  ('Bob Smith', 'bob@example.com', 'Marketing', 75000);`,
              },
              {
                title: 'SELECT',
                desc: 'Query and retrieve data with filtering, sorting, and pagination.',
                sql: `SELECT name, email, salary
FROM employees
WHERE department = 'Engineering'
  AND salary > 80000
ORDER BY salary DESC
LIMIT 10;`,
              },
              {
                title: 'UPDATE',
                desc: 'Modify existing records.',
                sql: `UPDATE employees
SET salary = salary * 1.10,
    department = 'Senior Engineering'
WHERE department = 'Engineering'
  AND salary > 90000;`,
              },
              {
                title: 'DELETE',
                desc: 'Remove records from tables.',
                sql: `DELETE FROM employees
WHERE created_at < NOW() - INTERVAL '1 year'
  AND department = 'Inactive';`,
              },
            ].map(({ title, desc, sql }) => (
              <div key={title} className="border border-border/50 rounded-lg bg-card p-4">
                <h3 className="text-sm font-semibold text-foreground mb-0.5">{title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{desc}</p>
                <pre className="text-xs font-mono text-foreground bg-muted/25 p-2.5 rounded-md overflow-x-auto whitespace-pre leading-relaxed">{sql}</pre>
              </div>
            ))}
          </div>
        </section>

        {/* Keys and Constraints */}
        <section>
          <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
            <Key className="w-4 h-4 text-primary" />
            Keys &amp; Constraints
          </h2>
          <div className="grid gap-2.5">
            {[
              {
                title: 'Primary Key',
                sql: `CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  sku VARCHAR(50) NOT NULL
);`,
              },
              {
                title: 'Foreign Key',
                sql: `CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  quantity INT NOT NULL CHECK (quantity > 0)
);`,
              },
              {
                title: 'Composite Key',
                sql: `CREATE TABLE order_items (
  order_id INT REFERENCES orders(id),
  product_id INT REFERENCES products(id),
  quantity INT NOT NULL,
  PRIMARY KEY (order_id, product_id)
);`,
              },
              {
                title: 'Unique & Check Constraints',
                sql: `ALTER TABLE employees
ADD CONSTRAINT unique_email UNIQUE (email);

ALTER TABLE employees
ADD CONSTRAINT check_salary CHECK (salary >= 0);`,
              },
            ].map(({ title, sql }) => (
              <div key={title} className="border border-border/50 rounded-lg bg-card p-4">
                <h3 className="text-sm font-semibold text-foreground mb-1.5">{title}</h3>
                <pre className="text-xs font-mono text-foreground bg-muted/25 p-2.5 rounded-md overflow-x-auto whitespace-pre leading-relaxed">{sql}</pre>
              </div>
            ))}
          </div>
        </section>

        {/* Joins */}
        <section>
          <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
            <GitFork className="w-4 h-4 text-primary" />
            Joins
          </h2>
          <div className="grid gap-2.5">
            {[
              {
                title: 'INNER JOIN',
                desc: 'Returns only matching rows from both tables.',
                sql: `SELECT e.name, d.department_name
FROM employees e
INNER JOIN departments d ON e.department_id = d.id;`,
              },
              {
                title: 'LEFT JOIN',
                desc: 'Returns all rows from the left table, with matches from the right.',
                sql: `SELECT e.name, o.total
FROM employees e
LEFT JOIN orders o ON e.id = o.employee_id;`,
              },
              {
                title: 'RIGHT JOIN',
                desc: 'Returns all rows from the right table, with matches from the left.',
                sql: `SELECT e.name, d.department_name
FROM employees e
RIGHT JOIN departments d ON e.department_id = d.id;`,
              },
              {
                title: 'FULL OUTER JOIN',
                desc: 'Returns all rows from both tables.',
                sql: `SELECT e.name, d.department_name
FROM employees e
FULL OUTER JOIN departments d ON e.department_id = d.id;`,
              },
              {
                title: 'CROSS JOIN',
                desc: 'Returns the Cartesian product of both tables.',
                sql: `SELECT e.name, p.project_name
FROM employees e
CROSS JOIN projects p;`,
              },
              {
                title: 'Self Join',
                desc: 'Join a table to itself.',
                sql: `SELECT e1.name AS employee, e2.name AS manager
FROM employees e1
LEFT JOIN employees e2 ON e1.manager_id = e2.id;`,
              },
            ].map(({ title, desc, sql }) => (
              <div key={title} className="border border-border/50 rounded-lg bg-card p-4">
                <h3 className="text-sm font-semibold text-foreground mb-0.5">{title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{desc}</p>
                <pre className="text-xs font-mono text-foreground bg-muted/25 p-2.5 rounded-md overflow-x-auto whitespace-pre leading-relaxed">{sql}</pre>
              </div>
            ))}
          </div>
        </section>

        {/* Advanced */}
        <section>
          <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
            <Table2 className="w-4 h-4 text-primary" />
            Advanced Features
          </h2>
          <div className="grid gap-2.5">
            {[
              {
                title: 'Indexes',
                sql: `-- B-tree index (default)
CREATE INDEX idx_emp_email ON employees(email);

-- Composite index
CREATE INDEX idx_emp_dept_sal ON employees(department, salary);

-- Unique index
CREATE UNIQUE INDEX idx_emp_unique_email ON employees(email);`,
              },
              {
                title: 'Views',
                sql: `CREATE VIEW active_employees AS
SELECT id, name, email, department
FROM employees
WHERE status = 'active';

SELECT * FROM active_employees;`,
              },
              {
                title: 'Subqueries',
                sql: `SELECT name, salary
FROM employees
WHERE salary > (
  SELECT AVG(salary) FROM employees
);`,
              },
              {
                title: 'Common Table Expressions (CTEs)',
                sql: `WITH dept_avg AS (
  SELECT department, AVG(salary) as avg_sal
  FROM employees
  GROUP BY department
)
SELECT e.name, e.salary, d.avg_sal
FROM employees e
JOIN dept_avg d ON e.department = d.department
WHERE e.salary > d.avg_sal;`,
              },
              {
                title: 'Window Functions',
                sql: `SELECT name, department, salary,
  RANK() OVER (PARTITION BY department ORDER BY salary DESC) as rank,
  AVG(salary) OVER (PARTITION BY department) as dept_avg
FROM employees;`,
              },
              {
                title: 'Transactions (via multiple statements)',
                sql: `-- Execute these as separate queries:
-- 1. Start
BEGIN;
-- 2. Operations  
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
-- 3. Commit
COMMIT;`,
              },
              {
                title: 'Aggregations',
                sql: `SELECT 
  department,
  COUNT(*) as total,
  AVG(salary) as avg_salary,
  MIN(salary) as min_salary,
  MAX(salary) as max_salary,
  SUM(salary) as total_salary
FROM employees
GROUP BY department
HAVING COUNT(*) > 5
ORDER BY avg_salary DESC;`,
              },
              {
                title: 'ALTER TABLE',
                sql: `-- Add column
ALTER TABLE employees ADD COLUMN phone VARCHAR(20);

-- Drop column
ALTER TABLE employees DROP COLUMN phone;

-- Rename column
ALTER TABLE employees RENAME COLUMN name TO full_name;

-- Change data type
ALTER TABLE employees ALTER COLUMN salary TYPE NUMERIC(12,2);`,
              },
            ].map(({ title, sql }) => (
              <div key={title} className="border border-border/50 rounded-lg bg-card p-4">
                <h3 className="text-sm font-semibold text-foreground mb-1.5">{title}</h3>
                <pre className="text-xs font-mono text-foreground bg-muted/25 p-2.5 rounded-md overflow-x-auto whitespace-pre leading-relaxed">{sql}</pre>
              </div>
            ))}
          </div>
        </section>

        {/* Security */}
        <section>
          <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Security Best Practices
          </h2>
          <div className="space-y-2.5 text-muted-foreground">
            <div className="border border-border/50 rounded-lg bg-card p-4">
              <h3 className="text-sm font-semibold text-foreground mb-1.5">Row Level Security (RLS)</h3>
              <p className="text-sm mb-2">Always enable RLS on your tables in production:</p>
              <pre className="text-xs font-mono text-foreground bg-muted/25 p-2.5 rounded-md overflow-x-auto whitespace-pre leading-relaxed">{`ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read"
  ON employees FOR SELECT
  USING (true);`}</pre>
            </div>
            <div className="border border-border/50 rounded-lg bg-card p-4">
              <h3 className="text-sm font-semibold text-foreground mb-1.5">Credentials Storage</h3>
              <p className="text-sm">
                Your Supabase credentials are stored in your browser&apos;s localStorage. They are never sent to any
                server other than your own Supabase project. Clear your browser data to remove them.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
