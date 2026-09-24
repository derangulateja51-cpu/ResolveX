# ResolveX — Student Complaint Management System

> **Campus-Wide AI-Assisted Complaint Intake, Resolution State Machine, & Ombudsman Governance Platform**  
> *Developed for College & Hackathon Excellence by a 5-Member Engineering Team.*

---

## 1. Project Overview
**ResolveX** is a unified digital grievance management and deflection platform engineered for higher education institutions. It streamlines how students submit grievances regarding campus facilities, academics, hostel accommodations, IT/WiFi networks, and dining facilities.

ResolveX incorporates modern AI natural-language parsing, an administrative resolution state machine, self-service issue deflection, tamper-evident audit trails, and confidential ombudsman grievance handling.

---

## 2. Problem Statement
Traditional university complaint mechanisms face several persistent challenges:
- **Unstructured Reports**: Students submit ambiguous, rambling descriptions without actionable details, categorizations, or locations.
- **Duplicate Ticket Flooding**: When widespread incidents occur (such as a router failure in a lecture block), hundreds of students file identical tickets, overwhelming maintenance staff.
- **Lack of Transparency**: Students remain unaware of work progress, technician assignments, or estimated times to resolution.
- **Sensitive Grievance Exposure**: Whistleblower reports, harassment allegations, or critical safety disputes get mixed into public queues without privacy protections.

**ResolveX** solves these issues with AI natural-language complaint structuring, duplicate deflection via active known issues, real-time audit timelines, and role-segregated confidential grievance workflows.

---

## 3. Features
- 🤖 **AI Natural-Language Complaint Intake**: Students describe problems in everyday language; our server-side AI extracts concise subjects, categorized classifications, and structured details.
- 🛡️ **Client Review & Edit Gate**: AI output is strictly validated and presented to the student for verification; AI *never* directly submits a ticket.
- ⚡ **Resilient Offline NLP Fallback**: If LLM API keys are unconfigured or external cloud APIs time out, the system automatically engages an intelligent offline heuristic parser or smoothly transitions to manual entry.
- 📊 **Dynamic Role-Based Dashboards**: Tailored views for Students, Administrators, and Grievance Officers.
- 🔍 **Search, Filter & Sort**: Comprehensive filtering by status, department category, priority, and ticket ID.
- 👥 **Self-Service Issue Deflection (Support Voting)**: Students can upvote active known incidents, raising priority while avoiding duplicate ticket submissions.
- 🔄 **Status State Machine & Resolution Proof**: Admin workflow covering `Pending` ➔ `In Review` ➔ `In Progress` ➔ `Resolved` with mandatory resolution summaries and proof-of-fix notes.
- 💬 **Interactive Clarification Threads**: Direct, asynchronous communication between students and administrators.
- 🔒 **Confidential Grievance Protocol**: Data masking and segregated queues for sensitive issues handled exclusively by the Ombudsman / Grievance Officer.
- 📜 **Tamper-Evident Audit Trails**: Chronological logs capturing every status transition, assignment, and action.

---

## 4. User Roles & Access Matrix

| Role | Access Permissions | Key Views |
| :--- | :--- | :--- |
| **Student** | Create complaints (AI & manual), track own tickets, withdraw pending tickets, upvote known issues, confirm resolution satisfaction. | Dashboard, Report Complaint, Detail View, History, Known Issues |
| **Admin** | View all campus complaints, update status state machine, assign technicians, submit resolutions with proof-of-fix, filter across departments. | Admin Dashboard, Complaint Management, Resolution Interface |
| **Grievance Officer** | Inspect sensitive/escalated grievances, access protected identity logs, conduct formal inquiries, execute sealed ombudsman rulings. | Grievance Officer Portal, Sensitive Queue, Formal Inquiries |

---

## 5. System Architecture

