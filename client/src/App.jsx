import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import VolunteerCaregiverRegistration from './components/VolunteerCaregiverRegistration';
import PatientRegistration from './components/PatientRegistration';
import AdminLogin from './components/AdminLogin';
import AdminPage from './components/AdminPage';
import VolunteerList from './components/VolunteerList'; 
import CaregiverList from './components/CaregiverList';
import PatientsInNeed from './components/PatientsInNeed'; 
import PatientManagement from './components/PatientManagement';
import AddPatient from './components/AddPatient';
import ViewPatient from './components/ViewPatient';
import UpdatePatient from './components/UpdatePatient';


const App = () => {
  return (
    <Router>
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/volunteer-caregiver-registration" element={<VolunteerCaregiverRegistration />} />
           <Route path="/patient-registration" element={<PatientRegistration />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminPage />} />
          <Route path="/admin/volunteers" element={<VolunteerList />} />
          <Route path="/admin/caregivers" element={<CaregiverList />} />
          <Route path="/admin/patients-in-need" element={<PatientsInNeed />} />
          <Route path="/admin/patient-management" element={<PatientManagement />} />
          <Route path="/admin/patients/add" element={<AddPatient />} />
          <Route path="/admin/patients/view/:id" element={<ViewPatient />} />
          <Route path="/admin/patients/update/:id" element={<UpdatePatient />} />

        </Routes>
      </main>
      <Footer />
    </Router>
  );
};

export default App;
