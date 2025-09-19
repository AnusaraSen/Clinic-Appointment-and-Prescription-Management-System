import React, { useState } from 'react';
import { 
  UserIcon, 
  MailIcon, 
  PhoneIcon, 
  GraduationCapIcon, 
  BadgeIcon, 
  PencilIcon, 
  CheckIcon, 
  XIcon 
} from 'lucide-react';
import Sidebar from './Sidebar/Sidebar';
import './PharmacistProfile.css';

// Mock pharmacist data
const pharmacistData = {
  id: 'PH-2023-001',
  name: 'Dr. Sarah Johnson',
  email: 'sarah.johnson@healthcareclinic.com',
  phone: '+1 (555) 123-4567',
  dateJoined: 'May 15, 2020',
  department: 'Outpatient Pharmacy',
  position: 'Senior Pharmacist',
  qualification: 'PharmD, University of Michigan',
  licenseNumber: 'PHR-78945612',
  licenseExpiry: 'December 31, 2025',
  specialization: 'Geriatric Pharmacy',
  avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8ZG9jdG9yfGVufDB8fDB8fHww',
  bio: 'Dr. Sarah Johnson is a senior pharmacist with over 10 years of experience in clinical pharmacy practice. She specializes in geriatric pharmacy and medication therapy management.'
};

const PharmacistProfile = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const [editField, setEditField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [profileData, setProfileData] = useState(pharmacistData);

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
      'License Expiry': 'licenseExpiry',
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
    { label: 'License Number', value: profileData.licenseNumber },
    { label: 'License Expiry', value: profileData.licenseExpiry, editable: true },
    { label: 'Specialization', value: profileData.specialization, editable: true }
  ];

  const accountFields = [
    { label: 'User ID', value: profileData.id },
    { label: 'Role', value: 'Pharmacist' },
    { label: 'Last Login', value: new Date().toLocaleDateString() }
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
      case 'professional': return <GraduationCapIcon className="profile-icon" />;
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
        <div className="pharmacist-profile-container">
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
                <svg className="settings-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
              </div>
              <h3 className="settings-card-title">Notifications</h3>
            </div>
            <p className="settings-card-description">Configure how and when you receive notifications</p>
            <button className="settings-card-button">Update Preferences</button>
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
            <p className="settings-card-description">View your account activity and login history</p>
            <button className="settings-card-button">View Activity</button>
          </div>
        </div>
      </div>
    </div>
      </div>
    </div>
  );
};

export default PharmacistProfile;
