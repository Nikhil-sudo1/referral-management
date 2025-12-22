"""
Script to create missing database tables
"""
import sys
sys.path.insert(0, '.')

from sqlalchemy import text
from app.database import engine, Base
from app.models import (
    User, UserType, Role, University, Program, Referral,
    Reward, RewardTier, Settings, AuditLog, PartnerType,
    Industry, Company, Job, JobReferral, JobReferralReward, JobRewardSlab
)

def create_tables():
    print("=" * 60)
    print("Creating missing database tables...")
    print("=" * 60)
    
    # Check which tables exist
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        """))
        existing_tables = {row[0] for row in result}
    
    print(f"\nExisting tables: {existing_tables}")
    
    # Create all tables defined in our models
    Base.metadata.create_all(bind=engine)
    
    # Check again
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        """))
        new_tables = {row[0] for row in result}
    
    created = new_tables - existing_tables
    if created:
        print(f"\nNewly created tables: {created}")
    else:
        print("\nNo new tables created - all tables already exist.")
    
    print("\n[OK] Table creation complete!")
    print("=" * 60)


if __name__ == "__main__":
    create_tables()

