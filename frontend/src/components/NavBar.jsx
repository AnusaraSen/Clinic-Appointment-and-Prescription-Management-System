import React, { useEffect, useState, useRef } from 'react';
import '../styles/NavBar.css';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/authentication/context/AuthContext';
// Use requested PNG icon and existing wordmark svg
import familyClinicPng from '../assets/Family Clinic (1).png';
import fallbackSvg from '../assets/family-health-logo.svg';

// Helper component to handle fallback if PNG fails to load
function BrandLogo() {
  const [src, setSrc] = useState(familyClinicPng);
  useEffect(()=> {
    // Log resolved asset path for debugging in the browser console
    // Open dev tools Network tab to ensure this URL returns 200.
    // If 404, the path or file name is wrong.
  console.log('Logo icon asset resolved to:', familyClinicPng);
  }, []);
  return (
  <div style={{
    height:'90px', 
    width:'90px', 
    overflow:'visible', 
    display:'block', 
    position:'relative',
    backgroundColor: 'transparent',
    borderRadius: '10px',
    marginRight: '5px',
    marginLeft: '-40px',
    border:'0px solid transparent',
    flexShrink: 0,
    zIndex: 1
  }}>
      <img
        src={src}
        alt="Family Health Care Logo"
        height={90}
        width={90}
        style={{
          objectFit:'contain', 
          height:'90px !important', 
          width:'90px !important', 
          display:'block',
          backgroundColor: 'transparent',
          borderRadius: '8px'
        }}
        onError={(e)=> {
          console.error('Logo failed to load:', src);
          if(src !== fallbackSvg){
            console.warn('Primary logo PNG failed to load, switching to fallback SVG.');
            setSrc(fallbackSvg);
          }
        }}
        onLoad={() => {
          console.log('Logo loaded successfully:', src);
        }}
      />
    </div>
  );
}

