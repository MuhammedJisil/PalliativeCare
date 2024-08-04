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
import VolunteerView from './components/VolunteerView';
import CaregiverList from './components/CaregiverList';
import CaregiverView from './components/CaregiverView';
import PatientsInNeed from './components/PatientsInNeed'; 
import PatientInNeedView from './components/PatientInNeedView';
import PatientManagement from './components/PatientManagement';
import AddPatient from './components/AddPatient';
import ViewPatient from './components/ViewPatient';
import UpdatePatient from './components/UpdatePatient';
import Donate from './components/Donate';
import DonationList from './components/DonationList';


const App = () => {
  return (
    <Router>
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/admin/donations" element={<DonationList />} />
          <Route path="/volunteer-caregiver-registration" element={<VolunteerCaregiverRegistration />} />
          <Route path="/admin/volunteers/view/:id" element={<VolunteerView />} />
           <Route path="/patient-registration" element={<PatientRegistration />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminPage />} />
          <Route path="/admin/volunteers" element={<VolunteerList />} />
          <Route path="/admin/volunteers/view/:id" element={<VolunteerView />} />
          <Route path="/admin/caregivers" element={<CaregiverList />} />
          <Route path="/admin/caregivers/view/:id" element={<CaregiverView />} />
          <Route path="/admin/patients-in-need" element={<PatientsInNeed />} />
          <Route path="/admin/patients-in-need/view/:id" element={<PatientInNeedView />} />
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