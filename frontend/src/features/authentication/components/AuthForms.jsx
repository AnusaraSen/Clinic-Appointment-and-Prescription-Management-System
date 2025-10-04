import React, { useState } from 'react';
import { MailIcon, LockIcon, UserIcon, PhoneIcon, EyeIcon, EyeOffIcon } from 'lucide-react';

const AuthForms = ({ activeForm, setActiveForm, onLogin, onRegister, isLoading, error }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    confirmPassword: '',
    terms: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (onLogin) {
      onLogin({
        email: formData.email,
        password: formData.password
      });
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      // Password mismatch - this should be handled by showing an error in the UI
      return;
    }
    if (!formData.terms) {
      // Terms not accepted - this should be handled by showing an error in the UI
      return;
    }

    // Password validation to match backend rules: min 6 chars, 1 letter, 1 number, 1 special char [@$!%*?&]
    const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    if (!PASSWORD_REGEX.test(formData.password)) {
      // Password validation failed - this should be handled by showing an error in the UI
      return;
    }

    if (onRegister) {
      onRegister({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-xl shadow-sm transition-all duration-300">
        {/* Display error message if exists */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {activeForm === 'login' ? (
          // Login Form
          <>
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                Welcome Back!
              </h2>
              <p className="text-gray-600">
                Login to manage your appointments, prescriptions, and records.
              </p>
            </div>
            <form className="space-y-5" onSubmit={handleLoginSubmit}>
              <div className="relative">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email / Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <MailIcon size={18} className="text-gray-400" />
                  </div>
                  <input 
                    type="email" 
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10 w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                    placeholder="Enter your email or username"
                    required
                  />
                </div>
              </div>
              <div className="relative">
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <a href="#" className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
                    Forgot Password?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <LockIcon size={18} className="text-gray-400" />
                  </div>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                    placeholder="Enter your password"
                    required
                  />
                  <button 
                    type="button" 
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors" 
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                  </button>
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
              <div className="relative flex items-center my-5">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-500 text-sm">
                  or login with
                </span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  type="button" 
                  className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-medium py-2.5 px-4 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" className="text-red-500">
                    <path fill="currentColor" d="M18.7 10.2c0-.6-.1-1.2-.2-1.8H10v3.4h4.8c-.2 1.1-.8 2-1.8 2.6v2.2h2.9c1.7-1.6 2.8-4 2.8-6.4z" />
                    <path fill="currentColor" d="M10 19c2.4 0 4.5-.8 6-2.2l-2.9-2.2c-.8.5-1.8.9-3.1.9-2.4 0-4.4-1.6-5.1-3.8H1.7v2.3C3.2 16.8 6.4 19 10 19z" />
                    <path fill="currentColor" d="M4.9 11.7c-.2-.6-.3-1.2-.3-1.7s.1-1.1.3-1.7V5.9H1.7C1.2 7.2 1 8.6 1 10s.2 2.8.7 4.1l3.2-2.4z" />
                    <path fill="currentColor" d="M10 4.2c1.4 0 2.6.5 3.5 1.3L16.2 3c-1.6-1.5-3.6-2-6.2-2C6.4 1 3.2 3.2 1.7 6.1l3.2 2.4c.7-2.2 2.7-3.8 5.1-3.8z" />
                  </svg>
                  Google
                </button>
                <button 
                  type="button" 
                  className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-medium py-2.5 px-4 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" className="text-blue-600">
                    <path fill="currentColor" d="M20 10.06c0-4.42-3.58-8-8-8s-8 3.58-8 8c0 3.98 2.9 7.28 6.71 7.86v-5.57h-2.02v-2.29h2.02V8.37c0-2 1.2-3.1 3.02-3.1.87 0 1.78.16 1.78.16v1.96h-1c-.99 0-1.3.61-1.3 1.24v1.49h2.21l-.35 2.29h-1.86v5.57C17.1 17.34 20 14.04 20 10.06z" />
                  </svg>
                  Facebook
                </button>
              </div>
              <div className="text-center mt-6">
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <button 
                    type="button" 
                    className="text-teal-600 hover:text-teal-800 font-medium transition-colors" 
                    onClick={() => setActiveForm('register')}
                  >
                    Register here
                  </button>
                </p>
              </div>
            </form>
          </>
        ) : (
          // Registration Form
          <>
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                Create Your Account
              </h2>
              <p className="text-gray-600">
                Join Family Health Care for easier appointment management.
              </p>
            </div>
            <form className="space-y-5" onSubmit={handleRegisterSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1.5">
                    First Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <UserIcon size={18} className="text-gray-400" />
                    </div>
                    <input 
                      type="text" 
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="pl-10 w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all" 
                      placeholder="First Name"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Last Name
                  </label>
                  <input 
                    type="text" 
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all" 
                    placeholder="Last Name"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="registerEmail" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <MailIcon size={18} className="text-gray-400" />
                  </div>
                  <input 
                    type="email" 
                    id="registerEmail"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10 w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all" 
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <PhoneIcon size={18} className="text-gray-400" />
                  </div>
                  <input 
                    type="tel" 
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="pl-10 w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all" 
                    placeholder="(123) 456-7890"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="registerPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <LockIcon size={18} className="text-gray-400" />
                  </div>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    id="registerPassword"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all" 
                    placeholder="Create a password"
                    required
                  />
                  <button 
                    type="button" 
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors" 
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <LockIcon size={18} className="text-gray-400" />
                  </div>
                  <input 
                    type={showConfirmPassword ? 'text' : 'password'} 
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-10 w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all" 
                    placeholder="Confirm your password"
                    required
                  />
                  <button 
                    type="button" 
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                  </button>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input 
                    id="terms" 
                    name="terms"
                    type="checkbox" 
                    checked={formData.terms}
                    onChange={handleInputChange}
                    className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-teal-300 transition-all"
                    required
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="text-gray-600">
                    I agree to the{' '}
                    <a href="#" className="text-teal-600 hover:underline">
                      Terms & Conditions
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-teal-600 hover:underline">
                      Privacy Policy
                    </a>
                  </label>
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                {isLoading ? 'Creating Account...' : 'Register'}
              </button>
              <div className="text-center mt-6">
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <button 
                    type="button" 
                    className="text-blue-600 hover:text-blue-800 font-medium transition-colors" 
                    onClick={() => setActiveForm('login')}
                  >
                    Login here
                  </button>
                </p>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthForms;