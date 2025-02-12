import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import VCMregistration from './components/VCMregistration';
import PatientRegistration from './components/PatientRegistration';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
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
import VCMLogin from './components/VCMLogin';
import VCMDashboard from './components/VCMDashboard';
import EquipmentList from './components/EquipmentList';
import EquipmentView from './components/EquipmentView';
import EquipmentDisplay from './components/EquipmentDisplay';
import PatientStatistics from './components/PatientStatistics';
import NotFound from './components/NotFound';
import ProtectedRoute from './components/ProtectedRoute';




const App = () => {
  return (
    <Router>
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/volunteer-caregiver-registration" element={<VCMregistration />} />
          <Route path="/patient-registration" element={<PatientRegistration />} />
          <Route path="/about" element={<About />} />
          <Route path="/equipment-display" element={<EquipmentDisplay />} />
          <Route path="*" element={<NotFound />} />

          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute element={<AdminDashboard />} role="admin" />} />
          <Route path="/admin/volunteers" element={<ProtectedRoute element={<VolunteerList />} role="admin" />} /> 
          <Route path="/admin/volunteers/view/:id" element={<ProtectedRoute element={<VolunteerView />} role="admin" />} />
          <Route path="/admin/caregivers" element={<ProtectedRoute element={<CaregiverList />} role="admin" />} />
          <Route path="/admin/caregivers/view/:id" element={<ProtectedRoute element={<CaregiverView />} role="admin" />} />
          <Route path="/admin/patients-in-need" element={<ProtectedRoute element={<PatientsInNeed />} role="admin" />} />
          <Route path="/admin/patients-in-need/view/:id" element={<ProtectedRoute element={<PatientInNeedView />} role="admin" />} />
          <Route path="/admin/patient-management" element={<ProtectedRoute element={<PatientManagement />} role="admin" />} />
          <Route path="/admin/patients/add" element={<ProtectedRoute element={<AddPatient />} role="admin" />} />
          <Route path="/admin/patients/view/:id" element={<ProtectedRoute element={<ViewPatient />} role="admin" />} />
          <Route path="/admin/patients/update/:id" element={<ProtectedRoute element={<UpdatePatient />} role="admin" />} />
          <Route path="/admin/tasks" element={<ProtectedRoute element={<ToDoList />} role="admin" />} />
          <Route path="/admin/schedules" element={<ProtectedRoute element={<ScheduleList />} role="admin" />} />
          <Route path="/admin/emergency-fund-management" element={<ProtectedRoute element={<EmergencyFundManager />} role="admin" />} />
          <Route path="/admin/patient-assignment" element={<ProtectedRoute element={<PatientAssignment />} role="admin" />} />
          <Route path="/admin/medical-professionals" element={<ProtectedRoute element={<MedicalProfessionalsList />} role="admin" />} />
          <Route path="/admin/medical-professionals/view/:id" element={<ProtectedRoute element={<MedicalProfessionalView />} role="admin" />} />
          <Route path="/admin/equipments" element={<ProtectedRoute element={<EquipmentList />} role="admin" />} />
          <Route path="/admin/equipments/view/:id" element={<ProtectedRoute element={<EquipmentView />} role="admin" />} />
          <Route path="/admin/statistics" element={<ProtectedRoute element={<PatientStatistics />} role="admin" />} />

          <Route path="/vcm" element={<VCMLogin/>} />
          <Route path="/vcm/dashboard" element={<ProtectedRoute element={<VCMDashboard />} role="vcm" />} />
        </Routes>
      </main>
    </Router>
  );
};

export default App;
