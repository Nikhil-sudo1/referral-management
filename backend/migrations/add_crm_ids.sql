-- Migration: Add CRM ID fields to universities and programs tables
-- Date: 2024-12-23
-- Description: Add crm_university_id and crm_course_id fields to enable CRM integration

-- Add CRM university ID to universities table
ALTER TABLE universities ADD COLUMN IF NOT EXISTS crm_university_id VARCHAR(100);
CREATE INDEX IF NOT EXISTS idx_universities_crm_id ON universities(crm_university_id);
ALTER TABLE universities ADD CONSTRAINT IF NOT EXISTS uq_universities_crm_id UNIQUE (crm_university_id);

-- Add CRM course ID to programs table
ALTER TABLE programs ADD COLUMN IF NOT EXISTS crm_course_id VARCHAR(100);
CREATE INDEX IF NOT EXISTS idx_programs_crm_id ON programs(crm_course_id);

-- Add comments for documentation
COMMENT ON COLUMN universities.crm_university_id IS 'Digivarsity CRM University ID for integration';
COMMENT ON COLUMN programs.crm_course_id IS 'Digivarsity CRM Course ID for integration';

