import React, { useState } from 'react';
import { UserIcon, MailIcon, PhoneIcon, CalendarIcon, BuildingIcon, GraduationCapIcon, BadgeIcon, PencilIcon, CheckIcon, XIcon } from 'lucide-react';
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
  bio: 'Dr. Sarah Johnson is a senior pharmacist with over 10 years of experience in clinical pharmacy practice. She specializes in geriatric pharmacy and medication therapy management. Sarah is passionate about patient education and optimizing medication regimens to improve patient outcomes.'
};
type ProfileSection = {
  id: string;
  title: string;
  icon: React.ReactNode;
  fields: {
    label: string;
    value: string;
    editable?: boolean;
  }[];
};
export function Profile() {
  const [activeTab, setActiveTab] = useState<'personal' | 'professional' | 'account'>('personal');
  const [editField, setEditField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [profileData, setProfileData] = useState(pharmacistData);
  const personalInfo: ProfileSection = {
    id: 'personal',
    title: 'Personal Information',
    icon: <UserIcon className="text-blue-600" />,
    fields: [{
      label: 'Full Name',
      value: profileData.name,
      editable: true
    }, {
      label: 'Email',
      value: profileData.email,
      editable: true
    }, {
      label: 'Phone',
      value: profileData.phone,
      editable: true
    }, {
      label: 'Date Joined',
      value: profileData.dateJoined
    }]
  };
  const professionalInfo: ProfileSection = {
    id: 'professional',
    title: 'Professional Information',
    icon: <GraduationCapIcon className="text-blue-600" />,
    fields: [{
      label: 'Department',
      value: profileData.department
    }, {
      label: 'Position',
      value: profileData.position
    }, {
      label: 'Qualification',
      value: profileData.qualification,
      editable: true
    }, {
      label: 'License Number',
      value: profileData.licenseNumber
    }, {
      label: 'License Expiry',
      value: profileData.licenseExpiry,
      editable: true
    }, {
      label: 'Specialization',
      value: profileData.specialization,
      editable: true
    }]
  };
  const accountInfo: ProfileSection = {
    id: 'account',
    title: 'Account Information',
    icon: <BadgeIcon className="text-blue-600" />,
    fields: [{
      label: 'User ID',
      value: profileData.id
    }, {
      label: 'Role',
      value: 'Pharmacist'
    }, {
      label: 'Last Login',
      value: new Date().toLocaleDateString()
    }]
  };
  const handleEditField = (label: string, value: string) => {
    setEditField(label);
    setEditValue(value);
  };
  const handleSaveField = (label: string) => {
    // In a real app, this would send the update to a backend
    setProfileData(prevData => {
      const newData = {
        ...prevData
      };
      switch (label) {
        case 'Full Name':
          newData.name = editValue;
          break;
        case 'Email':
          newData.email = editValue;
          break;
        case 'Phone':
          newData.phone = editValue;
          break;
        case 'Qualification':
          newData.qualification = editValue;
          break;
        case 'License Expiry':
          newData.licenseExpiry = editValue;
          break;
        case 'Specialization':
          newData.specialization = editValue;
          break;
      }
      return newData;
    });
    setEditField(null);
  };
  const handleCancelEdit = () => {
    setEditField(null);
  };
  const getActiveSection = () => {
    switch (activeTab) {
      case 'personal':
        return personalInfo;
      case 'professional':
        return professionalInfo;
      case 'account':
        return accountInfo;
      default:
        return personalInfo;
    }
  };
  return <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Summary Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <img src={profileData.avatar} alt={profileData.name} className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md" />
              <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full">
                <PencilIcon size={16} />
              </button>
            </div>
            <h3 className="mt-4 text-xl font-semibold text-gray-800">
              {profileData.name}
            </h3>
            <p className="text-blue-600 font-medium">{profileData.position}</p>
            <p className="mt-1 text-sm text-gray-500">
              {profileData.department}
            </p>
            <div className="w-full mt-6 space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <MailIcon size={16} className="mr-2 text-gray-400" />
                <span>{profileData.email}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <PhoneIcon size={16} className="mr-2 text-gray-400" />
                <span>{profileData.phone}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CalendarIcon size={16} className="mr-2 text-gray-400" />
                <span>Joined {profileData.dateJoined}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <BadgeIcon size={16} className="mr-2 text-gray-400" />
                <span>ID: {profileData.id}</span>
              </div>
            </div>
            <div className="mt-6 w-full">
              <h4 className="text-left text-sm font-medium text-gray-700 mb-2">
                Bio
              </h4>
              <p className="text-sm text-left text-gray-600">
                {profileData.bio}
              </p>
            </div>
          </div>
        </div>
        {/* Profile Details */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden lg:col-span-2">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button className={`flex-1 py-3 px-4 text-center font-medium ${activeTab === 'personal' ? 'bg-blue-50 text-blue-800 border-b-2 border-blue-500' : 'text-gray-600 hover:bg-gray-50'}`} onClick={() => setActiveTab('personal')}>
              Personal
            </button>
            <button className={`flex-1 py-3 px-4 text-center font-medium ${activeTab === 'professional' ? 'bg-blue-50 text-blue-800 border-b-2 border-blue-500' : 'text-gray-600 hover:bg-gray-50'}`} onClick={() => setActiveTab('professional')}>
              Professional
            </button>
            <button className={`flex-1 py-3 px-4 text-center font-medium ${activeTab === 'account' ? 'bg-blue-50 text-blue-800 border-b-2 border-blue-500' : 'text-gray-600 hover:bg-gray-50'}`} onClick={() => setActiveTab('account')}>
              Account
            </button>
          </div>
          {/* Active Section Content */}
          <div className="p-6">
            <div className="flex items-center mb-4">
              {getActiveSection().icon}
              <h3 className="text-lg font-semibold text-gray-800 ml-2">
                {getActiveSection().title}
              </h3>
            </div>
            <div className="space-y-4">
              {getActiveSection().fields.map(field => <div key={field.label} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-gray-100">
                  <div className="text-sm text-gray-500">{field.label}</div>
                  <div className="flex items-center mt-1 sm:mt-0">
                    {editField === field.label ? <div className="flex items-center">
                        <input type="text" value={editValue} onChange={e => setEditValue(e.target.value)} className="border border-gray-300 rounded-md px-3 py-1 text-sm" />
                        <button onClick={() => handleSaveField(field.label)} className="ml-2 text-green-600 hover:text-green-800">
                          <CheckIcon size={18} />
                        </button>
                        <button onClick={handleCancelEdit} className="ml-1 text-red-600 hover:text-red-800">
                          <XIcon size={18} />
                        </button>
                      </div> : <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-800">
                          {field.value}
                        </span>
                        {field.editable && <button onClick={() => handleEditField(field.label, field.value)} className="ml-2 text-blue-600 hover:text-blue-800">
                            <PencilIcon size={16} />
                          </button>}
                      </div>}
                  </div>
                </div>)}
            </div>
          </div>
        </div>
      </div>
      {/* Account Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SettingsCard title="Password Settings" description="Change your password and manage security settings" icon={<svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
            </svg>} buttonText="Change Password" />
        <SettingsCard title="Notification Preferences" description="Configure how and when you receive notifications" icon={<svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
            </svg>} buttonText="Update Preferences" />
        <SettingsCard title="Activity Log" description="View your account activity and login history" icon={<svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>} buttonText="View Activity" />
      </div>
    </div>;
}
type SettingsCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  buttonText: string;
};
function SettingsCard({
  title,
  description,
  icon,
  buttonText
}: SettingsCardProps) {
  return <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center mb-4">
        <div className="p-2 bg-blue-50 rounded-lg">{icon}</div>
        <h3 className="ml-3 text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      <button className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md font-medium text-sm transition-colors">
        {buttonText}
      </button>
    </div>;
}