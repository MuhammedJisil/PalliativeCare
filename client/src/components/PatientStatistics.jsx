import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Activity, 
  Edit, 
  Save, 
  RefreshCw, 
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { format, parseISO } from 'date-fns';
import BASE_URL from '../config';

const formatDate = (dateString) => {
  try {
    const parsedDate = parseISO(dateString);
    return format(parsedDate, 'MMMM d, yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};


const PatientStatistics = () => {
  const [data, setData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
   const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/statistics`);
      
      // Transform date fields to formatted version
      const transformedData = Object.entries(response.data).reduce((acc, [key, value]) => {
        // Check if the value looks like a date
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
          acc[key] = formatDate(value);
        } else {
          acc[key] = value;
        }
        return acc;
      }, {});

      setData(transformedData);
      setFormData(transformedData);
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      // When submitting, you might want to convert back to ISO format if needed
      const submitData = Object.entries(formData).reduce((acc, [key, value]) => {
        acc[key] = key.includes('date') ? new Date(value).toISOString() : value;
        return acc;
      }, {});

      await axios.put(`${BASE_URL}/api/statistics`, submitData);
      setSuccess("Statistics updated successfully!")
      setData(formData);
      setEditing(false);
    } catch (error) {
      console.error("Error updating statistics:", error);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-2">
              <Activity className="h-8 w-8 text-teal-600" />
              <Link to="/admin/dashboard" className="text-gray-800">
              <h1 className="text-xl font-semibold tracking-tight text-gray-800">
                Patient Statistics
              </h1>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchStatistics}
                className="p-2 text-gray-600 hover:text-teal-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <RefreshCw size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md">
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <RefreshCw className="animate-spin text-teal-600" size={24} />
            </div>
          ) : (
            <>
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-700">Statistics Details</h2>
                {!editing ? (
                  <button 
                    onClick={() => setEditing(true)} 
                    className="text-teal-600 hover:text-teal-700 transition-colors"
                  >
                    <Edit size={20} className="mr-1.5" />
                  </button>
                ) : (
                  <button 
                    onClick={handleSubmit} 
                    className="text-green-600 hover:text-green-700 transition-colors"
                  >
                    <Save size={20} />
                  </button>
                )}
              </div>
              
              <table className="w-full">
              <tbody>
                  {data && Object.entries(data)
                    .filter(([key]) => key !== 'id')
                    .map(([key, value]) => (
                      <tr key={key} className="border-b border-teal-100 last:border-b-0">
                        <td className="py-3 px-2 text-teal-800 font-medium capitalize">
                          {key.replace(/_/g, " ")}
                        </td>
                        <td className="py-3 px-2">
                          {editing ? (
                            <input
                              type={key.includes('date') ? "date" : "text"}
                              name={key}
                              value={formData[key]}
                              onChange={handleChange}
                              className="w-full p-2 border border-teal-300 rounded focus:ring-2 focus:ring-teal-500 outline-none"
                            />
                          ) : (
                            <span className="text-gray-700">{value}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </>
          )}
        </div>

        {/* Back Button */}
        <div className="mt-6">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="inline-flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>
                 {/* alert content */}
                 {(error || success) && (
  <div 
    className="fixed inset-0 z-40 bg-black/10"
    onClick={() => {
      setError(null);
      setSuccess(null);
    }}
  >
    <div 
      className="fixed top-4 right-4 z-50"
      onClick={(e) => e.stopPropagation()}
    >
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-md flex items-center space-x-3">
          <AlertCircle className="w-6 h-6 text-red-500" />
          <div>
            <p className="font-medium">{error}</p>
          </div>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-md flex items-center space-x-3">
          <CheckCircle className="w-6 h-6 text-green-500" />
          <div>
            <p className="font-medium">{success}</p>
          </div>
        </div>
      )}
    </div>
  </div>
)}

    </div>
  );
};

export default PatientStatistics;