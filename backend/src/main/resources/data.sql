-- Products
INSERT INTO product (name, description, price, image_url, category, available) VALUES
('iPhone 15 Pro', 'Latest Apple smartphone with A17 Pro chip, titanium design, and 48MP camera system', 1199.99, 'https://picsum.photos/seed/iphone/400/300', 'Electronics', true),
('MacBook Air M3', 'Ultra-thin laptop with M3 chip, 15-inch Liquid Retina display, 18-hour battery', 1299.99, 'https://picsum.photos/seed/macbook/400/300', 'Electronics', true),
('AirPods Pro 2', 'Active noise cancellation, adaptive transparency, personalized spatial audio', 249.99, 'https://picsum.photos/seed/airpods/400/300', 'Accessories', true),
('Apple Watch Ultra 2', 'Rugged titanium case, precision GPS, 36-hour battery, underwater depth gauge', 799.99, 'https://picsum.photos/seed/watch/400/300', 'Electronics', true),
('iPad Pro M4', 'Ultra Thin. Ultra Powerful. M4 chip, Liquid Retina XDR display, Apple Pencil Pro', 1099.99, 'https://picsum.photos/seed/ipad/400/300', 'Electronics', true),
('MagSafe Charger', 'Perfectly aligned wireless charging for iPhone and AirPods', 39.99, 'https://picsum.photos/seed/magsafe/400/300', 'Accessories', true),
('Apple Pencil Pro', 'Pixel-perfect precision, tilt and pressure sensitivity, Find My support', 129.99, 'https://picsum.photos/seed/pencil/400/300', 'Accessories', true),
('AppleCare+ Plan', 'Extended warranty with accidental damage protection, express replacement', 199.99, 'https://picsum.photos/seed/applecare/400/300', 'Services', true);

-- Packages
INSERT INTO product_package (name, description, price, discount, image_url) VALUES
('Ultimate Creator Bundle', 'MacBook Air + iPad Pro + Apple Pencil — everything you need to create', 2399.99, 15.0, 'https://picsum.photos/seed/creator/400/300'),
('Mobile Essentials Pack', 'iPhone 15 Pro + AirPods Pro + MagSafe Charger — stay connected', 1399.99, 10.0, 'https://picsum.photos/seed/mobile/400/300'),
('Fitness Pro Kit', 'Apple Watch Ultra + AirPods Pro + AppleCare+ — your fitness companion', 1149.99, 12.0, 'https://picsum.photos/seed/fitness/400/300'),
('Complete Ecosystem', 'iPhone + MacBook + AirPods + Watch — the full Apple experience', 3299.99, 20.0, 'https://picsum.photos/seed/ecosystem/400/300');

-- Package-Product relationships
-- Ultimate Creator Bundle: MacBook + iPad + Pencil
INSERT INTO package_products (package_id, product_id) VALUES (1, 2), (1, 5), (1, 7);
-- Mobile Essentials: iPhone + AirPods + MagSafe
INSERT INTO package_products (package_id, product_id) VALUES (2, 1), (2, 3), (2, 6);
-- Fitness Pro Kit: Watch + AirPods + AppleCare
INSERT INTO package_products (package_id, product_id) VALUES (3, 4), (3, 3), (3, 8);
-- Complete Ecosystem: iPhone + MacBook + AirPods + Watch
INSERT INTO package_products (package_id, product_id) VALUES (4, 1), (4, 2), (4, 3), (4, 4);

-- Product Characteristics (configuration requirements)
-- iPhone 15 Pro configs
INSERT INTO product_characteristic (product_id, name, label, type, required, options, default_value) VALUES
(1, 'storage', 'Storage Capacity', 'SELECT', true, '128GB,256GB,512GB,1TB', '256GB'),
(1, 'color', 'Color', 'SELECT', true, 'Natural Titanium,Blue Titanium,White Titanium,Black Titanium', 'Natural Titanium');

-- MacBook Air M3 configs
INSERT INTO product_characteristic (product_id, name, label, type, required, options, default_value) VALUES
(2, 'memory', 'Unified Memory', 'SELECT', true, '8GB,16GB,24GB', '16GB'),
(2, 'storage', 'SSD Storage', 'SELECT', true, '256GB,512GB,1TB,2TB', '512GB'),
(2, 'color', 'Finish', 'SELECT', true, 'Midnight,Starlight,Space Gray,Silver', 'Midnight');

-- AirPods Pro configs
INSERT INTO product_characteristic (product_id, name, label, type, required, options, default_value) VALUES
(3, 'engraving', 'Custom Engraving', 'TEXT', false, null, '');

-- Apple Watch configs
INSERT INTO product_characteristic (product_id, name, label, type, required, options, default_value) VALUES
(4, 'band', 'Band Type', 'SELECT', true, 'Alpine Loop,Trail Loop,Ocean Band', 'Alpine Loop'),
(4, 'bandColor', 'Band Color', 'SELECT', true, 'Orange,Blue,Green,Black', 'Orange');

-- iPad Pro configs
INSERT INTO product_characteristic (product_id, name, label, type, required, options, default_value) VALUES
(5, 'storage', 'Storage', 'SELECT', true, '256GB,512GB,1TB,2TB', '256GB'),
(5, 'connectivity', 'Connectivity', 'SELECT', true, 'Wi-Fi,Wi-Fi + Cellular', 'Wi-Fi');

-- AppleCare+ configs
INSERT INTO product_characteristic (product_id, name, label, type, required, options, default_value) VALUES
(8, 'duration', 'Coverage Duration', 'SELECT', true, '1 Year,2 Years,3 Years', '2 Years');
