-- ================================================================
--  HELLE RESIDENCE — COMPLETE DATABASE SETUP
--  Run this file once in your PostgreSQL / Supabase SQL Editor
--
--  Includes:
--    1. DROP & CREATE tables
--    2. Seed data (from CSV files)
--    3. Analysis report functions
-- ================================================================

-- ================================================================
--  HELLE RESIDENCE — DROP & CREATE TABLES
--  Matches CSV files exactly (all dates YYYY-MM-DD)
-- ================================================================

-- DROP (ลำดับสำคัญ — child ก่อน parent)
DROP TABLE IF EXISTS inspection_line      CASCADE;
DROP TABLE IF EXISTS inspection           CASCADE;
DROP TABLE IF EXISTS contract_item        CASCADE;
DROP TABLE IF EXISTS payments_item        CASCADE;
DROP TABLE IF EXISTS payment_receipt      CASCADE;
DROP TABLE IF EXISTS monthly_bill_line    CASCADE;
DROP TABLE IF EXISTS monthly_billing      CASCADE;
DROP TABLE IF EXISTS expense_line         CASCADE;
DROP TABLE IF EXISTS expense              CASCADE;
DROP TABLE IF EXISTS maintenance_ticket   CASCADE;
DROP TABLE IF EXISTS rental_contract      CASCADE;
DROP TABLE IF EXISTS furniture            CASCADE;
DROP TABLE IF EXISTS product_code         CASCADE;
DROP TABLE IF EXISTS room                 CASCADE;
DROP TABLE IF EXISTS room_type            CASCADE;
DROP TABLE IF EXISTS tenant               CASCADE;
DROP TABLE IF EXISTS staff                CASCADE;
DROP TABLE IF EXISTS supplier             CASCADE;
DROP TABLE IF EXISTS hostel_info          CASCADE;

-- ================================================================
--  CREATE
-- ================================================================

CREATE TABLE hostel_info (
    hostel_id    SERIAL PRIMARY KEY,
    hostel_name  text    NOT NULL,
    address      text,
    phone        text,
    email        text,
    tax_id       text
);

CREATE TABLE room_type (
    room_type_id  SERIAL PRIMARY KEY,
    description   text    NOT NULL,
    base_price    integer NOT NULL,
    max_occupants integer,
    size_sqm      numeric
);

CREATE TABLE room (
    room_no       text    PRIMARY KEY,
    room_type_id  integer NOT NULL REFERENCES room_type(room_type_id),
    floor         integer,
    monthly_price integer NOT NULL,
    status        text    NOT NULL,
    description   text
);

CREATE TABLE tenant (
    tenant_id   SERIAL PRIMARY KEY,
    name        text    NOT NULL,
    phone       text,
    email       text,
    address     text,
    id_card_no  text
);

CREATE TABLE staff (
    staff_id  SERIAL PRIMARY KEY,
    name      text    NOT NULL,
    position  text,
    phone     text
);

CREATE TABLE supplier (
    supplier_id          SERIAL PRIMARY KEY,
    name                 text    NOT NULL,
    contact_information  text
);

CREATE TABLE furniture (
    item_id        SERIAL PRIMARY KEY,
    name           text    NOT NULL,
    category       text,
    default_price  integer,
    description    text
);

CREATE TABLE product_code (
    product_code        text    PRIMARY KEY,
    product_name        text    NOT NULL,
    product_type        text    NOT NULL,
    default_unit_price  numeric,
    unit                text
);

CREATE TABLE rental_contract (
    contract_no           SERIAL PRIMARY KEY,
    contract_date         date        NOT NULL,
    tenant_id             integer     NOT NULL REFERENCES tenant(tenant_id),
    room_no               text        NOT NULL REFERENCES room(room_no),
    start_date            date        NOT NULL,
    end_date              date        NOT NULL,
    deposit_amount        integer,
    monthly_rent          integer     NOT NULL,
    total_contract_value  integer,
    created_at            timestamptz,
    status               text
);

CREATE TABLE contract_item (
    contract_line_id  SERIAL PRIMARY KEY,
    contract_no       integer NOT NULL REFERENCES rental_contract(contract_no),
    item_id           integer NOT NULL REFERENCES furniture(item_id),
    quantity          integer,
    condition         text,
    notes             text
);

CREATE TABLE maintenance_ticket (
    ticket_no            SERIAL PRIMARY KEY,
    request_date         date        NOT NULL,
    tenant_id            integer     REFERENCES tenant(tenant_id),
    room_no              text        REFERENCES room(room_no),
    issue_type           text,
    priority_level       text,
    description          text,
    estimated_cost       integer,
    actual_cost          integer,
    technician_staff_id  integer     REFERENCES staff(staff_id),
    status               text,
    completion_date      date,
    created_at           timestamptz
);

CREATE TABLE monthly_billing (
    bill_no            SERIAL PRIMARY KEY,
    bill_date          date        NOT NULL,
    billing_month      text        NOT NULL,
    tenant_id          integer     NOT NULL REFERENCES tenant(tenant_id),
    room_no            text        NOT NULL REFERENCES room(room_no),
    due_date           date,
    total_bill_amount  integer,
    total_paid         integer,
    balance_due        numeric,
    status             text,
    created_at         timestamptz
);

CREATE TABLE monthly_bill_line (
    bill_line_id  SERIAL PRIMARY KEY,
    bill_no       integer NOT NULL REFERENCES monthly_billing(bill_no),
    product_code  text    NOT NULL REFERENCES product_code(product_code),
    description   text,
    quantity      integer,
    unit_price    numeric,
    amount        integer,
    notes         text
);

CREATE TABLE payment_receipt (
    receipt_no        SERIAL PRIMARY KEY,
    receipt_date      date        NOT NULL,
    tenant_id         integer     NOT NULL REFERENCES tenant(tenant_id),
    room_no           text        NOT NULL REFERENCES room(room_no),
    payment_method    text,
    reference_number  text,
    total_paid        integer     NOT NULL,
    created_at        timestamptz
);

CREATE TABLE payments_item (
    payments_item_id  SERIAL PRIMARY KEY,
    receipt_no        integer NOT NULL REFERENCES payment_receipt(receipt_no),
    bill_no           integer NOT NULL REFERENCES monthly_billing(bill_no),
    amount_paid       integer NOT NULL,
    notes             text
);

CREATE TABLE expense (
    expense_no        SERIAL PRIMARY KEY,
    expense_date      date        NOT NULL,
    supplier_id       integer     REFERENCES supplier(supplier_id),
    expense_category  text,
    total_expense     integer,
    created_at        timestamptz
);

CREATE TABLE expense_line (
    expense_line_id  SERIAL PRIMARY KEY,
    expense_no       integer NOT NULL REFERENCES expense(expense_no),
    item_name        text    NOT NULL,
    quantity         integer,
    unit_price       integer,
    extended_price   integer
);

CREATE TABLE inspection (
    inspection_no       SERIAL PRIMARY KEY,
    inspection_date     date        NOT NULL,
    tenant_id           integer     REFERENCES tenant(tenant_id),
    room_no             text        REFERENCES room(room_no),
    inspector_staff_id  integer     REFERENCES staff(staff_id),
    result              text,
    total_fines         numeric,
    created_at          timestamptz
);

CREATE TABLE inspection_line (
    inspection_line_id  SERIAL PRIMARY KEY,
    inspection_no       integer NOT NULL REFERENCES inspection(inspection_no),
    item_checked        text,
    condition           text,
    fine_amount         integer,
    notes               text
);


-- ================================================================
--  HELLE RESIDENCE — SEED DATA (generated from CSV files)
-- ================================================================

-- hostel_info (1 rows)
INSERT INTO hostel_info (hostel_id, hostel_name, address, phone, email, tax_id) VALUES
  ('1', 'Hellesidence', '123 Sukhumvit Road, Khlong Toei, Bangkok 10110', '02-123-4567', 'info@helleresidence.co.th', '105555123456');

-- room_type (3 rows)
INSERT INTO room_type (room_type_id, description, base_price) VALUES
  ('1', 'Standard', '4500'),
  ('2', 'Deluxe', '6000'),
  ('3', 'Suite', '8500');

-- room (16 rows)
INSERT INTO room (room_no, room_type_id, floor, monthly_price, status) VALUES
  ('101', '1', '1', '4500', 'Occupied'),
  ('102', '1', '1', '4500', 'Occupied'),
  ('103', '1', '1', '4500', 'Occupied'),
  ('104', '1', '1', '4500', 'Occupied'),
  ('105', '1', '1', '4500', 'Occupied'),
  ('106', '1', '1', '4500', 'Maintenance'),
  ('201', '2', '2', '6000', 'Occupied'),
  ('202', '2', '2', '6000', 'Occupied'),
  ('203', '2', '2', '6000', 'Occupied'),
  ('204', '2', '2', '6000', 'Occupied'),
  ('205', '2', '2', '6000', 'Occupied'),
  ('301', '3', '3', '8500', 'Occupied'),
  ('302', '3', '3', '8500', 'Occupied'),
  ('303', '3', '3', '8500', 'Occupied'),
  ('401', '1', '4', '4500', 'Occupied'),
  ('402', '1', '4', '4500', 'Occupied');

-- tenant (15 rows)
INSERT INTO tenant (tenant_id, name, phone, email, address, id_card_no) VALUES
  ('1', 'Somchai Jaidee', '081-234-5678', 'somchai@email.com', '45 Moo 3, Nonthaburi 11000', '1100100012345'),
  ('2', 'Malee Srisuk', '082-345-6789', 'malee@email.com', '22 Ladprao Rd, Bangkok 10230', '1100100023456'),
  ('3', 'Napat Thongdee', '083-456-7890', 'napat@email.com', '8 Chaengwattana, Nonthaburi 11120', '1100100034567'),
  ('4', 'Pimchanok Rakdee', '084-567-8901', 'pimchanok@email.com', '100 Ratchadaphisek, Bangkok 10310', '1100100045678'),
  ('5', 'Krit Panya', '085-678-9012', 'krit@email.com', '77 Phahon Yothin, Bangkok 10900', '1100100056789'),
  ('6', 'Wanchai Boonmee', '086-789-0123', 'wanchai@email.com', '31 Silom Rd, Bangkok 10500', '1100100067890'),
  ('7', 'Sirinapa Chaiyakul', '087-890-1234', 'sirinapa@email.com', '15 On Nut Rd, Bangkok 10250', '1100100078901'),
  ('8', 'Thanida Somboon', '088-901-2345', 'thanida@email.com', '60 Bangna-Trad Rd, Bangkok 10260', '1100100089012'),
  ('9', 'Rattana Phonsri', '089-012-3456', 'rattana@email.com', '3 Sathorn Rd, Bangkok 10120', '1100100090123'),
  ('10', 'Pasit Lorprasert', '081-123-4567', 'pasit@email.com', '19 Minburi, Bangkok 10510', '1100100101234'),
  ('11', 'Busaba Wongsa', '082-234-5678', 'busaba@email.com', '55 Thonburi, Bangkok 10600', '1100100112345'),
  ('12', 'Chartchai Intawong', '083-345-6789', 'chartchai@email.com', '28 Phra Khanong, Bangkok 10260', '1100100123456'),
  ('13', 'Duangjai Keawkla', '084-456-7890', 'duangjai@email.com', '14 Ramkhamhaeng, Bangkok 10240', '1100100134567'),
  ('14', 'Ekkachai Phromma', '085-567-8901', 'ekkachai@email.com', '37 Wang Thonglang, Bangkok 10310', '1100100145678'),
  ('15', 'Fah Chantawong', '086-678-9012', 'fah@email.com', '9 Ratchayothin, Bangkok 10900', '1100100156789');

