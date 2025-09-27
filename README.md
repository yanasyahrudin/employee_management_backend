# Backend - Lyrid Prima Indonesia

Simple API server using Node.js, Express.js, and MySQL for user and employee management.

## Features

- JWT Authentication
- User Management (CRUD)
- Employee Management (CRUD) + Photo Upload
- Photo upload JPG/JPEG max 300KB

## Requirements

- Node.js
- MySQL
- npm

## Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Database setup**
   - Copy `.env.example` to `.env`
   - Edit `.env` with your MySQL settings:
   ```
   PORT=4001
   DB_HOST=127.0.0.1
   DB_PORT=3307
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=lyrid_prima_test
   JWT_SECRET=supersecretkey
   ```

3. **Create database and tables**
   ```bash
   node setup-db.js
   ```

4. **Create admin user**
   ```bash
   node seeders/seed.js
   ```

## Running the Server

```bash
# Development
npm run dev

# Production
npm start
```

Server runs at: `http://localhost:4001`

## Default Login

- Username: `admin`
- Password: `admin123`

## API Endpoints

### Authentication
| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | User login | `{ username, password }` |

### User Management (Protected Routes)
| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| GET | `/api/users` | Get all users | - |
| POST | `/api/users` | Create user | `{ username, password, fullname, role }` |
| PUT | `/api/users/:id` | Update user | `{ username, password, fullname, role }` |
| DELETE | `/api/users/:id` | Delete user | - |

### Employee Management (Protected Routes)
| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| GET | `/api/employees` | Get all employees | - |
| POST | `/api/employees` | Create employee (with photo) | `{ name, position, photo }` |
| PUT | `/api/employees/:id` | Update employee | `{ name, position, photo }` |
| DELETE | `/api/employees/:id` | Delete employee | - |

## Photo Upload

- Field name: `photo`
- Format: JPG, JPEG only
- Size: max 300KB
- Photos saved in `/uploads` folder

## Authentication

For protected endpoints, add header:
```
Authorization: Bearer <your-jwt-token>
```

## Project Structure

```
backend/
├── middleware/auth.js    # JWT middleware
├── routes/               # API routes
│   ├── auth.js          # Login routes
│   ├── users.js         # User routes
│   └── employees.js     # Employee routes
├── seeders/seed.js      # Initial data
├── uploads/             # Photo folder
├── app.js               # Main server
├── db.js                # Database connection
├── schema.sql           # Database schema
└── setup-db.js          # Database setup
```

## Troubleshooting

**Database connection failed?**
- Make sure MySQL is running
- Check settings in `.env` file

**Port already in use?**
- Change PORT in `.env` file

**Photo upload error?**
- Check file format (JPG/JPEG only)
- Check file size (max 300KB)
