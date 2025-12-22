"""
Comprehensive Database Seeding Script
Seeds ALL required data for the referral management system
- User Types & Roles
- Users for each role
- Industries, Companies, Jobs
- Job Referrals
- Reward Slabs
"""
import sys
sys.path.insert(0, '.')

import uuid
import random
from datetime import datetime, timedelta, date
from sqlalchemy import text

from app.database import SessionLocal, engine
from app.models.user import User
from app.models.user_type import UserType
from app.models.role import Role
from app.models.university import University
from app.models.program import Program
from app.models.referral import Referral
from app.models.industry import Industry
from app.models.company import Company
from app.models.job import Job
from app.models.job_referral import JobReferral, JobReferralReward, JobRewardSlab
from app.core.security import get_password_hash


def print_header(text):
    print("\n" + "=" * 70)
    print(f"  {text}")
    print("=" * 70)


# Use ASCII characters for Windows compatibility
OK = "[OK]"
ERR = "[ERROR]"
INFO = "[-]"


def seed_user_types_and_roles(db):
    """Seed user_type_master and role_master tables"""
    print_header("SEEDING USER TYPES AND ROLES")
    
    # User Types
    user_types = [
        UserType(id=1, name="Admin", code="admin", description="Administrative users with management access"),
        UserType(id=2, name="Referral Partner", code="referral_partner", description="Users who refer students/candidates"),
    ]
    
    for ut in user_types:
        existing = db.query(UserType).filter(UserType.id == ut.id).first()
        if not existing:
            db.add(ut)
            print(f"  {OK} Created UserType: {ut.name}")
        else:
            print(f"  {INFO} UserType exists: {ut.name}")
    
    db.commit()
    
    # Roles
    roles = [
        # Admin roles (user_type_id = 1)
        Role(id=1, user_type_id=1, name="Human Resources", code="human_resources", description="HR and recruitment management"),
        Role(id=2, user_type_id=1, name="Business Head", code="business_head", description="Business operations and strategy"),
        Role(id=3, user_type_id=1, name="Student Admin", code="student_admin", description="Student services and administration"),
        # Referral Partner roles (user_type_id = 2)
        Role(id=4, user_type_id=2, name="Employee", code="employee", description="Company employee referrer for jobs"),
        Role(id=5, user_type_id=2, name="Student Referrer", code="student_referrer", description="Student who refers peers for courses"),
    ]
    
    for role in roles:
        existing = db.query(Role).filter(Role.id == role.id).first()
        if not existing:
            db.add(role)
            print(f"  {OK} Created Role: {role.name} (ID: {role.id})")
        else:
            print(f"  {INFO} Role exists: {role.name} (ID: {role.id})")
    
    db.commit()
    print("\n  [OK] User Types and Roles seeded successfully")


def seed_industries_and_companies(db):
    """Seed industries and companies"""
    print_header("SEEDING INDUSTRIES AND COMPANIES")
    
    industries = [
        {"id": 1, "name": "Information Technology", "display_order": 1},
        {"id": 2, "name": "Healthcare & Life Sciences", "display_order": 2},
        {"id": 3, "name": "Manufacturing & Engineering", "display_order": 3},
        {"id": 4, "name": "Banking & Financial Services", "display_order": 4},
        {"id": 5, "name": "Education & Training", "display_order": 5},
    ]
    
    for ind_data in industries:
        existing = db.query(Industry).filter(Industry.id == ind_data["id"]).first()
        if not existing:
            industry = Industry(**ind_data, is_hidden=False)
            db.add(industry)
            print(f"  {OK} Created Industry: {ind_data['name']}")
    
    db.commit()
    
    companies = [
        # IT (industry_id=1)
        {"id": 1, "name": "TechCorp Solutions", "industry_id": 1, "description": "Leading IT consulting firm"},
        {"id": 2, "name": "Digital Innovations", "industry_id": 1, "description": "Software development company"},
        {"id": 3, "name": "Cloud Systems Inc", "industry_id": 1, "description": "Cloud infrastructure solutions"},
        # Healthcare (industry_id=2)
        {"id": 4, "name": "MediCare Hospitals", "industry_id": 2, "description": "Multi-specialty hospital chain"},
        {"id": 5, "name": "PharmaTech Labs", "industry_id": 2, "description": "Pharmaceutical research"},
        {"id": 6, "name": "HealthFirst Clinics", "industry_id": 2, "description": "Primary healthcare services"},
        # Manufacturing (industry_id=3)
        {"id": 7, "name": "AutoParts Manufacturing", "industry_id": 3, "description": "Automotive components"},
        {"id": 8, "name": "Steel Dynamics Ltd", "industry_id": 3, "description": "Steel and metal products"},
        {"id": 9, "name": "Precision Engineering", "industry_id": 3, "description": "Precision engineering solutions"},
        # Banking (industry_id=4)
        {"id": 10, "name": "National Bank", "industry_id": 4, "description": "Full-service banking"},
        {"id": 11, "name": "FinTech Solutions", "industry_id": 4, "description": "Digital banking and payments"},
        {"id": 12, "name": "Investment Partners", "industry_id": 4, "description": "Wealth management"},
        # Education (industry_id=5)
        {"id": 13, "name": "TeamLease EdTech", "industry_id": 5, "description": "Education and skill development"},
        {"id": 14, "name": "Global Learning Institute", "industry_id": 5, "description": "Professional training"},
        {"id": 15, "name": "Academic Excellence", "industry_id": 5, "description": "Educational consultancy"},
    ]
    
    for comp_data in companies:
        existing = db.query(Company).filter(Company.id == comp_data["id"]).first()
        if not existing:
            company = Company(**comp_data, is_active=True)
            db.add(company)
            print(f"  {OK} Created Company: {comp_data['name']}")
    
    db.commit()
    print("\n  [OK] Industries and Companies seeded successfully")