-- staff (5 rows)
INSERT INTO staff (staff_id, name, position, phone) VALUES
  ('1', 'Somjit Kaewdee', 'Manager', '081-111-1111'),
  ('2', 'Prasert Khamdi', 'Plumber', '082-222-2222'),
  ('3', 'Wichai Sripetch', 'Electrician', '083-333-3333'),
  ('4', 'Aranya Wongsak', 'Inspector', '084-444-4444'),
  ('5', 'Narin Thippharat', 'Technician', '085-555-5555');

-- supplier (5 rows)
INSERT INTO supplier (supplier_id, name, contact_information) VALUES
  ('1', 'Fix-It Co.', 'Tel: 02-111-1111 | fixitco@email.co.th'),
  ('2', 'Clean Pro', 'Tel: 02-222-2222 | cleanpro@email.co.th'),
  ('3', 'Office Plus', 'Tel: 02-333-3333 | officeplus@email.co.th'),
  ('4', 'Green Garden', 'Tel: 02-444-4444 | greengarden@email.co.th'),
  ('5', 'Power Tech', 'Tel: 02-555-5555 | powertech@email.co.th');

-- furniture (8 rows)
INSERT INTO furniture (item_id, name, category, default_price) VALUES
  ('1', 'Bed Frame', 'Bedroom', '5000'),
  ('2', 'Study Desk', 'Office', '2500'),
  ('3', 'Wardrobe', 'Bedroom', '4000'),
  ('4', 'Air Conditioner', 'Electrical', '15000'),
  ('5', 'Refrigerator', 'Electrical', '8000'),
  ('6', 'Water Heater', 'Bathroom', '3000'),
  ('7', 'Sofa', 'Living Room', '6000'),
  ('8', 'Television', 'Electronic', '10000');

-- product_code (8 rows)
INSERT INTO product_code (product_code, product_name, product_type, default_unit_price) VALUES
  ('CLEAN01', 'Cleaning Fee', 'Utility', 200),
  ('ELEC01', 'Electricity', 'Utility', '3.5'),
  ('FINE01', 'Late Payment Fine', 'Fine', 500),
  ('FINE02', 'Damage Fine', 'Fine', 200),
  ('INET01', 'Internet (Monthly)', 'Utility', 440),
  ('MAINT01', 'Maintenance Charge', 'Maintenance', 500),
  ('RENT01', 'Monthly Rent', 'Rent', 4500),
  ('WATER01', 'Water', 'Utility', 80);

-- rental_contract (15 rows)
INSERT INTO rental_contract (contract_no, contract_date, tenant_id, room_no, start_date, end_date, deposit_amount, monthly_rent, total_contract_value, created_at, status) VALUES
  ('1', '2026-01-01', '1', '101', '2026-01-01', '2026-12-31', '9000', '4500', '54000', '2026-01-01 09:00:00+00', 'Active'),
  ('2', '2026-01-14', '2', '102', '2026-01-01', '2027-01-14', '9000', '4500', '54000', '2026-01-14 09:00:00+00', 'Active'),
  ('3', '2026-01-05', '3', '201', '2026-01-01', '2026-12-31', '12000', '6000', '72000', '2026-01-05 09:00:00+00', 'Active'),
  ('4', '2026-01-31', '5', '301', '2026-02-01', '2027-01-31', '17000', '8500', '102000', '2026-01-31 09:00:00+00', 'Active'),
  ('5', '2026-01-01', '6', '202', '2026-01-01', '2026-12-31', '12000', '6000', '72000', '2026-01-01 09:00:00+00', 'Active'),
  ('6', '2025-04-25', '7', '203', '2025-04-25', '2026-06-30', '12000', '6000', '72000', '2026-01-20 09:00:00+00', 'Expiring'),
  ('7', '2025-04-25', '8', '104', '2025-04-25', '2026-06-30', '9000', '4500', '54000', '2026-02-14 09:00:00+00', 'Expiring'),
  ('8', '2025-04-25', '9', '302', '2025-04-25', '2026-06-30', '17000', '8500', '102000', '2026-01-10 09:00:00+00', 'Expiring'),
  ('9', '2026-01-31', '10', '401', '2026-02-01', '2027-01-31', '9000', '4500', '54000', '2026-01-31 09:00:00+00', 'Active'),
  ('10', '2026-02-28', '4', '103', '2026-03-01', '2027-02-28', '9000', '4500', '54000', '2026-02-28 09:00:00+00', 'Active'),
  ('11', '2026-06-01', '11', '402', '2026-06-01', '2026-12-31', '9000', '4500', '31500', '2026-06-01 09:00:00+00', 'Active'),
  ('12', '2026-03-01', '12', '204', '2026-03-01', '2027-02-28', '12000', '6000', '72000', '2026-03-01 09:00:00+00', 'Active'),
  ('13', '2026-03-05', '13', '105', '2026-03-05', '2027-03-04', '9000', '4500', '54000', '2026-03-05 09:00:00+00', 'Active'),
  ('14', '2026-03-10', '14', '303', '2026-03-10', '2026-03-31', '17000', '8500', '102000', '2026-03-10 09:00:00+00', 'Expired'),
  ('15', '2026-03-15', '15', '205', '2026-03-15', '2027-03-14', '12000', '6000', '72000', '2026-03-15 09:00:00+00', 'Active');

-- contract_item (82 rows)
INSERT INTO contract_item (contract_line_id, contract_no, item_id, quantity, condition, notes) VALUES
  ('1', '1', '1', '1', 'Good', NULL),
  ('2', '1', '2', '1', 'Good', NULL),
  ('3', '1', '3', '1', 'Good', NULL),
  ('4', '1', '4', '1', 'Good', NULL),
  ('5', '2', '1', '1', 'Good', NULL),
  ('6', '2', '2', '1', 'Good', NULL),
  ('7', '2', '3', '1', 'Fair', 'Minor scratch on surface'),
  ('8', '2', '4', '1', 'Good', NULL),
  ('9', '3', '1', '1', 'Good', NULL),
  ('10', '3', '2', '1', 'Good', NULL),
  ('11', '3', '3', '1', 'Good', NULL),
  ('12', '3', '4', '1', 'Good', NULL),
  ('13', '3', '5', '1', 'Good', NULL),
  ('14', '3', '6', '1', 'Good', NULL),
  ('15', '4', '1', '1', 'Good', NULL),
  ('16', '4', '2', '1', 'Good', NULL),
  ('17', '4', '3', '1', 'Good', NULL),
  ('18', '4', '4', '1', 'Good', NULL),
  ('19', '4', '5', '1', 'Good', NULL),
  ('20', '4', '6', '1', 'Good', NULL),
  ('21', '4', '7', '1', 'Good', NULL),
  ('22', '4', '8', '1', 'Good', NULL),
  ('23', '5', '1', '1', 'Good', NULL),
  ('24', '5', '2', '1', 'Fair', 'Handle slightly loose'),
  ('25', '5', '3', '1', 'Good', NULL),
  ('26', '5', '4', '1', 'Good', NULL),
  ('27', '5', '5', '1', 'Good', NULL),
  ('28', '5', '6', '1', 'Good', NULL),
  ('29', '6', '1', '1', 'Good', NULL),
  ('30', '6', '2', '1', 'Good', NULL),
  ('31', '6', '3', '1', 'Fair', 'Door hinge worn'),
  ('32', '6', '4', '1', 'Good', NULL),
  ('33', '6', '5', '1', 'Good', NULL),
  ('34', '6', '6', '1', 'Good', NULL),
  ('35', '7', '1', '1', 'Good', NULL),
  ('36', '7', '2', '1', 'Good', NULL),
  ('37', '7', '3', '1', 'Good', NULL),
  ('38', '7', '4', '1', 'Good', NULL),
  ('39', '8', '1', '1', 'Good', NULL),
  ('40', '8', '2', '1', 'Good', NULL),
  ('41', '8', '3', '1', 'Good', NULL),
  ('42', '8', '4', '1', 'Good', NULL),
  ('43', '8', '5', '1', 'Good', NULL),
  ('44', '8', '6', '1', 'Good', NULL),
  ('45', '8', '7', '1', 'Good', NULL),
  ('46', '8', '8', '1', 'Good', NULL),
  ('47', '9', '1', '1', 'Good', NULL),
  ('48', '9', '2', '1', 'Good', NULL),
  ('49', '9', '3', '1', 'Good', NULL),
  ('50', '9', '4', '1', 'Good', NULL),
  ('51', '10', '1', '1', 'Good', NULL),
  ('52', '10', '2', '1', 'Good', NULL),
  ('53', '10', '3', '1', 'Fair', 'Surface scratch'),
  ('54', '10', '4', '1', 'Good', NULL),
  ('55', '11', '1', '1', 'Good', NULL),
  ('56', '11', '2', '1', 'Good', NULL),
  ('57', '11', '3', '1', 'Good', NULL),
  ('58', '11', '4', '1', 'Fair', 'Remote control missing'),
  ('59', '12', '1', '1', 'Good', NULL),
  ('60', '12', '2', '1', 'Good', NULL),
  ('61', '12', '3', '1', 'Good', NULL),
  ('62', '12', '4', '1', 'Good', NULL),
  ('63', '12', '5', '1', 'Good', NULL),
  ('64', '12', '6', '1', 'Good', NULL),
  ('65', '13', '1', '1', 'Good', NULL),
  ('66', '13', '2', '1', 'Good', NULL),
  ('67', '13', '3', '1', 'Good', NULL),
  ('68', '13', '4', '1', 'Good', NULL),
  ('69', '14', '1', '1', 'Good', NULL),
  ('70', '14', '2', '1', 'Good', NULL),
  ('71', '14', '3', '1', 'Good', NULL),
  ('72', '14', '4', '1', 'Good', NULL),
  ('73', '14', '5', '1', 'Good', NULL),
  ('74', '14', '6', '1', 'Good', NULL),
  ('75', '14', '7', '1', 'Good', NULL),
  ('76', '14', '8', '1', 'Good', NULL),
  ('77', '15', '1', '1', 'Good', NULL),
  ('78', '15', '2', '1', 'Good', NULL),
  ('79', '15', '3', '1', 'Good', NULL),
  ('80', '15', '4', '1', 'Good', NULL),
  ('81', '15', '5', '1', 'Good', NULL),
  ('82', '15', '6', '1', 'Good', NULL);

