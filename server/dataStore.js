/**
 * IssueHub Unified Data Access Layer
 * Supports MongoDB when available, with automatic fallback to an in-memory/seed store.
 */

const bcrypt = require('bcryptjs');

let mongoConnected = false;

// Canonical Seed Users
const SEED_USERS = [
  {
    _id: 'usr_student_01',
    name: 'Alex Rivera',
    email: 'student@issuehub.edu',
    legacyEmail: 'student@resolvex.edu',
    passwordHash: bcrypt.hashSync('Password123!', 10),
    role: 'student',
    studentId: 'CS20240901',
    department: 'Computer Science & Engineering',
    phone: '+1 (555) 234-5678',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'usr_admin_01',
    name: 'Dr. Sarah Jenkins',
    email: 'admin@issuehub.edu',
    legacyEmail: 'admin@resolvex.edu',
    passwordHash: bcrypt.hashSync('AdminPass123!', 10),
    role: 'admin',
    department: 'Dean of Student Affairs',
    phone: '+1 (555) 876-5432',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'usr_grievance_01',
    name: 'Justice R. K. Verma',
    email: 'grievance@issuehub.edu',
    legacyEmail: 'grievance@resolvex.edu',
    passwordHash: bcrypt.hashSync('GrievancePass123!', 10),
    role: 'grievance_officer',
    department: 'Ombudsman & Grievance Cell',
    phone: '+1 (555) 345-6789',
    createdAt: new Date().toISOString()
  }
];

