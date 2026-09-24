const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  subject: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    required: true, 
    enum: ['Hostel', 'Academic', 'Infrastructure', 'Mess', 'IT/WiFi', 'Transport', 'Other'] 
  },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium' 
  },
  status: { 
    type: String, 
    enum: ['Pending', 'In Review', 'In Progress', 'Resolved', 'Rejected', 'Escalated', 'Withdrawn'],
    default: 'Pending' 
  },
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  studentName: { type: String },
  studentEmail: { type: String },
  studentId: { type: String },
  location: { type: String, default: 'General Campus' },
  isSensitive: { type: Boolean, default: false },
  isAIGenerated: { type: Boolean, default: false },
  upvotes: { type: Number, default: 0 },
  upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isKnownIssue: { type: Boolean, default: false },
  resolutionNotes: { type: String },
  proofOfFix: { type: String },
  resolvedAt: { type: Date },
  assignedOfficer: { type: String },
  withdrawalReason: { type: String },
  studentConfirmed: { type: Boolean, default: false },
  clarificationThread: [
    {
      sender: { type: String, required: true },
      role: { type: String, required: true },
      message: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }
  ],
  auditLog: [
    {
      action: { type: String, required: true },
      performedBy: { type: String, required: true },
      role: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
      details: { type: String }
    }
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Complaint || mongoose.model('Complaint', ComplaintSchema);
