"""
Import Jobs from Optara Database
This script connects to optara_staging and imports industries, companies, and jobs
into the referral management database, organized hierarchically.
"""
import sys
sys.path.insert(0, '.')

import psycopg2
from psycopg2.extras import RealDictCursor
from app.database import SessionLocal
from app.models.industry import Industry
from app.models.company import Company
from app.models.job import Job
from datetime import datetime
from sqlalchemy import text

def import_jobs():
    print('=' * 70)
    print('IMPORTING JOBS FROM OPTARA DATABASE')
    print('=' * 70)
    print()
    
    # Connect to optara database
    print('Step 1: Connecting to optara_staging...')
    try:
        optara_conn = psycopg2.connect(
            host='172.31.26.122',
            database='optara_staging',
            user='user_dev',
            password='DX9@ZXQk=zSY_@7',
            cursor_factory=RealDictCursor
        )
        optara_cursor = optara_conn.cursor()
        print('   ✓ Connected to optara database')
    except Exception as e:
        print(f'   ✗ Failed to connect to optara: {e}')
        print()
        print('   Make sure you can access 172.31.26.122:5432 from this machine')
        print('   You may need to be on VPN or have firewall access')
        return
    
    # Connect to referral management database
    print('Step 2: Connecting to referral management database...')
    db = SessionLocal()
    print('   ✓ Connected to referral management database')
    print()
    
    # Import industries
    print('Step 3: Importing industries...')
    optara_cursor.execute('SELECT * FROM optara_staging.industry ORDER BY industry_id')
    industries_data = optara_cursor.fetchall()
    
    industry_map = {}  # optara_id -> our_id
    
    for ind_data in industries_data:
        # Check if industry already exists
        existing = db.query(Industry).filter(Industry.id == ind_data['industry_id']).first()
        
        if not existing:
            industry = Industry(
                id=ind_data['industry_id'],
                name=ind_data['industry_name'],
                display_order=ind_data['display_order'] or 0,
                is_hidden=bool(ind_data['is_hidden'])
            )
            db.add(industry)
        else:
            # Update existing
            existing.name = ind_data['industry_name']
            existing.display_order = ind_data['display_order'] or 0
            existing.is_hidden = bool(ind_data['is_hidden'])
        
        industry_map[ind_data['industry_id']] = ind_data['industry_id']
    
    db.commit()
    print(f'   ✓ Imported {len(industries_data)} industries')
    print()
    
    # Fetch jobs
    print('Step 4: Fetching active jobs from optara...')
    optara_cursor.execute('''
        SELECT * FROM optara_staging.job 
        WHERE valid_till > date(now()) 
        ORDER BY company, job_title
    ''')
    jobs_data = optara_cursor.fetchall()
    print(f'   ✓ Found {len(jobs_data)} active jobs')
    print()
    
    # Extract unique companies and their industries
    print('Step 5: Extracting companies from jobs...')
    companies_dict = {}
    
    for job in jobs_data:
        company_name = job.get('company', '').strip()
        if not company_name:
            company_name = 'Unknown Company'
        
        industry_id = job.get('industry_id') or 1  # Default to first industry
        
        if company_name not in companies_dict:
            companies_dict[company_name] = {
                'industry_id': industry_id,
                'website_url': job.get('website_url'),
                'jobs_count': 0
            }
        companies_dict[company_name]['jobs_count'] += 1
    
    print(f'   ✓ Found {len(companies_dict)} unique companies')
    print()
    
    # Import companies
    print('Step 6: Creating companies in database...')
    company_map = {}  # company_name -> company_id
    
    for company_name, company_info in companies_dict.items():
        # Check if company exists
        existing = db.query(Company).filter(Company.name == company_name).first()
        
        if existing:
            company_map[company_name] = existing.id
        else:
            company = Company(
                name=company_name,
                industry_id=company_info['industry_id'],
                website_url=company_info['website_url'],
                is_active=True
            )
            db.add(company)
            db.flush()
            company_map[company_name] = company.id
    
    db.commit()
    print(f'   ✓ Created/updated {len(company_map)} companies')
    print()
    
    # Import jobs
    print('Step 7: Importing jobs...')
    imported_count = 0
    skipped_count = 0
    
    for job_data in jobs_data:
        company_name = job_data.get('company', '').strip() or 'Unknown Company'
        company_id = company_map.get(company_name)
        
        if not company_id:
            skipped_count += 1
            continue
        
        # Check if job already exists (by external_job_id)
        external_id = job_data.get('job_id')
        if external_id:
            existing = db.query(Job).filter(Job.external_job_id == external_id).first()
            if existing:
                # Update existing job
                existing.job_title = job_data.get('job_title') or 'Untitled Job'
                existing.valid_till = job_data.get('valid_till')
                existing.ctc_from = job_data.get('ctc_from')
                existing.ctc_to = job_data.get('ctc_to')
                existing.vacancies = job_data.get('vacancies') or 1
                existing.description = job_data.get('description')
                existing.location = job_data.get('pincode')
                existing.modified_on = datetime.now()
                skipped_count += 1
                continue
        
        # Create new job
        job = Job(
            external_job_id=job_data.get('job_id'),
            job_code=job_data.get('job_code'),
            job_title=job_data.get('job_title') or 'Untitled Job',
            company_id=company_id,
            industry_id=job_data.get('industry_id') or 1,
            exp_from=job_data.get('exp_from') or 0,
            exp_to=job_data.get('exp_to') or 0,
            ctc_from=job_data.get('ctc_from'),
            ctc_to=job_data.get('ctc_to'),
            hide_salary=bool(job_data.get('hide_salary')),
            description=job_data.get('description'),
            vacancies=job_data.get('vacancies') or 1,
            gender=job_data.get('gender'),
            location=job_data.get('pincode'),
            pincode=job_data.get('pincode'),
            valid_till=job_data.get('valid_till'),
            job_url=job_data.get('job_url'),
            website_url=job_data.get('website_url'),
            seo_title=job_data.get('seo_title'),
            seo_description=job_data.get('seo_description'),
            recruiter_name=job_data.get('recruiter_name'),
            recruiter_email=job_data.get('recruiter_email'),
            recruiter_mobile=job_data.get('recruiter_mobile'),
            spoc=job_data.get('spoc'),
            status=bool(job_data.get('status', 1)),
            is_active=True,
            source=job_data.get('source') or 'optara',
            fetched_on=job_data.get('fetched_on'),
            modified_on=job_data.get('modified_on')
        )
        db.add(job)
        imported_count += 1
        
        # Commit in batches
        if imported_count % 100 == 0:
            db.commit()
            print(f'   ... {imported_count} jobs imported')
    
    db.commit()
    print(f'   ✓ Imported {imported_count} new jobs')
    print(f'   ✓ Skipped {skipped_count} existing/invalid jobs')
    print()
    
    # Show summary
    print('Step 8: Generating summary...')
    print()
    print('=' * 70)
    print('IMPORT SUMMARY')
    print('=' * 70)
    
    # Count by industry
    result = db.execute(text('''
        SELECT i.name, COUNT(DISTINCT c.id) as companies, COUNT(j.id) as jobs
        FROM industries i
        LEFT JOIN companies c ON c.industry_id = i.id
        LEFT JOIN jobs j ON j.industry_id = i.id
        WHERE i.is_hidden = false
        GROUP BY i.id, i.name
        ORDER BY jobs DESC
        LIMIT 10
    '''))
    
    print('Top 10 Industries by Job Count:')
    print('-' * 70)
    for row in result:
        print(f'{row[0]:40s} | {row[1]:3d} companies | {row[2]:5d} jobs')
    
    print()
    print('=' * 70)
    print(f'Total Imported: {imported_count} jobs from {len(company_map)} companies')
    print('=' * 70)
    
    db.close()
    optara_cursor.close()
    optara_conn.close()

if __name__ == '__main__':
    try:
        import_jobs()
    except Exception as e:
        print(f'ERROR: {e}')
        import traceback
        traceback.print_exc()

