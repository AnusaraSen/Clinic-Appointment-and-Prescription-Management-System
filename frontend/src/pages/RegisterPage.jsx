import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/authentication/context/AuthContext';
import RegisterForm from '../features/authentication/components/RegisterForm';
import { Heart, Activity, Stethoscope, Cross } from 'lucide-react';
import '../styles/glassmorphism.css';

const RegisterPage = () => {
  const { isAuthenticated, clearError, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  // Clear errors on mount
  useEffect(() => {
    clearError();
  }, [clearError]);

  return (
    <div className="auth-background" style={{
      backgroundImage: 'url(/images/doctor-background.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      {/* Floating Medical Icons */}
      <Heart 
        className="floating-icon text-green-400" 
        size={60} 
        style={{ top: '10%', left: '10%', animationDelay: '0s' }} 
      />
      <Activity 
        className="floating-icon text-green-400" 
        size={50} 
        style={{ top: '70%', left: '15%', animationDelay: '3s' }} 
      />
      <Stethoscope 
        className="floating-icon text-green-400" 
        size={55} 
        style={{ top: '20%', right: '10%', animationDelay: '6s' }} 
      />
      <Cross 
        className="floating-icon text-green-400" 
        size={65} 
        style={{ bottom: '15%', right: '12%', animationDelay: '9s' }} 
      />
      <Heart 
        className="floating-icon text-green-400" 
        size={45} 
        style={{ top: '50%', left: '5%', animationDelay: '12s' }} 
      />
      <Activity 
        className="floating-icon text-green-400" 
        size={58} 
        style={{ bottom: '20%', left: '80%', animationDelay: '15s' }} 
      />

      {/* Auth Forms Container */}
      <div style={{ 
        position: 'relative', 
        zIndex: 10, 
        width: '100%', 
        maxWidth: '650px',
        marginRight: '40px' 
      }}>
        <RegisterForm />
      </div>

      {/* Footer */}
      <div style={{ 
        position: 'absolute', 
        bottom: '20px', 
        left: '50%', 
        transform: 'translateX(-50%)',
        zIndex: 10,
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: '13px',
        textAlign: 'center'
      }}>
        © 2025 Family Health Care. All Rights Reserved.
      </div>
    </div>
  );
};

export default RegisterPage;