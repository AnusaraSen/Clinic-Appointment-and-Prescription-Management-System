import React, { useState, useEffect } from 'react';

const TestAvailability = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/labtasks/lab-staff');
      const data = await response.json();
      setStaff(data);
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAvailability = async (staffId, newAvailability) => {
    try {
      setUpdating(staffId);
      
      const response = await fetch(`http://localhost:5000/api/labtasks/lab-staff/${staffId}/availability`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ availability: newAvailability }),
      });

      if (!response.ok) {
        throw new Error('Failed to update availability');
      }

      // Refresh staff data
      await fetchStaff();
    } catch (error) {
      console.error('Error updating availability:', error);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Lab Staff Availability Test</h2>
      <div className="space-y-2">
        {staff.map((member) => (
          <div key={member._id || member.id} className="flex items-center space-x-4 p-2 border rounded">
            <span className="w-32">{member.user?.name || member.name}</span>
            <span className="w-24">{member.position || 'Lab Assistant'}</span>
            <select
              value={member.availability || 'Available'}
              onChange={(e) => updateAvailability(member._id || member.id, e.target.value)}
              disabled={updating === (member._id || member.id)}
              className="border rounded px-2 py-1"
            >
              <option value="Available">Available</option>
              <option value="Not Available">Not Available</option>
            </select>
            {updating === (member._id || member.id) && <span>Updating...</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestAvailability;