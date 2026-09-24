# IssueHub — Backend API Architecture (Evaluator Guide)

This document describes the design, architecture, security implementation, and API specification of the **IssueHub Backend** for academic and technical evaluators.

---

## 🏛️ Architectural Overview

The IssueHub backend follows a decoupled **Model-View-Controller (MVC) + Service Layer** pattern built on **Node.js, Express, and MongoDB (Mongoose)**:

```text
backend/
├── config/
│   └── db.js                 # Database connection & non-blocking resilience engine
├── models/
│   ├── User.js               # Mongoose schema for Student, Admin, Grievance Officer
│   └── Complaint.js          # Mongoose schema for complaint state machine & audit log
├── controllers/
│   ├── authController.js     # User registration, login, JWT issuance, profile lookup
│   ├── complaintController.js# Complaint lifecycle (CRUD, withdrawal, satisfaction, upvotes)
│   ├── adminController.js    # Multi-dimensional triage, status transitions, resolution with proof
│   └── grievanceController.js# Ombudsman confidential disputes & sealed rulings
├── middleware/
│   └── auth.js               # JWT bearer token verification & Role-Based Access Control (RBAC)
├── routes/
│   ├── authRoutes.js         # /api/auth endpoints
│   ├── complaintRoutes.js    # /api/complaints endpoints
│   ├── adminRoutes.js        # /api/admin endpoints
│   ├── grievanceRoutes.js    # /api/grievance endpoints
│   └── aiRoutes.js           # /api/ai complaint natural language structuring
├── services/
│   ├── aiService.js          # Natural Language Processing & LLM intake engine
│   └── dataStore.js          # In-memory resilient seed store (guarantees 100% demo uptime)
├── scripts/
│   └── seed.js               # Automated database seeder
├── server.js                 # Express application runner on PORT 5000
└── .env.example              # Environment variables template
```

---

## 🔒 Security & Authentication Architecture

1. **Password Hashing**:
   * All passwords are encrypted using **bcrypt** with a work factor of **10 salt rounds** prior to persistence.
2. **Stateless JWT Sessions**:
   * Uses HMAC SHA-256 tokens (`jsonwebtoken`) with 7-day expiration.
   * Signed with a secure `JWT_SECRET`.
3. **Role-Based Access Control (RBAC)**:
   * Endpoints are protected by `authenticateToken` and `requireRole('admin')` or `requireRole('grievance_officer')`.
   * Unauthenticated requests are rejected with `401 Unauthorized`.
   * Unauthorized role escalations (e.g., student calling admin triage) are blocked with `403 Forbidden`.
4. **Confidential Ombudsman Protocol**:
   * Sensitive complaints (harassment, ethical disputes) automatically set `isSensitive: true` and `status: 'Escalated'`.
   * Student identities are masked (`Protected Complainant`) from general facilities staff and visible only to the Ombudsman cell.

---

## 📊 Database Schema Design

### 1. User Model (`models/User.js`)
* `name`: String (Required)
* `email`: String (Unique, Indexed, Lowercase)
* `password`: String (Hashed with bcrypt)
* `role`: Enum `['student', 'admin', 'grievance_officer']` (Default: `'student'`)
* `studentId`: String (Optional, for students)
* `department`: String
* `phone`: String
* `createdAt`: Date

### 2. Complaint Model (`models/Complaint.js`)
* `subject`: String (Required, trimmed)
* `description`: String (Required)
* `category`: Enum `['Hostel', 'Academic', 'Infrastructure', 'Mess', 'IT/WiFi', 'Transport', 'Other']`
* `priority`: Enum `['Low', 'Medium', 'High', 'Urgent']` (Default: `'Medium'`)
* `status`: State machine enum:
  * `Pending` ➔ `In Review` ➔ `In Progress` ➔ `Resolved`
  * Alternative terminal states: `Rejected`, `Escalated`, `Withdrawn`
* `student`: ObjectId (Ref: User)
* `studentName`: String
* `studentEmail`: String
* `location`: String
* `isSensitive`: Boolean (Grievance flag)
* `upvotes`: Number (Deflection counter)
* `upvotedBy`: Array of ObjectIds
* `resolutionNotes`: String (Admin resolution details)
* `proofOfFix`: String (Work order reference or verification signal)
* `studentConfirmed`: Boolean (Student verified satisfaction)
* `clarificationThread`: Array of `{ sender, role, message, timestamp }`
* `auditLog`: Tamper-evident array of `{ action, performedBy, role, timestamp, details }`

---

## 📑 API Endpoint Catalog

### Authentication (`/api/auth`)
* `POST /api/auth/login` — Authenticate and receive JWT token + user profile.
* `POST /api/auth/register` — Create new student/admin account.
* `GET /api/auth/me` — Retrieve current session user.
* `POST /api/auth/logout` — Terminate session.

### Student Complaints (`/api/complaints`)
* `GET /api/complaints/my` — Fetch complaints filed by the authenticated student.
* `POST /api/complaints` — Submit a new grievance ticket.
* `GET /api/complaints/:id` — Retrieve detailed ticket information.
* `POST /api/complaints/:id/withdraw` — Student self-service cancellation with reason.
* `POST /api/complaints/:id/confirm-resolution` — Student marks resolution satisfaction.
* `POST /api/complaints/:id/upvote` — Upvote active known issues.
* `POST /api/complaints/:id/clarification` — Send bi-directional message in clarification thread.
* `GET /api/complaints/known-issues` — Fetch active known campus alerts to avoid duplicate filing.

### Administration & Facilities (`/api/admin`)
* `GET /api/admin/complaints` — Filter complaints by status, category, priority, or search term.
* `GET /api/admin/stats` — Calculate executive KPIs and departmental breakdown.
* `PATCH /api/admin/complaints/:id/status` — State machine transition with audit comment.
* `POST /api/admin/complaints/:id/resolve` — Mark resolved with mandatory notes and proof of fix.

### Ombudsman & Ethics Cell (`/api/grievance`)
* `GET /api/grievance/complaints` — Access confidential dispute queue with shielded identity.
* `POST /api/grievance/complaints/:id/resolve` — Enact and seal formal ombudsman ruling.

### AI Natural Language Intake (`/api/ai`)
* `POST /api/ai/parse-complaint` — AI extracts title, category, and details from natural speech.
* `GET /api/ai/health` — Microservice health status.

---

## 🔑 Pre-Seeded Evaluator Accounts

| Role | Email | Password | Pre-seeded Permissions |
| :--- | :--- | :--- | :--- |
| **Student** | `student@issuehub.edu` | `Password123!` | File tickets, upvote, withdraw, confirm resolution |
| **Admin** | `admin@issuehub.edu` | `AdminPass123!` | Triage all tickets, update statuses, resolve with proof |
| **Grievance Officer** | `grievance@issuehub.edu` | `GrievancePass123!` | Protected Ombudsman queue, sealed case rulings |

---

## ⚡ Quick Start for Evaluators

Inside the `backend/` directory:

```bash
# 1. Install dependencies
npm install

# 2. Run the server
npm start
```

The server will launch on **http://localhost:5000** and output:
```text
🚀 IssueHub Backend API Server running on http://localhost:5000
   Base API URL: http://localhost:5000/api
   Health Check: http://localhost:5000/api/health
```