```
                          ┌─────────────────────────────────────┐
                          │         React Frontend (Vite)       │
                          │   Port 5173 (Dark Glassmorphic UI)  │
                          └──────────────────┬──────────────────┘
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       │ HTTP / REST APIs                          │
                       ▼                                           ▼
      ┌─────────────────────────────────┐        ┌──────────────────────────────────┐
      │     Main Backend API Server     │        │     ResolveX AI Intake Service   │
      │    Port 5000 (Members 1 - 4)    │        │         Port 5001 (Member 5)     │
      ├─────────────────────────────────┤        ├──────────────────────────────────┤
      │ • /api/auth (JWT Auth & Cookies)│        │ • POST /api/ai/parse-complaint   │
      │ • /api/complaints (CRUD & State)│        │ • Server-Side LLM Key Protection │
      │ • /api/admin (Resolution Engine)│        │ • Strict Schema Validation       │
      │ • /api/grievance (Audit Trails) │        │ • Offline NLP Fallback Engine    │
      └────────────────┬────────────────┘        └──────────────────────────────────┘
                       │
                       ▼
      ┌─────────────────────────────────┐
      │        MongoDB Database         │
      │   Collections: Users, Complaints│
      └─────────────────────────────────┘
```

---

## 6. Technology Stack
- **Frontend**: React 18, Vite, React Router DOM v6, Lucide Icons, Vanilla CSS (Glassmorphism & Obsidian Dark Theme)
- **Backend Services**: Node.js, Express.js, Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens), bcryptjs password hashing
- **Database**: MongoDB (Local or MongoDB Atlas)
- **AI / LLM Integration**: Google Gemini 1.5 Flash API (server-side proxy), deterministic NLP heuristic fallback
- **Automated Testing**: Postman Collection v2.1.0 with comprehensive `pm.test()` assertions

---

## 7. Project Structure
```
webforce/
├── frontend/                     # React + Vite Frontend Application (Member 5)
│   ├── public/                   # Static assets
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   │   ├── ComplaintCard.jsx # Dynamic complaint summary card with upvote
│   │   │   ├── EmptyState.jsx    # Illustrated zero-data states
│   │   │   ├── ErrorBanner.jsx   # Error & network alert bars
│   │   │   ├── LoadingSpinner.jsx# Animated loading indicator
│   │   │   ├── Navbar.jsx        # Role-based header with demo switcher
│   │   │   ├── PriorityBadge.jsx # Color-coded priority indicators
│   │   │   ├── ProtectedRoute.jsx# Auth & role permission guards
│   │   │   └── StatusBadge.jsx   # Glowing status pill badges
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Session management & user roles
│   │   ├── pages/                # All Application Views
│   │   │   ├── AdminComplaintManagement.jsx # Admin management & table
│   │   │   ├── AdminDashboard.jsx           # Admin analytics & overview
│   │   │   ├── AdminResolutionInterface.jsx # State machine & proof of fix
│   │   │   ├── ComplaintDetail.jsx          # Ticket inspection & withdrawal
│   │   │   ├── ComplaintHistory.jsx         # Search, filters, sort
│   │   │   ├── GrievancePortal.jsx          # Sensitive ombudsman console
│   │   │   ├── KnownIssues.jsx              # Self-service issue deflection
│   │   │   ├── Login.jsx                    # Sign in & 1-click test fills
│   │   │   ├── ReportComplaint.jsx          # AI Natural-Language intake
│   │   │   └── StudentDashboard.jsx         # Student home & stats
│   │   ├── services/
│   │   │   ├── aiService.js      # Client AI caller with schema validation
│   │   │   ├── api.js            # Axios/Fetch client with JWT injector
│   │   │   ├── authService.js    # Auth caller & demo credentials fallback
│   │   │   └── complaintService.js# Complaint CRUD & local mock store
│   │   ├── App.jsx               # Route definitions
│   │   ├── index.css             # Obsidian Glassmorphic Design System
│   │   └── main.jsx              # DOM entrypoint
│   ├── .env                      # Frontend environment configuration
│   └── package.json              # Frontend dependencies
│
├── server/                       # AI Intake Service & Routes (Member 5)
│   ├── aiRoutes.js               # Express Router for AI endpoints
│   ├── aiServer.js               # Standalone runner on port 5001
│   └── aiService.js              # LLM caller, schema validator & NLP fallback
│
├── scripts/
│   └── seed.js                   # MongoDB/Mongoose database seeder (Member 5)
│
├── postman/                      # Automated API Test Suites (Member 5)
│   ├── ResolveX.postman_collection.json  # Comprehensive tests with pm.test()
│   └── ResolveX.postman_environment.json # BaseURL and dynamic JWT tokens
│
├── .env.example                  # Environment configuration template
├── .env                          # Local development environment file
├── package.json                  # Root runner scripts (seed, ai-server)
└── README.md                     # Comprehensive project documentation
```

