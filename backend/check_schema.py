"""Check database schema"""
import psycopg2

conn = psycopg2.connect(
    host='10.0.3.146',
    port=5432,
    user='referral',
    password='R@f@iia1@2026',
    dbname='referral'
)
cur = conn.cursor()

# Get all tables
cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name")
tables = [r[0] for r in cur.fetchall()]
print('=== DATABASE TABLES ===')
for t in tables:
    print(f'  - {t}')

print('\n=== TABLE COLUMNS ===')
for table in tables:
    cur.execute(f"SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = '{table}' ORDER BY ordinal_position")
    cols = cur.fetchall()
    print(f'\n{table}:')
    for col in cols:
        print(f'  {col[0]} ({col[1]}) {"NULL" if col[2] == "YES" else "NOT NULL"}')

conn.close()

