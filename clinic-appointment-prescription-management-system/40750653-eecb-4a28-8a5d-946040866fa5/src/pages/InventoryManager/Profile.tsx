import React, { useState } from 'react';
import { UserIcon, MailIcon, PhoneIcon, CalendarIcon, BuildingIcon, BarChart3Icon, BadgeIcon, PencilIcon, CheckIcon, XIcon } from 'lucide-react';
// Mock inventory manager data
const inventoryManagerData = {
  id: 'IM-2023-005',
  name: 'Michael Rodriguez',
  email: 'michael.rodriguez@healthcareclinic.com',
  phone: '+1 (555) 987-6543',
  dateJoined: 'August 3, 2019',
  department: 'Pharmacy Logistics',
  position: 'Senior Inventory Manager',
  responsibility: 'Medication and Lab Equipment',
  certifications: 'CSCP, CPIM',
  performanceRating: 'Excellent',
  avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fG1hbGUlMjBwcm9mZXNzaW9uYWx8ZW58MHx8MHx8fDA%3D',
  bio: 'Michael Rodriguez is a senior inventory manager with extensive experience in healthcare supply chain management. He specializes in optimizing inventory levels, reducing waste, and ensuring critical supplies are always available. Michael has implemented several cost-saving initiatives that have significantly improved operational efficiency.'
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
  const [profileData, setProfileData] = useState(inventoryManagerData);
  const personalInfo: ProfileSection = {
    id: 'personal',
    title: 'Personal Information',
    icon: <UserIcon className="text-indigo-600" />,
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
    icon: <BuildingIcon className="text-indigo-600" />,
    fields: [{
      label: 'Department',
      value: profileData.department
    }, {
      label: 'Position',
      value: profileData.position
    }, {
      label: 'Area of Responsibility',
      value: profileData.responsibility,
      editable: true
    }, {
      label: 'Certifications',
      value: profileData.certifications,
      editable: true
    }, {
      label: 'Performance Rating',
      value: profileData.performanceRating
    }]
  };
  const accountInfo: ProfileSection = {
    id: 'account',
    title: 'Account Information',
    icon: <BadgeIcon className="text-indigo-600" />,
    fields: [{
      label: 'User ID',
      value: profileData.id
    }, {
      label: 'Role',
      value: 'Inventory Manager'
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
        case 'Area of Responsibility':
          newData.responsibility = editValue;
          break;
        case 'Certifications':
          newData.certifications = editValue;
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
  // Inventory performance metrics
  const performanceMetrics = [{
    label: 'Orders Processed',
    value: 548,
    change: '+12%',
    trend: 'up'
  }, {
    label: 'Inventory Accuracy',
    value: '97.8%',
    change: '+2.3%',
    trend: 'up'
  }, {
    label: 'Cost Savings',
    value: '$24,500',
    change: '+8.7%',
    trend: 'up'
  }, {
    label: 'Stockout Incidents',
    value: 5,
    change: '-25%',
    trend: 'down'
  }];
  return <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Summary Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <img src={profileData.avatar} alt={profileData.name} className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md" />
              <button className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1.5 rounded-full">
                <PencilIcon size={16} />
              </button>
            </div>
            <h3 className="mt-4 text-xl font-semibold text-gray-800">
              {profileData.name}
            </h3>
            <p className="text-indigo-600 font-medium">
              {profileData.position}
            </p>
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
            <button className={`flex-1 py-3 px-4 text-center font-medium ${activeTab === 'personal' ? 'bg-indigo-50 text-indigo-800 border-b-2 border-indigo-500' : 'text-gray-600 hover:bg-gray-50'}`} onClick={() => setActiveTab('personal')}>
              Personal
            </button>
            <button className={`flex-1 py-3 px-4 text-center font-medium ${activeTab === 'professional' ? 'bg-indigo-50 text-indigo-800 border-b-2 border-indigo-500' : 'text-gray-600 hover:bg-gray-50'}`} onClick={() => setActiveTab('professional')}>
              Professional
            </button>
            <button className={`flex-1 py-3 px-4 text-center font-medium ${activeTab === 'account' ? 'bg-indigo-50 text-indigo-800 border-b-2 border-indigo-500' : 'text-gray-600 hover:bg-gray-50'}`} onClick={() => setActiveTab('account')}>
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
                        {field.editable && <button onClick={() => handleEditField(field.label, field.value)} className="ml-2 text-indigo-600 hover:text-indigo-800">
                            <PencilIcon size={16} />
                          </button>}
                      </div>}
                  </div>
                </div>)}
            </div>
            {/* Performance Metrics (only shown on professional tab) */}
            {activeTab === 'professional' && <div className="mt-6">
                <div className="flex items-center mb-4">
                  <BarChart3Icon className="text-indigo-600" />
                  <h3 className="text-lg font-semibold text-gray-800 ml-2">
                    Performance Metrics
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {performanceMetrics.map(metric => <div key={metric.label} className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-500">{metric.label}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-lg font-semibold text-gray-800">
                          {metric.value}
                        </p>
                        <span className={`text-xs font-medium ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                          {metric.change}
                        </span>
                      </div>
                    </div>)}
                </div>
              </div>}
          </div>
        </div>
      </div>
      {/* Account Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SettingsCard title="Password Settings" description="Change your password and manage security settings" icon={<svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
            </svg>} buttonText="Change Password" />
        <SettingsCard title="Notification Preferences" description="Configure how and when you receive notifications" icon={<svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
            </svg>} buttonText="Update Preferences" />
        <SettingsCard title="Activity Log" description="View your account activity and login history" icon={<svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
        <div className="p-2 bg-indigo-50 rounded-lg">{icon}</div>
        <h3 className="ml-3 text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      <button className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md font-medium text-sm transition-colors">
        {buttonText}
      </button>
    </div>;
}