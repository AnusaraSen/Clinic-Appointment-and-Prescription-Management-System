import React from "react";
import DoctorCalendar from "./DoctorCalendar";
import ClinicalSidebar from '../../../components/ClinicalSidebar';

function DoctorCalendarPage() {
  // TODO: Replace with real authenticated doctor's _id fetched after login.
  // The string must be a 24-character hex value to be a valid MongoDB ObjectId.
  const doctorId = "64a9b0d1234567890abcdef1"; // placeholder valid-length ObjectId

  return (
    <div className="clinical-main-layout">
      <ClinicalSidebar />
      
      <div className="clinical-main-content">
        <div className="container mt-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Doctor Calendar</h2>
          </div>
          <DoctorCalendar doctorId={doctorId} />
        </div>
      </div>
    </div>
  );
}

export default DoctorCalendarPage;