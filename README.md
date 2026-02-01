# Clinic Appointment and Prescription Management System

## Description

This project is a full‑stack clinic appointment and prescription management system that digitizes core hospital and clinic workflows. It provides secure user authentication, comprehensive appointment management, and a dedicated doctors page where patients can browse doctor profiles, apply smart filters (such as specialty and availability), book appointments, and submit feedback on their visits. The system also covers prescription handling, pharmacy and lab workflows, and supports scheduling views, analytics, and exports of medical and operational reports.

## Features

- User authentication and authorization
- Appointment management (create, update, cancel)
- Doctors page with smart filtering and availability views
- Prescription creation and management
- Pharmacy and lab workflow support
- Background jobs and automated tasks (e.g., maintenance, reminders)
- Feedback capture for doctors and visits
- Calendars for schedules and availability
- Analytics dashboards and operational reports (PDF/Excel)

## Technologies Used

### Backend

- **Node.js** – JavaScript runtime
- **Express** – REST API framework
- **MongoDB + Mongoose** – Database and ODM
- **Authentication & Security**
  - JSON Web Tokens (JWT)
  - bcrypt
  - express-rate-limit
  - cors
  - cookie-parser
- **Scheduling / Background Jobs**
  - node-cron
- **File Handling & Documents**
  - multer (file uploads)
  - pdfkit (PDF generation)
  - exceljs (Excel export)
- **Other Utilities**
  - date-fns, node-fetch, morgan

### Frontend

- **React** – Single-page application (SPA)
- **Vite** – Bundler and dev server
- **Routing** – react-router-dom
- **UI & Styling**
  - Bootstrap 5
  - Tailwind CSS
  - clsx
  - React Icons, lucide-react
- **Appointments & Scheduling UI**
  - FullCalendar (`@fullcalendar/react`, `daygrid`, `timegrid`, `interaction`)
- **Charts & Analytics**
  - Recharts
- **Export & Reporting**
  - html2pdf.js
  - jsPDF
  - XLSX

### Testing & Tooling

- **Backend Testing**
  - Jest
  - Supertest
  - mongodb-memory-server
- **Frontend Testing**
  - Vitest (unit tests, coverage, UI mode)
- **Linting & Build Tools**
  - ESLint (with React Hooks & React Refresh plugins)
  - PostCSS, Autoprefixer
  - Tailwind/PostCSS plugins

For more details on how tests are structured and how to run them, see `TESTING.md`.

## Project Structure

- `backend/` – Express server, MongoDB models, services, scripts, and tests
- `frontend/` – React SPA source, Vite config, and UI assets
- `docs/` – Flow diagrams, maintenance notes, and feature documentation

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- npm or yarn
- A running MongoDB instance (local or remote)

### Backend Setup

```bash
cd backend
npm install

# Environment variables (create .env based on your setup)
# Example keys (adjust as needed):
#   MONGODB_URI=
#   JWT_SECRET=
#   PORT=5000

# Start in development mode
npm run dev

# Or start normally
npm start
```

### Frontend Setup

```bash
cd frontend
npm install

# Start the development server
npm run dev
```

By default, the frontend is configured to communicate with the backend API via HTTP; adjust base URLs in the frontend configuration or API helper modules if your backend runs on a different host/port.

## Running Tests

### Backend Tests

```bash
cd backend
npm test          # Run Jest test suite
npm run test:watch
npm run test:coverage
```

### Frontend Tests

```bash
cd frontend
npm test          # Run Vitest test suite
npm run test:ui   # Vitest UI
npm run test:coverage
```

For additional testing details and conventions, refer to `TESTING.md`.
