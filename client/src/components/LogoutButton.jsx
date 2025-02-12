import React from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LogoutButton = ({ userType }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Call logout endpoint
      await fetch('http://localhost:5000/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Clear ALL auth-related items from storage
      localStorage.clear(); // This will remove all localStorage items
      sessionStorage.clear(); // This will remove all sessionStorage items

      // Force a small delay to ensure cleanup is complete
      setTimeout(() => {
        // Redirect based on user type with replace to prevent back navigation
        if (userType === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/vcm', { replace: true });
        }
        
        // Force reload the page to clear any cached states
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