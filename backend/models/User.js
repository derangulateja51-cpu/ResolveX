const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    required: true, 
    enum: ['student', 'admin', 'grievance_officer'],
    default: 'student' 
  },
  studentId: { type: String, trim: true },
  department: { type: String, trim: true },
  phone: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now }
});

// Compare password helper
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
