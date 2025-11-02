-- Create users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'User' CHECK (role IN ('Admin', 'Supervisor', 'User')),
  is_active BOOLEAN DEFAULT true,
  assigned_task VARCHAR(100) CHECK (assigned_task IN ('Incoming Inspection', 'Finishing', 'Quality Control', 'Delivery')),
  completed_today INTEGER DEFAULT 0,
  total_assigned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inspections table
CREATE TABLE inspections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_number INTEGER NOT NULL,
  component_name VARCHAR(255) NOT NULL,
  supplier_details TEXT,
  image_path VARCHAR(500),
  remarks TEXT,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  duration VARCHAR(20),
  total_pause_time INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  timer_events JSONB DEFAULT '[]',
  inspected_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create finishing table
CREATE TABLE finishing (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_used VARCHAR(255) NOT NULL,
  tool_status VARCHAR(50) DEFAULT 'Working' CHECK (tool_status IN ('Working', 'Faulty')),
  part_component_id VARCHAR(255) NOT NULL,
  operator_name VARCHAR(255) NOT NULL,
  remarks TEXT,
  duration VARCHAR(20),
  is_completed BOOLEAN DEFAULT false,
  processed_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quality_control table
CREATE TABLE quality_control (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  part_id VARCHAR(255) NOT NULL,
  hole_dimensions JSONB,
  level_readings JSONB,
  inspector_name VARCHAR(255) NOT NULL,
  signature_image_path VARCHAR(500),
  remarks TEXT,
  qc_status VARCHAR(50) DEFAULT 'Pass' CHECK (qc_status IN ('Pass', 'Fail')),
  inspected_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create deliveries table
CREATE TABLE deliveries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  customer_id VARCHAR(255),
  delivery_address TEXT NOT NULL,
  part_id VARCHAR(255) NOT NULL,
  vehicle_details VARCHAR(255) NOT NULL,
  driver_name VARCHAR(255) NOT NULL,
  driver_contact VARCHAR(50) NOT NULL,
  scheduled_date DATE,
  scheduled_time TIME,
  delivery_status VARCHAR(50) DEFAULT 'Pending' CHECK (delivery_status IN ('Pending', 'Dispatched', 'In Transit', 'Delivered', 'Failed')),
  delivery_proof_image_path VARCHAR(500),
  remarks TEXT,
  processed_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tool_lists table
CREATE TABLE tool_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_name VARCHAR(255) NOT NULL,
  tool_data JSONB,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table for supervisor notifications
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  supervisor_id UUID REFERENCES users(id),
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'reassign_request',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_inspections_inspected_by ON inspections(inspected_by);
CREATE INDEX idx_finishing_processed_by ON finishing(processed_by);
CREATE INDEX idx_quality_control_inspected_by ON quality_control(inspected_by);
CREATE INDEX idx_deliveries_processed_by ON deliveries(processed_by);
CREATE INDEX idx_notifications_supervisor_id ON notifications(supervisor_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE finishing ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_control ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic policies - can be customized)
CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all users" ON users FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Admin')
);
CREATE POLICY "Supervisors can view users" ON users FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Admin', 'Supervisor'))
);

-- Insert default users
INSERT INTO users (name, username, password, role, is_active) VALUES
('Test Admin', 'testA1', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.Gm.F5W', 'Admin', true),
('Test Supervisor', 'testS1', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.Gm.F5W', 'Supervisor', true),
('Test User 1', 'testU1', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.Gm.F5W', 'User', true),
('Test User 2', 'testU2', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.Gm.F5W', 'User', true),
('Test User 3', 'testU3', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.Gm.F5W', 'User', true);