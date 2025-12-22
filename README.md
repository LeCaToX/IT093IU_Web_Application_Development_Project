# NexFlixx - Video Streaming Platform

A full-stack video streaming platform built with React and Spring Boot.

## Prerequisites

### For Docker Setup (Recommended)
- Docker Desktop installed and running

### For Manual Setup
- Node.js 18+ and npm
- Java 21 (JDK)
- MySQL 8.0

---

## Option 1: Run with Docker (Recommended)

This is the easiest way to run the entire application.

### Step 1: Clone the Repository

```bash
git clone https://github.com/Ryuma-sudo/IT093IU_Web_Application_Development_Project.git
cd IT093IU_Web_Application_Development_Project
```

### Step 2: Start All Services

```bash
docker-compose up --build
```

Wait 2-3 minutes for all services to start.

### Step 3: Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:8080

### Step 4: Stop the Application

```bash
docker-compose down
```

To remove all data including database:

```bash
docker-compose down -v
```

---

## Option 2: Manual Setup (Development)

### Step 1: Set Up MySQL Database

Start MySQL and run:

```sql
CREATE DATABASE db;
CREATE USER 'admin'@'localhost' IDENTIFIED BY 'admin';
GRANT ALL PRIVILEGES ON db.* TO 'admin'@'localhost';
FLUSH PRIVILEGES;
```

### Step 2: Run the Backend

Open a terminal and navigate to the backend folder:

```bash
cd be
```

Set environment variables:

**Windows (PowerShell):**
```powershell
$env:MYSQL_HOST="localhost"
$env:MYSQL_PORT="3306"
$env:MYSQL_DATABASE="db"
$env:MYSQL_USER="admin"
$env:MYSQL_PASSWORD="admin"
```

**Windows (Command Prompt):**
```cmd
set MYSQL_HOST=localhost
set MYSQL_PORT=3306
set MYSQL_DATABASE=db
set MYSQL_USER=admin
set MYSQL_PASSWORD=admin
```

**Mac/Linux:**
```bash
export MYSQL_HOST=localhost
export MYSQL_PORT=3306
export MYSQL_DATABASE=db
export MYSQL_USER=admin
export MYSQL_PASSWORD=admin
```

Run the backend:

```bash
# Windows
.\mvnw.cmd spring-boot:run

# Mac/Linux
./mvnw spring-boot:run
```

The backend will start on http://localhost:8080

### Step 3: Run the Frontend

Open a new terminal and navigate to the frontend folder:

```bash
cd fe
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will start on http://localhost:5173

---

## Default Login Accounts

| Username | Password | Role |
|----------|----------|------|
| admin | 123456789 | Admin |
---

## Project Structure

```
├── be/                  # Backend (Spring Boot)
│   ├── src/main/java/   # Java source code
│   └── src/main/resources/application.properties
│
├── fe/                  # Frontend (React + Vite)
│   ├── src/             # React source code
│   └── public/          # Static assets
│
└── docker-compose.yml   # Docker configuration
```

---

## Tech Stack

- Frontend: React 18, Vite, TailwindCSS, Zustand
- Backend: Spring Boot 3.2.3, Spring Security, JWT
- Database: MySQL 8.0
- Storage: Cloudinary
- Container: Docker Compose
