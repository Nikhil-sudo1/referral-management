"""
Add Performance Indexes
This script adds database indexes to improve query performance
"""
from sqlalchemy import text
from app.database import engine

def add_performance_indexes():
    """Add indexes to frequently queried columns"""
    
    indexes = [
        # Referrals table indexes
        "CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status)",
        "CREATE INDEX IF NOT EXISTS idx_referrals_university_id ON referrals(university_id)",
        "CREATE INDEX IF NOT EXISTS idx_referrals_program_id ON referrals(program_id)",
        "CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id)",
        "CREATE INDEX IF NOT EXISTS idx_referrals_counselor_id ON referrals(counselor_id)",
        "CREATE INDEX IF NOT EXISTS idx_referrals_created_at ON referrals(created_at)",
        "CREATE INDEX IF NOT EXISTS idx_referrals_referee_email ON referrals(referee_email)",
        
        # Users table indexes
        "CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)",
        "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)",
        "CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active)",
        "CREATE INDEX IF NOT EXISTS idx_users_tier ON users(tier)",
        
        # Universities table indexes
        "CREATE INDEX IF NOT EXISTS idx_universities_status ON universities(status)",
        "CREATE INDEX IF NOT EXISTS idx_universities_code ON universities(code)",
        
        # Programs table indexes  
        "CREATE INDEX IF NOT EXISTS idx_programs_university_id ON programs(university_id)",
        "CREATE INDEX IF NOT EXISTS idx_programs_status ON programs(status)",
        "CREATE INDEX IF NOT EXISTS idx_programs_reward_tier ON programs(reward_tier)",
        
        # Rewards table indexes
        "CREATE INDEX IF NOT EXISTS idx_rewards_user_id ON rewards(user_id)",
        "CREATE INDEX IF NOT EXISTS idx_rewards_referral_id ON rewards(referral_id)",
        "CREATE INDEX IF NOT EXISTS idx_rewards_status ON rewards(status)",
        "CREATE INDEX IF NOT EXISTS idx_rewards_user_type ON rewards(user_type)",
        
        # Notifications table indexes
        "CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)",
        "CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read)",
        "CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at)",
    ]
    
    with engine.connect() as conn:
        for index_sql in indexes:
            try:
                print(f"Creating index: {index_sql.split('idx_')[1].split(' ON')[0]}")
                conn.execute(text(index_sql))
                conn.commit()
                print("  ✓ Success")
            except Exception as e:
                print(f"  ✗ Error: {e}")
                conn.rollback()
    
    print("\n✅ All indexes created successfully!")

if __name__ == "__main__":
    print("Adding performance indexes to database...")
    print("=" * 60)
    add_performance_indexes()

