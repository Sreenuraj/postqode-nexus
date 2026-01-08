-- V3__convert_enums_to_varchar.sql
-- Convert PostgreSQL ENUM types to VARCHAR for better Hibernate compatibility

-- Convert products.status from ENUM to VARCHAR
ALTER TABLE products 
    ALTER COLUMN status TYPE VARCHAR(20) USING status::text;

-- Convert users.role from ENUM to VARCHAR  
ALTER TABLE users
    ALTER COLUMN role TYPE VARCHAR(20) USING role::text;

-- Convert activity_logs.action_type from ENUM to VARCHAR
ALTER TABLE activity_logs
    ALTER COLUMN action_type TYPE VARCHAR(20) USING action_type::text;

-- Drop the ENUM types (they're no longer needed)
DROP TYPE IF EXISTS product_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS action_type CASCADE;
