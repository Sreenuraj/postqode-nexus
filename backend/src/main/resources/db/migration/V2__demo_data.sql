-- V2__demo_data.sql
-- Insert demo users and products
-- Admin password: Admin@123
-- User password: User@123

-- Insert demo users with proper BCrypt hashes
-- Admin password: Admin@123 (BCrypt hash generated with Spring Security BCryptPasswordEncoder)
INSERT INTO users (username, password_hash, email, role, created_at, updated_at)
VALUES ('admin', '$2a$10$Ir9ZkNK6.YNZjSPvlDRCY.J6Q2YW6dwkP3s7YdrSpsfeQzmueLLFG', 'admin@postqode.com', 'ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- User password: User@123 (BCrypt hash generated with Spring Security BCryptPasswordEncoder)
INSERT INTO users (username, password_hash, email, role, created_at, updated_at)
VALUES ('user', '$2a$10$ziE3grL4PS5Ivb3Dg9FCR.PWecIjWWkzy.u6L0KA8hCzSwpdUMG2q', 'user@postqode.com', 'USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert demo products
INSERT INTO products (sku, name, description, price, quantity, status, created_by, created_at, updated_at)
SELECT 
    'LAPTOP-001',
    'Dell XPS 15',
    'High-performance laptop with 15.6" display',
    1299.99,
    25,
    'ACTIVE',
    (SELECT id FROM users WHERE username = 'admin'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP;

INSERT INTO products (sku, name, description, price, quantity, status, created_by, created_at, updated_at)
SELECT 
    'MOUSE-001',
    'Logitech MX Master 3',
    'Advanced wireless mouse',
    99.99,
    50,
    'ACTIVE',
    (SELECT id FROM users WHERE username = 'admin'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP;

INSERT INTO products (sku, name, description, price, quantity, status, created_by, created_at, updated_at)
SELECT 
    'KEYBOARD-001',
    'Mechanical Keyboard RGB',
    'Gaming keyboard with RGB lighting',
    149.99,
    8,
    'LOW_STOCK',
    (SELECT id FROM users WHERE username = 'admin'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP;

INSERT INTO products (sku, name, description, price, quantity, status, created_by, created_at, updated_at)
SELECT 
    'MONITOR-001',
    'LG 27" 4K Monitor',
    '27-inch 4K UHD monitor',
    399.99,
    0,
    'OUT_OF_STOCK',
    (SELECT id FROM users WHERE username = 'admin'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP;

INSERT INTO products (sku, name, description, price, quantity, status, created_by, created_at, updated_at)
SELECT 
    'HEADSET-001',
    'Sony WH-1000XM4',
    'Noise-cancelling wireless headphones',
    349.99,
    15,
    'ACTIVE',
    (SELECT id FROM users WHERE username = 'user'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP;
