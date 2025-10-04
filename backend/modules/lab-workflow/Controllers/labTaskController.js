// controllers/labTaskController.js
const mongoose = require("mongoose");
const LabTask = require("../Model/LabTask");
const LabStaff = require("../../workforce-facility/models/LabStaff"); // Use existing LabStaff model

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

  static async getAllTasks(req, res) {
    try {
      console.log("Attempting to fetch all tasks...");
      
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
        .populate('patient_id', 'name patient_id email')
        .lean()
        .exec();
      
      console.log("Tasks found:", tasks.length);
      
      // Transform the data to ensure labAssistant is a string for frontend compatibility
      const transformedTasks = tasks.map(task => ({
        ...task,
        labAssistant: task.labAssistant?.user?.name || null,
        patient: task.patient_id ? {
          _id: task.patient_id._id,
          name: task.patient_id.name,
          patient_id: task.patient_id.patient_id,
          email: task.patient_id.email
        } : null
      }));
      
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
        .populate("patient_id", "name patient_id email");
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.status(200).json(task);
    } catch (error) {
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
      .populate('patient_id', 'name patient_id email');
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.status(200).json(task);
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
      const labStaff = await LabStaff.find({}, 'lab_staff_id user')
        .populate('user', 'name')
        .sort({ 'user.name': 1 });
      console.log("Lab staff query result:", JSON.stringify(labStaff, null, 2));
      res.status(200).json(labStaff);
    } catch (error) {
      console.error("Error fetching lab staff:", error);
      res.status(500).json({ error: error.message });
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
      .populate('patient_id', 'name patient_id email')
      .sort({ createdAt: -1 });
      
      res.status(200).json({ count: tasks.length, tasks });
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
      res.status(201).json({ message: "Note added successfully", note: newNote });
    } catch (error) {
      console.error("Error adding task note:", error);
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
      res.status(200).json({ results: task.results || [] });
    } catch (error) {
      console.error("Error fetching task results:", error);
      res.status(500).json({ error: error.message });
    }
  }

  static async addTaskResults(req, res) {
    try {
      const resultData = req.body;
      const task = await LabTask.findById(req.params.id);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      const newResult = {
        ...resultData,
        _id: new mongoose.Types.ObjectId(),
        createdAt: new Date()
      };

      if (!task.results) {
        task.results = [];
      }
      task.results.unshift(newResult); // Add to beginning for latest first
      
      // Update task status if results are finalized
      if (resultData.status === 'final') {
        task.status = 'Completed';
      }
      
      await task.save();
      res.status(201).json({ message: "Results added successfully", result: newResult });
    } catch (error) {
      console.error("Error adding task results:", error);
      res.status(500).json({ error: error.message });
    }
  }

  static async uploadFile(req, res) {
    try {
      // This is a placeholder for file upload functionality
      // In a real implementation, you would use multer or similar middleware
      // and store files in a cloud storage service like AWS S3
      
      const { taskId, type } = req.body;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Simulate file upload response
      const fileData = {
        fileId: new mongoose.Types.ObjectId().toString(),
        url: `/uploads/${file.filename}`, // This would be the actual file URL
        originalName: file.originalname,
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
}

module.exports = LabTaskController;
