# Full-Stack Task Manager

A comprehensive task manager application built with React (Next.js), Go (Gin), and PostgreSQL.

## Prerequisites

- [Go](https://go.dev/dl/) (1.20+)
- [Node.js](https://nodejs.org/) (18+)
- [PostgreSQL](https://www.postgresql.org/download/)

## Project Structure

- `backend/`: Go API server using Gin framework and GORM
- `frontend/`: Next.js 14 application with Tailwind CSS

## Setup Instructions

### 1. Database Setup

Ensure PostgreSQL is running. The application expects a database named `taskmanager`.
The default connection string is `postgres://postgres:watjhfrg4h83eyhchGxuM8@localhost/taskmanager`.

If you need to change this, update `backend/.env`.

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
go mod download
```

Run the server:

```bash
go run main.go
```

The server will start on `http://localhost:8080`.
On first run, it will automatically migrate the database schema and seed initial data if the database is empty.

To run tests:

```bash
go test ./handlers/...
```

### 3. Frontend Setup

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

To run tests:

```bash
npm test
```

## Features

- Create, Read, Update, Delete tasks
- Task status (pending, in-progress, completed)
- Priority levels (low, medium, high)
- Due dates and Assignees
- Responsive UI
