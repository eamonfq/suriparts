import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, 'suriparts.db');

// Remove existing DB for fresh seed
if (existsSync(dbPath)) unlinkSync(dbPath);

const SQL = await initSqlJs();
const db = new SQL.Database();

// Helper: run schema
const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
db.exec(schema);
db.run("PRAGMA foreign_keys = ON");

// Helper: insert row and return lastInsertRowid
function insert(sql, params) {
  db.run(sql, params);
  const res = db.exec("SELECT last_insert_rowid() as id");
  return res.length > 0 ? res[0].values[0][0] : 0;
}

// ── PARTS (32 realistic aviation parts) ──
const partSql = `INSERT INTO parts (part_number, description, condition, serial_number, quantity, location, price, certification, aircraft_type, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

const parts = [
  ['101-384100-1', 'Brake Assembly - Main Wheel', 'NEW', 'SN-2024-0891', 4, 'USA', 12500.00, 'FAA 8130-3', 'Boeing 737', 'Brakes'],
  ['2613900-3', 'Nose Wheel Tire 18x5.5', 'OH', 'SN-2023-1547', 8, 'Colombia', 890.00, 'EASA Form 1', 'Airbus A320', 'Tires'],
  ['APS3200', 'APU Assembly Complete', 'SV', 'SN-APU-7823', 1, 'USA', 185000.00, 'FAA 8130-3', 'Airbus A320', 'APU'],
  ['7-001-540-003', 'Main Wheel Assembly', 'AR', 'SN-2024-0334', 2, 'Venezuela', 4200.00, 'Dual Release', 'Boeing 757', 'Wheels'],
  ['3-1611-1', 'Brake Disc - Carbon', 'NEW', 'SN-2024-1102', 12, 'USA', 3400.00, 'FAA 8130-3', 'Boeing 737', 'Brakes'],
  ['65C33582-9', 'Fuel Pump - Engine Driven', 'REPAIRED', 'SN-FP-4491', 2, 'Colombia', 8750.00, 'FAA 8130-3', 'Boeing 767', 'Fuel System'],
  ['1141AN2-3', 'Hydraulic Filter Element', 'NEW', null, 25, 'USA', 145.00, 'FAA 8130-3', 'General', 'Hydraulics'],
  ['747-620-001', 'Landing Gear Actuator', 'OH', 'SN-LGA-2209', 1, 'USA', 34500.00, 'FAA 8130-3', 'Boeing 747', 'Landing Gear'],
  ['SVO730-4', 'Starter Valve - Pneumatic', 'SV', 'SN-SV-8812', 3, 'USA', 6200.00, 'FAA 8130-3', 'Boeing 737', 'Pneumatics'],
  ['60B00068-12', 'Generator Control Unit', 'OH', 'SN-GCU-1190', 2, 'Colombia', 15800.00, 'EASA Form 1', 'Airbus A320', 'Electrical'],
  ['271A3300-02', 'Flap Actuator - Outboard', 'AR', 'SN-FA-7721', 1, 'USA', 22000.00, 'FAA 8130-3', 'Boeing 737', 'Flight Controls'],
  ['3214789-5', 'Air Cycle Machine', 'REPAIRED', 'SN-ACM-5543', 2, 'Venezuela', 18500.00, 'Dual Release', 'Boeing 757', 'Air Conditioning'],
  ['H368A101-2', 'Hydraulic Pump - Engine Driven', 'NEW', 'SN-HP-9034', 3, 'USA', 28000.00, 'FAA 8130-3', 'Airbus A320', 'Hydraulics'],
  ['2588M71G03', 'Turbine Blade Set (Stage 1)', 'NEW', null, 6, 'USA', 4500.00, 'FAA 8130-3', 'CFM56-7B', 'Engine'],
  ['155F1100-3', 'Fire Extinguisher Bottle - APU', 'SV', 'SN-FE-3321', 4, 'Colombia', 2100.00, 'EASA Form 1', 'General', 'Fire Protection'],
  ['261A1105-009', 'Nose Landing Gear Shock Strut', 'OH', 'SN-NLG-8877', 1, 'USA', 45000.00, 'FAA 8130-3', 'Boeing 737', 'Landing Gear'],
  ['331-350A', 'Pack Valve Assembly', 'NEW', 'SN-PV-2245', 5, 'USA', 7800.00, 'FAA 8130-3', 'Boeing 737', 'Air Conditioning'],
  ['MA20A1T6', 'Bolt - Shear', 'NEW', null, 200, 'USA', 12.50, 'ANSI Cert', 'General', 'Hardware'],
  ['MS21042L5', 'Self-Locking Nut', 'NEW', null, 500, 'USA', 2.75, 'ANSI Cert', 'General', 'Hardware'],
  ['S6125-4-020-355', 'O-Ring Seal - Hydraulic', 'NEW', null, 150, 'Colombia', 8.50, 'FAA-PMA', 'General', 'Seals'],
  ['805500-4', 'Proximity Sensor - Landing Gear', 'NEW', 'SN-PS-6678', 8, 'USA', 1250.00, 'FAA 8130-3', 'Boeing 737', 'Sensors'],
  ['7004175-903', 'IDG - Integrated Drive Generator', 'OH', 'SN-IDG-1156', 1, 'USA', 62000.00, 'FAA 8130-3', 'Boeing 767', 'Electrical'],
  ['471N1103-5', 'Thrust Reverser Actuator', 'SV', 'SN-TRA-4490', 2, 'Venezuela', 19500.00, 'Dual Release', 'Boeing 757', 'Engine'],
  ['944F010G01', 'Fuel Flow Transmitter', 'REPAIRED', 'SN-FFT-2278', 3, 'Colombia', 5600.00, 'EASA Form 1', 'Airbus A320', 'Fuel System'],
  ['114H2010-9', 'Spoiler Actuator', 'AR', 'SN-SA-9912', 2, 'USA', 11200.00, 'FAA 8130-3', 'Boeing 737', 'Flight Controls'],
  ['387A441-5', 'Windshield Panel - Captain Side', 'NEW', null, 2, 'USA', 16000.00, 'FAA 8130-3', 'Boeing 737', 'Windows'],
  ['9912459-3', 'ELT Battery Pack', 'NEW', null, 10, 'Colombia', 320.00, 'TSO-C126', 'General', 'Emergency'],
  ['CM2632L2', 'Cabin Pressure Controller', 'OH', 'SN-CPC-7741', 2, 'USA', 9800.00, 'FAA 8130-3', 'Airbus A320', 'Air Conditioning'],
  ['346D6101-3', 'Oxygen Mask - Crew', 'NEW', null, 15, 'USA', 450.00, 'TSO-C89A', 'General', 'Oxygen'],
  ['5006720-2', 'CVR - Cockpit Voice Recorder', 'OH', 'SN-CVR-3398', 1, 'USA', 24000.00, 'TSO-C124A', 'General', 'Avionics'],
  ['822-1553-001', 'Weather Radar Antenna', 'SV', 'SN-WRA-5567', 2, 'USA', 13500.00, 'FAA 8130-3', 'Boeing 737', 'Avionics'],
  ['GTCP131-9B', 'APU - Complete Unit', 'OH', 'SN-APU-1289', 1, 'Colombia', 210000.00, 'EASA Form 1', 'Boeing 757', 'APU'],
];

db.run('BEGIN');
for (const p of parts) {
  db.run(partSql, p);
}
db.run('COMMIT');

// ── CLIENTS (10) ──
const clientSql = `INSERT INTO clients (name, company, country, email, phone, whatsapp, notes) VALUES (?, ?, ?, ?, ?, ?, ?)`;

const clients = [
  ['Carlos Mendoza', 'Avianca Technical Services', 'Colombia', 'cmendoza@avianca.com', '+57 1 413 9511', '+57 310 555 1234', 'Main contact for 737 fleet. Payment net-30. Always requests full trace documentation.'],
  ['Maria Elena Rojas', 'CONVIASA', 'Venezuela', 'mrojas@conviasa.aero', '+58 212 555 8900', '+58 414 555 6789', 'Government airline. Requires proforma invoice before PO. 757 and 737 fleet.'],
  ['Roberto Silva', 'LATAM MRO', 'Chile', 'rsilva@latam.com', '+56 2 2565 1000', '+56 9 5555 4321', 'Large MRO operation. A320 and 767 fleet. Volume discounts negotiated.'],
  ['Juan Carlos Perez', 'Aeroman', 'El Salvador', 'jcperez@aeroman.com.sv', '+503 2339 9000', '+503 7555 8877', 'Growing MRO. Mainly A320 family. Prefers OH parts for cost savings.'],
  ['Patricia Vargas', 'Copa Airlines', 'Panama', 'pvargas@copaair.com', '+507 217 2672', '+507 6555 3344', '737 MAX and 737-800 fleet. Strict on certifications - FAA 8130-3 only.'],
  ['Eduardo Santos', 'GOL Linhas Aereas', 'Brasil', 'esantos@voegol.com.br', '+55 11 5504 4000', '+55 11 9555 2211', 'Large 737 operator. Buys in volume. Payment net-45.'],
  ['Ana Lucia Herrera', 'Satena', 'Colombia', 'aherrera@satena.com', '+57 1 605 2222', '+57 315 555 9988', 'Military-owned airline. Requires additional export documentation.'],
  ['Miguel Angel Torres', 'Laser Airlines', 'Venezuela', 'mtorres@laserairlines.com', '+58 212 555 3300', '+58 412 555 7766', '737 Classic fleet. Price sensitive. Often requests AR condition parts.'],
  ['Francisco Rivera', 'EaseFly', 'Colombia', 'frivera@easefly.com.co', '+57 4 444 3333', '+57 300 555 5544', 'Regional airline. ATR fleet mainly but also needs general hardware.'],
  ['Carmen Delgado', 'TAG Airlines', 'Guatemala', 'cdelgado@tag.com.gt', '+502 2380 9494', '+502 5555 1122', 'Regional operator. Embraer and ATR fleet. Quick decision maker.'],
];

db.run('BEGIN');
for (const c of clients) {
  db.run(clientSql, c);
}
db.run('COMMIT');

// ── SUPPLIERS (6) ──
const supplierSql = `INSERT INTO suppliers (name, contact_name, email, phone, country, specialty, notes) VALUES (?, ?, ?, ?, ?, ?, ?)`;

const suppliers = [
  ['Heico Aerospace', 'James Wilson', 'jwilson@heico.com', '+1 954 987 4000', 'USA', 'PMA parts, engine components, avionics', 'Largest PMA parts manufacturer. Good pricing on volume orders.'],
  ['Honeywell Aerospace', 'Sarah Chen', 'schen@honeywell.com', '+1 602 365 3099', 'USA', 'APU, avionics, wheels & brakes, engines', 'OEM supplier. Premium pricing but full warranty. Fast turnaround.'],
  ['Meggitt Aircraft Braking', 'David Thompson', 'dthompson@meggitt.com', '+1 330 796 2960', 'USA', 'Wheels, brakes, brake discs', 'Specialist in braking systems. Best pricing for Boeing 737 brakes.'],
  ['Kaman Aerospace', 'Michael Brown', 'mbrown@kaman.com', '+1 860 243 7100', 'USA', 'Bearings, fuel systems, structures', 'Good for hard-to-find parts. Extensive inventory.'],
  ['Aviall Services (Boeing)', 'Lisa Martinez', 'lmartinez@aviall.com', '+1 972 586 1000', 'USA', 'General aviation parts, hardware, consumables', 'Boeing subsidiary. Huge catalog. Good for standard hardware and consumables.'],
  ['GA Telesis', 'Robert Park', 'rpark@gatelesis.com', '+1 954 676 3111', 'USA', 'Engines, APU, landing gear, avionics', 'Large inventory of used serviceable parts. Good for OH/SV components.'],
];

db.run('BEGIN');
for (const s of suppliers) {
  db.run(supplierSql, s);
}
db.run('COMMIT');

// ── QUOTES (15 with varied statuses and dates) ──
const quoteSql = `INSERT INTO quotes (quote_number, client_id, status, subtotal, tax, total, notes, valid_until, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

const quotes = [
  ['QT-2026-001', 1, 'accepted', 25000.00, 0, 25000.00, 'Urgent order for Avianca 737 fleet maintenance', '2026-02-28', '2026-01-15 09:30:00'],
  ['QT-2026-002', 2, 'sent', 4200.00, 0, 4200.00, 'CONVIASA 757 wheel replacement', '2026-03-01', '2026-01-18 14:20:00'],
  ['QT-2026-003', 3, 'accepted', 62000.00, 0, 62000.00, 'LATAM IDG replacement for 767', '2026-02-15', '2026-01-20 10:00:00'],
  ['QT-2026-004', 5, 'rejected', 12500.00, 0, 12500.00, 'Copa 737 brake assembly - client found lower price', '2026-02-10', '2026-01-22 11:45:00'],
  ['QT-2026-005', 1, 'sent', 6800.00, 0, 6800.00, 'Avianca carbon brake discs', '2026-03-05', '2026-01-25 08:15:00'],
  ['QT-2026-006', 6, 'draft', 45000.00, 0, 45000.00, 'GOL nose landing gear strut', '2026-03-15', '2026-01-28 16:00:00'],
  ['QT-2026-007', 4, 'accepted', 15800.00, 0, 15800.00, 'Aeroman A320 generator control unit', '2026-02-20', '2026-01-30 09:10:00'],
  ['QT-2026-008', 8, 'expired', 8400.00, 0, 8400.00, 'Laser Airlines 737 parts - no response from client', '2026-01-30', '2026-01-10 13:30:00'],
  ['QT-2026-009', 2, 'sent', 19500.00, 0, 19500.00, 'CONVIASA thrust reverser actuators', '2026-03-10', '2026-02-01 10:20:00'],
  ['QT-2026-010', 7, 'draft', 2350.00, 0, 2350.00, 'Satena general hardware order', '2026-03-15', '2026-02-03 15:45:00'],
  ['QT-2026-011', 5, 'sent', 24000.00, 0, 24000.00, 'Copa Airlines CVR replacement', '2026-03-20', '2026-02-05 11:00:00'],
  ['QT-2026-012', 10, 'accepted', 5600.00, 0, 5600.00, 'TAG Airlines fuel flow transmitters', '2026-02-28', '2026-02-07 09:30:00'],
  ['QT-2026-013', 3, 'draft', 185000.00, 0, 185000.00, 'LATAM APU complete unit for A320', '2026-03-25', '2026-02-10 14:15:00'],
  ['QT-2026-014', 9, 'sent', 1720.00, 0, 1720.00, 'EaseFly miscellaneous hardware', '2026-03-15', '2026-02-12 08:40:00'],
  ['QT-2026-015', 6, 'draft', 28000.00, 0, 28000.00, 'GOL hydraulic pump for A320', '2026-03-20', '2026-02-14 16:30:00'],
];

const quoteItemSql = `INSERT INTO quote_items (quote_id, part_id, part_number, description, condition, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

const quoteItems = [
  [1, 1, '101-384100-1', 'Brake Assembly - Main Wheel', 'NEW', 2, 12500.00, 25000.00],
  [2, 4, '7-001-540-003', 'Main Wheel Assembly', 'AR', 1, 4200.00, 4200.00],
  [3, 22, '7004175-903', 'IDG - Integrated Drive Generator', 'OH', 1, 62000.00, 62000.00],
  [4, 1, '101-384100-1', 'Brake Assembly - Main Wheel', 'NEW', 1, 12500.00, 12500.00],
  [5, 5, '3-1611-1', 'Brake Disc - Carbon', 'NEW', 2, 3400.00, 6800.00],
  [6, 16, '261A1105-009', 'Nose Landing Gear Shock Strut', 'OH', 1, 45000.00, 45000.00],
  [7, 10, '60B00068-12', 'Generator Control Unit', 'OH', 1, 15800.00, 15800.00],
  [8, 5, '3-1611-1', 'Brake Disc - Carbon', 'NEW', 2, 3400.00, 6800.00],
  [8, 21, '805500-4', 'Proximity Sensor - Landing Gear', 'NEW', 2, 1250.00, 2500.00],
  [9, 23, '471N1103-5', 'Thrust Reverser Actuator', 'SV', 1, 19500.00, 19500.00],
  [10, 18, 'MA20A1T6', 'Bolt - Shear', 'NEW', 100, 12.50, 1250.00],
  [10, 19, 'MS21042L5', 'Self-Locking Nut', 'NEW', 200, 2.75, 550.00],
  [10, 20, 'S6125-4-020-355', 'O-Ring Seal - Hydraulic', 'NEW', 50, 8.50, 425.00],
  [11, 30, '5006720-2', 'CVR - Cockpit Voice Recorder', 'OH', 1, 24000.00, 24000.00],
  [12, 24, '944F010G01', 'Fuel Flow Transmitter', 'REPAIRED', 1, 5600.00, 5600.00],
  [13, 3, 'APS3200', 'APU Assembly Complete', 'SV', 1, 185000.00, 185000.00],
  [14, 18, 'MA20A1T6', 'Bolt - Shear', 'NEW', 50, 12.50, 625.00],
  [14, 19, 'MS21042L5', 'Self-Locking Nut', 'NEW', 100, 2.75, 275.00],
  [14, 27, '9912459-3', 'ELT Battery Pack', 'NEW', 2, 320.00, 640.00],
  [15, 13, 'H368A101-2', 'Hydraulic Pump - Engine Driven', 'NEW', 1, 28000.00, 28000.00],
];

db.run('BEGIN');
for (const q of quotes) {
  db.run(quoteSql, q);
}
for (const qi of quoteItems) {
  db.run(quoteItemSql, qi);
}
db.run('COMMIT');

// ── RFQs ──
const rfqSql = `INSERT INTO rfqs (supplier_id, quote_id, part_number, description, quantity, urgency, status, response_price, response_notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

const rfqs = [
  [2, null, 'APS3200-MOD', 'APU Assembly Modified Config', 1, 'high', 'responded', 195000.00, 'Available. Lead time 6-8 weeks. Full warranty.', '2026-02-08 10:00:00'],
  [3, 4, '101-384100-1', 'Brake Assembly - Main Wheel', 2, 'normal', 'responded', 11800.00, 'Can supply 2 units. Delivery 2 weeks.', '2026-01-23 09:00:00'],
  [6, null, 'CF6-80C2', 'Engine Module - Fan Case', 1, 'critical', 'pending', null, null, '2026-02-12 14:30:00'],
  [1, null, '65C33582-9', 'Fuel Pump - Engine Driven', 3, 'normal', 'no_stock', null, 'Currently out of stock. Expected restock in 3 months.', '2026-02-01 11:00:00'],
  [4, null, 'MS21042L5', 'Self-Locking Nut', 1000, 'low', 'responded', 2.10, 'Volume discount applied. Minimum order 500 units.', '2026-02-05 08:45:00'],
  [5, null, '346D6101-3', 'Oxygen Mask - Crew', 20, 'normal', 'pending', null, null, '2026-02-14 13:20:00'],
];

db.run('BEGIN');
for (const r of rfqs) {
  db.run(rfqSql, r);
}
db.run('COMMIT');

// ── ACTIVITY LOG ──
const actSql = `INSERT INTO activity_log (entity_type, entity_id, action, description, created_at) VALUES (?, ?, ?, ?, ?)`;

const activities = [
  ['quote', 1, 'created', 'Quote QT-2026-001 created for Avianca Technical Services', '2026-01-15 09:30:00'],
  ['quote', 1, 'status_change', 'Quote QT-2026-001 sent to client', '2026-01-16 10:00:00'],
  ['quote', 1, 'status_change', 'Quote QT-2026-001 accepted by client', '2026-01-20 14:00:00'],
  ['quote', 3, 'created', 'Quote QT-2026-003 created for LATAM MRO', '2026-01-20 10:00:00'],
  ['quote', 3, 'status_change', 'Quote QT-2026-003 accepted', '2026-01-25 09:00:00'],
  ['quote', 7, 'created', 'Quote QT-2026-007 created for Aeroman', '2026-01-30 09:10:00'],
  ['quote', 7, 'status_change', 'Quote QT-2026-007 accepted', '2026-02-02 11:30:00'],
  ['rfq', 1, 'created', 'RFQ sent to Honeywell for APU Assembly', '2026-02-08 10:00:00'],
  ['rfq', 1, 'status_change', 'Honeywell responded - APU available at $195,000', '2026-02-10 15:00:00'],
  ['quote', 13, 'created', 'Quote QT-2026-013 drafted for LATAM MRO - APU', '2026-02-10 14:15:00'],
  ['rfq', 3, 'created', 'RFQ sent to GA Telesis for CF6 Engine Module', '2026-02-12 14:30:00'],
  ['quote', 15, 'created', 'Quote QT-2026-015 drafted for GOL - Hydraulic Pump', '2026-02-14 16:30:00'],
  ['rfq', 6, 'created', 'RFQ sent to Aviall for Oxygen Masks', '2026-02-14 13:20:00'],
];

db.run('BEGIN');
for (const a of activities) {
  db.run(actSql, a);
}
db.run('COMMIT');

// Save to file
const data = db.export();
writeFileSync(dbPath, Buffer.from(data));
db.close();

console.log('Database seeded successfully!');
console.log(`  - ${parts.length} parts`);
console.log(`  - ${clients.length} clients`);
console.log(`  - ${suppliers.length} suppliers`);
console.log(`  - ${quotes.length} quotes with ${quoteItems.length} line items`);
console.log(`  - ${rfqs.length} RFQs`);
console.log(`  - ${activities.length} activity log entries`);
