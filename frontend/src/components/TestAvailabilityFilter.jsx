import React, { useState, useEffect } from 'react';

const TestAvailabilityFilter = () => {
  const [allStaff, setAllStaff] = useState([]);
  const [availableStaff, setAvailableStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaffData();
  }, []);

  const fetchStaffData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/labtasks/lab-staff');
      const data = await response.json();
      
      setAllStaff(data);
      
      // Filter only available staff (this is what the assignment dropdown should show)
      const available = data.filter(staff => staff.availability === 'Available');
      setAvailableStaff(available);
      
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Lab Staff Availability Filter Test</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* All Staff */}
        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">
            All Lab Staff ({allStaff.length})
          </h3>
          <div className="space-y-2">
            {allStaff.map((staff) => (
              <div key={staff._id} className="flex justify-between items-center p-2 border rounded">
                <span className="font-medium">{staff.user?.name}</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  staff.availability === 'Available' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {staff.availability}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Available Staff Only (What Assignment Dropdown Shows) */}
        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3 text-green-800">
            Available for Assignment ({availableStaff.length})
          </h3>
          <div className="space-y-2">
            {availableStaff.length > 0 ? (
              availableStaff.map((staff) => (
                <div key={staff._id} className="flex justify-between items-center p-2 bg-green-50 border border-green-200 rounded">
                  <span className="font-medium">{staff.user?.name}</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                    {staff.availability}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-red-600 p-4 text-center">
                No lab assistants are currently available for assignment
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">How it works:</h4>
        <ul className="text-blue-700 space-y-1">
          <li>• Lab supervisors can mark staff as "Available" or "Not Available" in the overview table</li>
          <li>• When assigning tasks, only "Available" staff appear in the dropdown</li>
          <li>• This ensures tasks are only assigned to staff who are present and ready to work</li>
          <li>• The "Available Staff" KPI card shows the real-time count</li>
        </ul>
      </div>
    </div>
  );
};

export default TestAvailabilityFilter;