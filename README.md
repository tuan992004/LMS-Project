# Modern LMS Dashboard Navigation System

A professional, full-stack Learning Management System (LMS) designed for businesses. This platform provides a streamlined experience for students, teachers, and administrators to manage courses, assignments, and professional growth.

## 🚀 Overview

This project is a modern web application built with a React-based frontend and a Node.js Express backend. It features a robust role-based navigation system, real-time notifications, and a centralized dashboard for all learning activities.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router 7](https://reactrouter.com/)
- **Notifications**: [Sonner](https://sonner.stevenly.me/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express 5](https://expressjs.com/)
- **Database**: [MySQL 8.0](https://www.mysql.com/)
- **Authentication**: JWT (JSON Web Tokens) & Bcrypt
- **File Handling**: [Multer](https://github.com/expressjs/multer)

---

## ✨ Key Features

- **🔐 Secure Authentication**: JWT-based login with persistent sessions and logout functionality.
- **👥 Role-Based Portals**:
  - **Admin**: Full control over users, courses, and platform settings.
  - **Teacher**: Manage course content, announcements, and grade assignments.
  - **Student**: Enroll in courses, track progress, and submit missions.
- **📢 Broadcasting Hub**: Centralized system for announcements and updates across all user roles.
- **📅 Interactive Calendar**: Visualize upcoming deadlines, sessions, and events.
- **🔔 Real-time Notifications**: Instant alerts for course updates, grades, and system messages.
- **📊 Assignment Tracking**: "Mission Briefing" style UI for assignments with attachment support.

---

## 📂 Project Structure

```text
LMS-Project/
├── prj-frontend/       # React application (Vite-powered)
│   ├── src/components  # Reusable UI components
│   ├── src/pages       # Role-specific dashboard layouts
│   ├── src/stores      # Global state (Zustand)
│   └── src/hooks       # Custom React hooks
├── prj-backend/        # Express API
│   ├── src/controllers # Business logic
│   ├── src/routes      # API endpoints
│   ├── src/middlewares # Auth & validation layers
│   └── uploads/        # Storage for assignment attachments
└── test-lms-db.sql     # Database schema and seed data
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18+)
- MySQL Server

### 1. Database Setup
1. Create a MySQL database (e.g., `test_database`).
2. Import the `test-lms-db.sql` file located in the root directory.

### 2. Backend Configuration
1. Navigate to `/prj-backend`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your `.env` file:
   ```env
   DB_HOST=localhost
   DB_USER=your_user
   DB_PASSWORD=your_password
   DB_NAME=test_database
   ACCESS_TOKEN_SECRET=your_jwt_secret
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### 3. Frontend Configuration
1. Navigate to `/prj-frontend`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

---

## 📜 Development Scripts

### Backend
- `npm run dev`: Starts the server with `nodemon` for auto-restart.
- `npm start`: Runs the production server.

### Frontend
- `npm run dev`: Launches the Vite development server.
- `npm run build`: Generates the production build in `/dist`.
- `npm run lint`: Runs ESLint for code quality checks.

---

## 🤝 License
ISC License. See package files for details.