-- maintenance_ticket (15 rows)
INSERT INTO maintenance_ticket (ticket_no, request_date, tenant_id, room_no, issue_type, priority_level, description, estimated_cost, actual_cost, technician_staff_id, status, completion_date, created_at) VALUES
  ('1', '2026-01-05', '1', '101', 'Plumbing', 'High', 'Water pipe leak under bathroom sink', '1000', 1200, 2, 'Completed', '2026-01-07', '2026-01-05 09:30:00+00'),
  ('2', '2026-01-12', '3', '201', 'Electrical', 'Urgent', 'Power outlet sparking in living room', '1500', NULL, 3, 'In Progress', NULL, '2026-01-12 09:30:00+00'),
  ('3', '2026-01-20', '2', '102', 'Furniture', 'Low', 'Wardrobe door hinge broken', '300', NULL, NULL, 'Pending', NULL, '2026-01-20 09:30:00+00'),
  ('4', '2026-01-28', '9', '302', 'Plumbing', 'Medium', 'Low water pressure in bathroom', '500', NULL, 2, 'In Progress', NULL, '2026-01-28 09:30:00+00'),
  ('5', '2026-02-03', '5', '301', 'Other', 'Medium', 'Window lock not functioning', '400', NULL, NULL, 'Pending', NULL, '2026-02-03 09:30:00+00'),
  ('6', '2026-02-08', '7', '203', 'Electrical', 'High', 'Air conditioner not cooling properly', '2000', 3500, 3, 'Completed', '2026-02-12', '2026-02-08 09:30:00+00'),
  ('7', '2026-02-15', '8', '104', 'Furniture', 'Low', 'Study desk drawer stuck', '200', 500, 5, 'Completed', '2026-02-17', '2026-02-15 09:30:00+00'),
  ('8', '2026-02-20', '10', '401', 'Plumbing', 'High', 'Toilet cistern overflow', '800', NULL, 2, 'In Progress', NULL, '2026-02-20 09:30:00+00'),
  ('9', '2026-03-05', '6', '202', 'Other', 'Low', 'Main door squeaking loudly', '150', 800, 5, 'Completed', '2026-03-06', '2026-03-05 09:30:00+00'),
  ('10', '2026-03-10', '4', '103', 'Electrical', 'Medium', 'Bathroom exhaust fan not working', '600', NULL, 3, 'Pending', NULL, '2026-03-10 09:30:00+00'),
  ('11', '2026-03-12', '1', '101', 'Plumbing', 'Low', 'Kitchen tap dripping continuously', '300', 350, 2, 'Completed', '2026-03-13', '2026-03-12 09:30:00+00'),
  ('12', '2026-03-14', '9', '302', 'Furniture', 'Medium', 'Sofa cushion torn and spring broken', '800', NULL, 5, 'Pending', NULL, '2026-03-14 09:30:00+00'),
  ('13', '2026-03-16', '3', '201', 'Electrical', 'High', 'Main circuit breaker tripping repeatedly', '2500', 2800, 3, 'Completed', '2026-03-18', '2026-03-16 09:30:00+00'),
  ('14', '2026-03-18', '6', '202', 'Plumbing', 'Urgent', 'Bathroom floor drain severely blocked', '1200', NULL, 2, 'In Progress', NULL, '2026-03-18 09:30:00+00'),
  ('15', '2026-03-20', '5', '301', 'Other', 'Low', 'Hallway ceiling light flickering', '200', 200, 5, 'Completed', '2026-03-21', '2026-03-20 09:30:00+00');

-- monthly_billing (29 rows)
INSERT INTO monthly_billing (bill_no, bill_date, billing_month, tenant_id, room_no, due_date, total_bill_amount, total_paid, balance_due, status, created_at) VALUES
  ('1', '2026-01-03', '2026-01', '1', '101', '2026-01-10', '5760', '5760', 0, 'Fully Paid', '2026-01-03 08:00:00+00'),
  ('2', '2026-01-03', '2026-01', '2', '102', '2026-01-10', '5680', '2000', 3680, 'Partially Paid', '2026-01-03 08:00:00+00'),
  ('3', '2026-01-03', '2026-01', '3', '201', '2026-01-10', '7560', '0', 7560, 'Unpaid', '2026-01-03 08:00:00+00'),
  ('4', '2026-01-03', '2026-01', '6', '202', '2026-01-10', '7410', '7410', 0, 'Fully Paid', '2026-01-03 08:00:00+00'),
  ('5', '2026-01-03', '2026-01', '7', '203', '2026-01-20', '7410', '3000', 4410, 'Partially Paid', '2026-01-03 08:00:00+00'),
  ('6', '2026-01-03', '2026-01', '9', '302', '2026-01-10', '10360', '10360', 0, 'Fully Paid', '2026-01-03 08:00:00+00'),
  ('7', '2026-02-03', '2026-02', '1', '101', '2026-02-10', '5690', '5690', 0, 'Fully Paid', '2026-02-03 08:00:00+00'),
  ('8', '2026-02-03', '2026-02', '2', '102', '2026-02-10', '5610', '5610', 0, 'Fully Paid', '2026-02-03 08:00:00+00'),
  ('9', '2026-02-03', '2026-02', '3', '201', '2026-02-10', '7990', '0', 7990, 'Unpaid', '2026-02-03 08:00:00+00'),
  ('10', '2026-02-03', '2026-02', '6', '202', '2026-02-10', '7410', '7410', 0, 'Fully Paid', '2026-02-03 08:00:00+00'),
  ('11', '2026-02-03', '2026-02', '7', '203', '2026-02-10', '7910', '3000', 4910, 'Partially Paid', '2026-02-03 08:00:00+00'),
  ('12', '2026-02-03', '2026-02', '9', '302', '2026-02-10', '13560', '13560', 0, 'Fully Paid', '2026-02-03 08:00:00+00'),
  ('13', '2026-02-03', '2026-02', '5', '301', '2026-02-10', '10510', '10510', 0, 'Fully Paid', '2026-02-03 08:00:00+00'),
  ('14', '2026-02-17', '2026-02', '8', '104', '2026-02-28', '5610', '0', 5610, 'Unpaid', '2026-02-17 08:00:00+00'),
  ('15', '2026-02-03', '2026-02', '10', '401', '2026-02-10', '5610', '5610', 0, 'Fully Paid', '2026-02-03 08:00:00+00'),
  ('16', '2026-03-03', '2026-03', '1', '101', '2026-03-10', '5760', '5760', 0, 'Fully Paid', '2026-03-03 08:00:00+00'),
  ('17', '2026-03-03', '2026-03', '2', '102', '2026-03-10', '5680', '0', 5680, 'Unpaid', '2026-03-03 08:00:00+00'),
  ('18', '2026-03-03', '2026-03', '3', '201', '2026-03-10', '8060', '0', 8060, 'Unpaid', '2026-03-03 08:00:00+00'),
  ('19', '2026-03-03', '2026-03', '6', '202', '2026-03-10', '7410', '7410', 0, 'Fully Paid', '2026-03-03 08:00:00+00'),
  ('20', '2026-03-03', '2026-03', '7', '203', '2026-03-10', '7410', '3000', 4410, 'Partially Paid', '2026-03-03 08:00:00+00'),
  ('21', '2026-03-03', '2026-03', '9', '302', '2026-03-10', '10360', '10360', 0, 'Fully Paid', '2026-03-03 08:00:00+00'),
  ('22', '2026-03-03', '2026-03', '5', '301', '2026-03-10', '13710', '13710', 0, 'Fully Paid', '2026-03-03 08:00:00+00'),
  ('23', '2026-03-03', '2026-03', '8', '104', '2026-03-31', '5610', '0', 5610, 'Unpaid', '2026-03-03 08:00:00+00'),
  ('24', '2026-03-03', '2026-03', '10', '401', '2026-03-10', '5610', '2000', 3610, 'Partially Paid', '2026-03-03 08:00:00+00'),
  ('25', '2026-03-03', '2026-03', '4', '103', '2026-03-10', '5690', '0', 5690, 'Unpaid', '2026-03-03 08:00:00+00'),
  ('26', '2026-03-10', '2026-03', '12', '204', '2026-03-20', '7410', '7410', 0, 'Fully Paid', '2026-03-10 08:00:00+00'),
  ('27', '2026-03-10', '2026-03', '13', '105', '2026-03-20', '5760', '0', 5760, 'Unpaid', '2026-03-10 08:00:00+00'),
  ('28', '2026-03-15', '2026-03', '14', '303', '2026-03-25', '10360', '10360', 0, 'Fully Paid', '2026-03-15 08:00:00+00'),
  ('29', '2026-03-20', '2026-03', '15', '205', '2026-03-31', '7410', '0', 7410, 'Unpaid', '2026-03-20 08:00:00+00');

