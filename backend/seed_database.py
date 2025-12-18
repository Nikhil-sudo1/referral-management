"""
Database Seeding Script
Populates database with realistic data for testing and demonstration
"""
from datetime import datetime, timedelta
import random
from app.database import SessionLocal
from app.models.user import User
from app.models.university import University
from app.models.program import Program
from app.models.referral import Referral
from app.models.reward import Reward, RewardTier
from app.core.security import get_password_hash
from uuid import uuid4

def clear_database(db):
    """Clear existing data"""
    print("Clearing existing data...")
    db.query(Reward).delete()
    db.query(Referral).delete()
    db.query(Program).delete()
    db.query(University).delete()
    db.query(User).filter(User.email != 'alex@example.com').delete()  # Keep test user
    db.query(RewardTier).delete()
    db.commit()
    print("[OK] Database cleared")

def seed_reward_tiers(db):
    """Create reward tiers"""
    print("\nSeeding Reward Tiers...")
    tiers = [
        RewardTier(
            tier_name="Bronze",
            min_referrals=1,
            max_referrals=5,
            multiplier=1.00,
            bonus_amount=0,
            description="1-5 successful referrals - Standard rewards",
            is_active=True
        ),
        RewardTier(
            tier_name="Silver",
            min_referrals=6,
            max_referrals=10,
            multiplier=1.25,
            bonus_amount=500,
            description="6-10 successful referrals - 25% bonus on rewards",
            is_active=True
        ),
        RewardTier(
            tier_name="Gold",
            min_referrals=11,
            max_referrals=20,
            multiplier=1.50,
            bonus_amount=1500,
            description="11-20 successful referrals - 50% bonus on rewards",
            is_active=True
        ),
        RewardTier(
            tier_name="Platinum",
            min_referrals=21,
            max_referrals=None,
            multiplier=2.00,
            bonus_amount=5000,
            description="21+ successful referrals - Double rewards",
            is_active=True
        )
    ]
    
    for tier in tiers:
        db.add(tier)
    db.commit()
    print(f"[OK] Created {len(tiers)} reward tiers")

def seed_users(db):
    """Create users with different roles"""
    print("\nSeeding Users...")
    
    users_data = [
        # Super Admin
        ("Super Admin", "admin@teamlease.com", "super_admin", "+919876543210", "TeamLease EdTech"),
        
        # Managers
        ("Rajesh Kumar", "rajesh.kumar@teamlease.com", "manager", "+919876543211", "TeamLease EdTech"),
        ("Priya Sharma", "priya.sharma@teamlease.com", "manager", "+919876543212", "TeamLease EdTech"),
        
        # Counselors
        ("Amit Patel", "amit.patel@teamlease.com", "counselor", "+919876543213", "TeamLease EdTech"),
        ("Sneha Reddy", "sneha.reddy@teamlease.com", "counselor", "+919876543214", "TeamLease EdTech"),
        ("Vikram Singh", "vikram.singh@teamlease.com", "counselor", "+919876543215", "TeamLease EdTech"),
        
        # Referrers
        ("Arjun Mehta", "arjun.mehta@gmail.com", "referrer", "+919876543216", "Independent"),
        ("Kavya Iyer", "kavya.iyer@gmail.com", "referrer", "+919876543217", "Education Consultant"),
        ("Rohit Verma", "rohit.verma@gmail.com", "referrer", "+919876543218", "Career Counselor"),
        ("Neha Gupta", "neha.gupta@gmail.com", "referrer", "+919876543219", "Independent"),
        ("Sanjay Das", "sanjay.das@gmail.com", "referrer", "+919876543220", "Independent"),
    ]
    
    users = []
    for name, email, role, phone, org in users_data:
        user = User(
            email=email.lower(),
            password_hash=get_password_hash("Password123!"),
            name=name,
            phone=phone,
            role=role,
            organization=org,
            referral_code=f"{name.split()[0].upper()}-REF-2025",
            tier="Bronze" if role == "referrer" else None,
            is_active=True,
            is_verified=True,
            created_at=datetime.utcnow() - timedelta(days=random.randint(30, 180))
        )
        db.add(user)
        users.append(user)
    
    db.commit()
    
    # Refresh to get IDs
    for user in users:
        db.refresh(user)
    
    print(f"[OK] Created {len(users)} users")
    return users

