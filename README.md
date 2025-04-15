# Secure Password Manager

A comprehensive and secure password management solution built with Node.js, Express, PostgreSQL, and React with TypeScript. This application implements client-side encryption to ensure your passwords remain secure even if the database is compromised.

## Architecture Overview

The password manager follows a client-side encryption architecture where:

1. All sensitive data is encrypted/decrypted in the browser using AES-256
2. The server never sees plaintext passwords or decryption keys
3. PostgreSQL database stores only encrypted password data
4. User authentication protects access to the encrypted data
5. The master password is never stored anywhere

## Key Security Features

- **Client-Side Encryption**: All passwords are encrypted and decrypted locally in the browser
- **Zero-Knowledge Design**: The server has no access to your actual passwords
- **Strong Encryption**: Uses AES-256 encryption with unique IVs for each password
- **Key Derivation**: Master password is processed with PBKDF2 to generate a strong encryption key
- **Session-Only Storage**: Encryption keys are stored only in session storage and cleared on browser close
- **Secure Authentication**: JWT-based authentication with bcrypt password hashing

## Features

- **Password Management**:

  - Securely store website credentials (username/email and password)
  - View, add, edit, and delete passwords
  - Generate strong random passwords
  - Copy passwords to clipboard securely

- **User Experience**:

  - Clean, modern user interface built with React
  - Responsive design that works on desktop and mobile devices
  - Password strength indicators
  - Search and filtering capabilities
  - User testimonials system to share experiences

- **Technical Features**:
  - TypeScript for type safety
  - React context API for state management
  - PostgreSQL relational database
  - RESTful API design
  - JWT authentication
  - Error handling and validation

## How It Works

### Encryption Process

1. When a user registers, their master password is never stored
2. A unique encryption key is derived from the master password using PBKDF2
3. When adding a password:
   - The password is encrypted locally in the browser using the encryption key
   - A random Initialization Vector (IV) is generated for each password
   - Only the encrypted password and IV are sent to the server
4. When viewing passwords:
   - Encrypted data is fetched from the server
   - Data is decrypted locally in the browser using the encryption key
   - Decrypted passwords are never transmitted over the network

### Database Schema

The PostgreSQL database includes tables for:

- `users`: Stores user accounts and authentication information
- `passwords`: Stores encrypted password entries with relationships to users
- `testimonials`: Stores user reviews and ratings

## Getting Started

### Prerequisites

- Node.js (v14+)
- PostgreSQL (v12+)
- npm or yarn package manager

### Installation

1. Clone the repository
2. Install server dependencies:
   ```
   cd server
   npm install
   ```
3. Install client dependencies:
   ```
   cd ../client
   npm install
   ```

### Database Setup

1. Connect to your PostgreSQL instance:
   ```
   psql -U postgres
   ```
2. Create a new user and database:
   ```sql
   CREATE USER root WITH PASSWORD 'mathiasole123';
   CREATE DATABASE password_manager;
   GRANT ALL PRIVILEGES ON DATABASE password_manager TO root;
   ```
3. Run the database script to create tables:
   ```
   psql -U root -d password_manager -f server/database.sql
   ```

### Configuration

1. Create a `.env` file in the server directory with the following variables:
   ```
   DB_HOST=
   DB_PORT=
   DB_USER=
   DB_PASSWORD=
   DB_NAME=
   JWT_SECRET=
   PORT=
   ```

### Running the Application

1. Start the server:

   ```
   cd server
   npm start
   ```

   For development with auto-reload:

   ```
   npm run dev
   ```

2. Start the client:

   ```
   cd client
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000`

## Usage Guide

### Creating an Account

1. Navigate to the registration page
2. Enter your email address
3. Create a strong master password (this will encrypt all your data)
4. Important: Your master password cannot be recovered if lost

### Managing Passwords

1. After logging in, you'll see your password dashboard
2. Add new passwords using the "Add New Password" button
3. View stored passwords in the list
4. Click "Show" to reveal a password (decrypted client-side)
5. Use "Edit" to update a password entry
6. Use "Delete" to remove a password entry

### Password Generator

1. When creating or editing a password, click the "Generate" button
2. A cryptographically strong random password will be created
3. You can use this password for your accounts

### Testimonials

1. Navigate to the testimonials page
2. View what other users say about the application
3. Add your own testimonial by clicking "Share Your Experience"
4. Rate the application and provide feedback

## Security Best Practices

- Use a strong, unique master password that you don't use elsewhere
- Ensure your master password includes a mix of letters, numbers, and symbols
- Log out when you're done to clear the encryption key from memory
- Keep your operating system and browser up-to-date
- Be cautious about using the password manager on public computers

## Technical Implementation Details

### Frontend

- Built with React and TypeScript
- Uses React Context API for state management
- Client-side encryption using CryptoJS library
- Form validation with Formik and Yup
- Responsive design with CSS

### Backend

- Node.js with Express framework
- RESTful API design
- JWT for authentication
- PostgreSQL for data storage
- Input validation and error handling

### API Endpoints

- `/api/auth/register` - Register a new user
- `/api/auth/login` - Authenticate a user
- `/api/passwords` - CRUD operations for password entries
- `/api/testimonials` - CRUD operations for testimonials

## Contribution Guidelines

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the LICENSE file for details.