-- monthly_bill_line (121 rows)
INSERT INTO monthly_bill_line (bill_line_id, bill_no, product_code, description, quantity, unit_price, amount, notes) VALUES
  ('1', '1', 'RENT01', 'Monthly Rent 2026-01', '1', 4500, '4500', NULL),
  ('2', '1', 'ELEC01', 'Electricity 120 units', '120', '3.5', '420', 'Meter 1100→1220'),
  ('3', '1', 'WATER01', 'Water 5 units', '5', 80, '400', NULL),
  ('4', '1', 'INET01', 'Internet (Fixed Monthly)', '1', 440, '440', NULL),
  ('5', '2', 'RENT01', 'Monthly Rent 2026-01', '1', 4500, '4500', NULL),
  ('6', '2', 'ELEC01', 'Electricity 120 units', '120', '3.5', '420', 'Meter 800→920'),
  ('7', '2', 'WATER01', 'Water 4 units', '4', 80, '320', NULL),
  ('8', '2', 'INET01', 'Internet (Fixed Monthly)', '1', 440, '440', NULL),
  ('9', '3', 'RENT01', 'Monthly Rent 2026-01', '1', 6000, '6000', NULL),
  ('10', '3', 'ELEC01', 'Electricity 160 units', '160', '3.5', '560', 'Meter 2000→2160'),
  ('11', '3', 'WATER01', 'Water 7 units', '7', 80, '560', NULL),
  ('12', '3', 'INET01', 'Internet (Fixed Monthly)', '1', 440, '440', NULL),
  ('13', '4', 'RENT01', 'Monthly Rent 2026-01', '1', 6000, '6000', NULL),
  ('14', '4', 'ELEC01', 'Electricity 140 units', '140', '3.5', '490', 'Meter 1500→1640'),
  ('15', '4', 'WATER01', 'Water 6 units', '6', 80, '480', NULL),
  ('16', '4', 'INET01', 'Internet (Fixed Monthly)', '1', 440, '440', NULL),
  ('17', '5', 'RENT01', 'Monthly Rent 2026-01', '1', 6000, '6000', NULL),
  ('18', '5', 'ELEC01', 'Electricity 140 units', '140', '3.5', '490', 'Meter 1200→1340'),
  ('19', '5', 'WATER01', 'Water 6 units', '6', 80, '480', NULL),
  ('20', '5', 'INET01', 'Internet (Fixed Monthly)', '1', 440, '440', NULL),
  ('21', '6', 'RENT01', 'Monthly Rent 2026-01', '1', 8500, '8500', NULL),
  ('22', '6', 'ELEC01', 'Electricity 200 units', '200', '3.5', '700', 'Meter 3000→3200'),
  ('23', '6', 'WATER01', 'Water 9 units', '9', 80, '720', NULL),
  ('24', '6', 'INET01', 'Internet (Fixed Monthly)', '1', 440, '440', NULL),
  ('25', '7', 'RENT01', 'Monthly Rent 2026-02', '1', 4500, '4500', NULL),
  ('26', '7', 'ELEC01', 'Electricity 100 units', '100', '3.5', '350', 'Meter 1220→1320'),
  ('27', '7', 'WATER01', 'Water 5 units', '5', 80, '400', NULL),
  ('28', '7', 'INET01', 'Internet (Fixed Monthly)', '1', 440, '440', NULL),
  ('29', '8', 'RENT01', 'Monthly Rent 2026-02', '1', 4500, '4500', NULL),
  ('30', '8', 'ELEC01', 'Electricity 100 units', '100', '3.5', '350', 'Meter 920→1020'),
  ('31', '8', 'WATER01', 'Water 4 units', '4', 80, '320', NULL),
  ('32', '8', 'INET01', 'Internet (Fixed Monthly)', '1', 440, '440', NULL),
  ('33', '9', 'RENT01', 'Monthly Rent 2026-02', '1', 6000, '6000', NULL),
  ('34', '9', 'ELEC01', 'Electricity 140 units', '140', '3.5', '490', 'Meter 2160→2300'),
  ('35', '9', 'WATER01', 'Water 7 units', '7', 80, '560', NULL),
  ('36', '9', 'INET01', 'Internet (Fixed Monthly)', '1', 440, '440', NULL),
  ('37', '9', 'FINE01', 'Late Payment Fine', '1', 500, '500', 'Overdue from 2026-01'),
  ('38', '10', 'RENT01', 'Monthly Rent 2026-02', '1', 6000, '6000', NULL),
  ('39', '10', 'ELEC01', 'Electricity 140 units', '140', '3.5', '490', 'Meter 1640→1780'),
  ('40', '10', 'WATER01', 'Water 6 units', '6', 80, '480', NULL),
  ('41', '10', 'INET01', 'Internet (Fixed Monthly)', '1', 440, '440', NULL),
  ('42', '11', 'RENT01', 'Monthly Rent 2026-02', '1', 6000, '6000', NULL),
  ('43', '11', 'ELEC01', 'Electricity 140 units', '140', '3.5', '490', 'Meter 1340→1480'),
  ('44', '11', 'WATER01', 'Water 6 units', '6', 80, '480', NULL),
  ('45', '11', 'INET01', 'Internet (Fixed Monthly)', '1', 440, '440', NULL),
  ('46', '11', 'FINE01', 'Late Payment Fine', '1', 500, '500', 'Overdue from 2026-01'),
  ('47', '12', 'RENT01', 'Monthly Rent 2026-02', '1', 8500, '8500', NULL),
  ('48', '12', 'ELEC01', 'Electricity 200 units', '200', '3.5', '700', 'Meter 3200→3400'),
  ('49', '12', 'WATER01', 'Water 9 units', '9', 80, '720', NULL),
  ('50', '12', 'INET01', 'Internet (Fixed Monthly)', '1', 440, '440', NULL),
  ('51', '12', 'MAINT01', 'Maintenance / Repair Charge', '1', 3200, '3200', 'Scheduled repair work'),
  ('52', '13', 'RENT01', 'Monthly Rent 2026-02', '1', 8500, '8500', NULL),
  ('53', '13', 'ELEC01', 'Electricity 220 units', '220', '3.5', '770', 'Meter 4000→4220'),
  ('54', '13', 'WATER01', 'Water 10 units', '10', 80, '800', NULL),
  ('55', '13', 'INET01', 'Internet (Fixed Monthly)', '1', 440, '440', NULL),
  ('56', '14', 'RENT01', 'Monthly Rent 2026-02', '1', 4500, '4500', NULL),
  ('57', '14', 'ELEC01', 'Electricity 100 units', '100', '3.5', '350', 'Meter 0→100'),
  ('58', '14', 'WATER01', 'Water 4 units', '4', 80, '320', NULL),
  ('59', '14', 'INET01', 'Internet (Fixed Monthly)', '1', 440, '440', NULL),
  ('60', '15', 'RENT01', 'Monthly Rent 2026-02', '1', 4500, '4500', NULL),
  ('61', '15', 'ELEC01', 'Electricity 100 units', '100', '3.5', '350', 'Meter 500→600'),
  ('62', '15', 'WATER01', 'Water 4 units', '4', 80, '320', NULL),
  ('63', '15', 'INET01', 'Internet (Fixed Monthly)', '1', 440, '440', NULL),
  ('64', '16', 'RENT01', 'Monthly Rent 2026-03', '1', 4500, '4500', NULL),
  ('65', '16', 'ELEC01', 'Electricity 120 units', '120', '3.5', '420', 'Meter 1320→1440'),
  ('66', '16', 'WATER01', 'Water 5 units', '5', 80, '400', NULL),
  ('67', '16', 'INET01', 'Internet (Fixed Monthly)', '1', 440, '440', NULL),
  ('68', '17', 'RENT01', 'Monthly Rent 2026-03', '1', 4500, '4500', NULL),
  ('69', '17', 'ELEC01', 'Electricity 120 units', '120', '3.5', '420', 'Meter 1020→1140'),
  ('70', '17', 'WATER01', 'Water 4 units', '4', 80, '320', NULL),
  ('71', '17', 'INET01', 'Internet (Fixed Monthly)', '1', 440, '440', NULL),
  ('72', '18', 'RENT01', 'Monthly Rent 2026-03', '1', 6000, '6000', NULL),
  ('73', '18', 'ELEC01', 'Electricity 160 units', '160', '3.5', '560', 'Meter 2300→2460'),
  ('74', '18', 'WATER01', 'Water 7 units', '7', 80, '560', NULL),
  ('75', '18', 'INET01', 'Internet (Fixed Monthly)', '1', 440, '440', NULL),
  ('76', '18', 'FINE01', 'Late Payment Fine', '1', 500, '500', 'Overdue from 2026-01 and 2026-02'),
  ('77', '19', 'RENT01', 'Monthly Rent 2026-03', '1', 6000, '6000', NULL),
  ('78', '19', 'ELEC01', 'Electricity 140 units', '140', '3.5', '490', 'Meter 1780→1920'),
  ('79', '19', 'WATER01', 'Water 6 units', '6', 80, '480', NULL),
  ('80', '19', 'INET01', 'Internet (Fixed Monthly)', '1', 440, '440', NULL),
  ('81', '20', 'RENT01', 'Monthly Rent 2026-03', '1', 6000, '6000', NULL),
  ('82', '20', 'ELEC01', 'Electricity 140 units', '140', '3.5', '490', 'Meter 1480→1620'),
  ('83', '20', 'WATER01', 'Water 6 units', '6', 80, '480', NULL),
  ('84', '20', 'INET01', 'Internet (Fixed Monthly)', '1', 440, '440', NULL),
  ('85', '21', 'RENT01', 'Monthly Rent 2026-03', '1', 8500, '8500', NULL),
  ('86', '21', 'ELEC01', 'Electricity 200 units', '200', '3.5', '700', 'Meter 3400→3600'),
  ('87', '21', 'WATER01', 'Water 9 units', '9', 80, '720', NULL),
  ('88', '21', 'INET01', 'Internet (Fixed Monthly)', '1', 440, '440', NULL),
  ('89', '22', 'RENT01', 'Monthly Rent 2026-03', '1', 8500, '8500', NULL),
  ('90', '22', 'ELEC01', 'Electricity 220 units', '220', '3.5', '770', 'Meter 4220→4440'),
  ('91', '22', 'WATER01', 'Water 10 units', '10', 80, '800', NULL),
  ('92', '22', 'INET01', 'Internet (Fixed Monthly)', '1', 440, '440', NULL),
  ('93', '22', 'MAINT01', 'Maintenance / Repair Charge', '1', 3200, '3200', 'Scheduled repair work'),
  ('94', '23', 'RENT01', 'Monthly Rent 2026-03', '1', 4500, '4500', NULL),
  ('95', '23', 'ELEC01', 'Electricity 100 units', '100', '3.5', '350', 'Meter 100→200'),
  ('96', '23', 'WATER01', 'Water 4 units', '4', 80, '320', NULL),
  ('97', '23', 'INET01', 'Internet (Fixed Monthly)', '1', 440, '440', NULL),
  ('98', '24', 'RENT01', 'Monthly Rent 2026-03', '1', 4500, '4500', NULL),
  ('99', '24', 'ELEC01', 'Electricity 100 units', '100', '3.5', '350', 'Meter 600→700'),
  ('100', '24', 'WATER01', 'Water 4 units', '4', 80, '320', NULL),
  ('101', '24', 'INET01', 'Internet (Fixed Monthly)', '1', 440, '440', NULL),
  ('102', '25', 'RENT01', 'Monthly Rent 2026-03', '1', 4500, '4500', NULL),
  ('103', '25', 'ELEC01', 'Electricity 100 units', '100', '3.5', '350', 'Meter 0→100'),
  ('104', '25', 'WATER01', 'Water 5 units', '5', 80, '400', NULL),
  ('105', '25', 'INET01', 'Internet (Fixed Monthly)', '1', 440, '440', NULL),
  ('106', '26', 'RENT01', 'Monthly Rent 2026-03', '1', 6000, '6000', NULL),
  ('107', '26', 'ELEC01', 'Electricity 140 units', '140', '3.5', '490', 'Meter 0→140'),
  ('108', '26', 'WATER01', 'Water 6 units', '6', 80, '480', NULL),
  ('109', '26', 'INET01', 'Internet (Fixed Monthly)', '1', 440, '440', NULL),
  ('110', '27', 'RENT01', 'Monthly Rent 2026-03', '1', 4500, '4500', NULL),
  ('111', '27', 'ELEC01', 'Electricity 120 units', '120', '3.5', '420', 'Meter 0→120'),
  ('112', '27', 'WATER01', 'Water 5 units', '5', 80, '400', NULL),
  ('113', '27', 'INET01', 'Internet (Fixed Monthly)', '1', 440, '440', NULL),
  ('114', '28', 'RENT01', 'Monthly Rent 2026-03', '1', 8500, '8500', NULL),
  ('115', '28', 'ELEC01', 'Electricity 200 units', '200', '3.5', '700', 'Meter 0→200'),
  ('116', '28', 'WATER01', 'Water 9 units', '9', 80, '720', NULL),
  ('117', '28', 'INET01', 'Internet (Fixed Monthly)', '1', 440, '440', NULL),
  ('118', '29', 'RENT01', 'Monthly Rent 2026-03', '1', 6000, '6000', NULL),
  ('119', '29', 'ELEC01', 'Electricity 140 units', '140', '3.5', '490', 'Meter 0→140'),
  ('120', '29', 'WATER01', 'Water 6 units', '6', 80, '480', NULL),
  ('121', '29', 'INET01', 'Internet (Fixed Monthly)', '1', 440, '440', NULL);

