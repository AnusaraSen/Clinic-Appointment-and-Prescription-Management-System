import React, { useState } from 'react';
import { 
  UserIcon, 
  MailIcon, 
  PhoneIcon, 
  GraduationCapIcon, 
  BadgeIcon, 
  PencilIcon, 
  CheckIcon, 
  XIcon,
  PackageIcon,
  ClipboardListIcon
} from 'lucide-react';
import Sidebar from './Sidebar';
import '../../../styles/InventoryManagerProfile.css';

// Mock inventory manager data
const inventoryManagerData = {
  id: 'IM-2023-002',
  name: 'Michael Rodriguez',
  email: 'michael.rodriguez@healthcareclinic.com',
  phone: '+1 (555) 987-6543',
  dateJoined: 'March 10, 2021',
  department: 'Supply Chain Management',
  position: 'Senior Inventory Manager',
  qualification: 'BS Supply Chain Management, Arizona State University',
  employeeId: 'EMP-45612',
  certifications: 'APICS CSCP, Six Sigma Green Belt',
  specialization: 'Medical Equipment & Pharmaceuticals',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YnVzaW5lc3MlMjBtYW58ZW58MHx8MHx8fDA%3D',
  bio: 'Michael Rodriguez is a senior inventory manager with over 8 years of experience in healthcare supply chain management. He specializes in optimizing inventory levels and ensuring seamless supply of medical equipment and pharmaceuticals.'
};

const InventoryManagerProfile = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const [editField, setEditField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [profileData, setProfileData] = useState(inventoryManagerData);

  const handleEditField = (label, value) => {
    setEditField(label);
    setEditValue(value);
  };

  const handleSaveField = (label) => {
    const fieldMap = {
      'Full Name': 'name',
      'Email': 'email',
      'Phone': 'phone',
      'Qualification': 'qualification',
      'Certifications': 'certifications',
      'Specialization': 'specialization'
    };

    const fieldKey = fieldMap[label];
    if (fieldKey) {
      setProfileData(prev => ({
        ...prev,
        [fieldKey]: editValue
      }));
    }

    setEditField(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditField(null);
    setEditValue('');
  };

  const personalFields = [
    { label: 'Full Name', value: profileData.name, editable: true },
    { label: 'Email', value: profileData.email, editable: true },
    { label: 'Phone', value: profileData.phone, editable: true },
    { label: 'Date Joined', value: profileData.dateJoined }
  ];

  const professionalFields = [
    { label: 'Department', value: profileData.department },
    { label: 'Position', value: profileData.position },
    { label: 'Qualification', value: profileData.qualification, editable: true },
    { label: 'Employee ID', value: profileData.employeeId },
    { label: 'Certifications', value: profileData.certifications, editable: true },
    { label: 'Specialization', value: profileData.specialization, editable: true }
  ];

  const accountFields = [
    { label: 'User ID', value: profileData.id },
    { label: 'Role', value: 'Inventory Manager' },
    { label: 'Last Login', value: new Date().toLocaleDateString() },
    { label: 'Account Status', value: 'Active' }
  ];

  const getCurrentFields = () => {
    switch (activeTab) {
      case 'personal': return personalFields;
      case 'professional': return professionalFields;
      case 'account': return accountFields;
      default: return personalFields;
    }
  };

  const getCurrentIcon = () => {
    switch (activeTab) {
      case 'personal': return <UserIcon className="profile-icon" />;
      case 'professional': return <PackageIcon className="profile-icon" />;
      case 'account': return <BadgeIcon className="profile-icon" />;
      default: return <UserIcon className="profile-icon" />;
    }
  };

  const getCurrentTitle = () => {
    switch (activeTab) {
      case 'personal': return 'Personal Information';
      case 'professional': return 'Professional Information';
      case 'account': return 'Account Information';
      default: return 'Personal Information';
    }
  };

  return (
    <div className="main-layout">
      <Sidebar />
      <div className="main-content-with-sidebar">
        <div className="inventory-manager-profile-container">
          <div className="profile-wrapper">
        {/* Profile Header */}
        <div className="profile-header-card">
          <div className="profile-header-content">
            <div className="profile-avatar-section">
              <img
                src={profileData.avatar}
                alt="Profile"
                className="profile-avatar-image"
              />
              <button className="avatar-edit-button">
                <PencilIcon size={14} />
              </button>
            </div>
            <div className="profile-info-section">
              <h1 className="profile-name">{profileData.name}</h1>
              <p className="profile-position">{profileData.position}</p>
              <p className="profile-department">{profileData.department}</p>
              <div className="profile-status">
                <span className="status-badge">Active</span>
              </div>
            </div>
          </div>
          
          <div className="profile-bio-section">
            <h3 className="bio-title">Professional Bio</h3>
            <p className="bio-text">{profileData.bio}</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="profile-main-card">
          {/* Tab Navigation */}
          <div className="tab-navigation">
            <button 
              className={'tab-button ' + (activeTab === 'personal' ? 'tab-active' : '')}
              onClick={() => setActiveTab('personal')}
            >
              Personal
            </button>
            <button 
              className={'tab-button ' + (activeTab === 'professional' ? 'tab-active' : '')}
              onClick={() => setActiveTab('professional')}
            >
              Professional
            </button>
            <button 
              className={'tab-button ' + (activeTab === 'account' ? 'tab-active' : '')}
              onClick={() => setActiveTab('account')}
            >
              Account
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            <div className="section-header">
              {getCurrentIcon()}
              <h3 className="section-title">{getCurrentTitle()}</h3>
            </div>
            
            <div className="fields-container">
              {getCurrentFields().map(field => (
                <div key={field.label} className="field-row">
                  <div className="field-label">{field.label}</div>
                  <div className="field-content">
                    {editField === field.label ? (
                      <div className="edit-field-container">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="edit-input"
                        />
                        <button
                          onClick={() => handleSaveField(field.label)}
                          className="save-button"
                        >
                          <CheckIcon size={18} />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="cancel-button"
                        >
                          <XIcon size={18} />
                        </button>
                      </div>
                    ) : (
                      <div className="display-field-container">
                        <span className="field-value">{field.value}</span>
                        {field.editable && (
                          <button
                            onClick={() => handleEditField(field.label, field.value)}
                            className="edit-button"
                          >
                            <PencilIcon size={16} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Settings Cards */}
        <div className="settings-cards-grid">
          <div className="settings-card">
            <div className="settings-card-header">
              <div className="settings-icon-container">
                <svg className="settings-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                </svg>
              </div>
              <h3 className="settings-card-title">Password Settings</h3>
            </div>
            <p className="settings-card-description">Change your password and manage security settings</p>
            <button className="settings-card-button">Change Password</button>
          </div>

          <div className="settings-card">
            <div className="settings-card-header">
              <div className="settings-icon-container">
                <ClipboardListIcon className="settings-icon" />
              </div>
              <h3 className="settings-card-title">Inventory Reports</h3>
            </div>
            <p className="settings-card-description">Generate and download inventory management reports</p>
            <button className="settings-card-button">Generate Reports</button>
          </div>

          <div className="settings-card">
            <div className="settings-card-header">
              <div className="settings-icon-container">
                <svg className="settings-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="settings-card-title">Activity Log</h3>
            </div>
            <p className="settings-card-description">View your account activity and inventory operations</p>
            <button className="settings-card-button">View Activity</button>
          </div>
        </div>
      </div>
    </div>
      </div>
    </div>
  );
};

export default InventoryManagerProfile;
