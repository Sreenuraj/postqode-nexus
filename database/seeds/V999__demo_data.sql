-- V999__demo_data.sql
-- Demo seed data for PostQode Nexus

-- Insert demo users
-- Admin password: Admin@123 (BCrypt hash)
-- User password: User@123 (BCrypt hash)
INSERT INTO users (id, username, password_hash, email, role) VALUES
    ('11111111-1111-1111-1111-111111111111', 'admin', '$2a$10$rO7UXJQ7xJZJZJZJZJZJZOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'admin@demo.com', 'ADMIN'),
    ('22222222-2222-2222-2222-222222222222', 'user', '$2a$10$rO7UXJQ7xJZJZJZJZJZJZOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'user@demo.com', 'USER')
ON CONFLICT (id) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    email = EXCLUDED.email,
    role = EXCLUDED.role;

-- Insert demo products (20 items)
INSERT INTO products (id, sku, name, description, price, quantity, status, created_by) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'PRD-001', 'Wireless Mouse', 'Ergonomic wireless mouse with adjustable DPI', 29.99, 150, 'ACTIVE', '11111111-1111-1111-1111-111111111111'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'PRD-002', 'Mechanical Keyboard', 'RGB mechanical keyboard with Cherry MX switches', 89.99, 5, 'LOW_STOCK', '11111111-1111-1111-1111-111111111111'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'PRD-003', 'USB-C Hub', '7-port USB-C hub with 4K HDMI output', 49.99, 0, 'OUT_OF_STOCK', '11111111-1111-1111-1111-111111111111'),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'PRD-004', 'Monitor Stand', 'Adjustable aluminum monitor stand with USB ports', 45.00, 75, 'ACTIVE', '11111111-1111-1111-1111-111111111111'),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'PRD-005', 'Webcam HD', '1080p HD webcam with built-in microphone', 79.99, 8, 'LOW_STOCK', '11111111-1111-1111-1111-111111111111'),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'PRD-006', 'Desk Lamp', 'LED desk lamp with adjustable color temperature', 35.00, 200, 'ACTIVE', '11111111-1111-1111-1111-111111111111'),
    ('77777777-7777-7777-7777-777777777777', 'PRD-007', 'Ergonomic Chair', 'Mesh ergonomic office chair with lumbar support', 299.99, 0, 'OUT_OF_STOCK', '11111111-1111-1111-1111-111111111111'),
    ('88888888-8888-8888-8888-888888888888', 'PRD-008', 'Laptop Stand', 'Portable aluminum laptop stand with cooling vents', 55.00, 45, 'ACTIVE', '11111111-1111-1111-1111-111111111111'),
    ('99999999-9999-9999-9999-999999999999', 'PRD-009', 'Wireless Charger', '15W fast wireless charging pad', 25.99, 3, 'LOW_STOCK', '11111111-1111-1111-1111-111111111111'),
    ('10101010-1010-1010-1010-101010101010', 'PRD-010', 'Bluetooth Speaker', 'Portable Bluetooth speaker with 20-hour battery', 69.99, 120, 'ACTIVE', '11111111-1111-1111-1111-111111111111'),
    ('11111111-1111-1111-1111-111111111112', 'PRD-011', 'Noise Cancelling Headphones', 'Over-ear wireless headphones with ANC', 199.99, 15, 'ACTIVE', '11111111-1111-1111-1111-111111111111'),
    ('12121212-1212-1212-1212-121212121212', 'PRD-012', 'USB Flash Drive 64GB', 'High-speed USB 3.0 flash drive', 12.99, 0, 'OUT_OF_STOCK', '11111111-1111-1111-1111-111111111111'),
    ('13131313-1313-1313-1313-131313131313', 'PRD-013', 'External SSD 1TB', 'Portable NVMe SSD with USB-C', 129.99, 25, 'ACTIVE', '11111111-1111-1111-1111-111111111111'),
    ('14141414-1414-1414-1414-141414141414', 'PRD-014', 'Wireless Earbuds', 'True wireless earbuds with charging case', 59.99, 7, 'LOW_STOCK', '11111111-1111-1111-1111-111111111111'),
    ('15151515-1515-1515-1515-151515151515', 'PRD-015', 'HDMI Cable 6ft', 'High-speed HDMI 2.1 cable with 8K support', 15.99, 300, 'ACTIVE', '11111111-1111-1111-1111-111111111111'),
    ('16161616-1616-1616-1616-161616161616', 'PRD-016', 'Mouse Pad XL', 'Extended gaming mouse pad with stitched edges', 19.99, 2, 'LOW_STOCK', '11111111-1111-1111-1111-111111111111'),
    ('17171717-1717-1717-1717-171717171717', 'PRD-017', 'Portable Projector', 'Mini 1080p projector with built-in speaker', 249.99, 10, 'LOW_STOCK', '11111111-1111-1111-1111-111111111111'),
    ('18181818-1818-1818-1818-181818181818', 'PRD-018', 'Smart Power Strip', 'WiFi-enabled power strip with surge protection', 39.99, 55, 'ACTIVE', '11111111-1111-1111-1111-111111111111'),
    ('19191919-1919-1919-1919-191919191919', 'PRD-019', 'Cable Management Kit', 'Complete cable organizer set with clips and sleeves', 24.99, 0, 'OUT_OF_STOCK', '11111111-1111-1111-1111-111111111111'),
    ('20202020-2020-2020-2020-202020202020', 'PRD-020', 'Webcam Light Ring', '10-inch LED ring light with phone holder', 29.99, 80, 'ACTIVE', '11111111-1111-1111-1111-111111111111');

-- Insert sample activity logs
INSERT INTO activity_logs (id, user_id, product_id, action_type, new_value) VALUES
    ('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', '11111111-1111-1111-1111-111111111111', NULL, 'LOGIN', '{"message": "Admin logged in"}'),
    ('a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'CREATE', '{"sku": "PRD-001", "name": "Wireless Mouse"}'),
    ('a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'STATE_CHANGE', '{"old_status": "ACTIVE", "new_status": "LOW_STOCK"}');
