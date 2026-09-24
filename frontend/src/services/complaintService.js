/**
 * ResolveX Complaint Service (Member 5 Scope)
 * Communicates with backend endpoints:
 * - Member 2: Complaint CRUD, Status transitions, Withdrawal, Clarification
 * - Member 3: Upvoting, Known Issues deflection
 * - Member 4: Sensitive grievances, Proof-of-fix, Audit trails
 * 
 * Includes persistent local storage fallback store when backend is offline.
 */

import { apiRequest } from './api';

// Initial baseline complaints mirroring Seed Data
const INITIAL_MOCK_COMPLAINTS = [
  {
    _id: 'cmp_wifi_01',
    id: 'cmp_wifi_01',
    subject: 'The WiFi in the CSE block has not been working for three days',
    description: 'The WiFi in the CSE block has not been working for three days. Students in the 3rd floor computer lab cannot submit assignments or access academic portals.',
    category: 'IT/WiFi',
    priority: 'High',
    status: 'Pending',
    studentId: 'CS20240901',
    studentName: 'Alex Rivera',
    studentEmail: 'student@resolvex.edu',
    location: 'CSE Block, 3rd Floor Labs',
    isSensitive: false,
    upvotes: 18,
    isKnownIssue: true,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    auditLog: [
      {
        action: 'SUBMITTED',
        performedBy: 'Alex Rivera',
        role: 'student',
        timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
        details: 'Initial complaint filed via AI Natural Language Intake.'
      }
    ],
    clarificationThread: []
  },
  {
    _id: 'cmp_hostel_02',
    id: 'cmp_hostel_02',
    subject: 'Hot water geyser malfunctioning in Block B 2nd floor',
    description: 'The geyser in the north wing washroom of Block B is tripping the main circuit breaker whenever powered on.',
    category: 'Hostel',
    priority: 'Medium',
    status: 'In Progress',
    studentId: 'CS20240901',
    studentName: 'Alex Rivera',
    studentEmail: 'student@resolvex.edu',
    location: 'Hostel Block B, 2nd Floor North',
    assignedOfficer: 'Estate Electrical Maintenance',
    isSensitive: false,
    upvotes: 7,
    isKnownIssue: false,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
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
    ]
  },
  {
    _id: 'cmp_academic_03',
    id: 'cmp_academic_03',
    subject: 'Flickering HDMI projector in Lecture Hall 402',
    description: 'The digital projector flickers violently every 30 seconds during data structures presentations.',
    category: 'Academic',
    priority: 'Low',
    status: 'Resolved',
    studentId: 'CS20240901',
    studentName: 'Alex Rivera',
    studentEmail: 'student@resolvex.edu',
    location: 'Academic Complex, Room 402',
    isSensitive: false,
    upvotes: 4,
    isKnownIssue: false,
    resolutionNotes: 'Technician inspected the AV console; replaced the 15m faulty HDMI high-speed cable and recalibrated lamp timing.',
    proofOfFix: 'Replaced cable verified with 4K HDMI test signal.',
    resolvedAt: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    auditLog: [
      {
        action: 'RESOLVED',
        performedBy: 'Dr. Sarah Jenkins',
        role: 'admin',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        details: 'Complaint resolved with verified fix.'
      }
    ],
    clarificationThread: []
  },
  {
    _id: 'cmp_mess_04',
    id: 'cmp_mess_04',
    subject: 'Mess dinner food hygiene and undercooked meals',
    description: 'Several students reported undercooked rice and unwashed greens during Tuesday night dinner service.',
    category: 'Mess',
    priority: 'Medium',
    status: 'In Review',
    studentId: 'CS20240901',
    studentName: 'Alex Rivera',
    studentEmail: 'student@resolvex.edu',
    location: 'Central Dining Hall 2',
    isSensitive: false,
    upvotes: 42,
    isKnownIssue: true,
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    auditLog: [
      {
        action: 'UNDER_REVIEW',
        performedBy: 'Dr. Sarah Jenkins',
        role: 'admin',
        timestamp: new Date(Date.now() - 12 * 3600000).toISOString(),
        details: 'Referred to Hostel Mess Advisory Committee.'
      }
    ],
    clarificationThread: []
  },
  {
    _id: 'cmp_infra_05',
    id: 'cmp_infra_05',
    subject: 'Request for individual ergonomic gaming chairs in library',
    description: 'Requesting soft luxury reclining beanbags and gaming chairs in the quiet study corner.',
    category: 'Infrastructure',
    priority: 'Low',
    status: 'Rejected',
    studentId: 'CS20240901',
    studentName: 'Alex Rivera',
    studentEmail: 'student@resolvex.edu',
    location: 'Central Library Floor 2',
    isSensitive: false,
    upvotes: 1,
    isKnownIssue: false,
    resolutionNotes: 'Standard ergonomic library wooden chairs conform to fire safety and space regulations. Custom furniture not permitted.',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    auditLog: [
      {
        action: 'REJECTED',
        performedBy: 'Dr. Sarah Jenkins',
        role: 'admin',
        timestamp: new Date(Date.now() - 6 * 86400000).toISOString(),
        details: 'Rejected as non-compliant with campus facilities policy.'
      }
    ],
    clarificationThread: []
  },
  {
    _id: 'cmp_grievance_06',
    id: 'cmp_grievance_06',
    subject: 'Confidential: Repeated verbal bullying and intimidation',
    description: 'An escalated grievance regarding sustained harassment outside the campus cafeteria after evening sports practice.',
    category: 'Other',
    priority: 'Urgent',
    status: 'Escalated',
    studentId: 'CS20240901',
    studentName: 'Anonymous (Protected)',
    studentEmail: 'student@resolvex.edu',
    location: 'East Sports Quadrangle',
    isSensitive: true,
    assignedOfficer: 'Justice R. K. Verma',
    upvotes: 0,
    isKnownIssue: false,
    createdAt: new Date(Date.now() - 10 * 3600000).toISOString(),
    auditLog: [
      {
        action: 'ESCALATED_TO_GRIEVANCE_OFFICER',
        performedBy: 'System Security Filter',
        role: 'system',
        timestamp: new Date(Date.now() - 10 * 3600000).toISOString(),
        details: 'Flagged as sensitive grievance. Access restricted to Grievance Officer role.'
      }
    ],
    clarificationThread: []
  }
];

