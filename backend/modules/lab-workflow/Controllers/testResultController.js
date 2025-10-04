const TestResult = require('../Model/TestResult');
const LabTest = require('../Model/LabTest');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../../uploads/test-results');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'test-result-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow images, PDFs, and documents
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, PDFs, and documents are allowed'));
    }
  }
});

class TestResultController {
  
  // Get test result by test ID
  static async getTestResult(req, res) {
    try {
      const { testId } = req.params;
      
      const testResult = await TestResult.findOne({ testId })
        .populate('labTestId')
        .lean();
      
      if (!testResult) {
        return res.status(404).json({
          success: false,
          message: 'Test result not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: testResult
      });
      
    } catch (error) {
      console.error('Error fetching test result:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
  
  // Get test result by lab test ID
  static async getTestResultByLabTestId(req, res) {
    try {
      const { labTestId } = req.params;
      
      const testResult = await TestResult.findOne({ labTestId })
        .populate('labTestId')
        .lean();
      
      if (!testResult) {
        return res.status(404).json({
          success: false,
          message: 'Test result not found for this lab test'
        });
      }
      
      res.status(200).json({
        success: true,
        data: testResult
      });
      
    } catch (error) {
      console.error('Error fetching test result by lab test ID:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
  
  // Create or update test result
  static async createOrUpdateTestResult(req, res) {
    try {
      const { testId } = req.params;
      const testResultData = req.body;
      
      // Convert labTestId to ObjectId if it's the lab test ID from the URL
      if (testId && !testResultData.labTestId) {
        testResultData.labTestId = testId;
      }
      
      let testResult = await TestResult.findOne({ testId: testResultData.testId });
      
      if (testResult) {
        // Update existing test result
        Object.assign(testResult, testResultData);
        testResult.updatedAt = new Date();
        await testResult.save();
        
        res.status(200).json({
          success: true,
          message: 'Test result updated successfully',
          data: testResult
        });
      } else {
        // Create new test result
        testResult = new TestResult({
          ...testResultData
        });
        await testResult.save();
        
        res.status(201).json({
          success: true,
          message: 'Test result created successfully',
          data: testResult
        });
      }
      
    } catch (error) {
      console.error('Error creating/updating test result:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
  
  // Get all test results with pagination and filtering
  static async getAllTestResults(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        testType,
        patientId,
        startDate,
        endDate
      } = req.query;
      
      const query = {};
      
      if (status) query.status = status;
      if (testType) query.testType = new RegExp(testType, 'i');
      if (patientId) query['patient.patientId'] = patientId;
      
      if (startDate || endDate) {
        query.completedDate = {};
        if (startDate) query.completedDate.$gte = new Date(startDate);
        if (endDate) query.completedDate.$lte = new Date(endDate);
      }
      
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { completedDate: -1 },
        populate: 'labTestId'
      };
      
      const testResults = await TestResult.find(query)
        .populate('labTestId')
        .sort({ completedDate: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean();
      
      const total = await TestResult.countDocuments(query);
      
      res.status(200).json({
        success: true,
        data: testResults,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      });
      
    } catch (error) {
      console.error('Error fetching test results:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
  
  // Add attachment to test result
  static async addAttachment(req, res) {
    try {
      const { testId } = req.params;
      const { fileName, fileType, fileSize, filePath } = req.body;
      
      const testResult = await TestResult.findOne({ testId });
      
      if (!testResult) {
        return res.status(404).json({
          success: false,
          message: 'Test result not found'
        });
      }
      
      const attachment = {
        fileName,
        fileType,
        fileSize,
        filePath,
        uploadDate: new Date()
      };
      
      testResult.attachments.push(attachment);
      await testResult.save();
      
      res.status(200).json({
        success: true,
        message: 'Attachment added successfully',
        data: testResult
      });
      
    } catch (error) {
      console.error('Error adding attachment:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
  
  // Delete attachment from test result
  static async deleteAttachment(req, res) {
    try {
      const { testId, attachmentId } = req.params;
      
      const testResult = await TestResult.findOne({ testId });
      
      if (!testResult) {
        return res.status(404).json({
          success: false,
          message: 'Test result not found'
        });
      }
      
      testResult.attachments.id(attachmentId).remove();
      await testResult.save();
      
      res.status(200).json({
        success: true,
        message: 'Attachment deleted successfully',
        data: testResult
      });
      
    } catch (error) {
      console.error('Error deleting attachment:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
  
  // Create sample test results for demo
  static async createSampleTestResults(req, res) {
    try {
      const sampleTestResults = [
        {
          testId: 'LT-10003',
          labTestId: null, // This should be a valid ObjectId in real scenario
          testType: 'Urinalysis',
          status: 'Verified',
          completedDate: new Date('2023-05-24'),
          requestedDate: new Date('2023-05-24'),
          patient: {
            name: 'Robert Brown',
            patientId: 'PT-12347',
            dateOfBirth: new Date('1975-01-15'),
            gender: 'Male'
          },
          requestedBy: 'Dr. James Wilson',
          parameters: [
            {
              parameter: 'Color',
              result: 'Yellow',
              referenceRange: 'Yellow to Amber',
              status: 'Normal',
              unit: ''
            },
            {
              parameter: 'Appearance',
              result: 'Clear',
              referenceRange: 'Clear',
              status: 'Normal',
              unit: ''
            },
            {
              parameter: 'pH',
              result: '6.0',
              referenceRange: '4.5-8.0',
              status: 'Normal',
              unit: ''
            },
            {
              parameter: 'Specific Gravity',
              result: '1.025',
              referenceRange: '1.005-1.030',
              status: 'Normal',
              unit: ''
            },
            {
              parameter: 'Glucose',
              result: 'Negative',
              referenceRange: 'Negative',
              status: 'Normal',
              unit: ''
            },
            {
              parameter: 'Protein',
              result: 'Trace',
              referenceRange: 'Negative',
              status: 'Abnormal',
              unit: ''
            },
            {
              parameter: 'Ketones',
              result: 'Negative',
              referenceRange: 'Negative',
              status: 'Normal',
              unit: ''
            }
          ],
          labNotes: 'Patient sample was collected at 9:15 AM and processed within 30 minutes of collection. Trace amounts of protein detected which may indicate mild dehydration or possible early signs of kidney issues. Recommend follow-up testing in 2 weeks if protein remains present.',
          performedBy: {
            name: 'Lisa Adams',
            role: 'Lab Assistant'
          },
          verifiedBy: {
            name: 'Kevin Lee',
            role: 'Lab Supervisor'
          },
          attachments: [
            {
              fileName: 'Urinalysis_Report_LT10003.pdf',
              fileType: 'PDF',
              fileSize: '1.2 MB',
              filePath: '/attachments/urinalysis/LT10003_report.pdf',
              uploadDate: new Date('2023-05-24')
            },
            {
              fileName: 'Lab_Images_LT10003.jpg',
              fileType: 'JPG',
              fileSize: '3.5 MB',
              filePath: '/attachments/urinalysis/LT10003_images.jpg',
              uploadDate: new Date('2023-05-24')
            }
          ]
        }
      ];
      
      // Clear existing sample data
      await TestResult.deleteMany({ testId: { $in: sampleTestResults.map(t => t.testId) } });
      
      // Insert new sample data
      const createdResults = await TestResult.insertMany(sampleTestResults);
      
      res.status(201).json({
        success: true,
        message: 'Sample test results created successfully',
        data: createdResults
      });
      
    } catch (error) {
      console.error('Error creating sample test results:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Upload test result with files
  static uploadTestResult = upload.array('attachments', 5);

  // Update test result with file upload
  static async updateTestResultWithFiles(req, res) {
    try {
      const { testId } = req.params;
      const testResultData = req.body;
      
      // Handle uploaded files
      const attachments = [];
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          attachments.push({
            fileName: file.originalname,
            fileType: path.extname(file.originalname).substring(1).toUpperCase(),
            fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
            filePath: `/uploads/test-results/${file.filename}`,
            uploadDate: new Date()
          });
        });
      }

      // Parse parameters if sent as JSON string
      if (typeof testResultData.parameters === 'string') {
        try {
          testResultData.parameters = JSON.parse(testResultData.parameters);
        } catch (e) {
          return res.status(400).json({
            success: false,
            message: 'Invalid parameters format'
          });
        }
      }

      // Add new attachments to existing ones
      const existingResult = await TestResult.findOne({ testId });
      if (existingResult && existingResult.attachments) {
        testResultData.attachments = [...existingResult.attachments, ...attachments];
      } else {
        testResultData.attachments = attachments;
      }

      // Update test result
      const updatedResult = await TestResult.findOneAndUpdate(
        { testId },
        { ...testResultData, updatedAt: new Date() },
        { new: true, upsert: true }
      ).populate('labTestId');

      res.json({
        success: true,
        message: 'Test result updated successfully',
        data: updatedResult
      });

    } catch (error) {
      console.error('Error updating test result with files:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Delete test result
  static async deleteTestResult(req, res) {
    try {
      const { testId } = req.params;
      
      const testResult = await TestResult.findOne({ testId });
      if (!testResult) {
        return res.status(404).json({
          success: false,
          message: 'Test result not found'
        });
      }

      // Delete associated files
      if (testResult.attachments && testResult.attachments.length > 0) {
        testResult.attachments.forEach(attachment => {
          const filePath = path.join(__dirname, '../../../', attachment.filePath);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        });
      }

      // Delete test result from database
      await TestResult.findOneAndDelete({ testId });

      res.json({
        success: true,
        message: 'Test result deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting test result:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Delete specific attachment
  static async deleteAttachment(req, res) {
    try {
      const { testId, attachmentId } = req.params;
      
      const testResult = await TestResult.findOne({ testId });
      if (!testResult) {
        return res.status(404).json({
          success: false,
          message: 'Test result not found'
        });
      }

      const attachmentIndex = testResult.attachments.findIndex(
        att => att._id.toString() === attachmentId
      );

      if (attachmentIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Attachment not found'
        });
      }

      const attachment = testResult.attachments[attachmentIndex];
      
      // Delete file from filesystem
      const filePath = path.join(__dirname, '../../../', attachment.filePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Remove attachment from array
      testResult.attachments.splice(attachmentIndex, 1);
      await testResult.save();

      res.json({
        success: true,
        message: 'Attachment deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting attachment:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get test result status summary
  static async getTestResultSummary(req, res) {
    try {
      const summary = await TestResult.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const total = await TestResult.countDocuments();

      res.json({
        success: true,
        data: {
          summary,
          total
        }
      });

    } catch (error) {
      console.error('Error getting test result summary:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Download test result as PDF
  static async downloadResultPDF(req, res) {
    try {
      const { testId } = req.params;
      
      const testResult = await TestResult.findOne({ testId })
        .populate('labTestId')
        .lean();

      if (!testResult) {
        return res.status(404).json({
          success: false,
          message: 'Test result not found'
        });
      }

      // For now, return a simple response indicating PDF generation would happen here
      // In a real implementation, you would use a library like puppeteer or jsPDF
      res.status(200).json({
        success: true,
        message: 'PDF download feature is not yet implemented',
        data: {
          testId: testResult.testId,
          downloadUrl: `/api/test-results/test/${testId}/pdf`,
          note: 'This would generate and return a PDF file in a real implementation'
        }
      });

    } catch (error) {
      console.error('Error downloading PDF:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Send notification
  static async sendNotification(req, res) {
    try {
      const { testId } = req.params;
      const { recipient, method, message } = req.body;
      
      const testResult = await TestResult.findOne({ testId })
        .populate('labTestId')
        .lean();

      if (!testResult) {
        return res.status(404).json({
          success: false,
          message: 'Test result not found'
        });
      }

      // Validate input
      if (!recipient || !method) {
        return res.status(400).json({
          success: false,
          message: 'Recipient and method are required'
        });
      }

      // For now, simulate sending notification
      // In a real implementation, you would integrate with email/SMS services
      console.log(`Sending ${method} notification to ${recipient} for test result ${testId}`);
      console.log(`Message: ${message || 'Your test results are ready'}`);

      res.status(200).json({
        success: true,
        message: `Notification sent successfully via ${method}`,
        data: {
          testId: testResult.testId,
          recipient,
          method,
          sentAt: new Date().toISOString(),
          note: 'This is a simulated notification. In production, this would use real email/SMS services.'
        }
      });

    } catch (error) {
      console.error('Error sending notification:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Share test result
  static async shareTestResult(req, res) {
    try {
      const { testId } = req.params;
      const { email, expirationDays, allowDownload } = req.body;
      
      const testResult = await TestResult.findOne({ testId })
        .populate('labTestId')
        .lean();

      if (!testResult) {
        return res.status(404).json({
          success: false,
          message: 'Test result not found'
        });
      }

      // Validate input
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }

      // Generate a mock share token (in production, use proper token generation)
      const shareToken = `share_${testId}_${Date.now()}`;
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + (expirationDays || 7));

      // For now, simulate creating share link
      // In a real implementation, you would store the share link in database and send email
      console.log(`Creating share link for test result ${testId}`);
      console.log(`Share link: /shared-results/${shareToken}`);
      console.log(`Expires: ${expirationDate.toISOString()}`);
      console.log(`Allow download: ${allowDownload}`);

      res.status(200).json({
        success: true,
        message: 'Share link created successfully',
        data: {
          testId: testResult.testId,
          shareToken,
          shareUrl: `/shared-results/${shareToken}`,
          recipient: email,
          expirationDate: expirationDate.toISOString(),
          allowDownload: allowDownload || false,
          createdAt: new Date().toISOString(),
          note: 'This is a simulated share link. In production, this would send an actual email with the link.'
        }
      });

    } catch (error) {
      console.error('Error sharing test result:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
}

module.exports = TestResultController;