-- ==============================================================================
-- IRCTC Railway Reservation System - Authentication Domain Schema
-- PostgreSQL Physical Database Implementation
-- ==============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. Table: auth_users
-- ==============================================================================
CREATE TABLE auth_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING_VERIFICATION',
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID,
    
    CONSTRAINT chk_users_email CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$')
);

CREATE INDEX idx_auth_users_email ON auth_users(email);
CREATE INDEX idx_auth_users_phone ON auth_users(phone_number);
CREATE INDEX idx_auth_users_status ON auth_users(status);
CREATE INDEX idx_auth_users_deleted_at ON auth_users(deleted_at) WHERE deleted_at IS NULL;

-- ==============================================================================
-- 2. Table: auth_roles
-- ==============================================================================
CREATE TABLE auth_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_roles_code CHECK (code ~ '^[A-Z0-9_]+$')
);

CREATE INDEX idx_auth_roles_code ON auth_roles(code);

-- ==============================================================================
-- 3. Table: auth_permissions
-- ==============================================================================
CREATE TABLE auth_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) UNIQUE NOT NULL,
    module VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_permissions_code CHECK (code ~ '^[a-z_]+:[a-z_]+$')
);

CREATE INDEX idx_auth_permissions_code ON auth_permissions(code);
CREATE INDEX idx_auth_permissions_module ON auth_permissions(module);

-- ==============================================================================
-- 4. Table: auth_user_roles (Many-to-Many)
-- ==============================================================================
CREATE TABLE auth_user_roles (
    user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES auth_roles(id) ON DELETE RESTRICT,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID REFERENCES auth_users(id) ON DELETE SET NULL,
    
    PRIMARY KEY (user_id, role_id)
);

CREATE INDEX idx_auth_user_roles_role_id ON auth_user_roles(role_id);

-- ==============================================================================
-- 5. Table: auth_role_permissions (Many-to-Many)
-- ==============================================================================
CREATE TABLE auth_role_permissions (
    role_id UUID NOT NULL REFERENCES auth_roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES auth_permissions(id) ON DELETE CASCADE,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (role_id, permission_id)
);

CREATE INDEX idx_auth_role_permissions_role_id ON auth_role_permissions(role_id);

-- ==============================================================================
-- 6. Table: auth_sessions
-- ==============================================================================
CREATE TABLE auth_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    ip_address INET,
    user_agent TEXT,
    device_id VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ NOT NULL,
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_sessions_expiry CHECK (expires_at > created_at)
);

CREATE INDEX idx_auth_sessions_user_id ON auth_sessions(user_id);
CREATE INDEX idx_auth_sessions_expires_at ON auth_sessions(expires_at) WHERE is_active = TRUE;

-- ==============================================================================
-- 7. Table: auth_refresh_tokens
-- ==============================================================================
CREATE TABLE auth_refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES auth_sessions(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) UNIQUE NOT NULL,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    replaced_by_token UUID REFERENCES auth_refresh_tokens(id) ON DELETE SET NULL,
    
    CONSTRAINT chk_refresh_tokens_expiry CHECK (expires_at > created_at)
);

CREATE INDEX idx_auth_refresh_tokens_hash ON auth_refresh_tokens(token_hash);
CREATE INDEX idx_auth_refresh_tokens_user_id ON auth_refresh_tokens(user_id);

-- ==============================================================================
-- 8. Table: auth_otp_verifications
-- ==============================================================================
CREATE TABLE auth_otp_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth_users(id) ON DELETE CASCADE,
    target_contact VARCHAR(255) NOT NULL,
    contact_type VARCHAR(20) NOT NULL,
    otp_hash VARCHAR(255) NOT NULL,
    purpose VARCHAR(50) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    attempts SMALLINT NOT NULL DEFAULT 0,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_otp_attempts CHECK (attempts <= 5),
    CONSTRAINT chk_otp_contact_type CHECK (contact_type IN ('EMAIL', 'SMS')),
    CONSTRAINT chk_otp_expiry CHECK (expires_at > created_at)
);

CREATE INDEX idx_auth_otp_target ON auth_otp_verifications(target_contact, purpose) WHERE is_verified = FALSE;

-- ==============================================================================
-- 9. Table: auth_login_history
-- ==============================================================================
CREATE TABLE auth_login_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth_users(id) ON DELETE CASCADE,
    attempt_status VARCHAR(20) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    location VARCHAR(255),
    failure_reason VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_login_history_status CHECK (attempt_status IN ('SUCCESS', 'FAILED'))
);

CREATE INDEX idx_auth_login_history_user_id ON auth_login_history(user_id);
-- Note: In production, consider BRIN index for created_at if time-series querying is heavily used.
CREATE INDEX idx_auth_login_history_created_at ON auth_login_history(created_at);

-- ==============================================================================
-- 10. Table: auth_failed_login_attempts
-- ==============================================================================
CREATE TABLE auth_failed_login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    ip_address INET,
    failed_count SMALLINT NOT NULL DEFAULT 1,
    last_attempt_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    locked_until TIMESTAMPTZ,
    
    UNIQUE (user_id, ip_address)
);

CREATE INDEX idx_auth_failed_logins_user_id ON auth_failed_login_attempts(user_id);

-- ==============================================================================
-- 11. Table: auth_password_history
-- ==============================================================================
CREATE TABLE auth_password_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_auth_password_history_user_id ON auth_password_history(user_id);

-- ==============================================================================
-- Triggers for updated_at timestamps
-- ==============================================================================
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_auth_users
BEFORE UPDATE ON auth_users
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_auth_roles
BEFORE UPDATE ON auth_roles
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();