---

## 8. Installation

Clone or extract the workspace and install root and frontend dependencies:

```bash
# 1. Install root dependencies (Express, Mongoose, bcryptjs, cors, dotenv)
npm install

# 2. Install frontend dependencies (React, Vite, React Router, Lucide Icons)
cd frontend
npm install
cd ..
```

---

## 9. Environment Variables

Create `.env` in the project root:
```env
# Server Configuration (Backend Port)
PORT=5000
MONGODB_URI=mongodb://localhost:27017/resolvex
JWT_SECRET=resolvex_super_secret_jwt_key_change_in_production
NODE_ENV=development

# Member 5 AI Intake Server (Kept Server-Side — NEVER expose to browser)
AI_SERVER_PORT=5001
GEMINI_API_KEY=your_gemini_api_key_here
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_AI_URL=http://localhost:5001/api/ai
```

---

## 10. Backend Setup (Members 1–4 Integration)
The main backend is implemented by Members 1–4:
- Runs on port `5000`.
- Requires MongoDB connection string (`MONGODB_URI`).
- Mounts `/api/auth`, `/api/complaints`, `/api/admin`, `/api/grievance`.
- The AI Intake routes from `server/aiRoutes.js` can be mounted directly into Express:
  ```javascript
  const aiRoutes = require('./server/aiRoutes');
  app.use('/api/ai', aiRoutes);
  ```

---

## 11. Frontend Setup
The frontend is built using Vite and React.
```bash
cd frontend
npm run dev
```
Accessible at: **`http://localhost:5173`**

---

## 12. MongoDB Setup
Ensure MongoDB is running locally on port 27017, or configure `MONGODB_URI` with a MongoDB Atlas connection string.

---

## 13. Seed Data Setup
Populate the database with pre-configured test users (Student, Admin, Grievance Officer) and sample complaints across all categories and statuses:

```bash
npm run seed
```

This script:
1. Connects to `MONGODB_URI`.
2. Hashes test passwords with standard 10-round `bcrypt`.
3. Creates student, admin, and grievance officer users.
4. Generates realistic complaints across all statuses (`Pending`, `In Progress`, `Resolved`, `Rejected`, `Escalated`) and categories (`IT/WiFi`, `Hostel`, `Academic`, `Mess`, `Infrastructure`, `Other`).

---

## 14. Running the Application

### Option A: Complete Development Stack
In separate terminal windows:
```bash
# Terminal 1: Run AI Intake Service
npm run ai-server

# Terminal 2: Run Frontend Dev Server
npm run frontend
```

### Option B: Monorepo Root Script
```bash
# Start frontend from root
npm run frontend
```

---

## 15. API Usage Specifications

### Authentication (Member 1)
- `POST /api/auth/login`: Authenticate with email/password; returns JWT token and user profile.
- `POST /api/auth/logout`: Clears authentication cookies / session.