// Canonical Seed Complaints
const SEED_COMPLAINTS = [
  {
    _id: 'cmp_wifi_01',
    subject: 'The WiFi in the CSE block has not been working for three days',
    description: 'The WiFi in the CSE block has not been working for three days. Students in the 3rd floor computer lab cannot submit assignments or access academic portals.',
    category: 'IT/WiFi',
    priority: 'High',
    status: 'Pending',
    student: 'usr_student_01',
    studentId: 'CS20240901',
    studentName: 'Alex Rivera',
    studentEmail: 'student@issuehub.edu',
    location: 'CSE Block, 3rd Floor Labs',
    isSensitive: false,
    upvotes: 18,
    upvotedBy: [],
    isKnownIssue: true,
    clarificationThread: [],
    auditLog: [
      {
        action: 'SUBMITTED',
        performedBy: 'Alex Rivera',
        role: 'student',
        timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
        details: 'Initial complaint filed via AI Natural Language Intake.'
      }
    ],
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    _id: 'cmp_hostel_02',
    subject: 'Hot water geyser malfunctioning in Block B 2nd floor',
    description: 'The geyser in the north wing washroom of Block B is tripping the main circuit breaker whenever powered on.',
    category: 'Hostel',
    priority: 'Medium',
    status: 'In Progress',
    student: 'usr_student_01',
    studentId: 'CS20240901',
    studentName: 'Alex Rivera',
    studentEmail: 'student@issuehub.edu',
    location: 'Hostel Block B, 2nd Floor North',
    assignedOfficer: 'Estate Electrical Maintenance',
    isSensitive: false,
    upvotes: 7,
    upvotedBy: [],
    isKnownIssue: false,
    clarificationThread: [
      {
        sender: 'Estate Electrical Maintenance',
        role: 'admin',
        message: 'A replacement heating element has been dispatched with technician Dave.',
        timestamp: new Date(Date.now() - 86400000).toISOString()
      }
    ],
    auditLog: [
      {
        action: 'STATUS_CHANGE',
        performedBy: 'Dr. Sarah Jenkins',
        role: 'admin',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        details: 'Status transitioned from Pending to In Progress.'
      }
    ],
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    _id: 'cmp_academic_03',
    subject: 'Flickering HDMI projector in Lecture Hall 402',
    description: 'The digital projector flickers violently every 30 seconds during data structures presentations.',
    category: 'Academic',
    priority: 'Low',
    status: 'Resolved',
    student: 'usr_student_01',
    studentId: 'CS20240901',
    studentName: 'Alex Rivera',
    studentEmail: 'student@issuehub.edu',
    location: 'Academic Complex, Room 402',
    isSensitive: false,
    upvotes: 4,
    upvotedBy: [],
    isKnownIssue: false,
    resolutionNotes: 'Technician inspected the AV console; replaced the 15m faulty HDMI high-speed cable and recalibrated lamp timing.',
    proofOfFix: 'Replaced cable verified with 4K HDMI test signal.',
    resolvedAt: new Date(Date.now() - 86400000).toISOString(),
    clarificationThread: [],
    auditLog: [
      {
        action: 'RESOLVED',
        performedBy: 'Dr. Sarah Jenkins',
        role: 'admin',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        details: 'Complaint resolved with verified fix.'
      }
    ],
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    _id: 'cmp_mess_04',
    subject: 'Mess dinner food hygiene and undercooked meals',
    description: 'Several students reported undercooked rice and unwashed greens during Tuesday night dinner service.',
    category: 'Mess',
    priority: 'Medium',
    status: 'In Review',
    student: 'usr_student_01',
    studentId: 'CS20240901',
    studentName: 'Alex Rivera',
    studentEmail: 'student@issuehub.edu',
    location: 'Central Dining Hall 2',
    isSensitive: false,
    upvotes: 42,
    upvotedBy: [],
    isKnownIssue: true,
    clarificationThread: [],
    auditLog: [
      {
        action: 'UNDER_REVIEW',
        performedBy: 'Dr. Sarah Jenkins',
        role: 'admin',
        timestamp: new Date(Date.now() - 12 * 3600000).toISOString(),
        details: 'Referred to Hostel Mess Advisory Committee.'
      }
    ],
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 3600000).toISOString()
  },
  {
    _id: 'cmp_infra_05',
    subject: 'Request for individual ergonomic gaming chairs in library',
    description: 'Requesting soft luxury reclining beanbags and gaming chairs in the quiet study corner.',
    category: 'Infrastructure',
    priority: 'Low',
    status: 'Rejected',
    student: 'usr_student_01',
    studentId: 'CS20240901',
    studentName: 'Alex Rivera',
    studentEmail: 'student@issuehub.edu',
    location: 'Central Library Floor 2',
    isSensitive: false,
    upvotes: 1,
    upvotedBy: [],
    isKnownIssue: false,
    resolutionNotes: 'Standard ergonomic library wooden chairs conform to fire safety and space regulations. Custom furniture not permitted.',
    clarificationThread: [],
    auditLog: [
      {
        action: 'REJECTED',
        performedBy: 'Dr. Sarah Jenkins',
        role: 'admin',
        timestamp: new Date(Date.now() - 6 * 86400000).toISOString(),
        details: 'Rejected as non-compliant with campus facilities policy.'
      }
    ],
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 86400000).toISOString()
  },
  {
    _id: 'cmp_grievance_06',
    subject: 'Confidential: Repeated verbal bullying and intimidation',
    description: 'An escalated grievance regarding sustained harassment outside the campus cafeteria after evening sports practice.',
    category: 'Other',
    priority: 'Urgent',
    status: 'Escalated',
    student: 'usr_student_01',
    studentId: 'CS20240901',
    studentName: 'Anonymous (Protected)',
    studentEmail: 'student@issuehub.edu',
    location: 'East Sports Quadrangle',
    isSensitive: true,
    assignedOfficer: 'Justice R. K. Verma',
    upvotes: 0,
    upvotedBy: [],
    isKnownIssue: false,
    clarificationThread: [],
    auditLog: [
      {
        action: 'ESCALATED_TO_GRIEVANCE_OFFICER',
        performedBy: 'System Security Filter',
        role: 'system',
        timestamp: new Date(Date.now() - 10 * 3600000).toISOString(),
        details: 'Flagged as sensitive grievance. Access restricted to Grievance Officer role.'
      }
    ],
    createdAt: new Date(Date.now() - 10 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 3600000).toISOString()
  }
];

class MemoryStore {
  constructor() {
    this.users = JSON.parse(JSON.stringify(SEED_USERS));
    this.complaints = JSON.parse(JSON.stringify(SEED_COMPLAINTS));
  }

