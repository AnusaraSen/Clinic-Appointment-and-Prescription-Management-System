const Patient = require('../../workforce-facility/models/Patient');
const User = require('../../workforce-facility/models/User');

class PatientController {
  
  // Get all patients with search functionality
  static async getPatients(req, res) {
    try {
      const { search, page = 1, limit = 10 } = req.query;
      
      let query = { isActive: true };
      
      // Build search query if search term provided
      if (search) {
        query.$or = [
          { patient_id: { $regex: search, $options: 'i' } },
          // Search in user's name through populate
        ];
      }
      
      const skip = (page - 1) * limit;
      
      let patients = await Patient.find(query)
        .populate('user', 'name email phone')
        .sort({ registrationDate: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      
      // If searching by name, filter after populate
      if (search) {
        patients = patients.filter(patient => 
          patient.user && patient.user.name && 
          patient.user.name.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      const total = search ? patients.length : await Patient.countDocuments(query);
      
      res.status(200).json({
        success: true,
        data: patients,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching patients:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
  
  // Get patient by linked User._id (workforce user)
  static async getPatientByUser(req, res) {
    try {
      const { userId } = req.params;
      if (!userId) {
        return res.status(400).json({ success: false, message: 'userId is required' });
      }

      // Find patient linked to this user
      const patient = await Patient.findOne({ user: userId })
        .populate('user', 'name email phone');

      if (!patient) {
        return res.status(404).json({ success: false, message: 'Patient not found for this user' });
      }

      return res.status(200).json({ success: true, data: patient });
    } catch (error) {
      console.error('Error fetching patient by user:', error);
      return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
  }

  // Get patient by ID
  static async getPatientById(req, res) {
    try {
      const patient = await Patient.findById(req.params.id)
        .populate('user', 'name email phone');
      
      if (!patient) {
        return res.status(404).json({ 
          success: false, 
          message: 'Patient not found' 
        });
      }
      
      res.status(200).json({
        success: true,
        data: patient
      });
    } catch (error) {
      console.error('Error fetching patient:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
  
  // Search patients specifically for task assignment
  static async searchPatientsForTask(req, res) {
    try {
      const { q } = req.query; // Search query
      
      // If no query provided, return all patients (for initial load)
      if (!q) {
        const patients = await Patient.find({ isActive: true })
          .populate('user', 'name email')
          .sort({ registrationDate: -1 })
          .limit(50); // Reasonable limit for initial load
        
        // Return simplified data for dropdown/selection
        const searchResults = patients.map(patient => ({
          _id: patient._id,
          id: patient._id,
          patient_id: patient.patient_id,
          name: patient.user ? patient.user.name : 'Unknown',
          email: patient.user ? patient.user.email : null,
          age: patient.age,
          registrationDate: patient.registrationDate
        }));
        
        return res.status(200).json({
          success: true,
          patients: searchResults,
          data: searchResults
        });
      }
      
      if (q.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Search query must be at least 2 characters'
        });
      }
      
      // Find patients with search in patient_id or user name
      const patients = await Patient.find({ isActive: true })
        .populate('user', 'name email')
        .sort({ registrationDate: -1 })
        .limit(20); // Limit for quick search
      
      // Filter by search term (patient_id or name)
      const filteredPatients = patients.filter(patient => {
        const matchesId = patient.patient_id.toLowerCase().includes(q.toLowerCase());
        const matchesName = patient.user && patient.user.name && 
                           patient.user.name.toLowerCase().includes(q.toLowerCase());
        return matchesId || matchesName;
      });
      
      // Return simplified data for dropdown/selection
      const searchResults = filteredPatients.map(patient => ({
        _id: patient._id,
        id: patient._id,
        patient_id: patient.patient_id,
        name: patient.user ? patient.user.name : 'Unknown',
        email: patient.user ? patient.user.email : null,
        age: patient.age,
        registrationDate: patient.registrationDate
      }));
      
      res.status(200).json({
        success: true,
        patients: searchResults,
        data: searchResults
      });
    } catch (error) {
      console.error('Error searching patients:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  // Get patient lab history
  static async getPatientLabHistory(req, res) {
    try {
      const { id } = req.params;
      const LabTask = require('../Model/LabTask');
      
      // Find all completed lab tasks for this patient
      const labHistory = await LabTask.find({ 
        patient_id: id,
        status: 'Completed',
        results: { $exists: true }
      })
      .select('taskTitle createdAt updatedAt results priority status sampleCollection processing')
      .sort({ updatedAt: -1 })
      .limit(20); // Last 20 completed tests
      
      // Transform data for better frontend consumption
      const history = labHistory.map(task => {
        const resultSummary = task.results?.overallInterpretation || 'No result summary';
        const status = task.status || 'Unknown';
        const technician = task.processing?.processedBy || task.sampleCollection?.collectedBy || 'Unknown';
        const priority = task.priority || 'Medium';

        return {
          _id: task._id,
          testType: task.taskTitle,
          date: task.updatedAt || task.createdAt,
          result: resultSummary,
          status: status,
          technician: technician,
          priority
        };
      });
      
      res.status(200).json({
        success: true,
        history: history
      });
    } catch (error) {
      console.error('Error fetching patient lab history:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
}

module.exports = PatientController;