-- payment_receipt (20 rows)
INSERT INTO payment_receipt (receipt_no, receipt_date, tenant_id, room_no, payment_method, reference_number, total_paid, created_at) VALUES
  ('1', '2026-01-08', '1', '101', 'Transfer', 'TXN-2501-001', '5760', '2026-01-08 10:00:00+00'),
  ('2', '2026-01-09', '2', '102', 'Cash', NULL, '2000', '2026-01-09 10:00:00+00'),
  ('3', '2026-01-10', '6', '202', 'Transfer', 'TXN-2501-002', '7410', '2026-01-10 10:00:00+00'),
  ('4', '2026-01-11', '9', '302', 'Card', 'CARD-2501-001', '10360', '2026-01-11 10:00:00+00'),
  ('5', '2026-01-22', '7', '203', 'Cash', NULL, '3000', '2026-01-22 10:00:00+00'),
  ('6', '2026-02-05', '1', '101', 'Transfer', 'TXN-2502-001', '5690', '2026-02-05 10:00:00+00'),
  ('7', '2026-02-06', '2', '102', 'Transfer', 'TXN-2502-002', '5610', '2026-02-06 10:00:00+00'),
  ('8', '2026-02-07', '6', '202', 'Transfer', 'TXN-2502-003', '7410', '2026-02-07 10:00:00+00'),
  ('9', '2026-02-08', '9', '302', 'Card', 'CARD-2502-001', '13560', '2026-02-08 10:00:00+00'),
  ('10', '2026-02-10', '5', '301', 'Transfer', 'TXN-2502-004', '10510', '2026-02-10 10:00:00+00'),
  ('11', '2026-02-12', '10', '401', 'Transfer', 'TXN-2502-005', '5610', '2026-02-12 10:00:00+00'),
  ('12', '2026-02-15', '7', '203', 'Cash', NULL, '3000', '2026-02-15 10:00:00+00'),
  ('13', '2026-03-05', '1', '101', 'Transfer', 'TXN-2503-001', '5760', '2026-03-05 10:00:00+00'),
  ('14', '2026-03-07', '6', '202', 'Transfer', 'TXN-2503-002', '7410', '2026-03-07 10:00:00+00'),
  ('15', '2026-03-08', '9', '302', 'Card', 'CARD-2503-001', '10360', '2026-03-08 10:00:00+00'),
  ('16', '2026-03-10', '5', '301', 'Transfer', 'TXN-2503-003', '13710', '2026-03-10 10:00:00+00'),
  ('17', '2026-03-12', '7', '203', 'Cash', NULL, '3000', '2026-03-12 10:00:00+00'),
  ('18', '2026-03-14', '10', '401', 'Cash', NULL, '2000', '2026-03-14 10:00:00+00'),
  ('19', '2026-03-16', '12', '204', 'Transfer', 'TXN-2503-004', '7410', '2026-03-16 10:00:00+00'),
  ('20', '2026-03-20', '14', '303', 'Card', 'CARD-2503-002', '10360', '2026-03-20 10:00:00+00');

-- payments_item (20 rows)
INSERT INTO payments_item (payments_item_id, receipt_no, bill_no, amount_paid, notes) VALUES
  ('1', '1', '1', '5760', NULL),
  ('2', '2', '2', '2000', 'Partial payment'),
  ('3', '3', '4', '7410', NULL),
  ('4', '4', '6', '10360', NULL),
  ('5', '5', '5', '3000', 'Partial payment'),
  ('6', '6', '7', '5690', NULL),
  ('7', '7', '8', '5610', NULL),
  ('8', '8', '10', '7410', NULL),
  ('9', '9', '12', '13560', NULL),
  ('10', '10', '13', '10510', NULL),
  ('11', '11', '15', '5610', NULL),
  ('12', '12', '11', '3000', 'Partial payment'),
  ('13', '13', '16', '5760', NULL),
  ('14', '14', '19', '7410', NULL),
  ('15', '15', '21', '10360', NULL),
  ('16', '16', '22', '13710', NULL),
  ('17', '17', '20', '3000', 'Partial payment'),
  ('18', '18', '24', '2000', 'Partial payment'),
  ('19', '19', '26', '7410', NULL),
  ('20', '20', '28', '10360', NULL);

-- expense (15 rows)
INSERT INTO expense (expense_no, expense_date, supplier_id, expense_category, total_expense, created_at) VALUES
  ('1', '2026-01-03', '1', 'Maintenance', '3200', '2026-01-03 11:00:00+00'),
  ('2', '2026-01-20', '1', 'Maintenance', '2800', '2026-01-20 11:00:00+00'),
  ('3', '2026-01-10', '2', 'Cleaning', '1800', '2026-01-10 11:00:00+00'),
  ('4', '2026-01-15', '5', 'Electrical', '3200', '2026-01-15 11:00:00+00'),
  ('5', '2026-01-25', '3', 'Office Supplies', '950', '2026-01-25 11:00:00+00'),
  ('6', '2026-02-05', '1', 'Maintenance', '5600', '2026-02-05 11:00:00+00'),
  ('7', '2026-02-12', '2', 'Cleaning', '1800', '2026-02-12 11:00:00+00'),
  ('8', '2026-02-18', '1', 'Maintenance', '4200', '2026-02-18 11:00:00+00'),
  ('9', '2026-02-20', '4', 'Landscaping', '4500', '2026-02-20 11:00:00+00'),
  ('10', '2026-02-28', '3', 'Office Supplies', '950', '2026-02-28 11:00:00+00'),
  ('11', '2026-03-01', '5', 'Electrical', '5000', '2026-03-01 11:00:00+00'),
  ('12', '2026-03-06', '1', 'Maintenance', '3600', '2026-03-06 11:00:00+00'),
  ('13', '2026-03-14', '2', 'Cleaning', '1800', '2026-03-14 11:00:00+00'),
  ('14', '2026-03-20', '1', 'Maintenance', '3000', '2026-03-20 11:00:00+00'),
  ('15', '2026-03-25', '4', 'Landscaping', '2800', '2026-03-25 11:00:00+00');

-- expense_line (51 rows)
INSERT INTO expense_line (expense_line_id, expense_no, item_name, quantity, unit_price, extended_price) VALUES
  ('1', '1', 'PVC Pipe 1 inch', '5', '120', '600'),
  ('2', '1', 'Pipe Fittings Set', '2', '350', '700'),
  ('3', '1', 'Labour – Plumber', '1', '1900', '1900'),
  ('4', '2', 'Pipe Repair Kit', '2', '300', '600'),
  ('5', '2', 'Silicone Sealant', '4', '50', '200'),
  ('6', '2', 'Labour – Plumber', '1', '2000', '2000'),
  ('7', '3', 'Cleaning Solution', '5', '100', '500'),
  ('8', '3', 'Mop & Bucket Set', '3', '120', '360'),
  ('9', '3', 'Labour – Cleaner', '1', '940', '940'),
  ('10', '4', 'LED Light Bulb 18W', '10', '80', '800'),
  ('11', '4', 'Electrical Switch Set', '5', '120', '600'),
  ('12', '4', 'Labour – Electrician', '1', '1800', '1800'),
  ('13', '5', 'A4 Paper Ream', '5', '90', '450'),
  ('14', '5', 'Ballpoint Pens Box', '2', '80', '160'),
  ('15', '5', 'File Folders', '4', '30', '120'),
  ('16', '5', 'Stapler', '1', '220', '220'),
  ('17', '6', 'Wall Paint – White', '10', '180', '1800'),
  ('18', '6', 'Roller Brush Set', '3', '120', '360'),
  ('19', '6', 'Labour – Painter', '2', '1200', '2400'),
  ('20', '6', 'Masking Tape', '6', '40', '240'),
  ('21', '6', 'Primer', '2', '400', '800'),
  ('22', '7', 'Disinfectant', '4', '120', '480'),
  ('23', '7', 'Microfiber Cloths Pack', '3', '80', '240'),
  ('24', '7', 'Labour – Cleaner', '1', '1080', '1080'),
  ('25', '8', 'Door Lock Set', '2', '350', '700'),
  ('26', '8', 'Door Handle', '3', '280', '840'),
  ('27', '8', 'Labour – Carpenter', '1', '2000', '2000'),
  ('28', '8', 'Hinge Set', '4', '80', '320'),
  ('29', '8', 'Wood Filler', '5', '68', '340'),
  ('30', '9', 'Garden Soil', '10', '80', '800'),
  ('31', '9', 'Fertilizer', '5', '100', '500'),
  ('32', '9', 'Labour – Gardener', '2', '1200', '2400'),
  ('33', '9', 'Plant Seeds Mix', '1', '800', '800'),
  ('34', '10', 'A4 Paper Ream', '3', '90', '270'),
  ('35', '10', 'Ink Cartridge', '2', '280', '560'),
  ('36', '10', 'Correction Fluid', '4', '30', '120'),
  ('37', '11', 'CCTV Camera', '2', '1200', '2400'),
  ('38', '11', 'Cable UTP Cat6 (m)', '100', '12', '1200'),
  ('39', '11', 'Labour – Electrician', '1', '1400', '1400'),
  ('40', '12', 'Ceramic Tiles', '10', '150', '1500'),
  ('41', '12', 'Tile Adhesive', '3', '180', '540'),
  ('42', '12', 'Labour – Tiler', '1', '1560', '1560'),
  ('43', '13', 'Cleaning Solution', '5', '100', '500'),
  ('44', '13', 'Trash Bags Box', '2', '150', '300'),
  ('45', '13', 'Labour – Cleaner', '1', '1000', '1000'),
  ('46', '14', 'PVC Pipe 3/4 inch', '5', '80', '400'),
  ('47', '14', 'Faucet Set', '2', '450', '900'),
  ('48', '14', 'Labour – Plumber', '1', '1700', '1700'),
  ('49', '15', 'Lawn Grass Seed', '5', '120', '600'),
  ('50', '15', 'Garden Hose (m)', '20', '40', '800'),
  ('51', '15', 'Labour – Gardener', '2', '700', '1400');