  // --- Users ---
  findUserByEmail(email) {
    if (!email) return null;
    const clean = email.trim().toLowerCase();
    return this.users.find(u => 
      u.email.toLowerCase() === clean || 
      (u.legacyEmail && u.legacyEmail.toLowerCase() === clean)
    );
  }

  findUserById(id) {
    return this.users.find(u => String(u._id) === String(id) || String(u.id) === String(id));
  }

  createUser(userData) {
    const newUser = {
      _id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      ...userData,
      createdAt: new Date().toISOString()
    };
    this.users.push(newUser);
    return newUser;
  }

  // --- Complaints ---
  getAllComplaints(filters = {}) {
    let list = [...this.complaints];

    if (filters.status && filters.status !== 'All') {
      list = list.filter(c => c.status && c.status.toLowerCase() === filters.status.toLowerCase());
    }

    if (filters.category && filters.category !== 'All') {
      list = list.filter(c => c.category && c.category.toLowerCase() === filters.category.toLowerCase());
    }

    if (filters.priority && filters.priority !== 'All') {
      list = list.filter(c => c.priority && c.priority.toLowerCase() === filters.priority.toLowerCase());
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(c =>
        (c.subject && c.subject.toLowerCase().includes(q)) ||
        (c.description && c.description.toLowerCase().includes(q)) ||
        (c.location && c.location.toLowerCase().includes(q)) ||
        (c.studentName && c.studentName.toLowerCase().includes(q)) ||
        String(c._id).toLowerCase().includes(q)
      );
    }

    // Sort newest first by default
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getComplaintsByStudent(studentId, studentEmail) {
    return this.complaints.filter(c => {
      const matchId = String(c.student) === String(studentId);
      const matchEmail = studentEmail && (c.studentEmail === studentEmail || c.studentEmail === 'student@resolvex.edu');
      return matchId || matchEmail;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getKnownIssues() {
    return this.complaints.filter(c => c.isKnownIssue || c.upvotes > 5);
  }

  getGrievanceComplaints() {
    return this.complaints.filter(c => c.isSensitive || c.status === 'Escalated' || c.priority === 'Urgent');
  }

  getComplaintById(id) {
    return this.complaints.find(c => String(c._id) === String(id) || String(c.id) === String(id));
  }

  createComplaint(complaintData) {
    const newId = `cmp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newComplaint = {
      _id: newId,
      id: newId,
      upvotes: 0,
      upvotedBy: [],
      clarificationThread: [],
      auditLog: [
        {
          action: 'SUBMITTED',
          performedBy: complaintData.studentName || 'Student',
          role: 'student',
          timestamp: new Date().toISOString(),
          details: complaintData.isAIGenerated 
            ? 'Filed using IssueHub AI Natural Language Intake.' 
            : 'Filed manually by student.'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...complaintData,
      status: complaintData.isSensitive ? 'Escalated' : (complaintData.status || 'Pending')
    };

    this.complaints.unshift(newComplaint);
    return newComplaint;
  }

  updateComplaint(id, updates) {
    const idx = this.complaints.findIndex(c => String(c._id) === String(id) || String(c.id) === String(id));
    if (idx === -1) return null;

    this.complaints[idx] = {
      ...this.complaints[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return this.complaints[idx];
  }

  addClarification(id, messageObj) {
    const complaint = this.getComplaintById(id);
    if (!complaint) return null;

    if (!complaint.clarificationThread) complaint.clarificationThread = [];
    complaint.clarificationThread.push({
      ...messageObj,
      timestamp: new Date().toISOString()
    });
    complaint.updatedAt = new Date().toISOString();
    return complaint;
  }

  addAuditLog(id, logObj) {
    const complaint = this.getComplaintById(id);
    if (!complaint) return null;

    if (!complaint.auditLog) complaint.auditLog = [];
    complaint.auditLog.push({
      ...logObj,
      timestamp: new Date().toISOString()
    });
    complaint.updatedAt = new Date().toISOString();
    return complaint;
  }
}

const memoryStore = new MemoryStore();

module.exports = {
  memoryStore,
  isMongoConnected: () => mongoConnected,
  setMongoConnected: (val) => { mongoConnected = val; }
};