function NavBar({ search, onSearchChange }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Add class to body to ensure content appears below fixed navbar
  useEffect(() => {
    document.body.classList.add('has-fixed-navbar');
    return () => {
      document.body.classList.remove('has-fixed-navbar');
    };
  }, []);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path) => location.pathname === path;
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleLogout = async () => {
    await logout();
    setIsProfileDropdownOpen(false);
    navigate('/');
  };

  // Role-based dashboard routing
  const getDashboardRoute = (userRole) => {
    const roleRoutes = {
      'Admin': '/admin/dashboard',
      'Administrator': '/admin/dashboard',
      'Patient': '/patient/dashboard',
      'Doctor': '/clinical/dashboard',
      'Clinician': '/clinical/dashboard',
      'Physician': '/clinical/dashboard',
      'Pharmacist': '/pharmacist/dashboard',
      'Pharmacy Manager': '/pharmacist/dashboard',
      'Lab Assistant': '/lab/assistant/dashboard',
      'LabAssistant': '/lab/assistant/dashboard',
      'Lab Technician': '/lab/assistant/dashboard',
      'Lab Supervisor': '/lab/supervisor/dashboard',
      'LabSupervisor': '/lab/supervisor/dashboard',
      'Lab Manager': '/lab/supervisor/dashboard',
      'Inventory Manager': '/inventory/dashboard',
      'Technician': '/technician-dashboard'
    };
    return roleRoutes[userRole] || '/dashboard';
  };

  const handleDashboardNavigation = () => {
    if (user && user.role) {
      const dashboardRoute = getDashboardRoute(user.role);
      navigate(dashboardRoute);
      setIsProfileDropdownOpen(false);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav className={`modern-navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Logo Section - Keep Original */}
        <Link className="brand-section" to="/" style={{ display: 'flex', alignItems: 'center' }}>
          <div className="brand-stack" style={{ display: 'flex', alignItems: 'center', minWidth: '200px' }}>
            <BrandLogo />
            <img 
              src={fallbackSvg} 
              alt="Family Health Care Wordmark" 
              className="wordmark"
              style={{ 
                height: '110px', 
                marginLeft: '-65px', 
                marginTop: '-5px',
                position: 'relative',
                zIndex: 10
              }}
            />
          </div>
        </Link>

        {/* Mobile Menu Toggle */}
        <button 
          className={`mobile-toggle ${isMobileMenuOpen ? 'active' : ''}`} 
          onClick={toggleMobileMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navigation Links */}
        <div className={`nav-links ${isMobileMenuOpen ? 'active' : ''}`}>
          <div className="nav-group">
            <Link 
              to="/" 
              className={`nav-item ${isActive('/') ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="nav-icon">
                🏠
              </div>
              <span className="nav-text" style={{color:'black', fontSize: '16px'}}>Home</span>
              <div className="nav-indicator"></div>
            </Link>

            <Link 
              to="/appointments" 
              className={`nav-item ${isActive('/appointments') ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="nav-icon">
                📅
              </div>
              <span className="nav-text" style={{color:'black', fontSize: '16px'}}>Appointments</span>
              <div className="nav-indicator"></div>
            </Link>

            <Link 
              to="/services" 
              className={`nav-item ${isActive('/services') ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="nav-icon">
                🩺
              </div>
              <span className="nav-text" style={{color:'black', fontSize: '16px'}}>Services</span>
              <div className="nav-indicator"></div>
            </Link>

            <Link 
              to="/doctors" 
              className={`nav-item ${isActive('/doctors') ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="nav-icon">
                👨‍⚕️
              </div>
              <span className="nav-text" style={{color:'black', fontSize: '16px'}}>Find Doctors</span>
              <div className="nav-indicator"></div>
            </Link>

          

            <Link 
              to="/contact" 
              className={`nav-item ${isActive('/contact') ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="nav-icon">
                📞
              </div>
              <span className="nav-text" style={{color:'black', fontSize: '16px'}}>Contact</span>
              <div className="nav-indicator"></div>
            </Link>
          </div>

          {/* User Section */}
          <div className="user-section">
            {!isAuthenticated ? (
              /* Authentication Buttons - Show when not logged in */
              <div className="auth-buttons">
                <Link 
                  to="/login" 
                  className={`auth-btn login-btn ${isActive('/login') ? 'active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  🔑
                  <span>Login</span>
                </Link>
                
                <Link 
                  to="/register" 
                  className={`auth-btn register-btn ${isActive('/register') ? 'active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  ➕
                  <span>Register</span>
                </Link>
              </div>
            ) : (
              /* Profile Section - Show when logged in */
              <div className="profile-section" ref={dropdownRef}>
                <button 
                  className="profile-button"
                  onClick={toggleProfileDropdown}
                >
                  <div className="profile-avatar">
                    👤
                  </div>
                  <span className="profile-name">{user?.name || user?.firstName + ' ' + (user?.lastName || '') || 'User'}</span>
                  <span className={`dropdown-arrow ${isProfileDropdownOpen ? 'open' : ''}`}>▼</span>
                </button>

                {isProfileDropdownOpen && (
                  <div className="profile-dropdown">
                    <div className="dropdown-header">
                      <div className="user-info">
                        <div className="user-avatar">
                          👤
                        </div>
                        <div className="user-details">
                          <span className="user-name">{user?.name || user?.firstName + ' ' + (user?.lastName || '') || 'User'}</span>
                          <span className="user-role">{user?.role || 'Member'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="dropdown-divider"></div>
                    
                    <div className="dropdown-menu">
                      <button 
                        className="dropdown-item dashboard-item"
                        onClick={handleDashboardNavigation}
                      >
                        <span className="dropdown-emoji">📊</span>
                        <span>Dashboard</span>
                      </button>
                      
                      <Link 
                        to="/profile" 
                        className="dropdown-item"
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <span className="dropdown-emoji">✏️</span>
                        <span>Edit Profile</span>
                      </Link>
                      
                      <Link 
                        to="/settings" 
                        className="dropdown-item"
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <span className="dropdown-emoji">⚙️</span>
                        <span>Settings</span>
                      </Link>
                      
                      <div className="dropdown-divider"></div>
                      
                      <button 
                        className="dropdown-item logout-item"
                        onClick={handleLogout}
                      >
                        <span className="dropdown-emoji">🚪</span>
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
