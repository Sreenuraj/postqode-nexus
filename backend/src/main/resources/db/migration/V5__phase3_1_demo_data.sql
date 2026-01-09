-- V5__phase3_1_demo_data.sql
-- Demo data for Phase 3.1 features
-- Adds sample categories, product category assignments, orders, and user inventory

-- Insert sample categories
INSERT INTO categories (id, name, description) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Electronics', 'Electronic devices and gadgets'),
  ('22222222-2222-2222-2222-222222222222', 'Office Supplies', 'Office and desk supplies'),
  ('33333333-3333-3333-3333-333333333333', 'Accessories', 'Computer accessories and peripherals'),
  ('44444444-4444-4444-4444-444444444444', 'Components', 'Computer components and hardware'),
  ('55555555-5555-5555-5555-555555555555', 'Storage', 'Storage devices and media');

-- Update existing products with categories
-- Get existing product IDs from demo data and assign categories
UPDATE products SET category_id = '11111111-1111-1111-1111-111111111111' WHERE sku IN ('PRD-001', 'PRD-002', 'PRD-003', 'PRD-005', 'PRD-011', 'PRD-014');
UPDATE products SET category_id = '22222222-2222-2222-2222-222222222222' WHERE sku IN ('PRD-004', 'PRD-006', 'PRD-015', 'PRD-016', 'PRD-018');
UPDATE products SET category_id = '33333333-3333-3333-3333-333333333333' WHERE sku IN ('PRD-008', 'PRD-009', 'PRD-013', 'PRD-020');
UPDATE products SET category_id = '44444444-4444-4444-4444-444444444444' WHERE sku IN ('PRD-007', 'PRD-010', 'PRD-017');
UPDATE products SET category_id = '55555555-5555-5555-5555-555555555555' WHERE sku IN ('PRD-012');

-- Insert sample orders for demo user (user ID: 22222222-2222-2222-2222-222222222222)
-- Get some product IDs for orders
-- Note: These IDs should match the actual product IDs in your database

-- Sample PENDING order
INSERT INTO orders (id, user_id, product_id, quantity, status) VALUES
  ('66666666-6666-6666-6666-666666666666', 
   (SELECT id FROM users WHERE username = 'user'),
   (SELECT id FROM products WHERE sku = 'PRD-001' LIMIT 1),
   2,
   'PENDING');

-- Sample APPROVED order
INSERT INTO orders (id, user_id, product_id, quantity, status) VALUES
  ('77777777-7777-7777-7777-777777777777', 
   (SELECT id FROM users WHERE username = 'user'),
   (SELECT id FROM products WHERE sku = 'PRD-004' LIMIT 1),
   1,
   'APPROVED');

-- Sample REJECTED order
INSERT INTO orders (id, user_id, product_id, quantity, status) VALUES
  ('88888888-8888-8888-8888-888888888888', 
   (SELECT id FROM users WHERE username = 'user'),
   (SELECT id FROM products WHERE sku = 'PRD-003' LIMIT 1),
   1,
   'REJECTED');

-- Sample CANCELLED order
INSERT INTO orders (id, user_id, product_id, quantity, status) VALUES
  ('99999999-9999-9999-9999-999999999999', 
   (SELECT id FROM users WHERE username = 'user'),
   (SELECT id FROM products WHERE sku = 'PRD-006' LIMIT 1),
   3,
   'CANCELLED');

-- Insert sample user inventory items for demo user
-- Auto-created from approved order
INSERT INTO user_inventory (id, user_id, product_id, name, quantity, source, notes) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   (SELECT id FROM users WHERE username = 'user'),
   (SELECT id FROM products WHERE sku = 'PRD-004' LIMIT 1),
   'Monitor Stand',
   1,
   'PURCHASED',
   'Purchased via order #77777777-7777-7777-7777-777777777777');

-- Manual inventory items
INSERT INTO user_inventory (id, user_id, product_id, name, quantity, source, notes) VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   (SELECT id FROM users WHERE username = 'user'),
   NULL,
   'Personal Laptop',
   1,
   'MANUAL',
   'My personal development laptop'),
   
  ('cccccccc-cccc-cccc-cccc-cccccccccccc',
   (SELECT id FROM users WHERE username = 'user'),
   NULL,
   'External Hard Drive',
   2,
   'MANUAL',
   'Backup drives for personal projects');