-- inspection (15 rows)
INSERT INTO inspection (inspection_no, inspection_date, tenant_id, room_no, inspector_staff_id, result, total_fines, created_at) VALUES
  ('1', '2026-01-15', '1', '101', '4', 'Pass', 0, '2026-01-15 14:00:00+00'),
  ('2', '2026-02-28', '2', '102', '1', 'Fail', 800, '2026-02-28 14:00:00+00'),
  ('3', '2026-03-10', '6', '202', '4', 'Pass', 0, '2026-03-10 14:00:00+00'),
  ('4', '2026-03-15', '5', '301', '1', 'Pass', 0, '2026-03-15 14:00:00+00'),
  ('5', '2026-01-31', '3', '201', '4', 'Pass', 0, '2026-01-31 14:00:00+00'),
  ('6', '2026-02-14', '7', '203', '1', 'Fail', 1200, '2026-02-14 14:00:00+00'),
  ('7', '2026-02-20', '9', '302', '4', 'Pass', 0, '2026-02-20 14:00:00+00'),
  ('8', '2026-03-01', '10', '401', '1', 'Pass', 0, '2026-03-01 14:00:00+00'),
  ('9', '2026-03-05', '8', '104', '4', 'Fail', 500, '2026-03-05 14:00:00+00'),
  ('10', '2026-03-08', '1', '101', '1', 'Pass', 0, '2026-03-08 14:00:00+00'),
  ('11', '2026-03-12', '2', '102', '4', 'Pass', 0, '2026-03-12 14:00:00+00'),
  ('12', '2026-03-18', '4', '103', '1', 'Pass', 0, '2026-03-18 14:00:00+00'),
  ('13', '2026-03-20', '9', '302', '4', 'Fail', 700, '2026-03-20 14:00:00+00'),
  ('14', '2026-03-22', '6', '202', '1', 'Pass', 0, '2026-03-22 14:00:00+00'),
  ('15', '2026-03-25', '5', '301', '4', 'Pass', 0, '2026-03-25 14:00:00+00');

-- inspection_line (84 rows)
INSERT INTO inspection_line (inspection_line_id, inspection_no, item_checked, condition, fine_amount, notes) VALUES
  ('1', '1', 'Bed Frame', 'Good', '0', NULL),
  ('2', '1', 'Study Desk', 'Good', '0', NULL),
  ('3', '1', 'Wardrobe', 'Fair', '0', 'Minor scuff on surface'),
  ('4', '1', 'Air Conditioner', 'Good', '0', NULL),
  ('5', '1', 'Wall Paint', 'Good', '0', NULL),
  ('6', '1', 'Bathroom Fixtures', 'Good', '0', NULL),
  ('7', '2', 'Bed Frame', 'Good', '0', NULL),
  ('8', '2', 'Study Desk', 'Good', '0', NULL),
  ('9', '2', 'Wardrobe', 'Damaged', '500', 'Door panel cracked'),
  ('10', '2', 'Air Conditioner', 'Good', '0', NULL),
  ('11', '2', 'Wall Paint', 'Damaged', '300', 'Stains on wall near window'),
  ('12', '2', 'Bathroom Fixtures', 'Good', '0', NULL),
  ('13', '3', 'Bed Frame', 'Good', '0', NULL),
  ('14', '3', 'Study Desk', 'Fair', '0', 'Surface scratch – pre-existing'),
  ('15', '3', 'Wardrobe', 'Good', '0', NULL),
  ('16', '3', 'Air Conditioner', 'Good', '0', NULL),
  ('17', '3', 'Refrigerator', 'Good', '0', NULL),
  ('18', '3', 'Water Heater', 'Good', '0', NULL),
  ('19', '4', 'Bed Frame', 'Good', '0', NULL),
  ('20', '4', 'Study Desk', 'Good', '0', NULL),
  ('21', '4', 'Wardrobe', 'Good', '0', NULL),
  ('22', '4', 'Air Conditioner', 'Good', '0', NULL),
  ('23', '4', 'Sofa', 'Good', '0', NULL),
  ('24', '4', 'Television', 'Good', '0', NULL),
  ('25', '5', 'Bed Frame', 'Good', '0', NULL),
  ('26', '5', 'Study Desk', 'Good', '0', NULL),
  ('27', '5', 'Wardrobe', 'Good', '0', NULL),
  ('28', '5', 'Air Conditioner', 'Good', '0', NULL),
  ('29', '5', 'Refrigerator', 'Good', '0', NULL),
  ('30', '5', 'Water Heater', 'Good', '0', NULL),
  ('31', '6', 'Bed Frame', 'Good', '0', NULL),
  ('32', '6', 'Study Desk', 'Damaged', '500', 'Deep scratch on surface'),
  ('33', '6', 'Wardrobe', 'Good', '0', NULL),
  ('34', '6', 'Air Conditioner', 'Good', '0', NULL),
  ('35', '6', 'Refrigerator', 'Damaged', '700', 'Broken shelf inside'),
  ('36', '6', 'Water Heater', 'Good', '0', NULL),
  ('37', '7', 'Bed Frame', 'Good', '0', NULL),
  ('38', '7', 'Study Desk', 'Good', '0', NULL),
  ('39', '7', 'Wardrobe', 'Good', '0', NULL),
  ('40', '7', 'Air Conditioner', 'Good', '0', NULL),
  ('41', '7', 'Sofa', 'Good', '0', NULL),
  ('42', '7', 'Television', 'Good', '0', NULL),
  ('43', '8', 'Bed Frame', 'Good', '0', NULL),
  ('44', '8', 'Study Desk', 'Good', '0', NULL),
  ('45', '8', 'Wardrobe', 'Good', '0', NULL),
  ('46', '8', 'Air Conditioner', 'Good', '0', NULL),
  ('47', '9', 'Bed Frame', 'Good', '0', NULL),
  ('48', '9', 'Study Desk', 'Good', '0', NULL),
  ('49', '9', 'Wardrobe', 'Fair', '0', 'Handle worn'),
  ('50', '9', 'Air Conditioner', 'Damaged', '500', 'Filter damaged - replacement needed'),
  ('51', '10', 'Bed Frame', 'Good', '0', NULL),
  ('52', '10', 'Study Desk', 'Good', '0', NULL),
  ('53', '10', 'Wardrobe', 'Good', '0', NULL),
  ('54', '10', 'Air Conditioner', 'Good', '0', NULL),
  ('55', '10', 'Wall Paint', 'Good', '0', NULL),
  ('56', '10', 'Bathroom Fixtures', 'Good', '0', NULL),
  ('57', '11', 'Bed Frame', 'Good', '0', NULL),
  ('58', '11', 'Study Desk', 'Good', '0', NULL),
  ('59', '11', 'Wardrobe', 'Good', '0', NULL),
  ('60', '11', 'Air Conditioner', 'Good', '0', NULL),
  ('61', '11', 'Wall Paint', 'Good', '0', NULL),
  ('62', '11', 'Bathroom Fixtures', 'Good', '0', NULL),
  ('63', '12', 'Bed Frame', 'Good', '0', NULL),
  ('64', '12', 'Study Desk', 'Good', '0', NULL),
  ('65', '12', 'Wardrobe', 'Good', '0', NULL),
  ('66', '12', 'Air Conditioner', 'Good', '0', NULL),
  ('67', '13', 'Bed Frame', 'Fair', '0', 'Slight wobble in frame'),
  ('68', '13', 'Study Desk', 'Good', '0', NULL),
  ('69', '13', 'Wardrobe', 'Damaged', '400', 'Door hinge broken off'),
  ('70', '13', 'Air Conditioner', 'Good', '0', NULL),
  ('71', '13', 'Sofa', 'Damaged', '300', 'Torn fabric on armrest'),
  ('72', '13', 'Television', 'Good', '0', NULL),
  ('73', '14', 'Bed Frame', 'Good', '0', NULL),
  ('74', '14', 'Study Desk', 'Good', '0', NULL),
  ('75', '14', 'Wardrobe', 'Good', '0', NULL),
  ('76', '14', 'Air Conditioner', 'Good', '0', NULL),
  ('77', '14', 'Refrigerator', 'Good', '0', NULL),
  ('78', '14', 'Water Heater', 'Good', '0', NULL),
  ('79', '15', 'Bed Frame', 'Good', '0', NULL),
  ('80', '15', 'Study Desk', 'Good', '0', NULL),
  ('81', '15', 'Wardrobe', 'Good', '0', NULL),
  ('82', '15', 'Air Conditioner', 'Good', '0', NULL),
  ('83', '15', 'Sofa', 'Good', '0', NULL),
  ('84', '15', 'Television', 'Good', '0', NULL);


