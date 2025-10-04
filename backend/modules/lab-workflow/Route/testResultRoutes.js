const express = require('express');
const router = express.Router();
const TestResultController = require('../Controllers/testResultController');

// Test Result Routes

// GET /api/test-results - Get all test results with pagination and filtering
router.get('/', TestResultController.getAllTestResults);

// GET /api/test-results/summary - Get test result status summary
router.get('/summary', TestResultController.getTestResultSummary);

// GET /api/test-results/test/:testId - Get test result by test ID
router.get('/test/:testId', TestResultController.getTestResult);

// GET /api/test-results/lab-test/:labTestId - Get test result by lab test ID
router.get('/lab-test/:labTestId', TestResultController.getTestResultByLabTestId);

// POST /api/test-results/test/:testId - Create or update test result
router.post('/test/:testId', TestResultController.createOrUpdateTestResult);

// POST /api/test-results/test/:testId/upload - Update test result with file upload
router.post('/test/:testId/upload', 
  TestResultController.uploadTestResult,
  TestResultController.updateTestResultWithFiles
);

// PUT /api/test-results/test/:testId - Update test result
router.put('/test/:testId', TestResultController.createOrUpdateTestResult);

// DELETE /api/test-results/test/:testId - Delete test result
router.delete('/test/:testId', TestResultController.deleteTestResult);

// POST /api/test-results/test/:testId/attachments - Add attachment to test result (legacy)
router.post('/test/:testId/attachments', TestResultController.addAttachment);

// DELETE /api/test-results/test/:testId/attachments/:attachmentId - Delete attachment
router.delete('/test/:testId/attachments/:attachmentId', TestResultController.deleteAttachment);

// POST /api/test-results/sample-data - Create sample test results for demo
router.post('/sample-data', TestResultController.createSampleTestResults);

// GET /api/test-results/test/:testId/pdf - Download test result as PDF
router.get('/test/:testId/pdf', TestResultController.downloadResultPDF);

// POST /api/test-results/test/:testId/notification - Send notification
router.post('/test/:testId/notification', TestResultController.sendNotification);

// POST /api/test-results/test/:testId/share - Share test result
router.post('/test/:testId/share', TestResultController.shareTestResult);

module.exports = router;