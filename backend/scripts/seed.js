/**
 * IssueHub Standalone Database Seeder
 * Run with: npm run seed (from inside backend/ or root)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/issuehub';

const User = require('../models/User');
const Complaint = require('../models/Complaint');

async function seedDatabase() {
  console.log('====================================================');
  console.log('🌱 Starting IssueHub Database Seeding...');
  console.log(`Connecting to: ${MONGODB_URI}`);
  console.log('====================================================');

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ Connected to MongoDB successfully.');

    await User.deleteMany({});
    await Complaint.deleteMany({});
    console.log('🧹 Purged existing User and Complaint collections.');

    const studentHash = await bcrypt.hash('Password123!', 10);
    const adminHash = await bcrypt.hash('AdminPass123!', 10);
    const grievanceHash = await bcrypt.hash('GrievancePass123!', 10);

    const users = await User.insertMany([
      {
        name: 'Alex Rivera',
        email: 'student@issuehub.edu',
        password: studentHash,
        role: 'student',
        studentId: 'CS20240901',
        department: 'Computer Science & Engineering',
        phone: '+1 (555) 234-5678'
      },
      {
        name: 'Dr. Sarah Jenkins',
        email: 'admin@issuehub.edu',
        password: adminHash,
        role: 'admin',
        department: 'Dean of Student Affairs',
        phone: '+1 (555) 876-5432'
      },
      {
        name: 'Justice R. K. Verma',
        email: 'grievance@issuehub.edu',
        password: grievanceHash,
        role: 'grievance_officer',
        department: 'Ombudsman & Grievance Cell',
        phone: '+1 (555) 345-6789'
      }
    ]);

    const [studentUser, adminUser, grievanceUser] = users;

    console.log(`✅ Seeded 3 Core Roles:`);
    console.log(`   - Student:           ${studentUser.email} (Password: Password123!)`);
    console.log(`   - Admin:             ${adminUser.email} (Password: AdminPass123!)`);
    console.log(`   - Grievance Officer: ${grievanceUser.email} (Password: GrievancePass123!)`);

    const sampleComplaints = [
      {
        subject: 'The WiFi in the CSE block has not been working for three days',
        description: 'The WiFi in the CSE block has not been working for three days. Students in the 3rd floor computer lab cannot submit assignments or access academic portals.',
        category: 'IT/WiFi',
        priority: 'High',
        status: 'Pending',
        student: studentUser._id,
        studentName: studentUser.name,
        studentEmail: studentUser.email,
        location: 'CSE Block, 3rd Floor Labs',
        isSensitive: false,
        upvotes: 18,
        isKnownIssue: true,
        auditLog: [
          {
            action: 'SUBMITTED',
            performedBy: studentUser.name,
            role: 'student',
            details: 'Initial complaint filed via AI Natural Language Intake.'
          }
        ]
      },
      {
        subject: 'Hot water geyser malfunctioning in Block B 2nd floor',
        description: 'The geyser in the north wing washroom of Block B is tripping the main circuit breaker whenever powered on.',
        category: 'Hostel',
        priority: 'Medium',
        status: 'In Progress',
        student: studentUser._id,
        studentName: studentUser.name,
        studentEmail: studentUser.email,
        location: 'Hostel Block B, 2nd Floor North',
        assignedOfficer: 'Estate Electrical Maintenance',
        isSensitive: false,
        upvotes: 7,
        clarificationThread: [
          {
            sender: 'Estate Electrical Maintenance',
            role: 'admin',
            message: 'A replacement heating element has been dispatched with technician Dave.'
          }
        ],
        auditLog: [
          {
            action: 'STATUS_CHANGE',
            performedBy: adminUser.name,
            role: 'admin',
            details: 'Status transitioned from Pending to In Progress.'
          }
        ]
      },
      {
        subject: 'Flickering HDMI projector in Lecture Hall 402',
        description: 'The digital projector flickers violently every 30 seconds during data structures presentations.',
        category: 'Academic',
        priority: 'Low',
        status: 'Resolved',
        student: studentUser._id,
        studentName: studentUser.name,
        studentEmail: studentUser.email,
        location: 'Academic Complex, Room 402',
        isSensitive: false,
        resolutionNotes: 'Technician inspected the AV console; replaced the 15m faulty HDMI high-speed cable and recalibrated lamp timing.',
        proofOfFix: 'Replaced cable verified with 4K HDMI test signal.',
        resolvedAt: new Date(Date.now() - 86400000),
        auditLog: [
          {
            action: 'RESOLVED',
            performedBy: adminUser.name,
            role: 'admin',
            details: 'Complaint resolved with verified fix.'
          }
        ]
      },
      {
        subject: 'Mess dinner food hygiene and undercooked meals',
        description: 'Several students reported undercooked rice and unwashed greens during Tuesday night dinner service.',
        category: 'Mess',
        priority: 'Medium',
        status: 'In Review',
        student: studentUser._id,
        studentName: studentUser.name,
        studentEmail: studentUser.email,
        location: 'Central Dining Hall 2',
        isSensitive: false,
        upvotes: 42,
        isKnownIssue: true,
        auditLog: [
          {
            action: 'UNDER_REVIEW',
            performedBy: adminUser.name,
            role: 'admin',
            details: 'Referred to Hostel Mess Advisory Committee.'
          }
        ]
      },
      {
        subject: 'Request for individual ergonomic gaming chairs in library',
        description: 'Requesting soft luxury reclining beanbags and gaming chairs in the quiet study corner.',
        category: 'Infrastructure',
        priority: 'Low',
        status: 'Rejected',
        student: studentUser._id,
        studentName: studentUser.name,
        studentEmail: studentUser.email,
        location: 'Central Library Floor 2',
        isSensitive: false,
        resolutionNotes: 'Standard ergonomic library wooden chairs conform to fire safety and space regulations. Custom furniture not permitted.',
        auditLog: [
          {
            action: 'REJECTED',
            performedBy: adminUser.name,
            role: 'admin',
            details: 'Rejected as non-compliant with campus facilities policy.'
          }
        ]
      },
      {
        subject: 'Confidential: Repeated verbal bullying and intimidation',
        description: 'An escalated grievance regarding sustained harassment outside the campus cafeteria after evening sports practice.',
        category: 'Other',
        priority: 'Urgent',
        status: 'Escalated',
        student: studentUser._id,
        studentName: 'Protected Complainant',
        studentEmail: studentUser.email,
        location: 'East Sports Quadrangle',
        isSensitive: true,
        assignedOfficer: grievanceUser.name,
        auditLog: [
          {
            action: 'ESCALATED_TO_GRIEVANCE_OFFICER',
            performedBy: 'System Security Filter',
            role: 'system',
            details: 'Flagged as sensitive grievance. Access restricted to Grievance Officer role.'
          }
        ]
      }
    ];

    const inserted = await Complaint.insertMany(sampleComplaints);
    console.log(`✅ Seeded ${inserted.length} complaints across departments and statuses.`);
    console.log('====================================================');
    console.log('🎉 Database seeding completed successfully!');
    console.log('====================================================');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

seedDatabase();
