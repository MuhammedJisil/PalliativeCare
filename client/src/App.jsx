import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import VCMregistration from './components/VCMregistration';
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
import ToDoList from './components/ToDoList';
import ScheduleList from './components/ScheduleList';
import About from './components/About';
import EmergencyFundManager from './components/EmergencyFundManager';
import PatientAssignment from './components/PatientAssignment';
import MedicalProfessionalsList from './components/MedicalProfessionalsList';
import MedicalProfessionalView from './components/MedicalProfessionalView';




const App = () => {
  return (
    <Router>
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/volunteer-caregiver-registration" element={<VCMregistration />} />
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
          <Route path="admin/tasks" element={<ToDoList />} /> 
          <Route path="/admin/schedules" element={<ScheduleList />} />
          <Route path="/about" element={<About />} />
          <Route path="/admin/emergency-fund-management" element={<EmergencyFundManager />} />
          <Route path="/admin/patient-assignment" element={<PatientAssignment />} />
          <Route path="/admin/Medical-professionals" element={<MedicalProfessionalsList />} />
          <Route path="/admin/Medical-professionals/view/:id" element={<MedicalProfessionalView/>} />

          
        </Routes>
      </main>
    </Router>
  );
};

export default App;
