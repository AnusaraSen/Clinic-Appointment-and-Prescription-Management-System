import React from 'react';
import { useParams } from 'react-router-dom';
//import MainLayout from '../components/MainLayout';
//import UploadTestResult from '../components/UploadTestResult';

const UploadTestResultPage = () => {
  const { testId } = useParams();

  return (
    <div>
      <h1>Upload Test Result for Test ID: {testId}</h1>
      <p>Upload functionality will be implemented here.</p>
    </div>
  );
};

export default UploadTestResultPage;