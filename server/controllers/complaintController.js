const { memoryStore, isMongoConnected } = require('../dataStore');
const Complaint = require('../models/Complaint');

/**
 * POST /api/complaints
 */
async function createComplaint(req, res) {
  try {
    const { subject, description, category, priority = 'Medium', location = 'General Campus', isSensitive = false, isAIGenerated = false } = req.body;

    if (!subject || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Subject, description, and category are required fields.',
        error: 'Missing required complaint attributes'
      });
    }

    const studentUser = req.user || {
      _id: 'usr_student_01',
      name: 'Alex Rivera',
      email: 'student@issuehub.edu',
      role: 'student',
      studentId: 'CS20240901'
    };

    const initialStatus = isSensitive ? 'Escalated' : 'Pending';

    const complaintPayload = {
      subject: subject.trim(),
      description: description.trim(),
      category,
      priority,
      location: location || 'General Campus',
      isSensitive: !!isSensitive,
      isAIGenerated: !!isAIGenerated,
      status: initialStatus,
      student: studentUser._id || studentUser.id,
      studentName: isSensitive ? 'Protected Complainant' : studentUser.name,
      studentEmail: studentUser.email,
      studentId: studentUser.studentId,
      assignedOfficer: isSensitive ? 'Justice R. K. Verma' : undefined,
      upvotes: 0,
      upvotedBy: [],
      clarificationThread: [],
      auditLog: [
        {
          action: isSensitive ? 'ESCALATED_TO_GRIEVANCE_OFFICER' : 'SUBMITTED',
          performedBy: studentUser.name,
          role: studentUser.role || 'student',
          timestamp: new Date().toISOString(),
          details: isSensitive 
            ? 'Filed under Confidential Ombudsman Protocol.' 
            : (isAIGenerated ? 'Filed via IssueHub AI Natural Language Intake.' : 'Filed manually by student.')
        }
      ]
    };

    if (isMongoConnected()) {
      const created = await Complaint.create(complaintPayload);
      return res.status(201).json({
        success: true,
        complaint: created
      });
    }

    // Memory Store
    const created = memoryStore.createComplaint(complaintPayload);
    return res.status(201).json({
      success: true,
      complaint: created
    });
  } catch (err) {
    console.error('[Create Complaint Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to record complaint',
      error: err.message
    });
  }
}

/**
 * GET /api/complaints/my
 */
async function getMyComplaints(req, res) {
  try {
    const studentId = req.user?._id || req.user?.id || 'usr_student_01';
    const studentEmail = req.user?.email || 'student@issuehub.edu';

    if (isMongoConnected()) {
      const complaints = await Complaint.find({
        $or: [
          { student: studentId },
          { studentEmail: studentEmail },
          { studentEmail: 'student@resolvex.edu' }
        ]
      }).sort({ createdAt: -1 });

      return res.status(200).json(complaints);
    }

    const complaints = memoryStore.getComplaintsByStudent(studentId, studentEmail);
    return res.status(200).json(complaints);
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve your complaints',
      error: err.message
    });
  }
}

/**
 * GET /api/complaints/known-issues
 */
async function getKnownIssues(req, res) {
  try {
    if (isMongoConnected()) {
      const issues = await Complaint.find({
        $or: [{ isKnownIssue: true }, { upvotes: { $gt: 5 } }]
      }).sort({ upvotes: -1 });
      return res.status(200).json(issues);
    }

    const issues = memoryStore.getKnownIssues();
    return res.status(200).json(issues);
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve campus known alerts',
      error: err.message
    });
  }
}

/**
 * GET /api/complaints/:id
 */
async function getComplaintById(req, res) {
  try {
    const { id } = req.params;

    let complaint = null;

    if (isMongoConnected()) {
      try {
        complaint = await Complaint.findById(id);
      } catch (e) {
        // If not a valid ObjectId, search by custom string id
        complaint = await Complaint.findOne({ _id: id });
      }
    }

    if (!complaint) {
      complaint = memoryStore.getComplaintById(id);
    }

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
        error: `No record matching ticket ID: ${id}`
      });
    }

    // Role-based visibility check for sensitive complaints
    if (complaint.isSensitive && req.user && req.user.role === 'student') {
      const isOwner = String(complaint.student) === String(req.user._id || req.user.id) ||
                      complaint.studentEmail === req.user.email;
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'Access restricted under confidential ombudsman protocol.',
          error: 'Forbidden'
        });
      }
    }

    return res.status(200).json({
      success: true,
      complaint
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch complaint details',
      error: err.message
    });
  }
}

