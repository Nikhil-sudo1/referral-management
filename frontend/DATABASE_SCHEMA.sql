-- ============================================
-- Referral Management System - Database Schema
-- PostgreSQL 14+
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- Table: users
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL CHECK (role IN ('super_admin', 'manager', 'counselor', 'referrer')),
    avatar_url TEXT,
    organization VARCHAR(255),
    university_id UUID,
    referral_code VARCHAR(50) UNIQUE,
    tier VARCHAR(50) DEFAULT 'Bronze' CHECK (tier IN ('Bronze', 'Silver', 'Gold', 'Platinum')),
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_users_university ON users(university_id);

-- ============================================
-- Table: universities
-- ============================================
CREATE TABLE universities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    logo_url TEXT,
    website VARCHAR(255),
    description TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    address TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_universities_code ON universities(code);
CREATE INDEX idx_universities_status ON universities(status);

-- Add foreign key constraint to users table
ALTER TABLE users ADD CONSTRAINT fk_users_university 
    FOREIGN KEY (university_id) REFERENCES universities(id) ON DELETE SET NULL;

-- ============================================
-- Table: programs
-- ============================================
CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    duration VARCHAR(50),
    fee_structure DECIMAL(12, 2) NOT NULL,
    commission_rate DECIMAL(5, 2) NOT NULL,
    reward_amount DECIMAL(12, 2) NOT NULL,
    reward_tier VARCHAR(50) DEFAULT 'bronze' CHECK (reward_tier IN ('bronze', 'silver', 'gold', 'platinum')),
    eligibility_criteria TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(university_id, code)
);

CREATE INDEX idx_programs_university ON programs(university_id);
CREATE INDEX idx_programs_status ON programs(status);

-- ============================================
-- Table: referrals
-- ============================================
CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_code VARCHAR(50) UNIQUE NOT NULL,
    
    -- Referrer (person who made the referral)
    referrer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    referrer_name VARCHAR(255) NOT NULL,
    referrer_email VARCHAR(255) NOT NULL,
    referrer_phone VARCHAR(20) NOT NULL,
    
    -- Referee (student being referred)
    referee_name VARCHAR(255) NOT NULL,
    referee_email VARCHAR(255) NOT NULL,
    referee_phone VARCHAR(20) NOT NULL,
    
    -- Program details
    university_id UUID NOT NULL REFERENCES universities(id),
    program_id UUID NOT NULL REFERENCES programs(id),
    
    -- Assignment
    counselor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP,
    
    -- Status tracking
    status VARCHAR(50) DEFAULT 'submitted' CHECK (status IN ('submitted', 'assigned', 'contacted', 'admitted', 'rejected')),
    status_notes TEXT,
    
    -- Dates
    submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    contacted_date TIMESTAMP,
    admission_date TIMESTAMP,
    rejection_date TIMESTAMP,
    
    -- Reward calculation
    slab_tier INTEGER DEFAULT 1,
    expected_reward DECIMAL(12, 2),
    
    -- Metadata
    source VARCHAR(100),
    utm_campaign VARCHAR(255),
    utm_source VARCHAR(255),
    utm_medium VARCHAR(255),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referrals_referee_email ON referrals(referee_email);
CREATE INDEX idx_referrals_university ON referrals(university_id);
CREATE INDEX idx_referrals_program ON referrals(program_id);
CREATE INDEX idx_referrals_counselor ON referrals(counselor_id);
CREATE INDEX idx_referrals_status ON referrals(status);
CREATE INDEX idx_referrals_submission_date ON referrals(submission_date);
CREATE INDEX idx_referrals_referral_code ON referrals(referral_code);

-- ============================================
-- Table: rewards
-- ============================================
CREATE TABLE rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_id UUID NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('referrer', 'counselor', 'referee')),
    reward_type VARCHAR(50) NOT NULL CHECK (reward_type IN ('voucher', 'points', 'cashback')),
    amount DECIMAL(12, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'disbursed', 'cancelled')),
    
    -- Approval tracking
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    approval_notes TEXT,
    
    -- Disbursement tracking
    disbursed_by UUID REFERENCES users(id),
    disbursed_at TIMESTAMP,
    disbursement_method VARCHAR(50),
    transaction_reference VARCHAR(255),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rewards_referral ON rewards(referral_id);
CREATE INDEX idx_rewards_user ON rewards(user_id);
CREATE INDEX idx_rewards_status ON rewards(status);
CREATE INDEX idx_rewards_user_type ON rewards(user_type);

-- ============================================
-- Table: reward_tiers
-- ============================================
CREATE TABLE reward_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tier_name VARCHAR(50) NOT NULL,
    min_referrals INTEGER NOT NULL,
    max_referrals INTEGER,
    multiplier DECIMAL(4, 2) DEFAULT 1.00,
    bonus_amount DECIMAL(12, 2) DEFAULT 0,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Table: notifications
-- ============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) CHECK (type IN ('info', 'success', 'warning', 'error')),
    category VARCHAR(50) CHECK (category IN ('referral', 'reward', 'system', 'assignment')),
    reference_type VARCHAR(50),
    reference_id UUID,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- ============================================
