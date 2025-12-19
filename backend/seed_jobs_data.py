"""
Seed Jobs Data - Comprehensive Dataset
5 Industries -> 3 Companies each -> 10 Jobs per company = 150 jobs total
"""
import sys
sys.path.insert(0, '.')

from app.database import SessionLocal
from app.models.industry import Industry
from app.models.company import Company
from app.models.job import Job
from datetime import date, timedelta
from sqlalchemy import text

def seed_jobs_data():
    print('=' * 70)
    print('SEEDING COMPREHENSIVE JOBS DATA')
    print('=' * 70)
    print()
    
    db = SessionLocal()
    
    # Step 1: Create 5 Industries
    print('Step 1: Creating 5 Industries...')
    industries = [
        {'id': 1, 'name': 'Information Technology', 'display_order': 1},
        {'id': 2, 'name': 'Healthcare & Life Sciences', 'display_order': 2},
        {'id': 3, 'name': 'Manufacturing & Engineering', 'display_order': 3},
        {'id': 4, 'name': 'Banking & Financial Services', 'display_order': 4},
        {'id': 5, 'name': 'Education & Training', 'display_order': 5},
    ]
    
    for ind_data in industries:
        existing = db.query(Industry).filter(Industry.id == ind_data['id']).first()
        if not existing:
            industry = Industry(**ind_data, is_hidden=False)
            db.add(industry)
    
    db.commit()
    print(f'   [OK] Created {len(industries)} industries')
    print()
    
    # Step 2: Create 3 Companies per Industry = 15 companies
    print('Step 2: Creating 3 Companies per Industry (15 total)...')
    companies = [
        # IT Industry (id=1)
        {'name': 'TechCorp Solutions', 'industry_id': 1, 'description': 'Leading IT consulting firm'},
        {'name': 'Digital Innovations', 'industry_id': 1, 'description': 'Software development company'},
        {'name': 'Cloud Systems Inc', 'industry_id': 1, 'description': 'Cloud infrastructure solutions'},
        
        # Healthcare Industry (id=2)
        {'name': 'MediCare Hospitals', 'industry_id': 2, 'description': 'Multi-specialty hospital chain'},
        {'name': 'PharmaTech Labs', 'industry_id': 2, 'description': 'Pharmaceutical research and manufacturing'},
        {'name': 'HealthFirst Clinics', 'industry_id': 2, 'description': 'Primary healthcare services'},
        
        # Manufacturing Industry (id=3)
        {'name': 'AutoParts Manufacturing', 'industry_id': 3, 'description': 'Automotive components manufacturer'},
        {'name': 'Steel Dynamics Ltd', 'industry_id': 3, 'description': 'Steel and metal products'},
        {'name': 'Precision Engineering Co', 'industry_id': 3, 'description': 'Precision engineering solutions'},
        
        # Banking Industry (id=4)
        {'name': 'National Bank', 'industry_id': 4, 'description': 'Full-service banking'},
        {'name': 'FinTech Solutions', 'industry_id': 4, 'description': 'Digital banking and payments'},
        {'name': 'Investment Partners', 'industry_id': 4, 'description': 'Wealth management and investments'},
        
        # Education Industry (id=5)
        {'name': 'TeamLease EdTech', 'industry_id': 5, 'description': 'Education and skill development'},
        {'name': 'Global Learning Institute', 'industry_id': 5, 'description': 'Professional training and certification'},
        {'name': 'Academic Excellence', 'industry_id': 5, 'description': 'Educational consultancy'},
    ]
    
    company_ids = []
    for comp_data in companies:
        existing = db.query(Company).filter(Company.name == comp_data['name']).first()
        if existing:
            company_ids.append(existing.id)
        else:
            company = Company(**comp_data, is_active=True)
            db.add(company)
            db.flush()
            company_ids.append(company.id)
    
    db.commit()
    print(f'   [OK] Created {len(companies)} companies')
    print()
    
    # Step 3: Create 10 Jobs per Company = 150 jobs
    print('Step 3: Creating 10 Jobs per Company (150 total)...')
    
    # Job titles by industry type
    job_titles = {
        1: [  # IT
            'Software Developer', 'Senior Backend Engineer', 'Frontend Developer', 
            'Full Stack Developer', 'DevOps Engineer', 'Data Scientist',
            'QA Engineer', 'UI/UX Designer', 'Product Manager', 'Technical Lead'
        ],
        2: [  # Healthcare
            'Medical Officer', 'Staff Nurse', 'Pharmacist', 'Lab Technician',
            'Radiologist', 'Physiotherapist', 'Healthcare Administrator',
            'Medical Billing Specialist', 'Patient Care Coordinator', 'Clinical Research Associate'
        ],
        3: [  # Manufacturing
            'Production Engineer', 'Quality Control Manager', 'Maintenance Technician',
            'CNC Operator', 'Production Supervisor', 'Quality Assurance Engineer',
            'Safety Officer', 'Plant Manager', 'Industrial Designer', 'Supply Chain Coordinator'
        ],
        4: [  # Banking
            'Relationship Manager', 'Credit Analyst', 'Branch Manager',
            'Financial Advisor', 'Loan Officer', 'Risk Analyst',
            'Compliance Officer', 'Treasury Manager', 'Investment Analyst', 'Operations Manager'
        ],
        5: [  # Education
            'Academic Coordinator', 'Training Specialist', 'Content Developer',
            'Student Counselor', 'Placement Officer', 'Curriculum Designer',
            'E-Learning Specialist', 'Educational Consultant', 'Admission Counselor', 'Faculty Member'
        ],
    }
    
    job_count = 0
    for company_idx, company_data in enumerate(companies):
        company_name = company_data['name']
        industry_id = company_data['industry_id']
        company_id = company_ids[company_idx]
        
        titles = job_titles[industry_id]
        
        for job_idx, job_title in enumerate(titles):
            # Create job with varying parameters
            exp_from = (job_idx % 5) * 2  # 0, 2, 4, 6, 8 years
            exp_to = exp_from + 3
            
            # Salary ranges based on experience
            base_salary = 300000 + (exp_from * 100000)
            ctc_from = base_salary
            ctc_to = base_salary + 200000
            
            vacancies = (job_idx % 5) + 1  # 1 to 5 vacancies
            
            # Locations
            locations = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata']
            location = locations[job_idx % len(locations)]
            
            # Valid till dates - 6 to 12 months from now
            months_valid = 6 + (job_idx % 7)
            valid_till = date.today() + timedelta(days=months_valid * 30)
            
            job = Job(
                external_job_id=1000 + job_count,
                job_title=job_title,
                company_id=company_id,
                industry_id=industry_id,
                exp_from=exp_from,
                exp_to=exp_to,
                ctc_from=ctc_from,
                ctc_to=ctc_to,
                hide_salary=False,
                description=f'{job_title} position at {company_name}. Requires {exp_from}-{exp_to} years experience. Based in {location}.',
                vacancies=vacancies,
                gender=None,
                location=location,
                valid_till=valid_till,
                status=True,
                is_active=True,
                source='manual_seed'
            )
            db.add(job)
            job_count += 1
            
            if job_count % 50 == 0:
                db.commit()
                print(f'   ... {job_count} jobs created')
    
    db.commit()
    print(f'   [OK] Created {job_count} jobs')
    print()
    
    # Display complete hierarchy
    print('=' * 70)
    print('COMPLETE HIERARCHICAL STRUCTURE')
    print('=' * 70)
    print()
    
    result = db.execute(text('''
        SELECT 
            i.id,
            i.name as industry,
            c.name as company,
            COUNT(j.id) as jobs,
            SUM(j.vacancies) as vacancies,
            MIN(j.ctc_from) as min_salary,
            MAX(j.ctc_to) as max_salary
        FROM industries i
        INNER JOIN companies c ON c.industry_id = i.id
        INNER JOIN jobs j ON j.company_id = c.id
        GROUP BY i.id, i.name, c.id, c.name
        ORDER BY i.id, c.name
    '''))
    
    current_industry_id = None
    industry_totals = {}
    
    for row in result:
        industry_id = row[0]
        industry_name = row[1]
        company_name = row[2]
        jobs = row[3]
        vacancies = int(row[4])
        min_sal = int(row[5]) // 100000
        max_sal = int(row[6]) // 100000
        
        if industry_id != current_industry_id:
            if current_industry_id:
                print()
            current_industry_id = industry_id
            print(f'[{industry_name}]')
            industry_totals[industry_id] = {'companies': 0, 'jobs': 0, 'vacancies': 0}
        
        print(f'  -> {company_name:35s} | {jobs:2d} jobs | {vacancies:3d} openings | Rs.{min_sal}-{max_sal}L')
        
        industry_totals[industry_id]['companies'] += 1
        industry_totals[industry_id]['jobs'] += jobs
        industry_totals[industry_id]['vacancies'] += vacancies
    
    print()
    print('=' * 70)
    print('SUMMARY BY INDUSTRY')
    print('=' * 70)
    
    for ind_data in industries:
        ind_id = ind_data['id']
        ind_name = ind_data['name']
        if ind_id in industry_totals:
            totals = industry_totals[ind_id]
            print(f'{ind_name:40s} | {totals["companies"]} companies | {totals["jobs"]:3d} jobs | {totals["vacancies"]:4d} openings')
    
    # Grand totals
    total_jobs = db.query(Job).count()
    total_companies = db.query(Company).count()
    total_vacancies = db.execute(text('SELECT SUM(vacancies) FROM jobs')).scalar() or 0
    
    print()
    print('=' * 70)
    print('GRAND TOTAL')
    print('=' * 70)
    print(f'Industries: {len(industries)}')
    print(f'Companies: {total_companies}')
    print(f'Jobs: {total_jobs}')
    print(f'Total Vacancies: {int(total_vacancies)}')
    print()
    print('[OK] Data seeding completed successfully!')
    print('=' * 70)
    
    db.close()

