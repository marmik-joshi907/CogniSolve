"""Quick script to inspect the cognisol database tables and data."""
from db.connection import init_pool, execute_query

init_pool()

# 1. List all tables
tables = execute_query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name"
)
print("=" * 50)
print("TABLES IN cognisol DATABASE")
print("=" * 50)
for t in tables:
    print(f"  [OK] {t['table_name']}")

# 2. Row counts
print()
print("=" * 50)
print("ROW COUNTS")
print("=" * 50)
for tbl in ['classification_labels', 'agents', 'complaints', 'sla_events']:
    count = execute_query(f"SELECT COUNT(*) as c FROM {tbl}")[0]['c']
    print(f"  {tbl}: {count} rows")

# 3. Classification labels (seed data)
print()
print("=" * 50)
print("CLASSIFICATION LABELS (seed data)")
print("=" * 50)
labels = execute_query("SELECT * FROM classification_labels ORDER BY id")
for l in labels:
    print(f"  [{l['id']}] {l['label_name']} -- {l['description']}")

# 4. Agents (seed data)
print()
print("=" * 50)
print("AGENTS (seed data)")
print("=" * 50)
agents = execute_query("SELECT * FROM agents ORDER BY id")
for a in agents:
    print(f"  [{a['id']}] {a['name']} ({a['role']}) -- {a['email']}")

# 5. Complaints (actual data)
print()
print("=" * 50)
print("COMPLAINTS")
print("=" * 50)
complaints = execute_query("SELECT id, channel, status, category, priority, confidence_score, sla_breached, created_at FROM complaints ORDER BY id")
if not complaints:
    print("  (no complaints submitted yet)")
for c in complaints:
    print(f"  [#{c['id']}] {c['category']} | {c['priority']} | {c['status']} | conf={c['confidence_score']} | breached={c['sla_breached']} | via {c['channel']} | {c['created_at']}")

# 6. Indexes
print()
print("=" * 50)
print("PERFORMANCE INDEXES")
print("=" * 50)
indexes = execute_query(
    "SELECT indexname, tablename FROM pg_indexes WHERE schemaname='public' AND indexname LIKE 'idx_%' ORDER BY indexname"
)
for i in indexes:
    print(f"  [OK] {i['indexname']} -> {i['tablename']}")

# 7. Column info for complaints table
print()
print("=" * 50)
print("COMPLAINTS TABLE SCHEMA")
print("=" * 50)
cols = execute_query("""
    SELECT column_name, data_type, column_default, is_nullable
    FROM information_schema.columns 
    WHERE table_name = 'complaints' 
    ORDER BY ordinal_position
""")
for col in cols:
    nullable = "NULL" if col['is_nullable'] == 'YES' else "NOT NULL"
    default = f" DEFAULT {col['column_default']}" if col['column_default'] else ""
    print(f"  {col['column_name']:25s} {col['data_type']:20s} {nullable}{default}")

print()
print("[DONE] Database is fully operational!")