-- Table: audit_logs
-- ============================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- ============================================
-- Table: settings
-- ============================================
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    category VARCHAR(50),
    description TEXT,
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Table: password_reset_tokens
-- ============================================
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_user ON password_reset_tokens(user_id);

-- ============================================
-- Table: bank_accounts (for referrer withdrawals)
-- ============================================
CREATE TABLE bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_holder_name VARCHAR(255) NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    ifsc_code VARCHAR(20) NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bank_accounts_user ON bank_accounts(user_id);

-- ============================================
-- Table: withdrawal_requests
-- ============================================
CREATE TABLE withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    bank_account_id UUID NOT NULL REFERENCES bank_accounts(id),
    amount DECIMAL(12, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    processed_by UUID REFERENCES users(id),
    processed_at TIMESTAMP,
    transaction_reference VARCHAR(255),
    failure_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_withdrawal_requests_user ON withdrawal_requests(user_id);
CREATE INDEX idx_withdrawal_requests_status ON withdrawal_requests(status);

-- ============================================
-- SEED DATA
-- ============================================

-- Insert default reward tiers
INSERT INTO reward_tiers (tier_name, min_referrals, max_referrals, multiplier, bonus_amount, description) VALUES
('Bronze', 1, 5, 1.00, 0, '1-5 successful referrals - Standard rewards'),
('Silver', 6, 10, 1.25, 500, '6-10 successful referrals - 25% bonus on rewards'),
('Gold', 11, 20, 1.50, 1500, '11-20 successful referrals - 50% bonus on rewards'),
('Platinum', 21, NULL, 2.00, 5000, '21+ successful referrals - Double rewards');

-- Insert default settings
INSERT INTO settings (key, value, category, description) VALUES
('system_name', '"TeamLease EdTech Referral Portal"', 'general', 'System display name'),
('default_timezone', '"Asia/Kolkata"', 'general', 'Default timezone'),
('multi_university_mode', 'true', 'general', 'Enable multi-university support'),
('referrer_base_reward', '100', 'rewards', 'Base reward for referrers in INR'),
('counselor_base_reward', '75', 'rewards', 'Base reward for counselors in INR'),
('default_reward_type', '"cashback"', 'rewards', 'Default reward type'),
('slab_wise_progression', 'true', 'rewards', 'Enable tiered rewards'),
('session_timeout_minutes', '30', 'security', 'Session timeout in minutes'),
('require_2fa', 'false', 'security', 'Require 2FA for admin users'),
('audit_logging', 'true', 'security', 'Enable audit logging'),
('notification_new_referral', 'true', 'notifications', 'Notify on new referral submission'),
('notification_assignment', 'true', 'notifications', 'Notify counselors on assignment'),
('notification_status_change', 'true', 'notifications', 'Notify referrers on status change'),
('notification_admission', 'true', 'notifications', 'Notify all parties on admission'),
('notification_reward', 'true', 'notifications', 'Notify on reward disbursement');

-- Insert sample universities
INSERT INTO universities (name, code, status, created_at) VALUES
('Massachusetts Institute of Technology', 'MIT', 'active', '2024-01-01'),
('Stanford University', 'STAN', 'active', '2024-01-15'),
('Harvard Business School', 'HBS', 'active', '2024-02-01'),
('Oxford University', 'OXF', 'active', '2024-02-15');

-- Insert sample programs (after universities are created)
INSERT INTO programs (university_id, name, code, duration, fee_structure, commission_rate, reward_amount, reward_tier, status)
SELECT 
    u.id, 'MBA Program', 'MBA', '2 years', 85000, 3.5, 2975, 'platinum', 'active'
FROM universities u WHERE u.code = 'MIT';

INSERT INTO programs (university_id, name, code, duration, fee_structure, commission_rate, reward_amount, reward_tier, status)
SELECT 
    u.id, 'MS Computer Science', 'MSCS', '2 years', 75000, 3.0, 2250, 'gold', 'active'
FROM universities u WHERE u.code = 'MIT';

INSERT INTO programs (university_id, name, code, duration, fee_structure, commission_rate, reward_amount, reward_tier, status)
SELECT 
    u.id, 'Executive MBA', 'EMBA', '18 months', 95000, 4.0, 3800, 'platinum', 'active'
FROM universities u WHERE u.code = 'STAN';

INSERT INTO programs (university_id, name, code, duration, fee_structure, commission_rate, reward_amount, reward_tier, status)
SELECT 
    u.id, 'MS Data Science', 'MSDS', '2 years', 70000, 2.5, 1750, 'silver', 'active'
FROM universities u WHERE u.code = 'STAN';

INSERT INTO programs (university_id, name, code, duration, fee_structure, commission_rate, reward_amount, reward_tier, status)
SELECT 
    u.id, 'MBA', 'MBA', '2 years', 110000, 5.0, 5500, 'platinum', 'active'
FROM universities u WHERE u.code = 'HBS';

INSERT INTO programs (university_id, name, code, duration, fee_structure, commission_rate, reward_amount, reward_tier, status)
SELECT 
    u.id, 'MSc Finance', 'MSFIN', '1 year', 65000, 2.0, 1300, 'bronze', 'active'
FROM universities u WHERE u.code = 'OXF';

-- Insert a sample admin user (password: admin123 - use bcrypt hash in production)
INSERT INTO users (email, password_hash, name, phone, role, is_active, is_verified) VALUES
('admin@teamlease.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiLXCJzLCS5W', 'System Admin', '+911234567890', 'super_admin', true, true);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_universities_updated_at BEFORE UPDATE ON universities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON programs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_referrals_updated_at BEFORE UPDATE ON referrals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rewards_updated_at BEFORE UPDATE ON rewards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate referral code
CREATE OR REPLACE FUNCTION generate_referral_code(uni_code VARCHAR, prog_code VARCHAR)
RETURNS VARCHAR AS $$
DECLARE
    random_suffix VARCHAR(5);
BEGIN
    random_suffix := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 5));
    RETURN uni_code || '-' || prog_code || '-' || random_suffix;
