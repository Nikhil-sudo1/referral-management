"""Add CRM integration fields to referrals

Revision ID: add_crm_fields_001
Revises: 
Create Date: 2025-12-18

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_crm_fields_001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    """Add CRM integration fields to referrals table"""
    # Add crm_lead_id column
    op.add_column('referrals', sa.Column('crm_lead_id', sa.Integer(), nullable=True))
    op.create_index('ix_referrals_crm_lead_id', 'referrals', ['crm_lead_id'], unique=False)
    
    # Add crm_synced_at column
    op.add_column('referrals', sa.Column('crm_synced_at', sa.DateTime(), nullable=True))
    
    # Add crm_sync_error column
    op.add_column('referrals', sa.Column('crm_sync_error', sa.Text(), nullable=True))


def downgrade():
    """Remove CRM integration fields from referrals table"""
    op.drop_index('ix_referrals_crm_lead_id', table_name='referrals')
    op.drop_column('referrals', 'crm_sync_error')
    op.drop_column('referrals', 'crm_synced_at')
    op.drop_column('referrals', 'crm_lead_id')