def seed_universities(db):
    """Create universities"""
    print("\nSeeding Universities...")
    
    universities_data = [
        ("Amity University", "AMITY", "https://via.placeholder.com/150", "https://www.amity.edu", "Leading private university with multiple campuses across India", "admissions@amity.edu", "+911244392600"),
        ("Manipal Academy", "MANIPAL", "https://via.placeholder.com/150", "https://www.manipal.edu", "Premier deemed university known for medical and engineering programs", "admissions@manipal.edu", "+918202923456"),
        ("Symbiosis International", "SIU", "https://via.placeholder.com/150", "https://www.siu.edu.in", "Multidisciplinary university with strong management programs", "admissions@siu.edu.in", "+912025293100"),
        ("BITS Pilani", "BITS", "https://via.placeholder.com/150", "https://www.bits-pilani.ac.in", "Premier engineering and science institution", "admissions@bits-pilani.ac.in", "+911596244444"),
        ("Christ University", "CHRISTUNI", "https://via.placeholder.com/150", "https://christuniversity.in", "Deemed university with diverse academic programs", "admissions@christuniversity.in", "+918040129100"),
        ("VIT Vellore", "VIT", "https://via.placeholder.com/150", "https://vit.ac.in", "Leading technology university with global recognition", "admissions@vit.ac.in", "+914162202000"),
        ("SRM Institute", "SRM", "https://via.placeholder.com/150", "https://www.srmist.edu.in", "Premier engineering and technology university", "admissions@srmist.edu.in", "+914427417000"),
        ("Lovely Professional University", "LPU", "https://via.placeholder.com/150", "https://www.lpu.in", "India's largest private university", "admissions@lpu.co.in", "+911824404000"),
    ]
    
    universities = []
    for name, code, logo, website, desc, email, phone in universities_data:
        uni = University(
            name=name,
            code=code,
            logo_url=logo,
            website=website,
            description=desc,
            contact_email=email,
            contact_phone=phone,
            address=f"{name} Campus, India",
            status="active",
            created_at=datetime.utcnow() - timedelta(days=random.randint(200, 365))
        )
        db.add(uni)
        universities.append(uni)
    
    db.commit()
    
    for uni in universities:
        db.refresh(uni)
    
    print(f"[OK] Created {len(universities)} universities")
    return universities

def seed_programs(db, universities):
    """Create programs for universities"""
    print("\nSeeding Programs...")
    
    program_templates = [
        ("B.Tech Computer Science", "BTECH-CS", "4 years", 800000, 15, 50000, "Bachelor of Technology in Computer Science and Engineering"),
        ("B.Tech Mechanical Engineering", "BTECH-ME", "4 years", 700000, 15, 45000, "Bachelor of Technology in Mechanical Engineering"),
        ("MBA", "MBA", "2 years", 1200000, 20, 80000, "Master of Business Administration"),
        ("BBA", "BBA", "3 years", 600000, 12, 35000, "Bachelor of Business Administration"),
        ("B.Tech Electronics", "BTECH-EC", "4 years", 750000, 15, 48000, "Bachelor of Technology in Electronics and Communication"),
        ("M.Tech AI & ML", "MTECH-AI", "2 years", 900000, 18, 60000, "Master of Technology in Artificial Intelligence and Machine Learning"),
        ("BCA", "BCA", "3 years", 400000, 10, 25000, "Bachelor of Computer Applications"),
        ("MCA", "MCA", "2 years", 500000, 12, 35000, "Master of Computer Applications"),
    ]
    
    programs = []
    for university in universities:
        # Each university gets 4-6 programs
        num_programs = random.randint(4, 6)
        selected_programs = random.sample(program_templates, num_programs)
        
        for name, code, duration, fee, commission, reward, desc in selected_programs:
            program = Program(
                university_id=university.id,
                name=name,
                code=f"{university.code}-{code}",
                description=desc,
                duration=duration,
                fee_structure=fee,
                commission_rate=commission,
                reward_amount=reward,
                reward_tier="gold",
                eligibility_criteria="10+2 or equivalent" if "B." in name else "Bachelor's degree or equivalent",
                status="active",
                created_at=datetime.utcnow() - timedelta(days=random.randint(100, 300))
            )
            db.add(program)
            programs.append(program)
    
    db.commit()
    
    for program in programs:
        db.refresh(program)
    
    print(f"[OK] Created {len(programs)} programs across {len(universities)} universities")
    return programs