def seed_jobs(db):
    """Seed jobs for each company"""
    print_header("SEEDING JOBS")
    
    job_titles_by_industry = {
        1: ["Software Developer", "Senior Backend Engineer", "Frontend Developer", "Full Stack Developer", 
            "DevOps Engineer", "Data Scientist", "QA Engineer", "UI/UX Designer", "Product Manager", "Technical Lead"],
        2: ["Medical Officer", "Staff Nurse", "Pharmacist", "Lab Technician", "Radiologist", 
            "Physiotherapist", "Healthcare Administrator", "Clinical Research Associate", "Medical Billing Specialist", "Patient Coordinator"],
        3: ["Production Engineer", "Quality Control Manager", "Maintenance Technician", "CNC Operator",
            "Production Supervisor", "Safety Officer", "Plant Manager", "Industrial Designer", "Supply Chain Coordinator", "Quality Engineer"],
        4: ["Relationship Manager", "Credit Analyst", "Branch Manager", "Financial Advisor", "Loan Officer",
            "Risk Analyst", "Compliance Officer", "Treasury Manager", "Investment Analyst", "Operations Manager"],
        5: ["Academic Coordinator", "Training Specialist", "Content Developer", "Student Counselor", "Placement Officer",
            "Curriculum Designer", "E-Learning Specialist", "Educational Consultant", "Admission Counselor", "Faculty Member"],
    }
    
    locations = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Pune", "Kolkata"]
    job_count = 0
    
    companies = db.query(Company).all()
    
    for company in companies:
        titles = job_titles_by_industry.get(company.industry_id, [])
        
        for idx, title in enumerate(titles):
            existing = db.query(Job).filter(Job.job_title == title, Job.company_id == company.id).first()
            if not existing:
                exp_from = (idx % 5) * 2
                exp_to = exp_from + 3
                base_salary = 300000 + (exp_from * 100000)
                
                job = Job(
                    external_job_id=1000 + job_count,
                    job_title=title,
                    company_id=company.id,
                    industry_id=company.industry_id,
                    exp_from=exp_from,
                    exp_to=exp_to,
                    ctc_from=base_salary,
                    ctc_to=base_salary + 200000,
                    hide_salary=False,
                    description=f"{title} position at {company.name}. Requires {exp_from}-{exp_to} years experience.",
                    vacancies=random.randint(1, 5),
                    location=random.choice(locations),
                    valid_till=date.today() + timedelta(days=random.randint(90, 365)),
                    status=True,
                    is_active=True,
                    source="seed_script"
                )
                db.add(job)
                job_count += 1
    
    db.commit()
    print(f"  {OK} Created {job_count} jobs")
    print(f"\n  {OK} Jobs seeded successfully")