/**
 * POST /api/complaints/:id/withdraw
 */
async function withdrawComplaint(req, res) {
  try {
    const { id } = req.params;
    const { reason = 'Withdrawn by student' } = req.body;

    const actorName = req.user?.name || 'Student';

    if (isMongoConnected()) {
      let complaint = await Complaint.findById(id).catch(() => null);
      if (!complaint) complaint = await Complaint.findOne({ _id: id });

      if (!complaint) {
        return res.status(404).json({ success: false, message: 'Complaint not found' });
      }

      complaint.status = 'Withdrawn';
      complaint.withdrawalReason = reason;
      complaint.auditLog.push({
        action: 'WITHDRAWN_BY_STUDENT',
        performedBy: actorName,
        role: 'student',
        timestamp: new Date(),
        details: reason
      });
      await complaint.save();

      return res.status(200).json({
        success: true,
        complaint
      });
    }

    const updated = memoryStore.updateComplaint(id, {
      status: 'Withdrawn',
      withdrawalReason: reason
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    memoryStore.addAuditLog(id, {
      action: 'WITHDRAWN_BY_STUDENT',
      performedBy: actorName,
      role: 'student',
      details: reason
    });

    return res.status(200).json({
      success: true,
      complaint: updated
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to withdraw complaint',
      error: err.message
    });
  }
}

/**
 * POST /api/complaints/:id/confirm-resolution
 */
async function confirmResolution(req, res) {
  try {
    const { id } = req.params;
    const actorName = req.user?.name || 'Student';

    if (isMongoConnected()) {
      let complaint = await Complaint.findById(id).catch(() => null);
      if (!complaint) complaint = await Complaint.findOne({ _id: id });

      if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

      complaint.studentConfirmed = true;
      complaint.auditLog.push({
        action: 'RESOLUTION_CONFIRMED',
        performedBy: actorName,
        role: 'student',
        timestamp: new Date(),
        details: 'Student confirmed resolution satisfaction.'
      });
      await complaint.save();

      return res.status(200).json({ success: true, complaint });
    }

    const updated = memoryStore.updateComplaint(id, { studentConfirmed: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Complaint not found' });

    memoryStore.addAuditLog(id, {
      action: 'RESOLUTION_CONFIRMED',
      performedBy: actorName,
      role: 'student',
      details: 'Student confirmed resolution satisfaction.'
    });

    return res.status(200).json({ success: true, complaint: updated });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to confirm resolution',
      error: err.message
    });
  }
}

/**
 * POST /api/complaints/:id/upvote
 */
async function upvoteComplaint(req, res) {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      let complaint = await Complaint.findById(id).catch(() => null);
      if (!complaint) complaint = await Complaint.findOne({ _id: id });

      if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

      complaint.upvotes = (complaint.upvotes || 0) + 1;
      await complaint.save();
      return res.status(200).json({ success: true, complaint });
    }

    const complaint = memoryStore.getComplaintById(id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    const updated = memoryStore.updateComplaint(id, {
      upvotes: (complaint.upvotes || 0) + 1
    });

    return res.status(200).json({ success: true, complaint: updated });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to upvote complaint',
      error: err.message
    });
  }
}

/**
 * POST /api/complaints/:id/clarification
 */
async function addClarification(req, res) {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Clarification message cannot be empty'
      });
    }

    const senderName = req.user?.name || 'User';
    const role = req.user?.role || 'student';

    const msgObj = {
      sender: senderName,
      role,
      message: message.trim(),
      timestamp: new Date()
    };

    if (isMongoConnected()) {
      let complaint = await Complaint.findById(id).catch(() => null);
      if (!complaint) complaint = await Complaint.findOne({ _id: id });

      if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

      complaint.clarificationThread.push(msgObj);
      await complaint.save();
      return res.status(200).json({ success: true, complaint });
    }

    const updated = memoryStore.addClarification(id, msgObj);
    if (!updated) return res.status(404).json({ success: false, message: 'Complaint not found' });

    return res.status(200).json({ success: true, complaint: updated });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to add clarification message',
      error: err.message
    });
  }
}

module.exports = {
  createComplaint,
  getMyComplaints,
  getKnownIssues,
  getComplaintById,
  withdrawComplaint,
  confirmResolution,
  upvoteComplaint,
  addClarification
};
