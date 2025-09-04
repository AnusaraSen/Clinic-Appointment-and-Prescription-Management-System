import React, { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { useEffect } from 'react'
import { AlertProvider } from './pages/clinical-workflow/prescriptions/AlertProvider'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AddPrescription from './pages/clinical-workflow/prescriptions/AddPrescription'
import AllPrescriptions from './pages/clinical-workflow/prescriptions/AllPrescriptions'
import UpdatePrescription from './pages/clinical-workflow/prescriptions/UpdatePrescription'
import DeletePrescription from './pages/clinical-workflow/prescriptions/DeletePrescription'
import NavBar from './components/NavBar'


function App() {
const [count, setCount] = useState(0)

const [globalSearch, setGlobalSearch] = useState('');
  return (
    <Router>
      <AlertProvider>
      <div className="App">
         <NavBar search={globalSearch} onSearchChange={setGlobalSearch} />

         <Routes>
          {/* Pass searchTerm as prop to AllStudents */}
          
          <Route path="/add" element={<AddPrescription />} />
          <Route path="/get" element={<AllPrescriptions search={globalSearch} />} />
          <Route path="/update/:id" element={<UpdatePrescription />} />
          <Route path="/delete/:id" element={<DeletePrescription />} />


          {/* <Route path="/addPatient" element={<AddPatient />} />
          <Route path="/getPatient" element={<AllPatients search={globalSearch} />} />
          <Route path="/updatePatient/:id" element={<UpdatePatient />} />
          <Route path="/deletePatient/:id" element={<DeletePatient />} /> */}

          
          {/* Add more routes as needed */}

        </Routes>
  </div>
  </AlertProvider>
    </Router>
  );
}

export default App
