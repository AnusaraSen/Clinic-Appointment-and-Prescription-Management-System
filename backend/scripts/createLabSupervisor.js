const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Import models
const User = require('../modules/workforce-facility/models/User');
const LabSupervisor = require('../modules/workforce-facility/models/LabSupervisor');
const LabStaff = require('../modules/workforce-facility/models/LabStaff');

const createLabSupervisor = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if lab supervisor already exists
    const existingUser = await User.findOne({ email: 'supervisor@lab.com' });
    if (existingUser) {
      console.log('Lab supervisor already exists');
    } else {
      // Generate unique user IDs
      const userCount = await User.countDocuments();
      const supervisorUserCount = await LabSupervisor.countDocuments();
      const supervisorId = `USR-${String(userCount + 1).padStart(4, '0')}`;
      const labSupervisorId = `LSUP-${String(supervisorUserCount + 1).padStart(4, '0')}`;

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('supervisor123', salt);

      // Create lab supervisor user
      const labSupervisorUser = new User({
        user_id: supervisorId,
        name: 'Dr. Sarah Wilson',
        email: 'supervisor@lab.com',
        password: hashedPassword,
        role: 'LabSupervisor',
        department: 'Laboratory',
        phone: '+1-555-0123',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const savedUser = await labSupervisorUser.save();

      // Create corresponding LabSupervisor record
      const labSupervisor = new LabSupervisor({
        supervisor_id: labSupervisorId,
        user: savedUser._id,
        department: 'Laboratory',
        managedSections: ['Hematology', 'Biochemistry', 'Microbiology'],
        officePhone: '+1-555-0123',
        officeLocation: 'Lab Building, Floor 2',
        notes: 'Lab Supervisor responsible for overseeing lab operations',
        isActive: true
      });

      await labSupervisor.save();
      console.log('✅ Lab supervisor created successfully');
      console.log('📧 Email: supervisor@lab.com');
      console.log('🔐 Password: supervisor123');
      console.log('👤 Role: LabSupervisor');
      console.log('🆔 Lab Supervisor ID:', labSupervisorId);
    }

    // Create lab assistant too for testing
    const existingAssistant = await User.findOne({ email: 'assistant@lab.com' });
    if (!existingAssistant) {
      const userCount = await User.countDocuments();
      const labStaffCount = await LabStaff.countDocuments();
      const assistantId = `USR-${String(userCount + 1).padStart(4, '0')}`;
      const labStaffId = `LAB-${String(labStaffCount + 1).padStart(4, '0')}`;
      
      const salt = await bcrypt.genSalt(10);
      const assistantPassword = await bcrypt.hash('assistant123', salt);
      
      // Create lab assistant user
      const labAssistantUser = new User({
        user_id: assistantId,
        name: 'John Smith',
        email: 'assistant@lab.com',
        password: assistantPassword,
        role: 'LabStaff',
        department: 'Laboratory',
        phone: '+1-555-0124',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const savedAssistantUser = await labAssistantUser.save();

      // Create corresponding LabStaff record
      const labStaff = new LabStaff({
        lab_staff_id: labStaffId,
        user: savedAssistantUser._id,
        position: 'Lab Technician',
        shift: 'morning',
        department: 'Laboratory',
        specializations: ['Sample Collection', 'Basic Testing'],
        workPhone: '+1-555-0124',
        workLocation: 'Lab Building, Floor 1',
        notes: 'Lab staff member responsible for sample collection and basic testing',
        isActive: true
      });

      await labStaff.save();
      console.log('✅ Lab assistant created successfully');
      console.log('📧 Email: assistant@lab.com');
      console.log('🔐 Password: assistant123');
      console.log('👤 Role: LabStaff');
      console.log('🆔 Lab Staff ID:', labStaffId);
    }

  } catch (error) {
    console.error('❌ Error creating lab supervisor:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  }
};

createLabSupervisor();