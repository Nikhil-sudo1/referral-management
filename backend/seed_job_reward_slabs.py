"""
Seed Job Reward Slabs
Creates the reward slab tiers for job referrals
"""
import uuid
from datetime import datetime
from app.database import SessionLocal
from app.models.job_referral import JobRewardSlab


def seed_reward_slabs():
    db = SessionLocal()
    
    print("=" * 60)
    print("SEEDING JOB REWARD SLABS")
    print("=" * 60)
    
    # Check if slabs already exist
    existing = db.query(JobRewardSlab).count()
    if existing > 0:
        print(f"Found {existing} existing slabs. Skipping seed.")
        db.close()
        return
    
    slabs = [
        {
            "slab_name": "Bronze",
            "min_referrals": 0,
            "max_referrals": 5,
            "reward_per_referral": 5000,
            "bonus_amount": 0,
            "level": 1,
            "description": "Starting level for new referrers. Earn ₹5,000 per successful referral.",
            "icon": "bronze",
            "color": "#CD7F32"
        },
        {
            "slab_name": "Silver",
            "min_referrals": 6,
            "max_referrals": 15,
            "reward_per_referral": 7500,
            "bonus_amount": 5000,
            "level": 2,
            "description": "Silver tier unlocked! Earn ₹7,500 per referral + ₹5,000 bonus on reaching this level.",
            "icon": "silver",
            "color": "#C0C0C0"
        },
        {
            "slab_name": "Gold",
            "min_referrals": 16,
            "max_referrals": 30,
            "reward_per_referral": 10000,
            "bonus_amount": 15000,
            "level": 3,
            "description": "Gold tier achieved! Earn ₹10,000 per referral + ₹15,000 bonus.",
            "icon": "gold",
            "color": "#FFD700"
        },
        {
            "slab_name": "Platinum",
            "min_referrals": 31,
            "max_referrals": 50,
            "reward_per_referral": 15000,
            "bonus_amount": 30000,
            "level": 4,
            "description": "Platinum elite! Earn ₹15,000 per referral + ₹30,000 bonus.",
            "icon": "platinum",
            "color": "#E5E4E2"
        },
        {
            "slab_name": "Diamond",
            "min_referrals": 51,
            "max_referrals": None,
            "reward_per_referral": 20000,
            "bonus_amount": 50000,
            "level": 5,
            "description": "Diamond legend! Maximum rewards: ₹20,000 per referral + ₹50,000 bonus.",
            "icon": "diamond",
            "color": "#B9F2FF"
        }
    ]
    
    for slab_data in slabs:
        slab = JobRewardSlab(
            id=uuid.uuid4(),
            slab_name=slab_data["slab_name"],
            min_referrals=slab_data["min_referrals"],
            max_referrals=slab_data["max_referrals"],
            reward_per_referral=slab_data["reward_per_referral"],
            bonus_amount=slab_data["bonus_amount"],
            level=slab_data["level"],
            description=slab_data["description"],
            icon=slab_data["icon"],
            color=slab_data["color"],
            is_active=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(slab)
        print(f"  ✓ Created {slab_data['slab_name']} slab (Level {slab_data['level']})")
    
    db.commit()
    db.close()
    
    print("-" * 60)
    print("✓ Successfully seeded 5 reward slabs")
    print("=" * 60)


if __name__ == "__main__":
    seed_reward_slabs()

