// AddCaregiverModal Component
const AddCaregiverModal = ({ isOpen, onClose, onCaregiverAdded }) => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      phone_number: '',
      address: '',
      availability: '',
      experience: '',
      certifications:'',
      notes: ''
    });
  
    const handleChange = (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const url = 'http://localhost:5000/api/caregivers';
        const response = await axios.post(url, { 
          ...formData, 
          userType: 'caregiver' 
        });
        
        // Clear form after successful submission
        setFormData({
          name: '',
          email: '',
          phone_number: '',
          address: '',
          availability: '',
          experience: '',
          certifications:'',
          notes: ''
        });
  
        // Notify parent component and close modal
        onCaregiverAdded(response.data);
        onClose();
        
        alert('Caregiver added successfully');
      } catch (error) {
        console.error('Error adding caregiver:', error);
        alert('Failed to add caregiver. Please try again.');
      }
    };
  
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          {/* Background overlay */}
          <div 
            className="fixed inset-0 transition-opacity" 
            aria-hidden="true"
            onClick={onClose}
          >
            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>
  
          {/* Modal container */}
          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              {/* Close button */}
              <button 
                onClick={onClose} 
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
  
              {/* Modal Header */}
              <div className="sm:flex sm:items-start mb-6">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-teal-100 sm:mx-0 sm:h-10 sm:w-10">
                  <Heart className="h-6 w-6 text-teal-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Add New Caregiver
                  </h3>
                  <p className="text-sm text-gray-500">
                    Fill out the details for a new caregiver
                  </p>
                </div>
              </div>
  
              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                    <User className="h-5 w-5 text-teal-600" />
                    <span>Name</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
  
                <div>
                  <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                    <Mail className="h-5 w-5 text-teal-600" />
                    <span>Email</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
  
                <div>
                  <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                    <Phone className="h-5 w-5 text-teal-600" />
                    <span>Phone Number</span>
                  </label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
  
                <div>
                  <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                    <MapPin className="h-5 w-5 text-teal-600" />
                    <span>Address</span>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    rows="3"
                  ></textarea>
                </div>
  
                <div>
                  <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                    <Calendar className="h-5 w-5 text-teal-600" />
                    <span>Availability</span>
                  </label>
                  <textarea
                    name="availability"
                    value={formData.availability}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    rows="3"
                  ></textarea>
                </div>
  
                <div>
                  <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                    <Book className="h-5 w-5 text-teal-600" />
                    <span>Skills</span>
                  </label>
                  <textarea
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    rows="3"
                  ></textarea>
                </div>
  
                <div>
                  <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                    <User className="h-5 w-5 text-teal-600" />
                    <span>Additional Notes</span>
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    rows="3"
                  ></textarea>
                </div>
  
                {/* Modal Footer */}
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-full border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Add Volunteer
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-3 w-full inline-flex justify-center rounded-full border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  };