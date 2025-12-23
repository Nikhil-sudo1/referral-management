"""
Script to apply the leaderboard stored procedure migration
"""
import sys
import os
from sqlalchemy import create_engine, text
from app.config import settings

def apply_stored_procedure():
    """Apply the stored procedure to the database"""
    try:
        engine = create_engine(settings.DATABASE_URL)
        
        # Read the SQL file
        sql_file_path = os.path.join(
            os.path.dirname(__file__),
            "migrations",
            "create_leaderboard_sp.sql"
        )
        
        with open(sql_file_path, 'r', encoding='utf-8') as f:
            sql_content = f.read()
        
        print("=" * 80)
        print("  APPLYING LEADERBOARD STORED PROCEDURE")
        print("=" * 80)
        print()
        
        with engine.connect() as conn:
            # Execute the SQL
            conn.execute(text(sql_content))
            conn.commit()
        
        print("[SUCCESS] Stored procedure 'get_referrer_leaderboard' created successfully!")
        print()
        
        # Test the stored procedure
        print("Testing stored procedure...")
        with engine.connect() as conn:
            result = conn.execute(
                text("SELECT * FROM get_referrer_leaderboard('all_time', 10, 2)")
            )
            rows = result.fetchall()
            print(f"[OK] Stored procedure executed successfully. Returned {len(rows)} rows.")
            if rows:
                print("\nSample results:")
                for row in rows[:3]:
                    print(f"  Rank {row[0]}: {row[2]} ({row[3]}) - {row[4]} referrals, {row[5]} admitted")
        
        print()
        print("=" * 80)
        print("  MIGRATION COMPLETE")
        print("=" * 80)
        
        return True
        
    except Exception as e:
        print(f"[ERROR] Failed to apply stored procedure: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = apply_stored_procedure()
    sys.exit(0 if success else 1)

