const { memoryStore, isMongoConnected } = require('../dataStore');
const Complaint = require('../models/Complaint');

/**
 * GET /api/grievance/complaints
 */
async function getGrievanceComplaints(req, res) {
  try {
    if (isMongoConnected()) {
      const grievances = await Complaint.find({
        $or: [
          { isSensitive: true },
          { status: 'Escalated' },
          { priority: 'Urgent' }
        ]
      }).sort({ createdAt: -1 });

      return res.status(200).json(grievances);
    }

    const grievances = memoryStore.getGrievanceComplaints();
    return res.status(200).json(grievances);
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to access confidential grievance records',
      error: err.message
    });
  }
}

/**
 * POST /api/grievance/complaints/:id/resolve
 */
async function resolveGrievance(req, res) {
  try {
    const { id } = req.params;
    const { resolutionNotes, proofOfFix } = req.body;

    const officerName = req.user?.name || 'Justice R. K. Verma (Ombudsman)';

    if (isMongoConnected()) {
      let complaint = await Complaint.findById(id).catch(() => null);
      if (!complaint) complaint = await Complaint.findOne({ _id: id });

      if (!complaint) {
        return res.status(404).json({ success: false, message: 'Grievance record not found' });
      }

      complaint.status = 'Resolved';
      complaint.resolutionNotes = resolutionNotes || 'Formal Ombudsman ruling enacted and case records sealed.';
      complaint.proofOfFix = proofOfFix || 'Ombudsman Formal Ruling Sealed & Filed';
      complaint.resolvedAt = new Date();
      complaint.auditLog.push({
        action: 'GRIEVANCE_RESOLVED_AND_SEALED',
        performedBy: officerName,
        role: 'grievance_officer',
        timestamp: new Date(),
        details: resolutionNotes || 'Formal ruling finalized.'
      });
      await complaint.save();

      return res.status(200).json({
        success: true,
        complaint
      });
    }

    const updated = memoryStore.updateComplaint(id, {
      status: 'Resolved',
      resolutionNotes: resolutionNotes || 'Formal Ombudsman ruling enacted and case records sealed.',
      proofOfFix: proofOfFix || 'Ombudsman Formal Ruling Sealed & Filed',
      resolvedAt: new Date().toISOString()
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Grievance record not found' });
    }

    memoryStore.addAuditLog(id, {
      action: 'GRIEVANCE_RESOLVED_AND_SEALED',
      performedBy: officerName,
      role: 'grievance_officer',
      details: resolutionNotes || 'Formal ruling finalized.'
    });

    return res.status(200).json({
      success: true,
      complaint: updated
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to record sealed ombudsman ruling',
      error: err.message
    });
  }
}

module.exports = {
  getGrievanceComplaints,
  resolveGrievance
};
