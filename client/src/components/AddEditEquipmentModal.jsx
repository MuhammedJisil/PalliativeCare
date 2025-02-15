import React from 'react';
import { 
  X, 
  WrenchIcon, 
  Package, 
  Hash, 
  Activity,
  AlertCircle,
  FileText,
  Image as ImageIcon, 
} from 'lucide-react';

const AddEditEquipmentModal = ({ 
  isModalOpen, 
  handleCloseModal, 
  editingEquipment, 
  formData, 
  setFormData, 
  handleSubmit,
  BASE_URL 
}) => {
  if (!isModalOpen) return null;

  const getImageUrl = (url) => {
    if (!url) return null;
    
    // If URL is already an absolute URL (Cloudinary or any external image), return it as is
    if (url.startsWith('http')) {
      return url;
    }
    
    // Otherwise, ensure it has BASE_URL
    return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file,
        existing_image: null // Clear the existing image when new file is selected
      }));
    }
  };

  // Get the appropriate image source for preview
  const getPreviewSrc = () => {
    if (formData.image) {
      return URL.createObjectURL(formData.image);
    }
    if (formData.existing_image) {
      return getImageUrl(formData.existing_image);
    }
    if (editingEquipment?.image_url) {
      return getImageUrl(editingEquipment.image_url);
    }
    return null;
  };

  // Update form with existing data when editing
  React.useEffect(() => {
    if (editingEquipment) {
      setFormData(prev => ({
        ...prev,
        existing_image: editingEquipment.image_url
      }));
    }
  }, [editingEquipment]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity" 
          aria-hidden="true"
          onClick={handleCloseModal}
        >
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        {/* Modal container */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {/* Close button */}
            <button 
              onClick={handleCloseModal} 
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>

            {/* Modal Header */}
            <div className="sm:flex sm:items-start mb-6">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-teal-100 sm:mx-0 sm:h-10 sm:w-10">
                <WrenchIcon className="h-6 w-6 text-teal-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {editingEquipment ? 'Edit Equipment' : 'Add New Equipment'}
                </h3>
                <p className="text-sm text-gray-500">
                  Fill out the equipment details below
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                  <Package className="h-5 w-5 text-teal-600" />
                  <span>Name</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                  <WrenchIcon className="h-5 w-5 text-teal-600" />
                  <span>Type</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                  <Hash className="h-5 w-5 text-teal-600" />
                  <span>Quantity</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                  <Activity className="h-5 w-5 text-teal-600" />
                  <span>Status</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="Available">Available</option>
                  <option value="In Use">In Use</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                  <option value="Out of Service">Out of Service</option>
                </select>
              </div>

              <div>
                <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                  <AlertCircle className="h-5 w-5 text-teal-600" />
                  <span>Condition</span>
                </label>
                <input
                  type="text"
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                  <FileText className="h-5 w-5 text-teal-600" />
                  <span>Notes</span>
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              {/* Image input with preview */}
             {/* Image input with preview */}
             <div>
                <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                  <ImageIcon className="h-5 w-5 text-teal-600" />
                  <span>Image</span>
                </label>
                
                {/* Image Preview */}
                {getPreviewSrc() && (
                  <div className="mb-4">
                    <div className="relative w-40 h-40 group">
                      <img
                        src={getPreviewSrc()}
                        alt="Equipment Preview"
                        className="w-40 h-40 object-cover rounded-lg border border-gray-200"
                      />
                      {/* Optional: Add remove image button */}
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          image: null,
                          existing_image: null
                        }))}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                )}

                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-medium
                    file:bg-teal-50 file:text-teal-700
                    hover:file:bg-teal-100"
                />
                <p className="mt-2 text-sm text-gray-500">
                  {formData.image ? 'New image selected' : 
                   formData.existing_image ? 'Using existing image' : 
                   'No image selected'}
                </p>
              </div>


              {/* Modal Footer */}
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="submit"
                  className="w-full inline-flex justify-center rounded-full border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {editingEquipment ? 'Update' : 'Add Equipment'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
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

export default AddEditEquipmentModal;