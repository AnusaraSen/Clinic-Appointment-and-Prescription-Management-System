// controllers/labTaskController.js
const mongoose = require("mongoose");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const LabTask = require("../Model/LabTask");
const LabStaff = require("../../workforce-facility/models/LabStaff"); // Use existing LabStaff model

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../../uploads/lab-results');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'lab-result-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow images, PDFs, and documents
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt|csv/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, PDFs, and documents are allowed!'));
    }
  }
});

class LabTaskController {
  
  static async createTask(req, res) {
    try {
      console.log("Received data:", req.body);
      
      // Generate unique task_id if not provided
      if (!req.body.task_id) {
        req.body.task_id = await LabTaskController.generateUniqueTaskId();
        console.log("Generated task_id:", req.body.task_id);
      }
      
      const task = await LabTask.create(req.body);
      console.log("Task created successfully:", task);
      
      res.status(201).json(task);
    } catch (error) {
      // If it's a duplicate key error, try generating a new ID and retry once
      if (error.code === 11000 && error.keyPattern && error.keyPattern.task_id) {
        try {
          console.log("Duplicate task_id detected, generating new ID and retrying...");
          req.body.task_id = await LabTaskController.generateUniqueTaskId();
          console.log("New generated task_id:", req.body.task_id);
          
          const task = await LabTask.create(req.body);
          console.log("Task created successfully on retry:", task);
          
          return res.status(201).json(task);
        } catch (retryError) {
          console.error("Error on retry:", retryError);
          return res.status(400).json({ error: retryError.message });
        }
      }
      
      console.error("Error creating task:", error);
      res.status(400).json({ error: error.message });
    }
  }

