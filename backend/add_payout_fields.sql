-- Add payout approval fields to rewards table
-- Run this SQL directly on your database

-- Add student-admin approval fields
ALTER TABLE rewards 
ADD COLUMN IF NOT EXISTS student_admin_approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS student_admin_approved_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS student_admin_approval_notes TEXT;

-- Add account team approval fields
ALTER TABLE rewards 
ADD COLUMN IF NOT EXISTS account_team_approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS account_team_approved_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS account_team_approval_notes TEXT;

-- Update status constraint to include new statuses
ALTER TABLE rewards DROP CONSTRAINT IF EXISTS rewards_status_check;
ALTER TABLE rewards ADD CONSTRAINT rewards_status_check 
CHECK (status IN (
    'pending_student_admin',
    'approved_student_admin',
    'pending_account_team',
    'approved_account_team',
    'disbursed',
    'cancelled',
    'pending',
    'approved'
));

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_rewards_student_admin_approved_by ON rewards(student_admin_approved_by);
CREATE INDEX IF NOT EXISTS idx_rewards_account_team_approved_by ON rewards(account_team_approved_by);

