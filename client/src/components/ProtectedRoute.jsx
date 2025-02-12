import React from 'react';
import { Navigate } from 'react-router-dom';

// ProtectedRoute component for both Admin and VCM
const ProtectedRoute = ({ element, role }) => {
  const token = localStorage.getItem(role === 'admin' ? 'admin_token' : 'vcm_token');

  return token ? element : <Navigate to={role === 'admin' ? "/admin" : "/vcm"} replace />;
};

export default ProtectedRoute;