def seed_referrals(db, users, universities, programs):
    """Create referrals with different statuses"""
    print("\nSeeding Referrals...")
    
    referrers = [u for u in users if u.role == "referrer"]
    counselors = [u for u in users if u.role == "counselor"]
    
    referee_names = [
        "Rahul Sharma", "Priyanka Singh", "Aditya Kumar", "Divya Patel",
        "Karan Mehta", "Ananya Reddy", "Rohan Gupta", "Ishita Verma",
        "Aarav Das", "Saanvi Iyer", "Vihaan Joshi", "Diya Kapoor",
        "Aryan Nair", "Aadhya Shah", "Reyansh Bose", "Kiara Desai",
        "Krishna Pillai", "Advika Roy", "Ayush Menon", "Myra Sinha"
    ]
    
    statuses = [
        ("submitted", 40),
        ("assigned", 25),
        ("contacted", 15),
        ("admitted", 12),
        ("rejected", 8)
    ]
    
    referrals = []
    referral_count = 0
    
    for referrer in referrers:
        # Each referrer has 3-8 referrals
        num_referrals = random.randint(3, 8)
        
        for _ in range(num_referrals):
            referee_name = random.choice(referee_names)
            referee_email = f"{referee_name.lower().replace(' ', '.')}@email.com"
            
            # Choose status based on weighted probability
            status = random.choices(
                [s[0] for s in statuses],
                weights=[s[1] for s in statuses]
            )[0]
            
            program = random.choice(programs)
            counselor = random.choice(counselors) if status != "submitted" else None
            
            # Calculate dates based on status
            created_date = datetime.utcnow() - timedelta(days=random.randint(1, 90))
            
            referral = Referral(
                referral_code=f"REF-{referral_count:05d}",
                referrer_id=referrer.id,
                referrer_name=referrer.name,
                referrer_email=referrer.email,
                referrer_phone=referrer.phone,
                referee_name=referee_name,
                referee_email=referee_email,
                referee_phone=f"+91{random.randint(7000000000, 9999999999)}",
                university_id=program.university_id,
                program_id=program.id,
                counselor_id=counselor.id if counselor else None,
                assigned_at=created_date + timedelta(days=1) if counselor else None,
                status=status,
                submission_date=created_date,
                contacted_date=created_date + timedelta(days=2) if status in ["contacted", "admitted", "rejected"] else None,
                admission_date=created_date + timedelta(days=random.randint(7, 30)) if status == "admitted" else None,
                rejection_date=created_date + timedelta(days=random.randint(7, 20)) if status == "rejected" else None,
                slab_tier=1,
                expected_reward=program.reward_amount,
                source="web",
                utm_source="organic",
                created_at=created_date
            )
            db.add(referral)
            referrals.append(referral)
            referral_count += 1
    
    db.commit()
    
    for ref in referrals:
        db.refresh(ref)
    
    print(f"[OK] Created {len(referrals)} referrals")
    return referrals

def seed_rewards(db, referrals, users):
    """Create rewards for admitted referrals"""
    print("\nSeeding Rewards...")
    
    admitted_referrals = [r for r in referrals if r.status == "admitted"]
    rewards = []
    
    for referral in admitted_referrals:
        # Reward for referrer
        referrer_reward = Reward(
            referral_id=referral.id,
            user_id=referral.referrer_id,
            user_type="referrer",
            reward_type="cashback",
            amount=referral.expected_reward,
            status=random.choice(["pending", "approved", "disbursed"]),
            approved_by=random.choice([u.id for u in users if u.role in ["manager", "super_admin"]]) if random.random() > 0.3 else None,
            approved_at=referral.admission_date + timedelta(days=2) if random.random() > 0.3 else None,
            disbursed_by=random.choice([u.id for u in users if u.role in ["manager", "super_admin"]]) if random.random() > 0.5 else None,
            disbursed_at=referral.admission_date + timedelta(days=random.randint(5, 15)) if random.random() > 0.5 else None,
            disbursement_method="bank_transfer" if random.random() > 0.5 else None,
            created_at=referral.admission_date + timedelta(days=1)
        )
        db.add(referrer_reward)
        rewards.append(referrer_reward)
        
        # Reward for counselor (if assigned)
        if referral.counselor_id:
            counselor_reward = Reward(
                referral_id=referral.id,
                user_id=referral.counselor_id,
                user_type="counselor",
                reward_type="incentive",
                amount=float(referral.expected_reward) * 0.5,  # 50% of referrer reward
                status=random.choice(["pending", "approved", "disbursed"]),
                approved_by=random.choice([u.id for u in users if u.role in ["manager", "super_admin"]]) if random.random() > 0.3 else None,
                approved_at=referral.admission_date + timedelta(days=2) if random.random() > 0.3 else None,
                created_at=referral.admission_date + timedelta(days=1)
            )
            db.add(counselor_reward)
            rewards.append(counselor_reward)
    
    db.commit()
    print(f"[OK] Created {len(rewards)} rewards")
    return rewards

def main():
    """Main seeding function"""
    print("\n" + "="*70)
    print("  DATABASE SEEDING - POPULATING WITH REALISTIC DATA")
    print("="*70)
    
    db = SessionLocal()
    
    try:
        # Clear existing data
        clear_database(db)
        
        # Seed data in order
        seed_reward_tiers(db)
        users = seed_users(db)
        universities = seed_universities(db)
        programs = seed_programs(db, universities)
        referrals = seed_referrals(db, users, universities, programs)
        rewards = seed_rewards(db, referrals, users)
        
        print("\n" + "="*70)
        print("  SEEDING COMPLETE!")
        print("="*70)
        print(f"\n[OK] Reward Tiers: 4")
        print(f"[OK] Users: {len(users)}")
        print(f"[OK] Universities: {len(universities)}")
        print(f"[OK] Programs: {len(programs)}")
        print(f"[OK] Referrals: {len(referrals)}")
        print(f"[OK] Rewards: {len(rewards)}")
        print("\n" + "="*70)
        print("\n[SUCCESS] Database is now populated with realistic data!")
        print("\nLogin credentials for testing:")
        print("  Admin:     admin@teamlease.com / Password123!")
        print("  Manager:   rajesh.kumar@teamlease.com / Password123!")
        print("  Counselor: amit.patel@teamlease.com / Password123!")
        print("  Referrer:  arjun.mehta@gmail.com / Password123!")
        print("\n" + "="*70 + "\n")
        
    except Exception as e:
        print(f"\n[ERROR] Error during seeding: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    main()

