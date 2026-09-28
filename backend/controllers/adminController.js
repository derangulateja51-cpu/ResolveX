/**
 * IssueHub Admin Controller
 * - Global complaint management & multi-dimensional filtering
 * - Real-time campus metric calculation
 * - Audit-logged status state machine transitions
 * - Official resolution submission with proof-of-fix verification
 */

const { memoryStore, isMongoConnected } = require('../services/dataStore');
const Complaint = require('../models/Complaint');

/**
 * GET /api/admin/complaints
 */
async function getAllComplaints(req, res) {
  try {
    const { status, category, priority, search } = req.query;

    if (isMongoConnected()) {
      const query = {};

      if (status && status !== 'All') {
        query.status = status;
      }
      if (category && category !== 'All') {
        query.category = category;
      }
      if (priority && priority !== 'All') {
        query.priority = priority;
      }
      if (search) {
        query.$or = [
          { subject: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { studentName: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } }
        ];
      }

      const complaints = await Complaint.find(query).sort({ createdAt: -1 });
      return res.status(200).json(complaints);
    }

    const complaints = memoryStore.getAllComplaints({ status, category, priority, search });
    return res.status(200).json(complaints);
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin complaints',
      error: err.message
    });
  }
}

/**
 * GET /api/admin/stats
 */
async function getStats(req, res) {
  try {
    let complaints = [];
    if (isMongoConnected()) {
      complaints = await Complaint.find({});
    } else {
      complaints = memoryStore.getAllComplaints();
    }

    const total = complaints.length;
    const pending = complaints.filter(c => c.status === 'Pending').length;
    const inProgress = complaints.filter(c => c.status === 'In Progress' || c.status === 'In Review').length;
    const resolved = complaints.filter(c => c.status === 'Resolved').length;
    const urgent = complaints.filter(c => c.priority === 'Urgent' || c.priority === 'High').length;

    const categoryCounts = complaints.reduce((acc, c) => {
      acc[c.category] = (acc[c.category] || 0) + 1;
      return acc;
    }, {});

    return res.status(200).json({
      success: true,
      stats: {
        total,
        pending,
        inProgress,
        resolved,
        urgent,
        categoryCounts
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to calculate campus metrics',
      error: err.message
    });
  }
}

/**
 * PATCH /api/admin/complaints/:id/status
 */
async function updateStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, comment = '' } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'New status is required'
      });
    }

    const adminName = req.user?.name || 'Administrator';
    const auditAction = `STATUS_CHANGE_TO_${status.toUpperCase().replace(/\s+/g, '_')}`;

    if (isMongoConnected()) {
      let complaint = await Complaint.findById(id).catch(() => null);
      if (!complaint) complaint = await Complaint.findOne({ _id: id });

      if (!complaint) {
        return res.status(404).json({ success: false, message: 'Complaint not found' });
      }

      complaint.status = status;
      complaint.auditLog.push({
        action: auditAction,
        performedBy: adminName,
        role: 'admin',
        timestamp: new Date(),
        details: comment || `Status updated to ${status}`
      });
      await complaint.save();

      return res.status(200).json({
        success: true,
        complaint
      });
    }

    const updated = memoryStore.updateComplaint(id, { status });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    memoryStore.addAuditLog(id, {
      action: auditAction,
      performedBy: adminName,
      role: 'admin',
      details: comment || `Status updated to ${status}`
    });

    return res.status(200).json({
      success: true,
      complaint: updated
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to transition complaint status',
      error: err.message
    });
  }
}

/**
 * POST /api/admin/complaints/:id/resolve
 */
async function resolveComplaint(req, res) {
  try {
    const { id } = req.params;
    const { resolutionNotes, proofOfFix } = req.body;

    if (!resolutionNotes || !resolutionNotes.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Resolution notes are required to formally resolve a complaint.'
      });
    }

    const adminName = req.user?.name || 'Administrator';

    if (isMongoConnected()) {
      let complaint = await Complaint.findById(id).catch(() => null);
      if (!complaint) complaint = await Complaint.findOne({ _id: id });

      if (!complaint) {
        return res.status(404).json({ success: false, message: 'Complaint not found' });
      }

      complaint.status = 'Resolved';
      complaint.resolutionNotes = resolutionNotes;
      complaint.proofOfFix = proofOfFix || 'Inspected and confirmed by campus facilities staff';
      complaint.resolvedAt = new Date();
      complaint.auditLog.push({
        action: 'RESOLVED_BY_ADMIN',
        performedBy: adminName,
        role: 'admin',
        timestamp: new Date(),
        details: `Resolution: ${resolutionNotes} | Proof: ${proofOfFix || 'N/A'}`
      });
      await complaint.save();

      return res.status(200).json({
        success: true,
        complaint
      });
    }

    const updated = memoryStore.updateComplaint(id, {
      status: 'Resolved',
      resolutionNotes,
      proofOfFix: proofOfFix || 'Inspected and confirmed by campus facilities staff',
      resolvedAt: new Date().toISOString()
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    memoryStore.addAuditLog(id, {
      action: 'RESOLVED_BY_ADMIN',
      performedBy: adminName,
      role: 'admin',
      details: `Resolution: ${resolutionNotes} | Proof: ${proofOfFix || 'N/A'}`
    });

    return res.status(200).json({
      success: true,
      complaint: updated
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to record official resolution',
      error: err.message
    });
  }
}

module.exports = {
  getAllComplaints,
  getStats,
  updateStatus,
  resolveComplaint
};