def create_role_hierarchy():
    """Create user_type_master and role_master tables with data"""
    import sys
    sys.path.insert(0, '.')
    from app.database import engine
    from sqlalchemy import text
    
    print('Creating User Type and Role Master tables...')
    print('=' * 70)
    print()
    
    with engine.connect() as conn:
        # Create user_type_master table
        print('1. Creating user_type_master table...')
        conn.execute(text('''
            CREATE TABLE IF NOT EXISTS user_type_master (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                code VARCHAR(50) NOT NULL UNIQUE,
                description VARCHAR(255),
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        '''))
        conn.commit()
        print('   [OK]')
        
        # Create role_master table
        print('2. Creating role_master table...')
        conn.execute(text('''
            CREATE TABLE IF NOT EXISTS role_master (
                id SERIAL PRIMARY KEY,
                user_type_id INTEGER NOT NULL,
                name VARCHAR(100) NOT NULL,
                code VARCHAR(50) NOT NULL UNIQUE,
                description VARCHAR(255),
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW(),
                FOREIGN KEY (user_type_id) REFERENCES user_type_master(id) ON DELETE CASCADE
            )
        '''))
        conn.commit()
        print('   [OK]')
        
        # Add role_id to users table
        print('3. Adding role_id to users table...')
        try:
            conn.execute(text('ALTER TABLE users ADD COLUMN IF NOT EXISTS role_id INTEGER'))
            conn.execute(text('''
                ALTER TABLE users ADD CONSTRAINT fk_users_role_id 
                FOREIGN KEY (role_id) REFERENCES role_master(id) ON DELETE SET NULL
            '''))
            conn.commit()
            print('   [OK]')
        except Exception as e:
            print(f'   [INFO] Already exists')
            conn.rollback()
        
        # Insert user types
        print('4. Inserting user types...')
        conn.execute(text('''
            INSERT INTO user_type_master (id, name, code, description)
            VALUES 
                (1, 'Admin', 'admin', 'Administrative users with full access'),
                (2, 'Referral Partner', 'referral_partner', 'External partners who refer students')
            ON CONFLICT (code) DO NOTHING
        '''))
        conn.commit()
        print('   [OK] - Admin, Referral Partner')
        
        # Insert roles
        print('5. Inserting roles...')
        conn.execute(text('''
            INSERT INTO role_master (id, user_type_id, name, code, description)
            VALUES 
                -- Admin Roles (user_type_id = 1)
                (1, 1, 'Human Resources', 'human_resources', 'HR and recruitment management'),
                (2, 1, 'Business Head', 'business_head', 'Business operations and strategy'),
                (3, 1, 'Student Admin', 'student_admin', 'Student services and administration'),
                
                -- Referral Partner Roles (user_type_id = 2)
                (4, 2, 'Employee', 'employee', 'Company employee referrer'),
                (5, 2, 'Student Referrer', 'student_referrer', 'Student who refers peers')
            ON CONFLICT (code) DO NOTHING
        '''))
        conn.commit()
        print('   [OK] - 5 roles created')
        print()
        
        # Display hierarchy
        print('=' * 70)
        print('USER TYPE & ROLE HIERARCHY')
        print('=' * 70)
        print()
        
        result = conn.execute(text('''
            SELECT 
                ut.name as user_type,
                r.id as role_id,
                r.name as role_name,
                r.code as role_code
            FROM user_type_master ut
            LEFT JOIN role_master r ON r.user_type_id = ut.id
            ORDER BY ut.id, r.id
        '''))
        
        current_type = None
        for row in result:
            if row[0] != current_type:
                current_type = row[0]
                print(f'[{row[0]}]')
            print(f'  -> ID: {row[1]} | {row[2]:20s} ({row[3]})')
        
        print()
        print('=' * 70)
        print('Role hierarchy created successfully!')
        print('=' * 70)

if __name__ == '__main__':
    try:
        create_role_hierarchy()
        print()
        seed_jobs_data()
    except Exception as e:
        print(f'ERROR: {e}')
        import traceback
        traceback.print_exc()