  // Helper method to generate unique task ID
  static async generateUniqueTaskId() {
    // Get all existing task IDs to find the highest number
    const allTasks = await LabTask.find({}, { task_id: 1 }).sort({ task_id: -1 });
    
    let maxNumber = 0;
    
    // Extract numbers from all task IDs and find the maximum
    allTasks.forEach(task => {
      if (task.task_id) {
        // Extract numbers from various formats: LTASK004, LTASK0022, LTASK0006, etc.
        const matches = task.task_id.match(/LTASK(\d+)/);
        if (matches) {
          const number = parseInt(matches[1]);
          if (number > maxNumber) {
            maxNumber = number;
          }
        }
      }
    });
    
    // Generate next task ID
    const nextTaskNumber = maxNumber + 1;
    return `LTASK${String(nextTaskNumber).padStart(4, '0')}`;
  }

  
  // Debug method to see raw MongoDB data
  static async debugRawData(req, res) {
    try {
      // Get raw data using MongoDB native driver
      const db = LabTask.db;
      const rawTasks = await db.collection('lab_tasks').find({}).limit(2).toArray();
      
      // Get data through Mongoose
      const mongooseTasks = await LabTask.find({}).limit(2);
      
      res.json({
        rawMongoDB: rawTasks,
        throughMongoose: mongooseTasks,
        schemaFields: Object.keys(LabTask.schema.paths)
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Test method to debug populate issue
  static async testPopulate(req, res) {
    try {
      // Get first task without populate
      const taskRaw = await LabTask.findOne({});
      
      // Get the same task with populate
      const taskPopulated = await LabTask.findById(taskRaw._id).populate("labAssistant");
      
      // Try to find the lab staff directly
      const labStaffDirect = await LabStaff.findById(taskRaw.labAssistant);
      
      res.json({
        taskRaw: taskRaw,
        taskPopulated: taskPopulated,
        labStaffDirect: labStaffDirect,
        labAssistantObjectId: taskRaw.labAssistant?.toString()
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Temporary test endpoint for debugging
  static async testTasksWithPatientNames(req, res) {
    try {
      console.log("🔥 TEST ENDPOINT: Fetching tasks with patient names...");
      
      const tasks = await LabTask.find({})
        .populate({
          path: 'patient_id',
          select: 'patient_id user',
          populate: {
            path: 'user',
            select: 'name email'
          }
        })
        .lean()
        .exec();
      
      const transformedTasks = tasks.map(task => ({
        ...task,
        patient: task.patient_id ? {
          _id: task.patient_id._id,
          name: task.patient_id.user?.name || 'Unknown',
          patient_id: task.patient_id.patient_id,
          email: task.patient_id.user?.email || null
        } : null
      }));
      
      console.log(`🔥 Transformed ${transformedTasks.length} tasks with patient names`);
      
      res.status(200).json({
        count: transformedTasks.length,
        tasks: transformedTasks
      });
    } catch (error) {
      console.error("Error in test endpoint:", error);
      res.status(500).json({ error: error.message });
    }
  }

  static async getAllTasks(req, res) {
    try {
      // Query with populate to get labAssistant and patient details
      const tasks = await LabTask.find({})
        .populate({
          path: 'labAssistant',
          select: 'lab_staff_id user',
          populate: {
            path: 'user',
            select: 'name'
          }
        })
        .populate({
          path: 'patient_id',
          select: 'patient_id user',
          populate: {
            path: 'user',
            select: 'name email'
          }
        })
        .lean()
        .exec();
      
      // Transform the data to ensure labAssistant is a string for frontend compatibility
      const transformedTasks = tasks.map(task => {
        const patient = task.patient_id ? {
          _id: task.patient_id._id,
          name: task.patient_id.user?.name || 'Unknown',
          patient_id: task.patient_id.patient_id,
          email: task.patient_id.user?.email || null
        } : null;
        
        return {
          ...task,
          labAssistant: task.labAssistant?.user?.name || null,
          patient: patient
        };
      });
      
      res.status(200).json({
        count: transformedTasks.length,
        tasks: transformedTasks
      });
    } catch (error) {
      console.error("Error fetching tasks:", error.message);
      res.status(500).json({ error: error.message });
    }
  }

  
  static async getTaskById(req, res) {
    try {
      const task = await LabTask.findById(req.params.id)
        .populate("labAssistant", "name staff_id")
        .populate({
          path: 'patient_id',
          select: 'patient_id user',
          populate: {
            path: 'user',
            select: 'name email'
          }
        })
        .lean()
        .exec();
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Transform the data to ensure patient information is in the correct format
      const transformedTask = {
        ...task,
        patient: task.patient_id ? {
          _id: task.patient_id._id,
          name: task.patient_id.user?.name || 'Unknown',
          patient_id: task.patient_id.patient_id,
          email: task.patient_id.user?.email || null
        } : null
      };
      
      res.status(200).json(transformedTask);
    } catch (error) {
      console.error('Error in getTaskById:', error);
      res.status(500).json({ error: error.message });
    }
  }

  
  static async updateTask(req, res) {
    try {
      const task = await LabTask.findByIdAndUpdate(
        req.params.id,
        { ...req.body, updatedAt: new Date() },
        { new: true }
      )
      .populate({
        path: 'labAssistant',
        select: 'lab_staff_id user',
        populate: {
          path: 'user',
          select: 'name'
        }
      })
      .populate({
        path: 'patient_id',
        select: 'patient_id user',
        populate: {
          path: 'user',
          select: 'name email'
        }
      })
      .lean()
      .exec();
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Transform the data to ensure consistent patient format
      const transformedTask = {
        ...task,
        labAssistant: task.labAssistant?.user?.name || null,
        patient: task.patient_id ? {
          _id: task.patient_id._id,
          name: task.patient_id.user?.name || 'Unknown',
          patient_id: task.patient_id.patient_id,
          email: task.patient_id.user?.email || null
        } : null
      };
      
      res.status(200).json(transformedTask);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(400).json({ error: error.message });
    }
  }

  
  static async deleteTask(req, res) {
    try {
      const task = await LabTask.findByIdAndDelete(req.params.id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getLabStaff(req, res) {
    try {
      console.log("=== getLabStaff called ===");
      const labStaff = await LabStaff.find({}, 'lab_staff_id user position availability')
        .populate('user', 'name')
        .sort({ 'user.name': 1 });
      console.log("Lab staff query result:", JSON.stringify(labStaff, null, 2));
      res.status(200).json(labStaff);
    } catch (error) {
      console.error("Error fetching lab staff:", error);
      res.status(500).json({ error: error.message });
    }
  }

  static async updateStaffAvailability(req, res) {
    try {
      const { staffId } = req.params;
      const { availability } = req.body;

      // Validate availability value
      if (!['Available', 'Not Available'].includes(availability)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid availability status. Must be "Available" or "Not Available"'
        });
      }

      const updatedStaff = await LabStaff.findByIdAndUpdate(
        staffId,
        { availability },
        { new: true }
      ).populate('user', 'name');

      if (!updatedStaff) {
        return res.status(404).json({
          success: false,
          message: 'Lab staff member not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Staff availability updated successfully',
        data: updatedStaff
      });
    } catch (error) {
      console.error("Error updating staff availability:", error);
      res.status(500).json({
        success: false,
        message: 'Failed to update staff availability',
        error: error.message
      });
    }
  }

  // New Lab Assistant specific methods

  static async getTasksByAssistant(req, res) {
    try {
      const { assistantId } = req.params;
      
      // Since the model now handles conversion, we can try both formats
      const tasks = await LabTask.find({
        $or: [
          { labAssistant: assistantId },
          { assignedTo: assistantId }
        ]
      })
      .populate({
        path: 'patient_id',
        select: 'patient_id user',
        populate: {
          path: 'user',
          select: 'name email'
        }
      })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
      
      // Transform the data to ensure patient information is in the correct format
      const transformedTasks = tasks.map(task => ({
        ...task,
        patient: task.patient_id ? {
          _id: task.patient_id._id,
          name: task.patient_id.user?.name || 'Unknown',
          patient_id: task.patient_id.patient_id,
          email: task.patient_id.user?.email || null
        } : null
      }));
      
      res.status(200).json({ count: transformedTasks.length, tasks: transformedTasks });
    } catch (error) {
      console.error("Error fetching assistant tasks:", error);
      res.status(500).json({ error: error.message });
    }
  }

  static async getTaskNotes(req, res) {
    try {
      const task = await LabTask.findById(req.params.id).select('notes');
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.status(200).json({ notes: task.notes || [] });
    } catch (error) {
      console.error("Error fetching task notes:", error);
      res.status(500).json({ error: error.message });
    }
  }

  static async addTaskNote(req, res) {
    try {
      const { content, author, type } = req.body;
      const task = await LabTask.findById(req.params.id);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      const newNote = {
        content,
        author,
        type: type || 'general',
        createdAt: new Date()
      };

      if (!task.notes) {
        task.notes = [];
      }
      task.notes.push(newNote);
      
      await task.save();
      
      // Get the newly created note with its MongoDB _id
      const savedNote = task.notes[task.notes.length - 1];
      console.log('Created note with ID:', savedNote._id);
      console.log('Full saved note:', JSON.stringify(savedNote, null, 2));
      
      // Convert to plain object to ensure _id is properly serialized
      const noteResponse = {
        _id: savedNote._id.toString(),
        content: savedNote.content,
        author: savedNote.author,
        type: savedNote.type,
        createdAt: savedNote.createdAt
      };
      
      res.status(201).json({ message: "Note added successfully", note: noteResponse });
    } catch (error) {
      console.error("Error adding task note:", error);
      res.status(500).json({ error: error.message });
    }
  }

  static async deleteTaskNote(req, res) {
    try {
      const { id: taskId, noteId } = req.params;
      const task = await LabTask.findById(taskId);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      if (!task.notes || task.notes.length === 0) {
        return res.status(404).json({ message: "No notes found for this task" });
      }

      // Find and remove the note by its _id or by index if _id is not available
      const noteIndex = task.notes.findIndex(note => 
        (note._id && note._id.toString() === noteId) || 
        (note.id && note.id.toString() === noteId)
      );
      
      if (noteIndex === -1) {
        return res.status(404).json({ message: "Note not found" });
      }

      task.notes.splice(noteIndex, 1);
      await task.save();
      
      res.status(200).json({ 
        message: "Note deleted successfully", 
        notes: task.notes 
      });
    } catch (error) {
      console.error("Error deleting task note:", error);
      res.status(500).json({ error: error.message });
    }
  }

  static async getTestExecutions(req, res) {
    try {
      const task = await LabTask.findById(req.params.id).select('executions processing');
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      // Return both old executions (for backward compatibility) and new processing data
      res.status(200).json({ 
        executions: task.executions || [], 
        processing: task.processing || {}
      });
    } catch (error) {
      console.error("Error fetching test executions:", error);
      res.status(500).json({ error: error.message });
    }
  }

  // New method for clinical processing data
  static async addClinicalProcessing(req, res) {
    try {
      const { sampleCollection, processing, results } = req.body;
      const task = await LabTask.findById(req.params.id);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      // Update the task with clinical processing data
      if (sampleCollection) {
        task.sampleCollection = { ...task.sampleCollection, ...sampleCollection };
      }
      
      if (processing) {
        task.processing = { ...task.processing, ...processing };
      }
      
      if (results && results.testResults) {
        if (!task.results) {
          task.results = { testResults: [] };
        }
        task.results.testResults = results.testResults;
        if (results.overallInterpretation) task.results.overallInterpretation = results.overallInterpretation;
        if (results.recommendations) task.results.recommendations = results.recommendations;
        if (results.criticalValues !== undefined) task.results.criticalValues = results.criticalValues;
        if (results.reviewedBy) task.results.reviewedBy = results.reviewedBy;
      }

      // Update status based on completion
      if (processing && processing.processedBy && results && results.testResults && results.testResults.length > 0) {
        task.status = "Results Ready";
      } else if (sampleCollection && sampleCollection.collectedBy) {
        task.status = "Sample Collected";
      } else if (processing && processing.processedBy) {
        task.status = "In Progress";
      }
      
      await task.save();
      res.status(200).json({ 
        message: "Clinical processing data updated successfully", 
        task: task 
      });
    } catch (error) {
      console.error("Error adding clinical processing:", error);
      res.status(500).json({ error: error.message });
    }
  }

  static async addTestExecution(req, res) {
    try {
      const executionData = req.body;
      const task = await LabTask.findById(req.params.id);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      // Check if this is new clinical processing format
      if (executionData.collectedBy || executionData.processedBy || executionData.testResults) {
        return LabTaskController.addClinicalProcessing(req, res);
      }

      // Legacy format - add to executions array
      const newExecution = {
        ...executionData,
        _id: new mongoose.Types.ObjectId(),
        createdAt: new Date()
      };

      if (!task.executions) {
        task.executions = [];
      }
      task.executions.push(newExecution);
      
      await task.save();
      res.status(201).json({ message: "Test execution logged successfully", execution: newExecution });
    } catch (error) {
      console.error("Error adding test execution:", error);
      res.status(500).json({ error: error.message });
    }
  }

  static async getTaskResults(req, res) {
    try {
      const task = await LabTask.findById(req.params.id).select('results');
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      // Return results as object or empty object with proper structure
      const results = task.results || {
        testResults: [],
        overallInterpretation: '',
        recommendations: '',
        criticalValues: false,
        physicianNotified: false
      };
      res.status(200).json({ results });
    } catch (error) {
      console.error("Error fetching task results:", error);
      res.status(500).json({ error: error.message });
    }
  }

  static async testEndpoint(req, res) {
    console.log('Test endpoint called');
    res.json({ message: "Test endpoint working", timestamp: new Date() });
  }

  static async addTaskResults(req, res) {
    try {
      console.log('Received request to add task results:', {
        taskId: req.params.id,
        bodyKeys: Object.keys(req.body)
      });
      
      const resultData = req.body;
      const task = await LabTask.findById(req.params.id);
      
      if (!task) {
        console.log('Task not found:', req.params.id);
        return res.status(404).json({ message: "Task not found" });
      }

      console.log('Task found, current results structure:', {
        hasResults: !!task.results,
        resultsType: typeof task.results,
        isArray: Array.isArray(task.results),
        resultsKeys: task.results ? Object.keys(task.results) : 'null'
      });

      // Fix corrupted data - if results is an array, convert it to object
      if (Array.isArray(task.results)) {
        console.log('Found results as array, converting to object structure');
        const oldResults = task.results;
        task.results = {
          testResults: [],
          overallInterpretation: '',
          recommendations: '',
          criticalValues: false,
          physicianNotified: false
        };
        // If old results had data, try to preserve what we can
        if (oldResults.length > 0) {
          console.log('Attempting to preserve old results data');
          task.results.overallInterpretation = `Legacy data: ${JSON.stringify(oldResults)}`;
        }
      }

      // Initialize results object if it doesn't exist
      if (!task.results) {
        task.results = {
          testResults: [],
          overallInterpretation: '',
          recommendations: '',
          criticalValues: false,
          physicianNotified: false
        };
        console.log('Initialized results object');
      }

      // Map frontend data to schema structure
      // Use interpretation field as overallInterpretation
      if (resultData.interpretation) {
        task.results.overallInterpretation = resultData.interpretation;
        console.log('Set overallInterpretation');
      }
      
      // If summary is provided, add it to overallInterpretation as well
      if (resultData.summary) {
        const summaryText = resultData.summary;
        const existingInterpretation = task.results.overallInterpretation || '';
        task.results.overallInterpretation = existingInterpretation 
          ? `${existingInterpretation}\n\nSummary: ${summaryText}`
          : `Summary: ${summaryText}`;
        console.log('Updated overallInterpretation with summary');
      }

      // Update recommendations
      if (resultData.recommendations) {
        task.results.recommendations = resultData.recommendations;
        console.log('Set recommendations');
      }

      // Add reviewer information
      if (resultData.reviewedBy) {
        task.results.reviewedBy = resultData.reviewedBy;
        console.log('Set reviewedBy');
      }

      // Handle test results if provided
      if (resultData.testResults && Array.isArray(resultData.testResults)) {
        task.results.testResults.push(...resultData.testResults);
        console.log('Added test results');
      }

      // Update other result fields
      if (resultData.criticalValues !== undefined) {
        task.results.criticalValues = resultData.criticalValues;
      }
      if (resultData.physicianNotified !== undefined) {
        task.results.physicianNotified = resultData.physicianNotified;
      }

      // Handle approval
      if (resultData.status === 'final' || resultData.status === 'reviewed') {
        task.results.approvedBy = resultData.reviewedBy || resultData.technician;
        task.results.approvalDateTime = new Date();
        task.status = 'Results Ready';
        console.log('Set approval information and status');
      }

      // Add a note if provided
      if (resultData.notes) {
        if (!task.notes) {
          task.notes = [];
        }
        task.notes.push({
          content: resultData.notes,
          author: resultData.technician || resultData.reviewedBy || 'Lab Staff',
          type: 'result',
          createdAt: new Date()
        });
        console.log('Added note');
      }
      
      console.log('About to save task');
      await task.save();
      console.log('Task saved successfully');
      
      res.status(201).json({ 
        message: "Results added successfully", 
        results: task.results 
      });
    } catch (error) {
      console.error("Error adding task results:", error);
      console.error("Error stack:", error.stack);
      res.status(500).json({ error: error.message });
    }
  }

  static async uploadFile(req, res) {
    try {
      const { taskId, type } = req.body;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // File upload response with actual file information
      const fileData = {
        fileId: new mongoose.Types.ObjectId().toString(),
        url: `/uploads/lab-results/${file.filename}`,
        originalName: file.originalname,
        filename: file.filename,
        size: file.size,
        mimeType: file.mimetype,
        uploadedAt: new Date()
      };

      res.status(200).json({
        message: "File uploaded successfully",
        ...fileData
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ error: error.message });
    }
  }

  // Static method to get the upload middleware
  static getUploadMiddleware() {
    return upload.single('file');
  }
}

module.exports = LabTaskController;
