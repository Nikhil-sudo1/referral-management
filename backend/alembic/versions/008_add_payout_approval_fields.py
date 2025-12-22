"""Add payout approval fields to rewards

Revision ID: 008_add_payout_approval_fields
Revises: 007_add_job_referral_tables
Create Date: 2025-12-22 19:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '008_add_payout_approval_fields'
down_revision = '007_job_referral_tables'
branch_labels = None
depends_on = None


def upgrade():
    # Add new approval fields for student-admin and account team
    op.add_column('rewards', sa.Column('student_admin_approved_by', postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column('rewards', sa.Column('student_admin_approved_at', sa.DateTime(), nullable=True))
    op.add_column('rewards', sa.Column('student_admin_approval_notes', sa.Text(), nullable=True))
    
    op.add_column('rewards', sa.Column('account_team_approved_by', postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column('rewards', sa.Column('account_team_approved_at', sa.DateTime(), nullable=True))
    op.add_column('rewards', sa.Column('account_team_approval_notes', sa.Text(), nullable=True))
    
    # Add foreign key constraints
    op.create_foreign_key(
        'fk_rewards_student_admin_approved_by',
        'rewards', 'users',
        ['student_admin_approved_by'], ['id'],
        ondelete='SET NULL'
    )
    op.create_foreign_key(
        'fk_rewards_account_team_approved_by',
        'rewards', 'users',
        ['account_team_approved_by'], ['id'],
        ondelete='SET NULL'
    )
    
    # Update status check constraint to include new statuses
    op.execute("""
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
    """)


def downgrade():
    # Remove foreign key constraints
    op.drop_constraint('fk_rewards_account_team_approved_by', 'rewards', type_='foreignkey')
    op.drop_constraint('fk_rewards_student_admin_approved_by', 'rewards', type_='foreignkey')
    
    # Remove columns
    op.drop_column('rewards', 'account_team_approval_notes')
    op.drop_column('rewards', 'account_team_approved_at')
    op.drop_column('rewards', 'account_team_approved_by')
    op.drop_column('rewards', 'student_admin_approval_notes')
    op.drop_column('rewards', 'student_admin_approved_at')
    op.drop_column('rewards', 'student_admin_approved_by')
    
    # Restore original status check
    op.execute("""
        ALTER TABLE rewards DROP CONSTRAINT IF EXISTS rewards_status_check;
        ALTER TABLE rewards ADD CONSTRAINT rewards_status_check 
        CHECK (status IN ('pending', 'approved', 'disbursed', 'cancelled'));
    """)

