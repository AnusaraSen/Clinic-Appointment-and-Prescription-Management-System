const express = require("express");
const router = express.Router();
const labTaskController = require("../Controllers/labTaskController");

// Test endpoint for debugging patient names (ADD THIS AT THE TOP)
router.get("/test-patient-names", labTaskController.testTasksWithPatientNames);

// Create a new task
router.post("/", labTaskController.createTask);

// // Debug raw MongoDB data
// router.get("/debug/raw", labTaskController.debugRawData);

// // Test populate functionality
// router.get("/test/populate", labTaskController.testPopulate);

// Get all tasks for a lab assistant
router.get("/", labTaskController.getAllTasks);

// Get tasks assigned to specific assistant
router.get("/assistant/:assistantId", labTaskController.getTasksByAssistant);

// Get all lab staff for assignment
router.get("/lab-staff", labTaskController.getLabStaff);

// Update staff availability
router.put("/lab-staff/:staffId/availability", labTaskController.updateStaffAvailability);

// Get single task by ID
router.get("/:id", labTaskController.getTaskById);

// Update a task
router.put("/:id", labTaskController.updateTask);

// Delete a task
router.delete("/:id", labTaskController.deleteTask);

// Lab Assistant specific endpoints

// Get task notes
router.get("/:id/notes", labTaskController.getTaskNotes);

// Add task note
router.post("/:id/notes", labTaskController.addTaskNote);

// Delete task note
router.delete("/:id/notes/:noteId", labTaskController.deleteTaskNote);

// Get test executions for a task (includes both legacy executions and clinical processing)
router.get("/:id/executions", labTaskController.getTestExecutions);

// Legacy execution endpoint (backward compatibility)
router.post("/:id/executions", labTaskController.addTestExecution);

// New clinical processing endpoint
router.post("/:id/processing", labTaskController.addClinicalProcessing);

// Test endpoint (must be before /:id routes)
router.get("/test", labTaskController.testEndpoint);

// Get task results
router.get("/:id/results", labTaskController.getTaskResults);

// Add task results
router.post("/:id/results", labTaskController.addTaskResults);

// File upload endpoint with multer middleware
router.post("/upload", labTaskController.getUploadMiddleware(), labTaskController.uploadFile);

module.exports = router;