-- ================================================================
--  HELLE RESIDENCE – ANALYSIS REPORT FUNCTIONS (PostgreSQL)
--  For use in Supabase SQL Editor
--
--  HOW TO USE EACH FUNCTION:
--
--  After running this file once to create the functions,
--  call them like this:
--
--  SELECT * FROM report_rental_income('2026-01-01', '2026-03-31', NULL);
--  SELECT * FROM report_rental_income('2026-01-01', '2026-03-31', 'Standard');
--
--  Pass NULL for optional filters to mean "All"
--  Pass '*' also works for "All" on text filters
-- ================================================================


-- ================================================================
--  1. KULCHAYA — Total Rental Income (by date range)
--
--  Parameters:
--    p_date_start  date    : Bill date from  (required)
--    p_date_end    date    : Bill date to    (required)
--    p_room_type   text    : Room type filter e.g. 'Standard' | NULL = All
--
--  CALL EXAMPLE:
--    SELECT * FROM report_rental_income('2026-01-01', '2026-03-31', NULL);
--    SELECT * FROM report_rental_income('2026-01-01', '2026-03-31', 'Deluxe');
-- ================================================================

CREATE OR REPLACE FUNCTION report_rental_income(
    p_date_start  date,
    p_date_end    date,
    p_room_type   text       -- NULL or '*' = All room types
)
RETURNS TABLE (
    tenant_name         text,
    room_no             text,
    room_type           text,
    months_billed       bigint,
    monthly_rent        numeric,
    total_rental_income numeric,
    pct_of_total        numeric
)
LANGUAGE sql STABLE AS $$

    SELECT tenant_name, room_no, room_type,
           months_billed, monthly_rent, total_rental_income, pct_of_total
    FROM (

        -- Detail rows per tenant
        SELECT
            t.name                              AS tenant_name,
            mb.room_no,
            rt.description                      AS room_type,
            COUNT(DISTINCT mb.bill_no)          AS months_billed,
            rc.monthly_rent,
            SUM(mbl.amount)                     AS total_rental_income,
            ROUND(SUM(mbl.amount) * 100.0
                / SUM(SUM(mbl.amount)) OVER (), 1) AS pct_of_total,
            0                                   AS sort_order,
            t.tenant_id                         AS tenant_id    -- for ordering
        FROM monthly_bill_line  mbl
        JOIN monthly_billing    mb  ON mbl.bill_no      = mb.bill_no
        JOIN product_code       pc  ON mbl.product_code = pc.product_code
        JOIN tenant             t   ON mb.tenant_id     = t.tenant_id
        JOIN room               r   ON mb.room_no       = r.room_no
        JOIN room_type          rt  ON r.room_type_id   = rt.room_type_id
        JOIN rental_contract    rc  ON rc.tenant_id     = mb.tenant_id
                                   AND rc.room_no       = mb.room_no
        WHERE pc.product_type = 'Rent'
          AND mb.bill_date BETWEEN p_date_start AND p_date_end
          AND (
              p_room_type IS NULL
              OR btrim(p_room_type) = ''
              OR p_room_type = '*'
              OR rt.description = p_room_type
          )
        GROUP BY t.tenant_id, t.name, mb.room_no, rt.description, rc.monthly_rent

        UNION ALL

        -- TOTAL row
        SELECT
            'TOTAL', '-', '-', NULL, NULL,
            SUM(mbl.amount),
            100.0,
            1,
            NULL
        FROM monthly_bill_line  mbl
        JOIN monthly_billing    mb  ON mbl.bill_no      = mb.bill_no
        JOIN product_code       pc  ON mbl.product_code = pc.product_code
        JOIN room               r   ON mb.room_no       = r.room_no
        JOIN room_type          rt  ON r.room_type_id   = rt.room_type_id
        WHERE pc.product_type = 'Rent'
          AND mb.bill_date BETWEEN p_date_start AND p_date_end
          AND (
              p_room_type IS NULL
              OR btrim(p_room_type) = ''
              OR p_room_type = '*'
              OR rt.description = p_room_type
          )

        ORDER BY sort_order, tenant_id ASC    -- changed: order by tenant_id

    ) sub;

$$;


-- ================================================================
--  2. CHAYANIT — Room Occupancy Rate (%)
--
--  Parameters:
--    p_room_type   text    : Room type filter e.g. 'Suite' | NULL = All
--
--  NOTE: Occupancy is based on CURRENT room status (live snapshot).
--  No date filter needed — it always reflects the current state.
--
--  CALL EXAMPLE:
--    SELECT * FROM report_occupancy_rate(NULL);
--    SELECT * FROM report_occupancy_rate('Standard');
-- ================================================================

CREATE OR REPLACE FUNCTION report_occupancy_rate(
    p_room_type   text       -- NULL or '*' = All room types
)
RETURNS TABLE (
    room_type           text,
    total_rooms         bigint,
    occupied            bigint,
    available           bigint,
    maintenance         bigint,
    occupancy_rate_pct  numeric
)
LANGUAGE sql STABLE AS $$

    SELECT room_type, total_rooms, occupied, available, maintenance, occupancy_rate_pct
    FROM (

        -- Detail rows per room type
        SELECT
            rt.description                                                      AS room_type,
            COUNT(*)                                                            AS total_rooms,
            COUNT(CASE WHEN r.status = 'Occupied'    THEN 1 END)               AS occupied,
            COUNT(CASE WHEN r.status = 'Available'   THEN 1 END)               AS available,
            COUNT(CASE WHEN r.status = 'Maintenance' THEN 1 END)               AS maintenance,
            ROUND(COUNT(CASE WHEN r.status = 'Occupied' THEN 1 END) * 100.0
                / NULLIF(COUNT(*), 0), 1)                                       AS occupancy_rate_pct,
            0                                                                   AS sort_order,
            rt.room_type_id                                                     AS room_type_id    -- for ordering
        FROM room r
        JOIN room_type rt ON r.room_type_id = rt.room_type_id
        WHERE (
            p_room_type IS NULL
            OR btrim(p_room_type) = ''
            OR p_room_type = '*'
            OR rt.description = p_room_type
        )
        GROUP BY rt.room_type_id, rt.description

        UNION ALL

        -- TOTAL row
        SELECT
            'TOTAL',
            COUNT(*),
            COUNT(CASE WHEN r.status = 'Occupied'    THEN 1 END),
            COUNT(CASE WHEN r.status = 'Available'   THEN 1 END),
            COUNT(CASE WHEN r.status = 'Maintenance' THEN 1 END),
            ROUND(COUNT(CASE WHEN r.status = 'Occupied' THEN 1 END) * 100.0
                / NULLIF(COUNT(*), 0), 1),
            1,
            NULL
        FROM room r
        JOIN room_type rt ON r.room_type_id = rt.room_type_id
        WHERE (
            p_room_type IS NULL
            OR btrim(p_room_type) = ''
            OR p_room_type = '*'
            OR rt.description = p_room_type
        )

        ORDER BY sort_order, room_type_id ASC    -- changed: order by room_type_id

    ) sub;

$$;


-- ================================================================
--  3. THANAPHON — Maintenance Cost Grouped by Month
--
--  Parameters:
--    p_date_start  date    : Completion date from  (required)
--    p_date_end    date    : Completion date to    (required)
--    p_issue_type  text    : 'Plumbing'|'Electrical'|'Furniture'|'Other' | NULL = All
--
--  CALL EXAMPLE:
--    SELECT * FROM report_maintenance_cost('2026-01-01', '2026-03-31', NULL);
--    SELECT * FROM report_maintenance_cost('2026-01-01', '2026-03-31', 'Plumbing');
-- ================================================================

CREATE OR REPLACE FUNCTION report_maintenance_cost(
    p_date_start  date,
    p_date_end    date,
    p_issue_type  text       -- NULL or '*' = All issue types
)
RETURNS TABLE (
    month       text,
    tickets     bigint,
    plumbing    numeric,
    electrical  numeric,
    furniture   numeric,
    other       numeric,
    total_cost  numeric
)
LANGUAGE sql STABLE AS $$

    SELECT month, tickets, plumbing, electrical, furniture, other, total_cost
    FROM (

        -- Detail rows per month
        SELECT
            TO_CHAR(DATE_TRUNC('month', completion_date), 'Mon YYYY')       AS month,
            COUNT(*)                                                         AS tickets,
            SUM(CASE WHEN issue_type = 'Plumbing'   THEN actual_cost END)   AS plumbing,
            SUM(CASE WHEN issue_type = 'Electrical' THEN actual_cost END)   AS electrical,
            SUM(CASE WHEN issue_type = 'Furniture'  THEN actual_cost END)   AS furniture,
            SUM(CASE WHEN issue_type = 'Other'      THEN actual_cost END)   AS other,
            SUM(actual_cost)                                                 AS total_cost,
            0                                                                AS sort_order,
            DATE_TRUNC('month', completion_date)                             AS month_date    -- for ordering
        FROM maintenance_ticket
        WHERE status = 'Completed'
          AND completion_date BETWEEN p_date_start AND p_date_end
          AND (
              p_issue_type IS NULL
              OR btrim(p_issue_type) = ''
              OR p_issue_type = '*'
              OR issue_type = p_issue_type
          )
        GROUP BY DATE_TRUNC('month', completion_date)

        UNION ALL

        -- TOTAL row
        SELECT
            'TOTAL',
            COUNT(*),
            SUM(CASE WHEN issue_type = 'Plumbing'   THEN actual_cost END),
            SUM(CASE WHEN issue_type = 'Electrical' THEN actual_cost END),
            SUM(CASE WHEN issue_type = 'Furniture'  THEN actual_cost END),
            SUM(CASE WHEN issue_type = 'Other'      THEN actual_cost END),
            SUM(actual_cost),
            1,
            NULL
        FROM maintenance_ticket
        WHERE status = 'Completed'
          AND completion_date BETWEEN p_date_start AND p_date_end
          AND (
              p_issue_type IS NULL
              OR btrim(p_issue_type) = ''
              OR p_issue_type = '*'
              OR issue_type = p_issue_type
          )

        ORDER BY sort_order, month_date ASC    -- changed: order by real date value, not text

    ) sub;

$$;


-- ================================================================
--  4. TANA — Total Charges Grouped by Product Type
--
--  Parameters:
--    p_date_start    date    : Bill date from   (required)
--    p_date_end      date    : Bill date to     (required)
--    p_product_type  text    : 'Rent'|'Utility'|'Maintenance'|'Fine' | NULL = All
--    p_tenant_id     integer : Specific tenant  | NULL = All tenants
--
--  CALL EXAMPLE:
--    SELECT * FROM report_charges_by_type('2026-01-01', '2026-03-31', NULL, NULL);
--    SELECT * FROM report_charges_by_type('2026-01-01', '2026-03-31', 'Utility', NULL);
--    SELECT * FROM report_charges_by_type('2026-01-01', '2026-03-31', NULL, 1);
-- ================================================================

