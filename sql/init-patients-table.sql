-- Create patients table in Neon
CREATE TABLE IF NOT EXISTS patients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  treatment VARCHAR(255),
  total_amount DECIMAL(10, 2) DEFAULT 0,
  paid_amount DECIMAL(10, 2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add some sample data (optional)
INSERT INTO patients (name, phone, treatment, total_amount, paid_amount, status) VALUES
  ('محمد علی', '07701234567', 'تریتمنت تەلی', 1000000, 300000, 'pending'),
  ('نالیا حسن', '07709876543', 'پوليش', 500000, 200000, 'pending'),
  ('فاتیمە محمود', '07705555555', 'روانکاری', 750000, 750000, 'completed');

-- Create index for better query performance
CREATE INDEX idx_patients_status ON patients(status);
CREATE INDEX idx_patients_date ON patients(date DESC);
