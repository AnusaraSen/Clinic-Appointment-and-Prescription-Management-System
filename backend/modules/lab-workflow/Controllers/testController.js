// Simple test controller to verify API is working
const testConnection = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "API is working",
      timestamp: new Date().toISOString(),
      data: {
        status: "healthy",
        version: "1.0.0"
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "API test failed",
      error: error.message
    });
  }
};

// Return mock lab tests data for testing frontend
const getMockLabTests = async (req, res) => {
  try {
    const mockLabTests = [
      {
        _id: "1",
        labtest_id: "LT001",
        type: "Complete Blood Count",
        patient: {
          _id: "p1",
          name: "John Doe",
          email: "john.doe@email.com",
          patient_id: "P001"
        },
        doctor: {
          _id: "d1", 
          name: "Dr. Sarah Wilson",
          specialization: "General Medicine"
        },
        status: "Pending",
        priorityLevel: "Normal",
        sampleType: "Blood",
        instructions: "Fasting required for 12 hours",
        estimatedTime: "2-3 hours",
        createdAt: new Date().toISOString()
      },
      {
        _id: "2",
        labtest_id: "LT002",
        type: "Lipid Profile", 
        patient: {
          _id: "p2",
          name: "Jane Smith",
          email: "jane.smith@email.com",
          patient_id: "P002"
        },
        doctor: {
          _id: "d2",
          name: "Dr. Robert Chen", 
          specialization: "Cardiology"
        },
        status: "In Progress",
        priorityLevel: "High",
        sampleType: "Blood",
        instructions: "Patient should fast for 12 hours",
        estimatedTime: "4-6 hours",
        createdAt: new Date().toISOString()
      },
      {
        _id: "3",
        labtest_id: "LT003",
        type: "Urine Analysis",
        patient: {
          _id: "p3",
          name: "Mike Johnson", 
          email: "mike.johnson@email.com",
          patient_id: "P003"
        },
        doctor: {
          _id: "d1",
          name: "Dr. Sarah Wilson",
          specialization: "General Medicine"
        },
        status: "Completed",
        priorityLevel: "Urgent",
        sampleType: "Urine",
        instructions: "Mid-stream clean catch sample",
        estimatedTime: "1-2 hours",
        results: "Normal parameters within range",
        notes: "All values normal",
        createdAt: new Date().toISOString()
      }
    ];

    const stats = {
      pending: 1,
      inProgress: 1,
      completed: 1,
      urgent: 1
    };

    res.status(200).json({
      success: true,
      message: "Mock lab tests retrieved successfully",
      data: {
        labTests: mockLabTests,
        stats,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalCount: mockLabTests.length,
          hasNext: false,
          hasPrev: false
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get mock data",
      error: error.message
    });
  }
};

module.exports = {
  testConnection,
  getMockLabTests
};