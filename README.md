# Task Management System (Team Workflow App)

A modern, responsive, and secure Task Management System designed for team collaboration. Built as a full-stack web application using React, Tailwind CSS v4, Express, and MySQL.

---

## Technical Stack

- **Frontend**: React (v19), Vite (v8), TypeScript, Tailwind CSS (v4), Lucide Icons, Axios.
- **Backend**: Express.js, Node.js, JSON Web Tokens (JWT), BCryptJS, MySQL2.
- **Database**: MySQL.

---

## Key Features

1. **User Authentication & Session Management**:
   - Secure register/login screens with client-side form validations.
   - JWT-based request interception. Session details are cached in `localStorage` for automated persistence.
2. **Task Board (CRUD Operations)**:
   - Create new tasks with Title, Description, Priority, Status, Due Date, and Assignees.
   - Edit, update, or permanently delete tasks (gated by creator/admin role privileges).
3. **Role-Based Access Control (RBAC)**:
   - **Admin**: Full authority. Can view, create, edit, or delete any task, and assign tasks to any registered member.
   - **User**: Restricted visibility. Can only view tasks they created or are assigned to. Can edit tasks they are associated with. Can only delete tasks they created.
4. **Search and Filter Controls**:
   - Search tasks dynamically by title keywords.
   - Filter cards by Status (`Open`, `In Progress`, `Testing`, `Done`) and Priority (`Low`, `Medium`, `High`).
5. **Interactive UI/UX**:
   - Dark-theme design with glassmorphic cards, smooth transitions, validation error highlights, and loading spinners.
   - **Task Details Modal**: Click on any task card title to open a dedicated, scrollable read-only details window to read complete descriptions.

---

## Database Setup (MySQL)

Create a MySQL database named `task_manager` (or any custom name) and execute the following SQL scripts to establish the database schema:

```sql
-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'User') DEFAULT 'User',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
    status ENUM('Open', 'In Progress', 'Testing', 'Done') DEFAULT 'Open',
    due_date DATE DEFAULT NULL,
    created_by INT NOT NULL,
    assigned_to INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);
```

---

## Configuration Setup

### 1. Backend Config
Navigate to the `/backend` folder and configure a `.env` file with the following variables:
```env
PORT=5000
DB_HOST=127.0.0.1
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=task_manager
JWT_SECRET=your_jwt_signature_key
```

### 2. Frontend Config
Navigate to the `/frontend` folder. Standard API requests are wired to target `http://localhost:5000` inside [api.ts](frontend/src/services/api.ts).

---

## Running the Application Locally

### 1. Install Dependencies
You must install node dependencies in both subdirectories:
```bash
# In backend folder
cd backend
npm install

# In frontend folder
cd ../frontend
npm install
```

### 2. Run the Backend API Server
```bash
cd backend
npm run dev
# The API server will start on http://localhost:5000
```

### 3. Run the Frontend Development Server
```bash
cd frontend
npm run dev
# Vite server will launch. Open http://localhost:5173 in your browser
```

---

## Creating Admin Accounts

Since public registration is locked to the `User` role (by design, for security), Admin accounts must be created using one of the following approaches:

### Option A: Using the Seed Script (Recommended)
A helper script is included in the backend to create or promote an Admin account:
```bash
cd backend
npm run seed:admin
```
This will either:
- **Create** a new admin account with default credentials (`admin@taskmanager.com` / `adminpassword123`).
- **Promote** an existing account with that email to the `Admin` role.

> **Note**: Change the default credentials inside `backend/seed-admin.js` before running if you want a custom email or password.

### Option B: Direct SQL Query
You can also manually promote any registered user to Admin directly in your MySQL database:
```sql
UPDATE users SET role = 'Admin' WHERE email = 'your-user@example.com';
```
Or create a brand-new admin account in one SQL statement (replace the hash with a bcrypt-hashed password):
```sql
INSERT INTO users (name, email, password, role) 
VALUES ('Admin Name', 'admin@example.com', '$2a$10$...bcrypt_hash...', 'Admin');
```
