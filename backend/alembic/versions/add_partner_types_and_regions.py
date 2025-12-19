"""add partner types and regions

Revision ID: add_partner_types_regions
Revises: add_crm_fields_to_referrals
Create Date: 2025-12-19 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_partner_types_regions'
down_revision = 'add_crm_fields_to_referrals'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create referral_partner_master table
    op.create_table(
        'referral_partner_master',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('code', sa.String(length=50), nullable=False),
        sa.Column('description', sa.String(length=255), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name'),
        sa.UniqueConstraint('code')
    )
    
    # Create regions table
    op.create_table(
        'regions',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('code', sa.String(length=50), nullable=False),
        sa.Column('description', sa.String(length=255), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name'),
        sa.UniqueConstraint('code')
    )
    
    # Add region_id to universities table
    op.add_column('universities', sa.Column('region_id', sa.Integer(), nullable=True))
    op.create_foreign_key(
        'fk_universities_region_id', 'universities', 'regions',
        ['region_id'], ['id'], ondelete='SET NULL'
    )
    
    # Add new columns to users table
    op.add_column('users', sa.Column('admin_sub_role', sa.String(length=50), nullable=True))
    op.add_column('users', sa.Column('partner_type_id', sa.Integer(), nullable=True))
    op.add_column('users', sa.Column('region_id', sa.Integer(), nullable=True))
    
    op.create_foreign_key(
        'fk_users_partner_type_id', 'users', 'referral_partner_master',
        ['partner_type_id'], ['id'], ondelete='SET NULL'
    )
    op.create_foreign_key(
        'fk_users_region_id', 'users', 'regions',
        ['region_id'], ['id'], ondelete='SET NULL'
    )
    
    # Insert default partner types
    op.execute("""
        INSERT INTO referral_partner_master (name, code, description, is_active)
        VALUES 
            ('Employee', 'employee', 'Organization Employee Referrer', true),
            ('Student Referrer', 'student_referrer', 'Student Referrer from Universities', true)
    """)
    
    # Insert default regions
    op.execute("""
        INSERT INTO regions (name, code, description, is_active)
        VALUES 
            ('North India', 'north', 'Northern Region', true),
            ('South India', 'south', 'Southern Region', true),
            ('East India', 'east', 'Eastern Region', true),
            ('West India', 'west', 'Western Region', true),
            ('Central India', 'central', 'Central Region', true)
    """)


def downgrade() -> None:
    # Remove foreign keys and columns from users
    op.drop_constraint('fk_users_region_id', 'users', type_='foreignkey')
    op.drop_constraint('fk_users_partner_type_id', 'users', type_='foreignkey')
    op.drop_column('users', 'region_id')
    op.drop_column('users', 'partner_type_id')
    op.drop_column('users', 'admin_sub_role')
    
    # Remove foreign key and column from universities
    op.drop_constraint('fk_universities_region_id', 'universities', type_='foreignkey')
    op.drop_column('universities', 'region_id')
    
    # Drop tables
    op.drop_table('regions')
    op.drop_table('referral_partner_master')