def seed_universities_and_programs(db):
    """Seed universities and programs for student referrals"""
    print_header("SEEDING UNIVERSITIES AND PROGRAMS")
    
    universities_data = [
        ("Amity University", "AMITY", "admissions@amity.edu"),
        ("Manipal Academy", "MANIPAL", "admissions@manipal.edu"),
        ("Symbiosis International", "SIU", "admissions@siu.edu.in"),
        ("BITS Pilani", "BITS", "admissions@bits-pilani.ac.in"),
        ("Christ University", "CHRISTUNI", "admissions@christuniversity.in"),
        ("VIT Vellore", "VIT", "admissions@vit.ac.in"),
        ("SRM Institute", "SRM", "admissions@srmist.edu.in"),
        ("Lovely Professional University", "LPU", "admissions@lpu.co.in"),
    ]
    
    uni_count = 0
    for name, code, email in universities_data:
        existing = db.query(University).filter(University.code == code).first()
        if not existing:
            uni = University(
                id=uuid.uuid4(),
                name=name,
                code=code,
                contact_email=email,
                contact_phone="+91" + str(random.randint(7000000000, 9999999999)),
                description=f"Premier educational institution - {name}",
                address=f"{name} Campus, India",
                status="active"
            )
            db.add(uni)
            uni_count += 1
    
    db.commit()
    print(f"  {OK} Created {uni_count} universities")
    
    # Add programs for each university
    # (name, code, duration, fee, commission_rate, reward)
    program_templates = [
        ("B.Tech Computer Science", "BTECH-CS", 4, 800000, 15, 50000),
        ("MBA", "MBA", 2, 1200000, 20, 80000),
        ("BBA", "BBA", 3, 600000, 12, 35000),
        ("B.Tech Electronics", "BTECH-EC", 4, 750000, 15, 48000),
        ("MCA", "MCA", 2, 500000, 12, 35000),
    ]
    
    prog_count = 0
    universities = db.query(University).all()
    for uni in universities:
        for name, code, duration, fee, commission, reward in program_templates:
            existing = db.query(Program).filter(
                Program.university_id == uni.id,
                Program.code == f"{uni.code}-{code}"
            ).first()
            if not existing:
                program = Program(
                    id=uuid.uuid4(),
                    university_id=uni.id,
                    name=name,
                    code=f"{uni.code}-{code}",
                    description=f"{name} at {uni.name}",
                    duration=f"{duration} years",
                    fee_structure=fee,
                    commission_rate=commission,
                    reward_amount=reward,
                    reward_tier="bronze",
                    status="active"
                )
                db.add(program)
                prog_count += 1
    
    db.commit()
    print(f"  {OK} Created {prog_count} programs")
    print("\n  [OK] Universities and Programs seeded successfully")


def seed_test_users(db):
    """Seed test users for each role"""
    print_header("SEEDING TEST USERS")
    
    # Get first university and first company for associations
    first_uni = db.query(University).first()
    first_company = db.query(Company).first()
    
    users_data = [
        # Admin - HR (user_type_id=1, role_id=1)
        {
            "email": "rajesh.hr@teamlease.com",
            "full_name": "Rajesh Kumar",
            "mobile_number": "+919876543210",
            "user_type_id": 1,
            "role_id": 1,
            "is_active": True,
            "email_verification": True,
        },
        # Admin - Business Head (user_type_id=1, role_id=2)
        {
            "email": "priya.bh@teamlease.com",
            "full_name": "Priya Sharma",
            "mobile_number": "+919876543211",
            "user_type_id": 1,
            "role_id": 2,
            "is_active": True,
            "email_verification": True,
        },
        # Admin - Student Admin (user_type_id=1, role_id=3)
        {
            "email": "amit.admin@teamlease.com",
            "full_name": "Amit Patel",
            "mobile_number": "+919876543212",
            "user_type_id": 1,
            "role_id": 3,
            "is_active": True,
            "email_verification": True,
        },
        # Referral Partner - Employee (user_type_id=2, role_id=4)
        {
            "email": "employee@test.com",
            "full_name": "Vikram Singh",
            "mobile_number": "+919876543213",
            "user_type_id": 2,
            "role_id": 4,
            "org_id": first_company.id if first_company else 1,
            "referral_code": "VIKR-2024-001",
            "is_active": True,
            "email_verification": True,
        },
        # Another Employee referrer
        {
            "email": "sneha.emp@test.com",
            "full_name": "Sneha Reddy",
            "mobile_number": "+919876543214",
            "user_type_id": 2,
            "role_id": 4,
            "org_id": first_company.id if first_company else 1,
            "referral_code": "SNEH-2024-002",
            "is_active": True,
            "email_verification": True,
        },
        # Referral Partner - Student Referrer (user_type_id=2, role_id=5)
        {
            "email": "student@test.com",
            "full_name": "Arjun Mehta",
            "mobile_number": "+919876543215",
            "user_type_id": 2,
            "role_id": 5,
            "univ_id": first_uni.id if first_uni else None,
            "referral_code": "ARJUN-2024-003",
            "is_active": True,
            "email_verification": True,
        },
        # Another Student referrer
        {
            "email": "kavya.student@test.com",
            "full_name": "Kavya Iyer",
            "mobile_number": "+919876543216",
            "user_type_id": 2,
            "role_id": 5,
            "univ_id": first_uni.id if first_uni else None,
            "referral_code": "KAVY-2024-004",
            "is_active": True,
            "email_verification": True,
        },
    ]
    
    for user_data in users_data:
        existing = db.query(User).filter(User.email == user_data["email"]).first()
        if not existing:
            user = User(
                id=uuid.uuid4(),
                email=user_data["email"],
                password=get_password_hash("Password@123"),
                full_name=user_data["full_name"],
                mobile_number=user_data["mobile_number"],
                user_type_id=user_data["user_type_id"],
                role_id=user_data["role_id"],
                org_id=user_data.get("org_id"),
                univ_id=user_data.get("univ_id"),
                referral_code=user_data.get("referral_code"),
                is_active=user_data["is_active"],
                email_verification=user_data["email_verification"],
            )
            db.add(user)
            print(f"  {OK} Created User: {user_data['full_name']} ({user_data['email']}) - Role ID: {user_data['role_id']}")
        else:
            print(f"  - User exists: {user_data['email']}")
    
    db.commit()
    print("\n  [OK] Test users seeded successfully")


