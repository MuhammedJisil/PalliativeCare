import React from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BASE_URL from '../config';

const LogoutButton = ({ userType }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Call logout endpoint
      await fetch(`${BASE_URL}/api/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userType === 'admin' ? localStorage.getItem('admin_token') : localStorage.getItem('vcm_token')}`
        }
      });
  
      // Remove only the token related to the user type
      if (userType === 'admin') {
        localStorage.removeItem('admin_token');
      } else {
        localStorage.removeItem('vcm_token');
      }
  
      // Small delay to ensure cleanup is complete
      setTimeout(() => {
        // Redirect based on user type
        navigate(userType === 'admin' ? '/admin' : '/vcm', { replace: true });
  
        // Force reload the page to clear cached states
        window.location.reload();
      }, 100);
  
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  return (
    <button
      onClick={handleLogout}
      className="flex items-center px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
    >
      <LogOut className="h-5 w-5 mr-2" />
    </button>
  );
};

export default LogoutButton;