// Test script to create a new task and test notifications
const mongoose = require("mongoose");
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for testing');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Import the LabTask model
const LabTask = require("./modules/lab-workflow/Model/LabTask");

const createTestTask = async () => {
  try {
    await connectDB();
    
    const newTask = {
      task_id: `LTASK${String(Date.now()).slice(-4)}`, // Generate unique ID
      taskTitle: "Blood Sugar Test",
      taskDescription: "Urgent blood sugar level test for diabetic patient",
      priority: "High",
      status: "Pending",
      labAssistant: "68db723002a6f9a5fd01eb31", // Use ObjectId of Sarasi Mannada
      patient_id: "68e5ee14e8dadc33da97acf2", // Use existing patient ID
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Due tomorrow
      testInformation: {
        specimenType: "Blood",
        fastingRequired: true
      },
      sampleCollection: {
        labelsApplied: false
      },
      results: {
        criticalValues: false,
        physicianNotified: false,
        testResults: []
      }
    };

    const task = await LabTask.create(newTask);
    console.log('New task created for notification testing:', {
      task_id: task.task_id,
      title: task.taskTitle,
      priority: task.priority,
      assignedTo: task.labAssistant
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating test task:', error);
    process.exit(1);
  }
};

createTestTask();