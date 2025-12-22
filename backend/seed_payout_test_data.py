"""
Seed realistic payout data for testing
Creates rewards with different statuses using actual database users and referrals
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from app.database import SessionLocal
from app.models.reward import Reward
from app.models.referral import Referral
from app.models.user import User
from decimal import Decimal
from datetime import datetime, timedelta
import uuid
import random

# Realistic reward amounts based on common referral tiers (in rupees)
REALISTIC_AMOUNTS = [
    Decimal("12500"), Decimal("15000"), Decimal("18000"), Decimal("20000"), 
    Decimal("22000"), Decimal("25000"), Decimal("28000"), Decimal("30000"),
    Decimal("32000"), Decimal("35000"), Decimal("37500"), Decimal("40000"),
    Decimal("42000"), Decimal("45000"), Decimal("48000"), Decimal("50000"),
]

# Professional approval notes that sound realistic
STUDENT_ADMIN_NOTES = [
    "Verified referral details and student admission confirmed. All documents validated.",
    "Student successfully enrolled. Referral meets all eligibility criteria.",
    "Approved after verification of admission status and referral authenticity.",
    "Confirmed admission and verified all referral information. Ready for account team review.",
    "Student admission verified. Referral process completed successfully.",
    "All required documents verified. Student admission confirmed. Proceeding with approval.",
    "Referral validated. Student admission status confirmed. Ready for next approval stage.",
]

ACCOUNT_TEAM_NOTES = [
    "Financial verification completed. All bank details validated. Ready for disbursement.",
    "Approved after account verification. Payout can be processed.",
    "All checks completed. Account details verified. Proceed with disbursement.",
    "Financial review completed. Bank information validated. Approved for payout.",
    "Account verification successful. Ready for fund transfer.",
    "Bank account details verified. All compliance checks passed. Approved for disbursement.",
    "Financial audit completed. Account holder details confirmed. Proceed with payment.",
]

def seed_payout_test_data():
    """Create realistic rewards for testing payout approval"""
    db: Session = SessionLocal()
    
    try:
        print("🔧 Creating realistic payout data...")
        
        # Get existing users and referrals
        # Only use admitted referrals that don't already have rewards
        admitted_referrals = db.query(Referral).filter(
            Referral.status == "admitted"
        ).all()
        
        # Get referrer users (user_type_id = 2 is Referral Partner)
        referrer_users = db.query(User).filter(
            User.user_type_id == 2,
            User.is_active == True
        ).all()
        
        # Get student admin user
        student_admin = db.query(User).filter(User.role_id == 3).first()
        
        # Get account team user (Admin or HR Admin)
        account_team_user = db.query(User).filter(User.role_id.in_([1, 2])).first()
        
        if not referrer_users:
            print("❌ No referrer users found. Please create users first.")
            return
        
        if not admitted_referrals:
            print("⚠️  No admitted referrals found. Creating from all referrals...")
            admitted_referrals = db.query(Referral).limit(20).all()
        
        if not student_admin:
            print("⚠️  No student admin user found. Some rewards won't have approval history.")
        
        # Filter out referrals that already have rewards
        existing_reward_referral_ids = db.query(Reward.referral_id).filter(
            Reward.referral_id.isnot(None)
        ).distinct().all()
        existing_ids = {r[0] for r in existing_reward_referral_ids}
        
        available_referrals = [r for r in admitted_referrals if r.id not in existing_ids]
        
        if not available_referrals:
            print("⚠️  All referrals already have rewards. Creating additional rewards...")
            # Use all referrals but create new rewards
            available_referrals = admitted_referrals[:20]
        
        print(f"📊 Found {len(available_referrals)} available referrals")
        print(f"📊 Found {len(referrer_users)} referrer users")
        
        # Create rewards with different statuses
        test_rewards = []
        
        # 1. Pending Student-Admin Approval (12 rewards)
        print("\n📝 Creating rewards with status: pending_student_admin...")
        for i in range(min(12, len(available_referrals))):
            referral = available_referrals[i]
            # Use the referrer from the referral, or pick a random one
            referrer_id = referral.referrer_id
            if not referrer_id and referrer_users:
                referrer_id = random.choice(referrer_users).id
            elif not referrer_id:
                continue
            
            # Use referral's expected_reward if available, otherwise random
            amount = referral.expected_reward if referral.expected_reward else random.choice(REALISTIC_AMOUNTS)
            
            reward = Reward(
                id=uuid.uuid4(),
                referral_id=referral.id,
                user_id=referrer_id,
                user_type="referrer",
                reward_type="cashback",
                amount=amount,
                status="pending_student_admin",
                created_at=datetime.utcnow() - timedelta(days=random.randint(1, 14))
            )
            test_rewards.append(reward)
            db.add(reward)
            print(f"   ✓ Created reward ₹{amount} for referral {referral.referral_code}")
        
        # 2. Approved by Student-Admin, Pending Account Team (8 rewards)
        print("\n📝 Creating rewards with status: pending_account_team...")
        if student_admin:
            start_idx = min(12, len(available_referrals))
            for i in range(min(8, len(available_referrals) - start_idx)):
                idx = start_idx + i
                if idx < len(available_referrals):
                    referral = available_referrals[idx]
                    referrer_id = referral.referrer_id
                    if not referrer_id and referrer_users:
                        referrer_id = random.choice(referrer_users).id
                    elif not referrer_id:
                        continue
                    
                    amount = referral.expected_reward if referral.expected_reward else random.choice(REALISTIC_AMOUNTS)
                    
                    reward = Reward(
                        id=uuid.uuid4(),
                        referral_id=referral.id,
                        user_id=referrer_id,
                        user_type="referrer",
                        reward_type="cashback",
                        amount=amount,
                        status="pending_account_team",
                        student_admin_approved_by=student_admin.id,
                        student_admin_approved_at=datetime.utcnow() - timedelta(hours=random.randint(2, 48)),
                        student_admin_approval_notes=random.choice(STUDENT_ADMIN_NOTES),
                        created_at=datetime.utcnow() - timedelta(days=random.randint(5, 20))
                    )
                    test_rewards.append(reward)
                    db.add(reward)
                    print(f"   ✓ Created reward ₹{amount} for referral {referral.referral_code} (approved by student-admin)")
        else:
            print("   ⚠️  Skipped - No student admin user found")
        
        # 3. Approved by Account Team, Ready for Disbursement (6 rewards)
        print("\n📝 Creating rewards with status: approved_account_team...")
        if account_team_user and student_admin:
            start_idx = min(20, len(available_referrals))
            for i in range(min(6, len(available_referrals) - start_idx)):
                idx = start_idx + i
                if idx < len(available_referrals):
                    referral = available_referrals[idx]
                    referrer_id = referral.referrer_id
                    if not referrer_id and referrer_users:
                        referrer_id = random.choice(referrer_users).id
                    elif not referrer_id:
                        continue
                    
                    amount = referral.expected_reward if referral.expected_reward else random.choice(REALISTIC_AMOUNTS)
                    student_approved_time = datetime.utcnow() - timedelta(days=random.randint(7, 21))
                    
                    reward = Reward(
                        id=uuid.uuid4(),
                        referral_id=referral.id,
                        user_id=referrer_id,
                        user_type="referrer",
                        reward_type="cashback",
                        amount=amount,
                        status="approved_account_team",
                        student_admin_approved_by=student_admin.id,
                        student_admin_approved_at=student_approved_time,
                        student_admin_approval_notes=random.choice(STUDENT_ADMIN_NOTES),
                        account_team_approved_by=account_team_user.id,
                        account_team_approved_at=datetime.utcnow() - timedelta(hours=random.randint(1, 24)),
                        account_team_approval_notes=random.choice(ACCOUNT_TEAM_NOTES),
                        created_at=datetime.utcnow() - timedelta(days=random.randint(10, 30))
                    )
                    test_rewards.append(reward)
                    db.add(reward)
                    print(f"   ✓ Created reward ₹{amount} for referral {referral.referral_code} (approved by account team)")
        else:
            print("   ⚠️  Skipped - Missing student admin or account team user")
        
        # Commit all rewards
        db.commit()
        
        print(f"\n✅ Successfully created {len(test_rewards)} realistic rewards:")
        pending_count = len([r for r in test_rewards if r.status == "pending_student_admin"])
        pending_account_count = len([r for r in test_rewards if r.status == "pending_account_team"])
        approved_account_count = len([r for r in test_rewards if r.status == "approved_account_team"])
        print(f"   - {pending_count} rewards with status: pending_student_admin")
        print(f"   - {pending_account_count} rewards with status: pending_account_team")
        print(f"   - {approved_account_count} rewards with status: approved_account_team")
        
        # Show summary
        print("\n📊 Database Summary by status:")
        statuses = db.query(Reward.status, func.count(Reward.id)).group_by(Reward.status).all()
        for status, count in statuses:
            print(f"   - {status}: {count}")
        
        # Show total amount
        total_amount = db.query(func.sum(Reward.amount)).filter(
            Reward.status == "pending_student_admin"
        ).scalar() or Decimal("0")
        print(f"\n💰 Total pending amount: ₹{total_amount:,.2f}")
        
    except Exception as e:
        print(f"❌ Error creating test data: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_payout_test_data()