END;
$$ LANGUAGE plpgsql;

-- Function to generate user referral code
CREATE OR REPLACE FUNCTION generate_user_referral_code(user_name VARCHAR)
RETURNS VARCHAR AS $$
DECLARE
    name_part VARCHAR(10);
    random_suffix VARCHAR(4);
BEGIN
    name_part := UPPER(REGEXP_REPLACE(SPLIT_PART(user_name, ' ', 1), '[^A-Za-z]', '', 'g'));
    name_part := SUBSTRING(name_part FROM 1 FOR 4);
    random_suffix := TO_CHAR(EXTRACT(YEAR FROM CURRENT_DATE), 'FM0000');
    RETURN name_part || '-REF-' || random_suffix;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate referral code for users
CREATE OR REPLACE FUNCTION set_user_referral_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role = 'referrer' AND NEW.referral_code IS NULL THEN
        NEW.referral_code := generate_user_referral_code(NEW.name);
        -- Handle duplicates by adding random suffix
        WHILE EXISTS (SELECT 1 FROM users WHERE referral_code = NEW.referral_code) LOOP
            NEW.referral_code := generate_user_referral_code(NEW.name) || '-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 2));
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_user_referral_code_trigger
BEFORE INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION set_user_referral_code();

-- ============================================
-- VIEWS
-- ============================================

-- View: Dashboard Statistics
CREATE OR REPLACE VIEW v_dashboard_stats AS
SELECT 
    COUNT(*) as total_referrals,
    COUNT(*) FILTER (WHERE status = 'submitted' AND counselor_id IS NULL) as pending_assignment,
    COUNT(*) FILTER (WHERE status = 'admitted') as total_admissions,
    ROUND(COUNT(*) FILTER (WHERE status = 'admitted')::DECIMAL / NULLIF(COUNT(*), 0) * 100, 1) as conversion_rate,
    (SELECT COUNT(DISTINCT id) FROM universities WHERE status = 'active') as active_universities
FROM referrals;

-- View: Leaderboard
CREATE OR REPLACE VIEW v_referrer_leaderboard AS
SELECT 
    u.id as user_id,
    u.name as user_name,
    u.avatar_url,
    u.tier,
    COUNT(r.id) as total_referrals,
    COUNT(r.id) FILTER (WHERE r.status = 'admitted') as total_admissions,
    ROUND(COUNT(r.id) FILTER (WHERE r.status = 'admitted')::DECIMAL / NULLIF(COUNT(r.id), 0) * 100, 1) as conversion_rate,
    COALESCE(SUM(rw.amount) FILTER (WHERE rw.status = 'disbursed'), 0) as total_rewards,
    ROW_NUMBER() OVER (ORDER BY COUNT(r.id) FILTER (WHERE r.status = 'admitted') DESC) as rank
FROM users u
LEFT JOIN referrals r ON u.id = r.referrer_id
LEFT JOIN rewards rw ON r.id = rw.referral_id AND rw.user_id = u.id
WHERE u.role = 'referrer' AND u.is_active = true
GROUP BY u.id, u.name, u.avatar_url, u.tier
ORDER BY total_admissions DESC;

-- View: University Stats
CREATE OR REPLACE VIEW v_university_stats AS
SELECT 
    u.id,
    u.name,
    u.code,
    u.status,
    COUNT(DISTINCT p.id) as total_programs,
    COUNT(r.id) as total_referrals,
    COUNT(r.id) FILTER (WHERE r.status = 'admitted') as total_admissions,
    ROUND(COUNT(r.id) FILTER (WHERE r.status = 'admitted')::DECIMAL / NULLIF(COUNT(r.id), 0) * 100, 1) as conversion_rate
FROM universities u
LEFT JOIN programs p ON u.id = p.university_id
LEFT JOIN referrals r ON u.id = r.university_id
GROUP BY u.id, u.name, u.code, u.status;

-- ============================================
-- END OF SCHEMA
-- ============================================

