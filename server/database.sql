-- Database creation (run as PostgreSQL superuser)
CREATE DATABASE password_manager;

-- Connect to the new database
-- \c password_manager

-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create passwords table
CREATE TABLE passwords (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  website VARCHAR(255),
  username VARCHAR(255),
  encrypted_password TEXT NOT NULL,
  iv TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user
    FOREIGN KEY(user_id)
    REFERENCES users(id)
);

-- Create testimonials table
CREATE TABLE testimonials (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user
    FOREIGN KEY(user_id)
    REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX idx_passwords_user_id ON passwords(user_id);
CREATE INDEX idx_testimonials_user_id ON testimonials(user_id);

-- Create a function to update 'updated_at' timestamp automatically
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger for passwords table to update 'updated_at'
CREATE TRIGGER update_passwords_modtime
BEFORE UPDATE ON passwords
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
