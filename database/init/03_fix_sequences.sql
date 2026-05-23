-- Fix sequences so new INSERTs auto-increment past existing seed data
-- Run after 01_schema.sql and 02_seed_csv.sql

-- Convert integer PKs to SERIAL (create sequences and set defaults)
CREATE SEQUENCE IF NOT EXISTS tenant_tenant_id_seq;
SELECT setval('tenant_tenant_id_seq', COALESCE((SELECT MAX(tenant_id) FROM tenant), 0) + 1, false);
ALTER TABLE tenant ALTER COLUMN tenant_id SET DEFAULT nextval('tenant_tenant_id_seq');

CREATE SEQUENCE IF NOT EXISTS staff_staff_id_seq;
SELECT setval('staff_staff_id_seq', COALESCE((SELECT MAX(staff_id) FROM staff), 0) + 1, false);
ALTER TABLE staff ALTER COLUMN staff_id SET DEFAULT nextval('staff_staff_id_seq');

CREATE SEQUENCE IF NOT EXISTS supplier_supplier_id_seq;
SELECT setval('supplier_supplier_id_seq', COALESCE((SELECT MAX(supplier_id) FROM supplier), 0) + 1, false);
ALTER TABLE supplier ALTER COLUMN supplier_id SET DEFAULT nextval('supplier_supplier_id_seq');

CREATE SEQUENCE IF NOT EXISTS room_type_room_type_id_seq;
SELECT setval('room_type_room_type_id_seq', COALESCE((SELECT MAX(room_type_id) FROM room_type), 0) + 1, false);
ALTER TABLE room_type ALTER COLUMN room_type_id SET DEFAULT nextval('room_type_room_type_id_seq');

CREATE SEQUENCE IF NOT EXISTS furniture_item_id_seq;
SELECT setval('furniture_item_id_seq', COALESCE((SELECT MAX(item_id) FROM furniture), 0) + 1, false);
ALTER TABLE furniture ALTER COLUMN item_id SET DEFAULT nextval('furniture_item_id_seq');

CREATE SEQUENCE IF NOT EXISTS rental_contract_contract_no_seq;
SELECT setval('rental_contract_contract_no_seq', COALESCE((SELECT MAX(contract_no) FROM rental_contract), 0) + 1, false);
ALTER TABLE rental_contract ALTER COLUMN contract_no SET DEFAULT nextval('rental_contract_contract_no_seq');

CREATE SEQUENCE IF NOT EXISTS contract_item_contract_line_id_seq;
SELECT setval('contract_item_contract_line_id_seq', COALESCE((SELECT MAX(contract_line_id) FROM contract_item), 0) + 1, false);
ALTER TABLE contract_item ALTER COLUMN contract_line_id SET DEFAULT nextval('contract_item_contract_line_id_seq');

CREATE SEQUENCE IF NOT EXISTS maintenance_ticket_ticket_no_seq;
SELECT setval('maintenance_ticket_ticket_no_seq', COALESCE((SELECT MAX(ticket_no) FROM maintenance_ticket), 0) + 1, false);
ALTER TABLE maintenance_ticket ALTER COLUMN ticket_no SET DEFAULT nextval('maintenance_ticket_ticket_no_seq');

CREATE SEQUENCE IF NOT EXISTS monthly_billing_bill_no_seq;
SELECT setval('monthly_billing_bill_no_seq', COALESCE((SELECT MAX(bill_no) FROM monthly_billing), 0) + 1, false);
ALTER TABLE monthly_billing ALTER COLUMN bill_no SET DEFAULT nextval('monthly_billing_bill_no_seq');

CREATE SEQUENCE IF NOT EXISTS monthly_bill_line_bill_line_id_seq;
SELECT setval('monthly_bill_line_bill_line_id_seq', COALESCE((SELECT MAX(bill_line_id) FROM monthly_bill_line), 0) + 1, false);
ALTER TABLE monthly_bill_line ALTER COLUMN bill_line_id SET DEFAULT nextval('monthly_bill_line_bill_line_id_seq');

CREATE SEQUENCE IF NOT EXISTS payment_receipt_receipt_no_seq;
SELECT setval('payment_receipt_receipt_no_seq', COALESCE((SELECT MAX(receipt_no) FROM payment_receipt), 0) + 1, false);
ALTER TABLE payment_receipt ALTER COLUMN receipt_no SET DEFAULT nextval('payment_receipt_receipt_no_seq');

CREATE SEQUENCE IF NOT EXISTS payments_item_payments_item_id_seq;
SELECT setval('payments_item_payments_item_id_seq', COALESCE((SELECT MAX(payments_item_id) FROM payments_item), 0) + 1, false);
ALTER TABLE payments_item ALTER COLUMN payments_item_id SET DEFAULT nextval('payments_item_payments_item_id_seq');

CREATE SEQUENCE IF NOT EXISTS expense_expense_no_seq;
SELECT setval('expense_expense_no_seq', COALESCE((SELECT MAX(expense_no) FROM expense), 0) + 1, false);
ALTER TABLE expense ALTER COLUMN expense_no SET DEFAULT nextval('expense_expense_no_seq');

CREATE SEQUENCE IF NOT EXISTS expense_line_expense_line_id_seq;
SELECT setval('expense_line_expense_line_id_seq', COALESCE((SELECT MAX(expense_line_id) FROM expense_line), 0) + 1, false);
ALTER TABLE expense_line ALTER COLUMN expense_line_id SET DEFAULT nextval('expense_line_expense_line_id_seq');

CREATE SEQUENCE IF NOT EXISTS inspection_inspection_no_seq;
SELECT setval('inspection_inspection_no_seq', COALESCE((SELECT MAX(inspection_no) FROM inspection), 0) + 1, false);
ALTER TABLE inspection ALTER COLUMN inspection_no SET DEFAULT nextval('inspection_inspection_no_seq');

CREATE SEQUENCE IF NOT EXISTS inspection_line_inspection_line_id_seq;
SELECT setval('inspection_line_inspection_line_id_seq', COALESCE((SELECT MAX(inspection_line_id) FROM inspection_line), 0) + 1, false);
ALTER TABLE inspection_line ALTER COLUMN inspection_line_id SET DEFAULT nextval('inspection_line_inspection_line_id_seq');