### Complaints CRUD (Member 2)
- `GET /api/complaints/my`: Returns complaints filed by the authenticated student.
- `POST /api/complaints`: Creates a new complaint.
- `GET /api/complaints/:id`: Retrieves full details of a specific complaint.
- `POST /api/complaints/:id/withdraw`: Student self-service withdrawal with reason.
- `POST /api/complaints/:id/confirm-resolution`: Student confirms resolution satisfaction.

### Admin Management (Member 2 & 4)
- `GET /api/admin/complaints`: Administrative filterable complaint list.
- `PATCH /api/admin/complaints/:id/status`: Transitions complaint status state machine.
- `POST /api/admin/complaints/:id/resolve`: Submits resolution notes and proof of fix.

### Grievance Portal (Member 4)
- `GET /api/grievance/complaints`: Retrieves escalated, confidential grievances.

### AI Natural-Language Intake (Member 5)
- `POST /api/ai/parse-complaint`:
  - **Request Body**: `{ "prompt": "The WiFi in the CSE block has not been working for three days." }`
  - **Response**:
    ```json
    {
      "success": true,
      "data": {
        "subject": "The WiFi in the CSE block has not been working for three days",
        "description": "The WiFi in the CSE block has not been working for three days.",
        "category": "IT/WiFi"
      },
      "source": "gemini-llm"
    }
    ```

---

## 16. Authentication & Security
- **Server-Side API Key Storage**: The LLM API key (`GEMINI_API_KEY`) is stored strictly in server-side environment variables and is never exposed in browser bundles.
- **JWT Protection**: Tokens are passed via the standard `Authorization: Bearer <token>` header.
- **Role-Based Guards**: Protected routes (`ProtectedRoute.jsx`) inspect user roles (`student`, `admin`, `grievance_officer`) and block unauthorized access.
- **Student Privacy & Data Masking**: Sensitive grievance reports mask identifying student data from standard administrative views.

---

## 17. AI Complaint Intake Architecture

1. **Natural Language Input**: Student describes their issue freely.
2. **Server-Side AI Proxy (`server/aiService.js`)**:
   - Strictly enforces an 8-second timeout.
   - Converts natural text to structured schema `{ subject, description, category }`.
   - Category is normalized into one of `['Hostel', 'Academic', 'Infrastructure', 'Mess', 'IT/WiFi', 'Transport', 'Other']`.
3. **Resilient Fallback**:
   - If external LLM times out or is unconfigured, the built-in deterministic heuristic NLP parser structures the data.
   - If parsing completely fails, the system signals `fallbackToManual: true`, seamlessly rendering the manual entry form with user input preserved.
4. **Human-in-the-Loop Review**:
   - The structured fields are presented in an editable card.
   - The student reviews and modifies any field.
   - The student explicitly clicks **"Review & Submit Complaint"** — the AI *never* submits on its own.

---

## 18. Postman Automated Testing

The repository contains an automated Postman test suite:
- **Collection File**: `postman/ResolveX.postman_collection.json`
- **Environment File**: `postman/ResolveX.postman_environment.json`

### Test Coverage Matrix:
- **AUTH**:
  - `1.1 Successful Student Login` (Extracts `userToken`, tests 200)
  - `1.2 Successful Admin Login` (Extracts `adminToken`, tests 200)
  - `1.3 Successful Grievance Officer Login` (Extracts `grievanceToken`, tests 200)
  - `1.4 Invalid Login - Wrong Password` (Tests 400/401 error response)
  - `1.5 Missing Credentials` (Tests 400 Bad Request)
  - `1.6 Unauthorized Request - No Token` (Tests 401 Unauthorized)
- **COMPLAINTS**:
  - `2.1 Create Complaint - Valid` (Extracts `complaintId`, tests 201)
  - `2.2 Create Complaint - Missing Fields` (Tests 400 validation error)
  - `2.3 Get Own Complaints` (Tests 200 array response)
  - `2.4 Get Complaint Details` (Tests 200 matching `complaintId`)
  - `2.5 Unauthorized Complaint Access` (Tests 401/403 with invalid token)
  - `2.6 Withdraw Complaint` (Tests status transition to `Withdrawn`)
