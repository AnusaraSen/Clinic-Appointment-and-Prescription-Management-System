import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const SimpleAuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const result = await login(email, password);
      if (!result.success) {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoType) => {
    setLoading(true);
    setError('');
    
    const demos = {
      admin: { email: 'nimal.admin@example.com', password: '4TLRT!hD' },
      doctor: { email: 'sarah.perera@example.com', password: 'Uj&07w@q' },
      patient: { email: 'johndoe@example.com', password: 'TempPass123!' }
    };
    
    const demo = demos[demoType];
    if (demo) {
      try {
        console.log(`Attempting demo login for: ${demoType}`, demo);
        const result = await login(demo.email, demo.password);
        console.log('Login result:', result);
        
        if (!result.success) {
          setError(result.message || `${demoType} demo login failed`);
        }
      } catch (err) {
        setError(`Demo login failed. Please try again.`);
        console.error('Demo login error:', err);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">🏥 Clinic Login</h2>
          <p className="text-gray-600 mt-2">Please sign in to your account</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
            Logging in...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            required
          />
          
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="space-y-2">
          <p className="text-center text-sm text-gray-600">Demo Logins:</p>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => handleDemoLogin('admin')}
              disabled={loading}
              className="bg-red-100 text-red-800 py-2 px-4 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              👨‍💼 Admin Demo (Nimal)
            </button>
            <button
              onClick={() => handleDemoLogin('doctor')}
              disabled={loading}
              className="bg-green-100 text-green-800 py-2 px-4 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              👨‍⚕️ Doctor Demo (Dr. Sarah)
            </button>
            <button
              onClick={() => handleDemoLogin('patient')}
              disabled={loading}
              className="bg-blue-100 text-blue-800 py-2 px-4 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              👤 Patient Demo (John)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleAuthPage;