def seed_job_reward_slabs(db):
    """Seed reward slabs for job referrals"""
    print_header("SEEDING JOB REWARD SLABS")
    
    slabs = [
        {
            "slab_name": "Bronze",
            "min_referrals": 0,
            "max_referrals": 5,
            "reward_per_referral": 5000,
            "bonus_amount": 0,
            "level": 1,
            "description": "Starting level. Earn ₹5,000 per successful referral.",
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
            "description": "Silver tier! Earn ₹7,500 per referral + ₹5,000 bonus.",
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
            "description": "Gold tier! Earn ₹10,000 per referral + ₹15,000 bonus.",
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
            "description": "Diamond legend! Maximum rewards: ₹20,000 per referral.",
            "icon": "diamond",
            "color": "#B9F2FF"
        }
    ]
    
    for slab_data in slabs:
        existing = db.query(JobRewardSlab).filter(JobRewardSlab.slab_name == slab_data["slab_name"]).first()
        if not existing:
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
            )
            db.add(slab)
            print(f"  {OK} Created Slab: {slab_data['slab_name']} (Level {slab_data['level']})")
    
    db.commit()
    print("\n  [OK] Reward slabs seeded successfully")


def seed_job_referrals(db):
    """Seed sample job referrals for Employee users"""
    print_header("SEEDING JOB REFERRALS")
    
    # Get employee users (role_id = 4)
    employees = db.query(User).filter(User.role_id == 4).all()
    
    if not employees:
        print("  ! No employee users found. Skipping job referrals.")
        return
    
    # Get all jobs
    jobs = db.query(Job).all()
    
    if not jobs:
        print("  ! No jobs found. Skipping job referrals.")
        return
    
    referee_names = [
        "Rahul Sharma", "Priyanka Singh", "Aditya Kumar", "Divya Patel",
        "Karan Mehta", "Ananya Reddy", "Rohan Gupta", "Ishita Verma",
        "Aarav Das", "Saanvi Iyer", "Vihaan Joshi", "Diya Kapoor",
    ]
    
    statuses = ["submitted", "screening", "interviewed", "offered", "joined", "rejected"]
    status_weights = [30, 25, 20, 10, 10, 5]
    
    ref_count = 0
    for employee in employees:
        # Each employee has 5-10 referrals
        num_referrals = random.randint(5, 10)
        
        for i in range(num_referrals):
            referee_name = random.choice(referee_names)
            job = random.choice(jobs)
            status = random.choices(statuses, weights=status_weights)[0]
            
            submission_date = datetime.utcnow() - timedelta(days=random.randint(1, 60))
            
            referral = JobReferral(
                id=uuid.uuid4(),
                referral_code=f"JR-{employee.full_name.split()[0][:3].upper()}-{ref_count:04d}",
                referrer_id=employee.id,
                referrer_name=employee.full_name,
                referrer_email=employee.email,
                referrer_phone=employee.mobile_number,
                referee_name=referee_name,
                referee_email=f"{referee_name.lower().replace(' ', '.')}@email.com",
                referee_phone=f"+91{random.randint(7000000000, 9999999999)}",
                referee_experience=random.randint(1, 10),
                referee_current_company=random.choice(["Infosys", "TCS", "Wipro", "Tech Mahindra", "HCL"]),
                job_id=job.id,
                company_id=job.company_id,
                industry_id=job.industry_id,
                status=status,
                submission_date=submission_date,
                expected_reward=random.choice([5000, 7500, 10000, 15000]),
                reward_status="pending" if status != "joined" else random.choice(["pending", "approved"]),
                source="employee_portal"
            )
            db.add(referral)
            ref_count += 1
    
    db.commit()
    print(f"  {OK} Created {ref_count} job referrals")
    print("\n  [OK] Job referrals seeded successfully")