CREATE OR REPLACE FUNCTION report_charges_by_type(
    p_date_start    date,
    p_date_end      date,
    p_product_type  text,       -- NULL or '*' = All product types
    p_tenant_id     integer     -- NULL = All tenants
)
RETURNS TABLE (
    product_type    text,
    product_name    text,
    times_charged   bigint,
    total_amount    numeric,
    pct_of_total    numeric
)
LANGUAGE sql STABLE AS $$

    SELECT product_type, product_name, times_charged, total_amount, pct_of_total
    FROM (

        -- Detail rows per product
        SELECT
            pc.product_type,
            pc.product_name,
            COUNT(mbl.bill_line_id)                                             AS times_charged,
            SUM(mbl.amount)                                                     AS total_amount,
            ROUND(SUM(mbl.amount) * 100.0
                / SUM(SUM(mbl.amount)) OVER (), 1)                              AS pct_of_total,
            0                                                                   AS sort_order
        FROM monthly_bill_line  mbl
        JOIN product_code       pc  ON mbl.product_code = pc.product_code
        JOIN monthly_billing    mb  ON mbl.bill_no      = mb.bill_no
        WHERE mb.bill_date BETWEEN p_date_start AND p_date_end
          AND (
              p_product_type IS NULL
              OR btrim(p_product_type) = ''
              OR p_product_type = '*'
              OR pc.product_type = p_product_type
          )
          AND (
              p_tenant_id IS NULL
              OR mb.tenant_id = p_tenant_id
          )
        GROUP BY pc.product_type, pc.product_name

        UNION ALL

        -- TOTAL row
        SELECT
            'TOTAL', '-',
            COUNT(mbl.bill_line_id),
            SUM(mbl.amount),
            100.0,
            1
        FROM monthly_bill_line  mbl
        JOIN product_code       pc  ON mbl.product_code = pc.product_code
        JOIN monthly_billing    mb  ON mbl.bill_no      = mb.bill_no
        WHERE mb.bill_date BETWEEN p_date_start AND p_date_end
          AND (
              p_product_type IS NULL
              OR btrim(p_product_type) = ''
              OR p_product_type = '*'
              OR pc.product_type = p_product_type
          )
          AND (
              p_tenant_id IS NULL
              OR mb.tenant_id = p_tenant_id
          )

        ORDER BY sort_order, product_type, total_amount DESC

    ) sub;

$$;


-- ================================================================
--  5. PATTARAWADEE — Total Payments Grouped by Method
--
--  Parameters:
--    p_date_start      date    : Receipt date from  (required)
--    p_date_end        date    : Receipt date to    (required)
--    p_payment_method  text    : 'Cash'|'Transfer'|'Card' | NULL = All
--    p_tenant_id       integer : Specific tenant    | NULL = All tenants
--
--  CALL EXAMPLE:
--    SELECT * FROM report_payments_by_method('2026-01-01', '2026-03-31', NULL, NULL);
--    SELECT * FROM report_payments_by_method('2026-01-01', '2026-03-31', 'Transfer', NULL);
--    SELECT * FROM report_payments_by_method('2026-01-01', '2026-03-31', NULL, 1);
-- ================================================================

CREATE OR REPLACE FUNCTION report_payments_by_method(
    p_date_start      date,
    p_date_end        date,
    p_payment_method  text,       -- NULL or '*' = All methods
    p_tenant_id       integer     -- NULL = All tenants
)
RETURNS TABLE (
    payment_method   text,
    receipt_count    bigint,
    total_amount     numeric,
    pct_of_total     numeric,
    avg_per_receipt  numeric
)
LANGUAGE sql STABLE AS $$

    SELECT payment_method, receipt_count, total_amount, pct_of_total, avg_per_receipt
    FROM (

        -- Detail rows per payment method
        SELECT
            payment_method,
            COUNT(*)                                                            AS receipt_count,
            SUM(total_paid)                                                     AS total_amount,
            ROUND(SUM(total_paid) * 100.0
                / SUM(SUM(total_paid)) OVER (), 1)                              AS pct_of_total,
            ROUND(AVG(total_paid), 0)                                           AS avg_per_receipt,
            0                                                                   AS sort_order
        FROM payment_receipt
        WHERE receipt_date BETWEEN p_date_start AND p_date_end
          AND (
              p_payment_method IS NULL
              OR btrim(p_payment_method) = ''
              OR p_payment_method = '*'
              OR payment_method = p_payment_method
          )
          AND (
              p_tenant_id IS NULL
              OR tenant_id = p_tenant_id
          )
        GROUP BY payment_method

        UNION ALL

        -- TOTAL row
        SELECT
            'TOTAL',
            COUNT(*),
            SUM(total_paid),
            100.0,
            ROUND(AVG(total_paid), 0),
            1
        FROM payment_receipt
        WHERE receipt_date BETWEEN p_date_start AND p_date_end
          AND (
              p_payment_method IS NULL
              OR btrim(p_payment_method) = ''
              OR p_payment_method = '*'
              OR payment_method = p_payment_method
          )
          AND (
              p_tenant_id IS NULL
              OR tenant_id = p_tenant_id
          )

        ORDER BY sort_order, total_amount DESC

    ) sub;

$$;


-- ================================================================
--  6. SIRIPITCH — Total Expenses Grouped by Category
--
--  Parameters:
--    p_date_start  date    : Expense date from  (required)
--    p_date_end    date    : Expense date to    (required)
--    p_category    text    : e.g. 'Maintenance' | NULL = All categories
--    p_supplier_id integer : Specific supplier  | NULL = All suppliers
--
--  CALL EXAMPLE:
--    SELECT * FROM report_expenses_by_category('2026-01-01', '2026-03-31', NULL, NULL);
--    SELECT * FROM report_expenses_by_category('2026-01-01', '2026-03-31', 'Maintenance', NULL);
--    SELECT * FROM report_expenses_by_category('2026-01-01', '2026-03-31', NULL, 1);
-- ================================================================

CREATE OR REPLACE FUNCTION report_expenses_by_category(
    p_date_start  date,
    p_date_end    date,
    p_category    text,       -- NULL or '*' = All categories
    p_supplier_id integer     -- NULL = All suppliers
)
RETURNS TABLE (
    expense_category  text,
    expense_count     bigint,
    item_count        bigint,
    total_amount      numeric,
    pct_of_total      numeric
)
LANGUAGE sql STABLE AS $$

    SELECT expense_category, expense_count, item_count, total_amount, pct_of_total
    FROM (

        -- Detail rows per category
        SELECT
            e.expense_category,
            COUNT(DISTINCT e.expense_no)                                            AS expense_count,
            COUNT(el.expense_line_id)                                               AS item_count,
            SUM(el.extended_price)                                                  AS total_amount,
            ROUND(SUM(el.extended_price) * 100.0
                / SUM(SUM(el.extended_price)) OVER (), 1)                           AS pct_of_total,
            0                                                                       AS sort_order
        FROM expense        e
        JOIN expense_line   el ON e.expense_no = el.expense_no
        WHERE e.expense_date BETWEEN p_date_start AND p_date_end
          AND (
              p_category IS NULL
              OR btrim(p_category) = ''
              OR p_category = '*'
              OR e.expense_category = p_category
          )
          AND (
              p_supplier_id IS NULL
              OR e.supplier_id = p_supplier_id
          )
        GROUP BY e.expense_category

        UNION ALL

        -- TOTAL row
        SELECT
            'TOTAL',
            COUNT(DISTINCT e.expense_no),
            COUNT(el.expense_line_id),
            SUM(el.extended_price),
            100.0,
            1
        FROM expense        e
        JOIN expense_line   el ON e.expense_no = el.expense_no
        WHERE e.expense_date BETWEEN p_date_start AND p_date_end
          AND (
              p_category IS NULL
              OR btrim(p_category) = ''
              OR p_category = '*'
              OR e.expense_category = p_category
          )
          AND (
              p_supplier_id IS NULL
              OR e.supplier_id = p_supplier_id
          )

        ORDER BY sort_order, total_amount DESC

    ) sub;

$$;


-- ================================================================
--  QUICK TEST — run these after creating the functions
--  to verify everything works on your data
-- ================================================================

-- 1. Kulchaya — All room types, Jan–Mar 2026
SELECT * FROM report_rental_income('2026-01-01', '2026-03-31', NULL);

-- 1b. Kulchaya — Standard rooms only
SELECT * FROM report_rental_income('2026-01-01', '2026-03-31', 'Standard');

-- 2. Chayanit — All room types (current snapshot)
SELECT * FROM report_occupancy_rate(NULL);

-- 2b. Chayanit — Suite only
SELECT * FROM report_occupancy_rate('Suite');

-- 3. Thanaphon — All issue types, Jan–Mar 2026
SELECT * FROM report_maintenance_cost('2026-01-01', '2026-03-31', NULL);

-- 3b. Thanaphon — Plumbing only
SELECT * FROM report_maintenance_cost('2026-01-01', '2026-03-31', 'Plumbing');

-- 4. Tana — All product types, Jan–Mar 2026, all tenants
SELECT * FROM report_charges_by_type('2026-01-01', '2026-03-31', NULL, NULL);

-- 4b. Tana — Utility charges only
SELECT * FROM report_charges_by_type('2026-01-01', '2026-03-31', 'Utility', NULL);

-- 5. Pattarawadee — All methods, Jan–Mar 2026, all tenants
SELECT * FROM report_payments_by_method('2026-01-01', '2026-03-31', NULL, NULL);

-- 5b. Pattarawadee — Transfer only
SELECT * FROM report_payments_by_method('2026-01-01', '2026-03-31', 'Transfer', NULL);

-- 6. Siripitch — All categories, Jan–Mar 2026, all suppliers
SELECT * FROM report_expenses_by_category('2026-01-01', '2026-03-31', NULL, NULL);

-- 6b. Siripitch — Maintenance category only
SELECT * FROM report_expenses_by_category('2026-01-01', '2026-03-31', 'Maintenance', NULL);

-- 6c. Siripitch — Supplier 1 (Fix-It Co.) only
SELECT * FROM report_expenses_by_category('2026-01-01', '2026-03-31', NULL, 1);