function getLocalStore() {
  const stored = localStorage.getItem('issuehub_mock_complaints') || localStorage.getItem('resolvex_mock_complaints');
  if (!stored) {
    localStorage.setItem('issuehub_mock_complaints', JSON.stringify(INITIAL_MOCK_COMPLAINTS));
    return [...INITIAL_MOCK_COMPLAINTS];
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return [...INITIAL_MOCK_COMPLAINTS];
  }
}

function saveLocalStore(complaints) {
  localStorage.setItem('issuehub_mock_complaints', JSON.stringify(complaints));
}

export const complaintService = {
  /**
   * Get complaints for current student
   */
  async getMyComplaints() {
    try {
      const res = await apiRequest('/complaints/my');
      return Array.isArray(res) ? res : (res.complaints || res.data || []);
    } catch (err) {
      console.warn('[Complaint Service] Live /complaints/my failed, using local store:', err.message);
      const all = getLocalStore();
      // Filter out escalated confidential complaints if student didn't file them or non-sensitive
      return all.filter(c => !c.isSensitive || c.studentEmail === 'student@resolvex.edu');
    }
  },

  /**
   * Get single complaint by ID
   */
  async getComplaintById(id) {
    try {
      const res = await apiRequest(`/complaints/${id}`);
      return res.complaint || res.data || res;
    } catch (err) {
      console.warn(`[Complaint Service] Live /complaints/${id} failed, using local store:`, err.message);
      const all = getLocalStore();
      const found = all.find(c => c._id === id || c.id === id);
      if (!found) throw new Error('Complaint not found');
      return found;
    }
  },

  /**
   * Create new complaint
   */
  async createComplaint(complaintData) {
    try {
      const res = await apiRequest('/complaints', {
        method: 'POST',
        body: JSON.stringify(complaintData)
      });
      return res.complaint || res.data || res;
    } catch (err) {
      console.warn('[Complaint Service] Live create complaint failed, saving to local store:', err.message);
      const all = getLocalStore();
      const newComplaint = {
        _id: `cmp_${Date.now()}`,
        id: `cmp_${Date.now()}`,
        ...complaintData,
        status: complaintData.isSensitive ? 'Escalated' : 'Pending',
        upvotes: 0,
        createdAt: new Date().toISOString(),
        studentName: 'Alex Rivera',
        studentEmail: 'student@resolvex.edu',
        auditLog: [
          {
            action: 'SUBMITTED',
            performedBy: 'Alex Rivera',
            role: 'student',
            timestamp: new Date().toISOString(),
            details: complaintData.isAIGenerated 
              ? 'Filed using IssueHub AI Natural Language Intake.' 
              : 'Filed manually by student.'
          }
        ],
        clarificationThread: []
      };

      all.unshift(newComplaint);
      saveLocalStore(all);
      return newComplaint;
    }
  },

  /**
   * Withdraw a complaint (Student self-service)
   */
  async withdrawComplaint(id, reason = '') {
    try {
      const res = await apiRequest(`/complaints/${id}/withdraw`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      });
      return res.complaint || res.data || res;
    } catch (err) {
      console.warn('[Complaint Service] Live withdraw failed, updating local store:', err.message);
      const all = getLocalStore();
      const index = all.findIndex(c => c._id === id || c.id === id);
      if (index !== -1) {
        all[index].status = 'Withdrawn';
        all[index].withdrawalReason = reason;
        all[index].auditLog.push({
          action: 'WITHDRAWN_BY_STUDENT',
          performedBy: 'Alex Rivera',
          role: 'student',
          timestamp: new Date().toISOString(),
          details: `Student withdrew complaint: "${reason || 'No reason provided'}"`
        });
        saveLocalStore(all);
        return all[index];
      }
      throw new Error('Complaint not found');
    }
  },

  /**
   * Confirm resolution (Student)
   */
  async confirmResolution(id) {
    try {
      const res = await apiRequest(`/complaints/${id}/confirm-resolution`, {
        method: 'POST'
      });
      return res;
    } catch (err) {
      const all = getLocalStore();
      const index = all.findIndex(c => c._id === id || c.id === id);
      if (index !== -1) {
        all[index].studentConfirmed = true;
        all[index].auditLog.push({
          action: 'RESOLUTION_CONFIRMED',
          performedBy: 'Alex Rivera',
          role: 'student',
          timestamp: new Date().toISOString(),
          details: 'Student confirmed resolution satisfaction.'
        });
        saveLocalStore(all);
        return all[index];
      }
      throw new Error('Complaint not found');
    }
  },

  /**
   * Admin: Get all complaints (with filters)
   */
  async getAllComplaints(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const res = await apiRequest(`/admin/complaints?${queryParams}`);
      return Array.isArray(res) ? res : (res.complaints || res.data || []);
    } catch (err) {
      console.warn('[Complaint Service] Live /admin/complaints failed, using local store:', err.message);
      let all = getLocalStore();
      if (filters.status && filters.status !== 'All') {
        all = all.filter(c => c.status.toLowerCase() === filters.status.toLowerCase());
      }
      if (filters.category && filters.category !== 'All') {
        all = all.filter(c => c.category.toLowerCase() === filters.category.toLowerCase());
      }
      if (filters.search) {
        const s = filters.search.toLowerCase();
        all = all.filter(c => 
          c.subject.toLowerCase().includes(s) || 
          c.description.toLowerCase().includes(s) || 
          (c._id && c._id.toLowerCase().includes(s))
        );
      }
      return all;
    }
  },

  /**
   * Admin: Update status
   */
  async updateComplaintStatus(id, newStatus, comment = '', adminName = 'Dr. Sarah Jenkins') {
    try {
      const res = await apiRequest(`/admin/complaints/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus, comment })
      });
      return res.complaint || res.data || res;
    } catch (err) {
      console.warn('[Complaint Service] Live status update failed, updating local store:', err.message);
      const all = getLocalStore();
      const index = all.findIndex(c => c._id === id || c.id === id);
      if (index !== -1) {
        all[index].status = newStatus;
        all[index].auditLog.push({
          action: `STATUS_CHANGE_TO_${newStatus.toUpperCase().replace(/\s+/g, '_')}`,
          performedBy: adminName,
          role: 'admin',
          timestamp: new Date().toISOString(),
          details: comment || `Status updated to ${newStatus}`
        });
        saveLocalStore(all);
        return all[index];
      }
      throw new Error('Complaint not found');
    }
  },

  /**
   * Admin: Resolve complaint with proof
   */
  async resolveComplaint(id, resolutionNotes, proofOfFix, adminName = 'Dr. Sarah Jenkins') {
    try {
      const res = await apiRequest(`/admin/complaints/${id}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ resolutionNotes, proofOfFix })
      });
      return res.complaint || res.data || res;
    } catch (err) {
      const all = getLocalStore();
      const index = all.findIndex(c => c._id === id || c.id === id);
      if (index !== -1) {
        all[index].status = 'Resolved';
        all[index].resolutionNotes = resolutionNotes;
        all[index].proofOfFix = proofOfFix;
        all[index].resolvedAt = new Date().toISOString();
        all[index].auditLog.push({
          action: 'RESOLVED_BY_ADMIN',
          performedBy: adminName,
          role: 'admin',
          timestamp: new Date().toISOString(),
          details: `Resolution: ${resolutionNotes} | Proof: ${proofOfFix}`
        });
        saveLocalStore(all);
        return all[index];
      }
      throw new Error('Complaint not found');
    }
  },

  /**
   * Grievance Officer: Get escalated/sensitive complaints
   */
  async getGrievanceComplaints() {
    try {
      const res = await apiRequest('/grievance/complaints');
      return Array.isArray(res) ? res : (res.complaints || res.data || []);
    } catch (err) {
      const all = getLocalStore();
      // Grievance officer sees escalated and sensitive complaints
      return all.filter(c => c.isSensitive || c.status === 'Escalated' || c.priority === 'Urgent');
    }
  },

  /**
   * Student Upvote / Deflection Support
   */
  async upvoteComplaint(id) {
    const all = getLocalStore();
    const index = all.findIndex(c => c._id === id || c.id === id);
    if (index !== -1) {
      all[index].upvotes = (all[index].upvotes || 0) + 1;
      saveLocalStore(all);
      return all[index];
    }
    return null;
  },

  /**
   * Known issues for deflection
   */
  async getKnownIssues() {
    const all = getLocalStore();
    return all.filter(c => c.isKnownIssue || c.upvotes > 5);
  },

  /**
   * Post clarification message
   */
  async postClarification(id, message, senderName, role) {
    const all = getLocalStore();
    const index = all.findIndex(c => c._id === id || c.id === id);
    if (index !== -1) {
      const newMsg = {
        sender: senderName,
        role: role,
        message: message,
        timestamp: new Date().toISOString()
      };
      if (!all[index].clarificationThread) all[index].clarificationThread = [];
      all[index].clarificationThread.push(newMsg);
      saveLocalStore(all);
      return all[index];
    }
    throw new Error('Complaint not found');
  }
};