def seed_student_referrals(db):
    """Seed sample referrals for Student users"""
    print_header("SEEDING STUDENT REFERRALS")
    
    # Get student referrer users (role_id = 5)
    students = db.query(User).filter(User.role_id == 5).all()
    
    if not students:
        print("  ! No student referrer users found. Skipping student referrals.")
        return
    
    # Get programs
    programs = db.query(Program).all()
    
    if not programs:
        print("  ! No programs found. Skipping student referrals.")
        return
    
    referee_names = [
        "Rahul Sharma", "Priyanka Singh", "Aditya Kumar", "Divya Patel",
        "Karan Mehta", "Ananya Reddy", "Rohan Gupta", "Ishita Verma",
    ]
    
    statuses = ["submitted", "assigned", "contacted", "admitted", "rejected"]
    
    ref_count = 0
    for student in students:
        num_referrals = random.randint(5, 12)
        
        for i in range(num_referrals):
            referee_name = random.choice(referee_names)
            program = random.choice(programs)
            status = random.choice(statuses)
            
            submission_date = datetime.utcnow() - timedelta(days=random.randint(1, 90))
            
            referral = Referral(
                id=uuid.uuid4(),
                referral_code=f"SR-{student.full_name.split()[0][:3].upper()}-{ref_count:04d}",
                referrer_id=student.id,
                referrer_name=student.full_name,
                referrer_email=student.email,
                referrer_phone=student.mobile_number,
                referee_name=referee_name,
                referee_email=f"{referee_name.lower().replace(' ', '.')}@student.com",
                referee_phone=f"+91{random.randint(7000000000, 9999999999)}",
                university_id=program.university_id,
                program_id=program.id,
                status=status,
                submission_date=submission_date,
                expected_reward=program.reward_amount,
                source="referrer_portal"
            )
            db.add(referral)
            ref_count += 1
    
    db.commit()
    print(f"  {OK} Created {ref_count} student referrals")
    print("\n  [OK] Student referrals seeded successfully")


def main():
    """Main seeding function"""
    print("\n" + "=" * 70)
    print("  COMPREHENSIVE DATABASE SEEDING")
    print("  Populating all required data for Referral Management System")
    print("=" * 70)
    
    db = SessionLocal()
    
    try:
        # Seed in order
        seed_user_types_and_roles(db)
        seed_industries_and_companies(db)
        seed_jobs(db)
        seed_universities_and_programs(db)
        seed_test_users(db)
        seed_job_reward_slabs(db)
        seed_job_referrals(db)
        seed_student_referrals(db)
        
        print_header("SEEDING COMPLETE!")
        
        print("\n  Login Credentials:")
        print("  " + "-" * 50)
        print("  HR Admin:        rajesh.hr@teamlease.com / Password@123")
        print("  Business Head:   priya.bh@teamlease.com / Password@123")
        print("  Student Admin:   amit.admin@teamlease.com / Password@123")
        print("  Employee:        employee@test.com / Password@123")
        print("  Student:         student@test.com / Password@123")
        print("  " + "-" * 50)
        print("\n  Role-based Navigation:")
        print("  - HR/Business Head (role 1,2): /dashboard")
        print("  - Student Admin (role 3): /student-admin")
        print("  - Employee (role 4): /employee")
        print("  - Student Referrer (role 5): /referrer/referrals")
        print("\n" + "=" * 70 + "\n")
        
    except Exception as e:
        print(f"\n  [ERROR] Error during seeding: {e}")
        db.rollback()
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    main()

