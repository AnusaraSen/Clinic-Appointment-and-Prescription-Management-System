import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Upload, 
  File, 
  Image, 
  FileText, 
  Download, 
  Trash2, 
  Save,
  CheckCircle,
  AlertCircle,
  Eye,
  Camera,
  Paperclip
} from 'lucide-react';

const ResultsUpload = ({ taskId, onClose, isModal = false }) => {
  const navigate = useNavigate();
  
  const [resultData, setResultData] = useState({
    summary: '',
    interpretation: '',
    recommendations: '',
    status: 'preliminary', // preliminary, final, reviewed
    technician: 'John Doe', // Should come from auth context
    notes: ''
  });

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [existingResults, setExistingResults] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const allowedFileTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/bmp',
    'application/pdf', 'text/plain', 'text/csv',
    'application/vnd.ms-excel', 
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  const maxFileSize = 10 * 1024 * 1024; // 10MB

  useEffect(() => {
    fetchExistingResults();
  }, []);

  const fetchExistingResults = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/labtasks/${taskId}/results`);
      if (response.ok) {
        const data = await response.json();
        setExistingResults(data.results || []);
        if (data.results && data.results.length > 0) {
          const latest = data.results[0];
          setResultData({
            summary: latest.summary || '',
            interpretation: latest.interpretation || '',
            recommendations: latest.recommendations || '',
            status: latest.status || 'preliminary',
            technician: latest.technician || 'John Doe',
            notes: latest.notes || ''
          });
        }
      }
    } catch (error) {
      console.error('Error fetching results:', error);
      // Mock existing results for demonstration
      setExistingResults([
        {
          _id: 'result1',
          summary: 'Blood count within normal limits',
          status: 'preliminary',
          technician: 'John Doe',
          createdAt: '2025-09-21T10:00:00.000Z',
          files: [
            { name: 'blood_count_report.pdf', size: 245000, type: 'application/pdf' }
          ]
        }
      ]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const validFiles = files.filter(file => {
      if (!allowedFileTypes.includes(file.type)) {
        alert(`File type ${file.type} is not allowed. Please upload images, PDFs, or documents.`);
        return false;
      }
      if (file.size > maxFileSize) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });

    const newFiles = validFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: null,
      uploaded: false
    }));

    // Generate previews for images
    newFiles.forEach(fileObj => {
      if (fileObj.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setUploadedFiles(prev => 
            prev.map(f => 
              f.id === fileObj.id ? { ...f, preview: e.target.result } : f
            )
          );
        };
        reader.readAsDataURL(fileObj.file);
      }
    });

    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const uploadFiles = async () => {
    const filesToUpload = uploadedFiles.filter(f => !f.uploaded);
    if (filesToUpload.length === 0) return [];

    setUploading(true);
    const uploadedFileData = [];

    try {
      for (const fileObj of filesToUpload) {
        const formData = new FormData();
        formData.append('file', fileObj.file);
        formData.append('taskId', taskId);
        formData.append('type', 'result');

        const response = await fetch(`http://localhost:5000/api/labtasks/upload`, {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          const data = await response.json();
          uploadedFileData.push({
            name: fileObj.name,
            size: fileObj.size,
            type: fileObj.type,
            url: data.url,
            id: data.fileId
          });
          
          // Mark as uploaded
          setUploadedFiles(prev =>
            prev.map(f =>
              f.id === fileObj.id ? { ...f, uploaded: true } : f
            )
          );
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error(`Failed to upload ${fileObj.name}:`, errorData);
          throw new Error(`Failed to upload ${fileObj.name}: ${errorData.error || response.statusText}`);
        }
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Some files failed to upload. Please try again.');
    } finally {
      setUploading(false);
    }

    return uploadedFileData;
  };

  const saveResults = async () => {
    setSaving(true);
    try {
      // First upload any new files
      const newUploadedFiles = await uploadFiles();

      const resultsData = {
        ...resultData,
        taskId,
        files: [
          ...newUploadedFiles,
          ...uploadedFiles.filter(f => f.uploaded).map(f => ({
            name: f.name,
            size: f.size,
            type: f.type,
            url: f.url,
            id: f.id
          }))
        ],
        createdAt: new Date().toISOString()
      };

      console.log('Sending results data:', resultsData);
      console.log('Task ID:', taskId);

      const response = await fetch(`http://localhost:5000/api/labtasks/${taskId}/results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resultsData)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        alert('Results saved successfully!');
        fetchExistingResults();
        
        // Redirect to test results page
        navigate('/lab-workflow/test-results');
        
        if (isModal && onClose) {
          onClose();
        }
      } else {
        const responseText = await response.text();
        console.log('Raw response text:', responseText);
        
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (e) {
          errorData = { message: responseText };
        }
        
        console.error('Failed to save results:', errorData);
        throw new Error(`Failed to save results: ${errorData.error || errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Error saving results:', error);
      alert(`Failed to save results. Please try again. Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const finalizeResults = async () => {
    if (!resultData.summary.trim()) {
      alert('Please provide a result summary before finalizing.');
      return;
    }
    
    const updatedData = { ...resultData, status: 'final' };
    setResultData(updatedData);
    await saveResults();
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return <Image className="h-5 w-5" />;
    if (type === 'application/pdf') return <FileText className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Test Results & Upload</h2>
        {isModal && (
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Results Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Test Results Summary</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Result Summary <span className="text-red-500">*</span>
            </label>
            <textarea
              value={resultData.summary}
              onChange={(e) => setResultData(prev => ({ ...prev, summary: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Provide a concise summary of the test results..."
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Clinical Interpretation
            </label>
            <textarea
              value={resultData.interpretation}
              onChange={(e) => setResultData(prev => ({ ...prev, interpretation: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Interpret the clinical significance of the results..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recommendations
            </label>
            <textarea
              value={resultData.recommendations}
              onChange={(e) => setResultData(prev => ({ ...prev, recommendations: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Any follow-up recommendations or additional tests needed..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Result Status
              </label>
              <select
                value={resultData.status}
                onChange={(e) => setResultData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="preliminary">Preliminary</option>
                <option value="final">Final</option>
                <option value="reviewed">Reviewed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              value={resultData.notes}
              onChange={(e) => setResultData(prev => ({ ...prev, notes: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Any additional notes about the test or results..."
            />
          </div>
        </div>
      </div>

      {/* File Upload Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Paperclip className="h-5 w-5 mr-2" />
          Attach Result Files
        </h3>
        
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            Drop files here or click to upload
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Supports: Images (JPG, PNG, GIF), PDFs, Documents (DOC, DOCX), Spreadsheets (XLS, XLSX)
          </p>
          <p className="text-xs text-gray-400 mb-4">Maximum file size: 10MB</p>
          
          <input
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.gif,.bmp,.pdf,.txt,.csv,.xls,.xlsx,.doc,.docx"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer inline-flex items-center"
          >
            <Camera className="h-4 w-4 mr-2" />
            Choose Files
          </label>
        </div>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Uploaded Files</h4>
            <div className="space-y-2">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {file.preview ? (
                      <img src={file.preview} alt={file.name} className="h-10 w-10 object-cover rounded" />
                    ) : (
                      <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center">
                        {getFileIcon(file.type)}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                    {file.uploaded && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {file.preview && (
                      <button
                        onClick={() => window.open(file.preview)}
                        className="p-1 text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-1 text-red-600 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Previous Results */}
      {existingResults.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Previous Results</h3>
          <div className="space-y-3">
            {existingResults.map((result) => (
              <div key={result._id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-gray-900">{result.summary}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(result.createdAt).toLocaleString()} - by {result.technician}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    result.status === 'final' 
                      ? 'bg-green-100 text-green-800' 
                      : result.status === 'reviewed'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {result.status}
                  </span>
                </div>
                {result.files && result.files.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Attached files:</p>
                    <div className="flex flex-wrap gap-2">
                      {result.files.map((file, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {getFileIcon(file.type)}
                          <span className="ml-1">{file.name}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={saveResults}
          disabled={saving || uploading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Results'}
        </button>
        <button
          onClick={finalizeResults}
          disabled={saving || uploading || !resultData.summary.trim()}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Finalize Results
        </button>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default ResultsUpload;