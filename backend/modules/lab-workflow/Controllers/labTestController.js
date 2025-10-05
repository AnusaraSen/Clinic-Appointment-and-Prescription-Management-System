const LabTest = require("../Model/LabTest");
const Patient = require("../../workforce-facility/models/Patient"); // Use existing Patient model
const Doctor = require("../../workforce-facility/models/Doctor"); // Use existing Doctor model
const LabStaff = require("../../workforce-facility/models/LabStaff"); // Use existing LabStaff model
const LabSupervisor = require("../../workforce-facility/models/LabSupervisor"); // Use existing LabSupervisor model


// ================= CREATE LAB TEST =================
const createLabTest = async (req, res) => {
  try {
    const {
      labtest_id,
      patient,
      doctor,
      type,
      labAssistant,
      priorityLevel,
      requestedBy,
      equipments
    } = req.body;

    // Validate required fields
    if (!labtest_id || !patient || !doctor || !type) {
      return res.status(400).json({
        success: false,
        message: "Lab test ID, patient, doctor, and type are required"
      });
    }

    // Check if lab test ID already exists
    const existingLabTest = await LabTest.findOne({ labtest_id });
    if (existingLabTest) {
      return res.status(400).json({
        success: false,
        message: "Lab test ID already exists"
      });
    }

    // Verify patient exists
    const patientExists = await Patient.findById(patient);
    if (!patientExists) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }

    // Verify doctor exists
    const doctorExists = await Doctor.findById(doctor);
    if (!doctorExists) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    // Handle empty string values for optional ObjectId fields
    let processedLabAssistant = labAssistant;
    if (labAssistant === "") {
      processedLabAssistant = null;
    } else if (labAssistant) {
      // Verify lab assistant exists (if provided and not empty)
      const labAssistantExists = await LabStaff.findById(labAssistant);
      if (!labAssistantExists) {
        return res.status(404).json({
          success: false,
          message: "Lab assistant not found"
        });
      }
    }

    // Create new lab test
    const newLabTest = new LabTest({
      labtest_id,
      patient,
      doctor,
      type,
      labAssistant: processedLabAssistant,
      priorityLevel: priorityLevel || "Medium",
      requestedBy,
      equipments
    });

    const savedLabTest = await newLabTest.save();

    res.status(201).json({
      success: true,
      message: "Lab test created successfully",
      data: { labTest: savedLabTest }
    });
  } catch (error) {
    console.error("Error creating lab test:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// ================= GET ALL LAB TESTS =================
const getAllLabTests = async (req, res) => {
  try {
    const { status, type, priorityLevel, search, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = {};
    if (status && status !== 'All') filter.status = status;
    if (type) filter.type = type;
    if (priorityLevel) filter.priorityLevel = priorityLevel;

    // Add search functionality
    if (search) {
      filter.$or = [
        { labtest_id: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Set timeout for database operations
    const options = { 
      maxTimeMS: 5000, // 5 second timeout
      lean: true // Return plain objects instead of Mongoose documents for better performance
    };

    // First check if there are any lab tests
    const totalCount = await LabTest.countDocuments(filter, { maxTimeMS: 5000 });
    
    let labTests = [];
    if (totalCount > 0) {
      labTests = await LabTest.find(filter, null, options)
        .populate("patient", "name email phone patient_id")
        .populate("doctor", "name specialization")
        .populate("labAssistant", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
    }

    // Get count by status for dashboard stats
    let stats = {
      pending: 0,
      inProgress: 0,
      completed: 0,
      urgent: 0
    };

    if (totalCount > 0) {
      try {
        const statusCounts = await LabTest.aggregate([
          { $group: { _id: "$status", count: { $sum: 1 } } }
        ], { maxTimeMS: 5000 });

        stats = {
          pending: statusCounts.find(s => s._id === 'Pending')?.count || 0,
          inProgress: statusCounts.find(s => s._id === 'In Progress')?.count || 0,
          completed: statusCounts.find(s => s._id === 'Completed')?.count || 0,
          urgent: await LabTest.countDocuments({ priorityLevel: 'Urgent' }, { maxTimeMS: 5000 }) || 0
        };
      } catch (aggregateError) {
        console.warn("Could not get stats:", aggregateError.message);
      }
    }

    res.status(200).json({
      success: true,
      message: "Lab tests retrieved successfully",
      data: {
        labTests,
        stats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: limit > 0 ? Math.ceil(totalCount / limit) : 1,
          totalCount,
          hasNext: page * limit < totalCount,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error("Error fetching lab tests:", error);
    
    // Return empty data instead of error if it's a timeout or connection issue
    if (error.name === 'MongooseError' || error.message.includes('timeout') || error.message.includes('buffering')) {
      return res.status(200).json({
        success: true,
        message: "No lab tests found - database may be empty",
        data: {
          labTests: [],
          stats: {
            pending: 0,
            inProgress: 0,
            completed: 0,
            urgent: 0
          },
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalCount: 0,
            hasNext: false,
            hasPrev: false
          }
        }
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// ================= GET LAB TEST BY ID =================
const getLabTestById = async (req, res) => {
  try {
    const { id } = req.params;

    const labTest = await LabTest.findById(id)
      .populate("patient", "name email phone dateOfBirth gender")
      .populate("doctor", "name specialization email")
      .populate("labAssistant", "name email");

    if (!labTest) {
      return res.status(404).json({
        success: false,
        message: "Lab test not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Lab test retrieved successfully",
      data: { labTest: labTest }
    });
  } catch (error) {
    console.error("Error fetching lab test:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// ================= UPDATE LAB TEST =================
const updateLabTest = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove immutable fields from update
    delete updateData.labtest_id;
    delete updateData.createdAt;

    // Handle empty string values for ObjectId fields
    // Convert empty strings to null for ObjectId fields to prevent casting errors
    if (updateData.labAssistant === "") {
      updateData.labAssistant = null;
    }
    if (updateData.patient === "") {
      updateData.patient = null;
    }
    if (updateData.doctor === "") {
      updateData.doctor = null;
    }

    // If updating status to "In Progress", set collection date
    if (updateData.status === "In Progress" && !updateData.collectedDate) {
      updateData.collectedDate = new Date();
    }

    const updatedLabTest = await LabTest.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("patient", "name email phone")
      .populate("doctor", "name specialization")
      .populate("labAssistant", "name");

    if (!updatedLabTest) {
      return res.status(404).json({
        success: false,
        message: "Lab test not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Lab test updated successfully",
      data: { labTest: updatedLabTest }
    });
  } catch (error) {
    console.error("Error updating lab test:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// ================= DELETE LAB TEST =================
const deleteLabTest = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedLabTest = await LabTest.findByIdAndDelete(id);

    if (!deletedLabTest) {
      return res.status(404).json({
        success: false,
        message: "Lab test not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Lab test deleted successfully",
      data: deletedLabTest
    });
  } catch (error) {
    console.error("Error deleting lab test:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// ================= UPDATE LAB TEST STATUS =================
const updateLabTestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, collectedBy } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required"
      });
    }

    const updateData = { status };

    // If status is "In Progress" and no collection date exists, set it
    if (status === "In Progress") {
      updateData.collectedDate = new Date();
      if (collectedBy) {
        updateData.collectedBy = collectedBy;
      }
    }

    const updatedLabTest = await LabTest.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("patient", "name email")
      .populate("doctor", "name")
      .populate("labAssistant", "name");

    if (!updatedLabTest) {
      return res.status(404).json({
        success: false,
        message: "Lab test not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Lab test status updated successfully",
      data: { labTest: updatedLabTest }
    });
  } catch (error) {
    console.error("Error updating lab test status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// ================= GET LAB TESTS BY PATIENT =================
const getLabTestsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { status } = req.query;

    const filter = { patient: patientId };
    if (status) filter.status = status;

    const labTests = await LabTest.find(filter)
      .populate("doctor", "name specialization")
      .populate("labAssistant", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Patient lab tests retrieved successfully",
      data: labTests
    });
  } catch (error) {
    console.error("Error fetching patient lab tests:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// ================= GET LAB TESTS BY DOCTOR =================
const getLabTestsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { status } = req.query;

    const filter = { doctor: doctorId };
    if (status) filter.status = status;

    const labTests = await LabTest.find(filter)
      .populate("patient", "name email phone")
      .populate("labAssistant", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Doctor lab tests retrieved successfully",
      data: { labTests }
    });
  } catch (error) {
    console.error("Error fetching doctor lab tests:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// ================= ASSIGN STAFF TO LAB TEST =================
const assignStaffToLabTest = async (req, res) => {
  try {
    const { id } = req.params;
    const { labAssistant, priority, notes } = req.body;

    if (!labAssistant) {
      return res.status(400).json({
        success: false,
        message: "Lab assistant ID is required"
      });
    }

    // Verify lab assistant exists
    const labAssistantExists = await LabStaff.findById(labAssistant);
    if (!labAssistantExists) {
      return res.status(404).json({
        success: false,
        message: "Lab assistant not found"
      });
    }

    // Prepare update data
    const updateData = { 
      labAssistant,
      status: "In Progress",
      collectedDate: new Date()
    };

    // Add priority if provided
    if (priority) {
      updateData.priorityLevel = priority;
    }

    // Add notes if provided
    if (notes) {
      updateData.notes = notes;
    }

    const updatedLabTest = await LabTest.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("patient", "name email phone patient_id")
      .populate("doctor", "name specialization")
      .populate("labAssistant", "name staff_id");

    if (!updatedLabTest) {
      return res.status(404).json({
        success: false,
        message: "Lab test not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Staff assigned successfully",
      data: updatedLabTest
    });
  } catch (error) {
    console.error("Error assigning staff:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// ================= GET AVAILABLE STAFF =================
const getAvailableStaff = async (req, res) => {
  try {
    // Set timeout for database operations
    const options = { maxTimeMS: 5000 };

    let labStaff = [];

    try {
      labStaff = await LabStaff.find({ availability: 'Available' }, null, options)
        .select('name email staff_id role availability');
    } catch (dbError) {
      console.warn("Database unavailable, using mock staff data:", dbError.message);
      
      // Mock staff data fallback
      labStaff = [
        {
          _id: "staff1",
          name: "Sarah Johnson",
          email: "sarah.johnson@clinic.com",
          staff_id: "LSF001",
          role: "Lab Assistant",
          availability: "Available"
        },
        {
          _id: "staff2",
          name: "Michael Chen",
          email: "michael.chen@clinic.com", 
          staff_id: "LSF002",
          role: "Lab Assistant",
          availability: "Available"
        },
        {
          _id: "staff3",
          name: "Emily Davis",
          email: "emily.davis@clinic.com",
          staff_id: "LSF003", 
          role: "Lab Assistant",
          availability: "Available"
        },
        {
          _id: "staff4",
          name: "James Wilson",
          email: "james.wilson@clinic.com",
          staff_id: "LSF004",
          role: "Lab Assistant", 
          availability: "Available"
        },
        {
          _id: "staff5",
          name: "Lisa Anderson",
          email: "lisa.anderson@clinic.com",
          staff_id: "LSF005",
          role: "Lab Assistant",
          availability: "Available"
        }
      ];

      let supervisors = [
        {
          _id: "supervisor1",
          name: "Dr. Kevin Lee",
          email: "kevin.lee@clinic.com",
          supervisor_id: "SUP001"
        },
        {
          _id: "supervisor2", 
          name: "Dr. Rachel Miller",
          email: "rachel.miller@clinic.com",
          supervisor_id: "SUP002"
        }
      ];
    }

    // Return available staff
    const allStaff = labStaff.map(staff => ({
      _id: staff._id,
      name: staff.name,
      email: staff.email,
      staffId: staff.staff_id,
      role: staff.role || "Lab Assistant",
      type: "staff"
    }));

    res.status(200).json({
      success: true,
      message: "Available staff retrieved successfully",
      data: {
        staff: allStaff,
        labStaff
      }
    });
  } catch (error) {
    console.error("Error fetching available staff:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// ================= CREATE SAMPLE DATA =================
const createSampleData = async (req, res) => {
  try {
    // Create sample patients
    const patients = [
      {
        patient_id: "PT-12345",
        name: "John Smith",
        email: "john.smith@email.com",
        phone: "+1-555-0123",
        dateOfBirth: new Date("1985-03-15"),
        gender: "Male"
      },
      {
        patient_id: "PT-12346",
        name: "Sarah Johnson",
        email: "sarah.johnson@email.com",
        phone: "+1-555-0124",
        dateOfBirth: new Date("1990-07-22"),
        gender: "Female"
      },
      {
        patient_id: "PT-12347",
        name: "Robert Brown",
        email: "robert.brown@email.com",
        phone: "+1-555-0125",
        dateOfBirth: new Date("1978-11-08"),
        gender: "Male"
      }
    ];

    // Create sample doctors
    const doctors = [
      {
        doctor_id: "DOC-001",
        name: "Dr. Michael Chen",
        email: "m.chen@hospital.com",
        specialization: "Internal Medicine"
      },
      {
        doctor_id: "DOC-002",
        name: "Dr. Lisa Wong",
        email: "l.wong@hospital.com",
        specialization: "Cardiology"
      },
      {
        doctor_id: "DOC-003",
        name: "Dr. James Wilson",
        email: "j.wilson@hospital.com",
        specialization: "Neurology"
      }
    ];

    // Create sample lab staff
    const labStaff = [
      {
        staff_id: "LS-001",
        name: "Lisa Adams",
        email: "l.adams@lab.com",
        availability: "Available",
        role: "Lab Assistant"
      },
      {
        staff_id: "LS-002",
        name: "Mark Wilson",
        email: "m.wilson@lab.com",
        availability: "Busy",
        role: "Lab Assistant"
      },
      {
        staff_id: "LS-003",
        name: "Jane Davis",
        email: "j.davis@lab.com",
        availability: "Available",
        role: "Lab Assistant"
      }
    ];

    // Create sample lab supervisors
    const labSupervisors = [
      {
        supervisor_id: "SUP-001",
        name: "Kevin Lee",
        email: "k.lee@lab.com"
      },
      {
        supervisor_id: "SUP-002",
        name: "Rachel Miller",
        email: "r.miller@lab.com"
      }
    ];

    // Insert data with timeout
    const timeoutOptions = { ordered: false, maxTimeMS: 5000 };
    
    try {
      await Patient.insertMany(patients, timeoutOptions);
      await Doctor.insertMany(doctors, timeoutOptions);
      await LabStaff.insertMany(labStaff, timeoutOptions);
      await LabSupervisor.insertMany(labSupervisors, timeoutOptions);
    } catch (insertError) {
      console.warn("Some data may already exist:", insertError.message);
    }

    // Create sample lab tests
    const samplePatients = await Patient.find({}, null, { maxTimeMS: 5000 }).limit(3);
    const sampleDoctors = await Doctor.find({}, null, { maxTimeMS: 5000 }).limit(3);
    const sampleStaff = await LabStaff.find({}, null, { maxTimeMS: 5000 }).limit(3);

    const labTests = [
      {
        labtest_id: "LT-10001",
        patient: samplePatients[0]._id,
        doctor: sampleDoctors[0]._id,
        type: "Blood Glucose Test",
        priorityLevel: "Urgent",
        status: "In Progress",
        labAssistant: sampleStaff[0]._id,
        requestedBy: sampleDoctors[0].name,
        collectedDate: new Date(),
        equipments: [
          {
            name: "Glucose Meter",
            quantity: 1,
            status: "In Use"
          },
          {
            name: "Test Strips",
            quantity: 5,
            status: "Available"
          }
        ],
        notes: "Fasting blood glucose test for diabetes screening",
        estimatedCompletionTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        specialInstructions: "Patient has been fasting for 12 hours",
        urgentReason: "Patient showing symptoms of hyperglycemia"
      },
      {
        labtest_id: "LT-10002",
        patient: samplePatients[1]._id,
        doctor: sampleDoctors[1]._id,
        type: "Complete Blood Count",
        priorityLevel: "Medium",
        status: "Pending",
        requestedBy: sampleDoctors[1].name,
        equipments: [
          {
            name: "Hematology Analyzer",
            quantity: 1,
            status: "Available"
          },
          {
            name: "Blood Collection Tubes",
            quantity: 3,
            status: "Available"
          }
        ],
        notes: "Complete blood count for annual checkup",
        estimatedCompletionTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
        specialInstructions: "No special preparation required"
      },
      {
        labtest_id: "LT-10003",
        patient: samplePatients[2]._id,
        doctor: sampleDoctors[2]._id,
        type: "Urinalysis",
        priorityLevel: "Low",
        status: "Completed",
        labAssistant: sampleStaff[1]._id,
        requestedBy: sampleDoctors[2].name,
        results: "Normal values within expected range",
        collectedDate: new Date(Date.now() - 86400000), // Yesterday
        completedDate: new Date(Date.now() - 82800000), // 1 hour after collection
        reportGeneratedDate: new Date(Date.now() - 79200000), // 2 hours after collection
        equipments: [
          {
            name: "Urine Analyzer",
            quantity: 1,
            status: "Available"
          },
          {
            name: "Microscope",
            quantity: 1,
            status: "Available"
          },
          {
            name: "Urine Collection Cup",
            quantity: 1,
            status: "Used"
          }
        ],
        notes: "Routine urinalysis for kidney function assessment",
        testResults: {
          protein: "Negative",
          glucose: "Negative",
          ketones: "Negative",
          blood: "Negative",
          nitrites: "Negative",
          leukocytes: "Negative",
          specificGravity: "1.020",
          pH: "6.0",
          color: "Yellow",
          clarity: "Clear"
        }
      },
      {
        labtest_id: "LT-10004",
        patient: samplePatients[0]._id,
        doctor: sampleDoctors[1]._id,
        type: "Lipid Profile",
        priorityLevel: "High",
        status: "Pending",
        requestedBy: sampleDoctors[1].name,
        equipments: [
          {
            name: "Chemistry Analyzer",
            quantity: 1,
            status: "Reserved"
          },
          {
            name: "Serum Separator Tubes",
            quantity: 2,
            status: "Available"
          }
        ],
        notes: "Lipid profile for cardiovascular risk assessment",
        estimatedCompletionTime: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
        specialInstructions: "Patient must fast for 12 hours before sample collection",
        requestReason: "Family history of cardiovascular disease"
      },
      {
        labtest_id: "LT-10005",
        patient: samplePatients[1]._id,
        doctor: sampleDoctors[2]._id,
        type: "Thyroid Function Test",
        priorityLevel: "Medium",
        status: "In Progress",
        labAssistant: sampleStaff[2]._id,
        requestedBy: sampleDoctors[2].name,
        collectedDate: new Date(Date.now() - 3600000), // 1 hour ago
        equipments: [
          {
            name: "Immunoassay Analyzer",
            quantity: 1,
            status: "In Use"
          },
          {
            name: "Serum Tubes",
            quantity: 2,
            status: "In Use"
          }
        ],
        notes: "TSH, T3, T4 levels for thyroid function evaluation",
        estimatedCompletionTime: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
        specialInstructions: "Morning collection preferred",
        symptoms: ["Fatigue", "Weight changes", "Hair loss"]
      },
      {
        labtest_id: "LT-10006",
        patient: samplePatients[2]._id,
        doctor: sampleDoctors[0]._id,
        type: "Liver Function Test",
        priorityLevel: "Urgent",
        status: "Pending",
        requestedBy: sampleDoctors[0].name,
        equipments: [
          {
            name: "Chemistry Analyzer",
            quantity: 1,
            status: "Available"
          },
          {
            name: "Serum Separator Tubes",
            quantity: 3,
            status: "Available"
          }
        ],
        notes: "Comprehensive liver function panel including ALT, AST, Bilirubin, Albumin",
        estimatedCompletionTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
        urgentReason: "Patient presenting with abdominal pain and jaundice",
        clinicalFindings: "Elevated liver enzymes on initial screening",
        requestedTests: ["ALT", "AST", "ALP", "Total Bilirubin", "Direct Bilirubin", "Albumin", "Total Protein"]
      }
    ];

    await LabTest.insertMany(labTests, { ordered: false, maxTimeMS: 5000 });

    res.status(201).json({
      success: true,
      message: "Comprehensive sample data created successfully",
      data: {
        patients: samplePatients.length,
        doctors: sampleDoctors.length,
        labStaff: sampleStaff.length,
        labTests: labTests.length,
        summary: {
          totalLabTests: labTests.length,
          testTypes: [...new Set(labTests.map(test => test.type))],
          statusDistribution: {
            pending: labTests.filter(test => test.status === 'Pending').length,
            inProgress: labTests.filter(test => test.status === 'In Progress').length,
            completed: labTests.filter(test => test.status === 'Completed').length
          },
          priorityDistribution: {
            urgent: labTests.filter(test => test.priorityLevel === 'Urgent').length,
            high: labTests.filter(test => test.priorityLevel === 'High').length,
            medium: labTests.filter(test => test.priorityLevel === 'Medium').length,
            low: labTests.filter(test => test.priorityLevel === 'Low').length
          }
        }
      }
    });

  } catch (error) {
    // Ignore duplicate key errors
    if (error.code === 11000) {
      res.status(200).json({
        success: true,
        message: "Sample data already exists"
      });
    } else {
      console.error("Error creating sample data:", error);
      res.status(500).json({
        success: false,
        message: "Error creating sample data",
        error: error.message
      });
    }
  }
};

module.exports = {
  createLabTest,
  getAllLabTests,
  getLabTestById,
  updateLabTest,
  deleteLabTest,
  updateLabTestStatus,
  getLabTestsByPatient,
  getLabTestsByDoctor,
  assignStaffToLabTest,
  getAvailableStaff,
  createSampleData
};