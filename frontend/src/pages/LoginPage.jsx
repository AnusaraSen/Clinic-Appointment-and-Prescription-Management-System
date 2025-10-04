import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/authentication/context/AuthContext';
import AuthForms from '../features/authentication/components/AuthForms';
import ImageSlider from '../features/authentication/components/ImageSlider';
import Logo from '../features/authentication/components/Logo';

const LoginPage = () => {
  const [activeForm, setActiveForm] = useState('login'); // Start with login form
  const { login, register, isLoading, error, isAuthenticated, clearError, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  // Clear errors when switching forms
  useEffect(() => {
    clearError();
  }, [activeForm, clearError]);

  const handleLogin = async (credentials) => {
    const result = await login(credentials);
    if (result.success) {
      navigate('/');
    }
  };

  const handleRegister = async (userData) => {
    const result = await register(userData);
    if (result.success) {
      navigate('/');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white to-blue-50">
      {/* Header with Logo and Back to Home */}
      <header className="p-4 md:p-6 flex justify-between items-center">
        
      </header>

      {/* Main Content */}
      <main className="flex flex-grow flex-col md:flex-row overflow-hidden shadow-xl md:m-6 md:rounded-2xl">
        {/* Left Side - Image Slider */}
        <div className="w-full md:w-1/2 h-72 md:h-auto relative">
          <ImageSlider />
        </div>

        {/* Right Side - Auth Forms */}
        <div className="w-full md:w-1/2 flex justify-center items-center p-6 md:p-8 bg-white bg-opacity-90 backdrop-blur-md">
          <AuthForms
            activeForm={activeForm}
            setActiveForm={setActiveForm}
            onLogin={handleLogin}
            onRegister={handleRegister}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 md:p-6 text-center text-gray-600 text-sm">
        © 2025 Family Health Care. All Rights Reserved.
      </footer>
    </div>
  );
};

export default LoginPage;