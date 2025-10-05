const express = require('express');
const router = express.Router();

// Simple test route
router.get('/test/:testId', (req, res) => {
  const { testId } = req.params;
  
  // Return mock data for now
  res.json({
    success: true,
    data: {
      testId: testId,
      labTestId: null,
      testType: 'Urinalysis',
      status: 'Verified',
      completedDate: '2023-05-24T00:00:00.000Z',
      requestedDate: '2023-05-24T00:00:00.000Z',
      patient: {
        name: 'Robert Brown',
        patientId: 'PT-12347',
        dateOfBirth: '1975-01-15T00:00:00.000Z',
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
        role: 'Lab Technician'
      },
      attachments: [
        {
          _id: 'att1',
          fileName: 'Urinalysis_Report_LT10003.pdf',
          fileType: 'PDF',
          fileSize: '1.2 MB',
          filePath: '/attachments/urinalysis/LT10003_report.pdf',
          uploadDate: '2023-05-24T00:00:00.000Z'
        },
        {
          _id: 'att2',
          fileName: 'Lab_Images_LT10003.jpg',
          fileType: 'JPG',
          fileSize: '3.5 MB',
          filePath: '/attachments/urinalysis/LT10003_images.jpg',
          uploadDate: '2023-05-24T00:00:00.000Z'
        }
      ],
      createdAt: '2023-05-24T00:00:00.000Z',
      updatedAt: '2023-05-24T00:00:00.000Z'
    }
  });
});

module.exports = router;