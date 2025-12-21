"""add job referral tables

Revision ID: 007
Revises: 006
Create Date: 2024-12-22

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '007'
down_revision: Union[str, None] = '006'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create job_referrals table
    op.create_table(
        'job_referrals',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('referral_code', sa.String(50), nullable=False),
        sa.Column('referrer_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('referrer_name', sa.String(255), nullable=False),
        sa.Column('referrer_email', sa.String(255), nullable=False),
        sa.Column('referrer_phone', sa.String(20), nullable=False),
        sa.Column('referee_name', sa.String(255), nullable=False),
        sa.Column('referee_email', sa.String(255), nullable=False),
        sa.Column('referee_phone', sa.String(20), nullable=False),
        sa.Column('referee_resume_url', sa.String(500), nullable=True),
        sa.Column('referee_linkedin', sa.String(500), nullable=True),
        sa.Column('referee_experience', sa.Numeric(5, 2), nullable=True),
        sa.Column('referee_current_company', sa.String(255), nullable=True),
        sa.Column('referee_current_designation', sa.String(255), nullable=True),
        sa.Column('job_id', sa.Integer(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('industry_id', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(50), nullable=True, server_default='submitted'),
        sa.Column('status_notes', sa.Text(), nullable=True),
        sa.Column('submission_date', sa.DateTime(), nullable=True),
        sa.Column('screening_date', sa.DateTime(), nullable=True),
        sa.Column('interview_date', sa.DateTime(), nullable=True),
        sa.Column('offer_date', sa.DateTime(), nullable=True),
        sa.Column('joining_date', sa.DateTime(), nullable=True),
        sa.Column('rejection_date', sa.DateTime(), nullable=True),
        sa.Column('slab_tier', sa.Integer(), nullable=True, server_default='1'),
        sa.Column('expected_reward', sa.Numeric(12, 2), nullable=True),
        sa.Column('actual_reward', sa.Numeric(12, 2), nullable=True),
        sa.Column('reward_status', sa.String(50), nullable=True, server_default='pending'),
        sa.Column('source', sa.String(100), nullable=True, server_default='employee_portal'),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('hr_assigned_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('hr_notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['referrer_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['job_id'], ['jobs.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['industry_id'], ['industries.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['hr_assigned_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_job_referrals_referral_code', 'job_referrals', ['referral_code'], unique=True)
    op.create_index('ix_job_referrals_referrer_id', 'job_referrals', ['referrer_id'])
    op.create_index('ix_job_referrals_referee_email', 'job_referrals', ['referee_email'])
    op.create_index('ix_job_referrals_job_id', 'job_referrals', ['job_id'])
    op.create_index('ix_job_referrals_company_id', 'job_referrals', ['company_id'])
    op.create_index('ix_job_referrals_status', 'job_referrals', ['status'])
    op.create_index('ix_job_referrals_submission_date', 'job_referrals', ['submission_date'])

    # Create job_referral_rewards table
    op.create_table(
        'job_referral_rewards',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('job_referral_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('reward_type', sa.String(50), nullable=False),
        sa.Column('amount', sa.Numeric(12, 2), nullable=False),
        sa.Column('status', sa.String(50), nullable=True, server_default='pending'),
        sa.Column('approved_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('approved_at', sa.DateTime(), nullable=True),
        sa.Column('approval_notes', sa.Text(), nullable=True),
        sa.Column('disbursed_at', sa.DateTime(), nullable=True),
        sa.Column('disbursement_method', sa.String(50), nullable=True),
        sa.Column('transaction_reference', sa.String(255), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['job_referral_id'], ['job_referrals.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.ForeignKeyConstraint(['approved_by'], ['users.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_job_referral_rewards_job_referral_id', 'job_referral_rewards', ['job_referral_id'])
    op.create_index('ix_job_referral_rewards_user_id', 'job_referral_rewards', ['user_id'])
    op.create_index('ix_job_referral_rewards_status', 'job_referral_rewards', ['status'])

    # Create job_reward_slabs table
    op.create_table(
        'job_reward_slabs',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('slab_name', sa.String(50), nullable=False),
        sa.Column('min_referrals', sa.Integer(), nullable=False),
        sa.Column('max_referrals', sa.Integer(), nullable=True),
        sa.Column('reward_per_referral', sa.Numeric(12, 2), nullable=True, server_default='0'),
        sa.Column('bonus_amount', sa.Numeric(12, 2), nullable=True, server_default='0'),
        sa.Column('level', sa.Integer(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('icon', sa.String(50), nullable=True),
        sa.Column('color', sa.String(50), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True, server_default='true'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('job_reward_slabs')
    op.drop_table('job_referral_rewards')
    op.drop_table('job_referrals')

