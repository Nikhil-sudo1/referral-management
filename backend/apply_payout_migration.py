"""
Apply payout approval fields migration directly to database
Run this script to add the new columns without using Alembic
"""
import psycopg2
from app.config import settings

def apply_migration():
    """Apply the payout approval fields migration"""
    try:
        # Connect to database
        conn = psycopg2.connect(
            host=settings.DATABASE_HOST,
            port=settings.DATABASE_PORT,
            database=settings.DATABASE_NAME,
            user=settings.DATABASE_USER,
            password=settings.DATABASE_PASSWORD
        )
        cur = conn.cursor()
        
        print("Connected to database. Applying migration...")
        
        # Add student-admin approval fields
        print("Adding student-admin approval fields...")
        cur.execute("""
            ALTER TABLE rewards 
            ADD COLUMN IF NOT EXISTS student_admin_approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
            ADD COLUMN IF NOT EXISTS student_admin_approved_at TIMESTAMP,
            ADD COLUMN IF NOT EXISTS student_admin_approval_notes TEXT;
        """)
        
        # Add account team approval fields
        print("Adding account team approval fields...")
        cur.execute("""
            ALTER TABLE rewards 
            ADD COLUMN IF NOT EXISTS account_team_approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
            ADD COLUMN IF NOT EXISTS account_team_approved_at TIMESTAMP,
            ADD COLUMN IF NOT EXISTS account_team_approval_notes TEXT;
        """)
        
        # Drop existing constraint if it exists
        print("Updating status constraint...")
        cur.execute("ALTER TABLE rewards DROP CONSTRAINT IF EXISTS rewards_status_check;")
        
        # Add new constraint with all statuses
        cur.execute("""
            ALTER TABLE rewards ADD CONSTRAINT rewards_status_check 
            CHECK (status IN (
                'pending_student_admin',
                'approved_student_admin',
                'pending_account_team',
                'approved_account_team',
                'disbursed',
                'cancelled',
                'pending',
                'approved'
            ));
        """)
        
        # Create indexes
        print("Creating indexes...")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_rewards_student_admin_approved_by ON rewards(student_admin_approved_by);")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_rewards_account_team_approved_by ON rewards(account_team_approved_by);")
        
        # Commit changes
        conn.commit()
        print("✅ Migration applied successfully!")
        
        # Verify columns exist
        cur.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'rewards' 
            AND column_name IN (
                'student_admin_approved_by',
                'student_admin_approved_at',
                'student_admin_approval_notes',
                'account_team_approved_by',
                'account_team_approved_at',
                'account_team_approval_notes'
            );
        """)
        columns = cur.fetchall()
        print(f"\n✅ Verified: {len(columns)} new columns added:")
        for col in columns:
            print(f"   - {col[0]}")
        
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error applying migration: {e}")
        if conn:
            conn.rollback()
        raise

if __name__ == "__main__":
    apply_migration()