- **ADMIN**:
  - `3.1 Admin Access - List All Complaints` (Tests 200 with `adminToken`)
  - `3.2 Unauthorized User Attempting Admin Operation` (Tests 403 Forbidden with `userToken`)
  - `3.3 Admin Status Update` (Tests 200 status update to `In Progress`)
  - `3.4 Admin Resolution Update` (Tests 200 status update to `Resolved`)
- **GRIEVANCE OFFICER**:
  - `4.1 Authorized Grievance Officer Access` (Tests 200 with `grievanceToken`)
  - `4.2 Unauthorized Grievance Access by Student` (Tests 403 Forbidden with `userToken`)
- **AI INTAKE**:
  - `5.1 Valid AI Natural-Language Intake` (Tests 200 and schema validation `{ subject, description, category }`)
  - `5.2 Invalid AI Request / Missing Text` (Tests 400 error and fallback signal)

### How to Run in Postman:
1. Open Postman ➔ Click **Import** ➔ Select `postman/ResolveX.postman_collection.json` and `postman/ResolveX.postman_environment.json`.
2. Select the **"ResolveX Environment"** in the top-right environment selector.
3. Open **ResolveX Collection** ➔ Click **Run Collection** ➔ All tests execute in sequence with dynamic token chaining.

---

## 19. Test Credentials

The database seeder and local demo mode provide three accounts:

| Role | Email | Password | Identifier / Department |
| :--- | :--- | :--- | :--- |
| **Student** | `student@resolvex.edu` | `Password123!` | Roll: `CS20240901` (Computer Science & Eng) |
| **Admin** | `admin@resolvex.edu` | `AdminPass123!` | Dean of Student Affairs |
| **Grievance Officer**| `grievance@resolvex.edu` | `GrievancePass123!` | Ombudsman & Grievance Cell |

> **Quick Testing Tip**: On the `/login` page, click any of the **"Quick Evaluation Logins"** buttons for instant 1-click credential filling! You can also toggle roles anytime using the navbar role switcher.

---

## 20. Team Member Responsibilities & Boundaries

| Member | Assigned Scope | Status & Interface Contract |
| :--- | :--- | :--- |
| **Member 1** | Authentication, JWT, Cookies, Authorization Middleware, Validation, Error Handling | `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` |
| **Member 2** | Complaint Schema, Complaint CRUD, Status State Machine, Withdrawal, Resolution Confirmation, Clarification Thread | `GET /api/complaints`, `POST /api/complaints`, `POST /:id/withdraw`, `POST /:id/confirm-resolution`, `POST /:id/clarification` |
| **Member 3** | Priority Scoring, Duplicate Detection, Support Voting (Upvotes), Known Issue Linking, Self-Service Deflection | `POST /:id/upvote`, `GET /api/complaints/known-issues` |
| **Member 4** | Sensitive Data Handling, Grievance Officer Role, Audit Log, Proof-of-Fix, Analytics | `GET /api/grievance/complaints`, `POST /api/admin/complaints/:id/resolve`, Audit schema |
| **Member 5 (Me)** | **React Frontend (All Pages), AI Natural-Language Intake, Postman Automated Tests, Seed Data, README Documentation** | Delivered complete in this repository. All contracts with Members 1–4 are cleanly abstracted in `frontend/src/services/`. |

---

## Verification & Health Check Commands
```bash
# Verify Frontend Production Build
cd frontend && npm run build

# Verify AI Intake Microservice
node server/aiServer.js

# Test AI Parser CLI
node -e "const { parseComplaintIntake } = require('./server/aiService'); parseComplaintIntake('The WiFi in the CSE block has not been working for three days.').then(console.log);"

# Run Database Seeder
npm run seed
```
