-- GateFlow Database Schema
-- Run this file to initialize the database

CREATE DATABASE IF NOT EXISTS gateflow_db;
USE gateflow_db;

-- 1. Organization Configurations (For Academic Bridge Integrations)
CREATE TABLE IF NOT EXISTS school_configs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  academic_bridge_api_url VARCHAR(255) DEFAULT 'https://api.academicbridge.rw/v1',
  academic_bridge_api_key VARCHAR(255) NULL,
  marks_penalty_per_hour INT DEFAULT 2,
  activation_code_gatekeeper VARCHAR(50) DEFAULT 'GATE-2026-X',
  activation_code_discipline VARCHAR(50) DEFAULT 'DISC-2026-Y',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Initialize default school configurations
INSERT INTO school_configs (academic_bridge_api_key)
SELECT NULL WHERE NOT EXISTS (SELECT 1 FROM school_configs LIMIT 1);

-- 2. System Users Table (Internal Staff)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('Admin', 'DOD', 'Patron', 'Matron', 'Gatekeeper') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Border Registry Entities (Students, Staff, Suppliers)
CREATE TABLE IF NOT EXISTS entities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  entity_type ENUM('Student', 'Staff', 'Supplier', 'Visitor', 'School_Vehicle') NOT NULL,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NULL,
  national_id VARCHAR(20) NULL UNIQUE,
  license_plate VARCHAR(20) NULL,
  company_name VARCHAR(100) NULL,
  academic_bridge_student_id VARCHAR(50) NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Digital Permissions Ledger
CREATE TABLE IF NOT EXISTS permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  entity_id INT NOT NULL,
  issued_by INT NOT NULL,
  reason TEXT NOT NULL,
  destination VARCHAR(255) NOT NULL,
  expected_departure DATETIME NOT NULL,
  expected_return DATETIME NOT NULL,
  status ENUM('Approved', 'Active', 'Returned', 'Overdue') DEFAULT 'Approved',
  marks_deducted_cache INT DEFAULT 0,
  waived_reason TEXT NULL,
  FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE,
  FOREIGN KEY (issued_by) REFERENCES users(id)
);

-- 5. Physical Movement Checkpoint Logs
CREATE TABLE IF NOT EXISTS gate_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  entity_id INT NOT NULL,
  direction ENUM('IN', 'OUT') NOT NULL,
  logged_by INT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE,
  FOREIGN KEY (logged_by) REFERENCES users(id)
);

-- 6. Asset / Cargo Inventory Border Sheets
CREATE TABLE IF NOT EXISTS asset_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  gate_log_id INT NOT NULL,
  item_description TEXT NOT NULL,
  action_type ENUM('Supply_Delivery', 'School_Property_Movement', 'Personal_Belongings') NOT NULL,
  FOREIGN KEY (gate_log_id) REFERENCES gate_logs(id) ON DELETE CASCADE
);
