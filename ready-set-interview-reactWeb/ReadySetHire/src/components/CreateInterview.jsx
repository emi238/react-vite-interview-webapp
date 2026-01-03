import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createInterview, getInterview, updateInterview } from '../app.js';

/**
 * Create or edit an interview
 * This component provides a form to create a new interview or edit an existing one
 * 
 * @component
 * @param {object} location - React Router location object containing state
 * @param {string} location.state.interviewId - ID of the interview being edited (optional)
 * 
 * @state {string} title - Title of the interview
 * @state {string} job_role - Job role being interviewed for
 * @state {string} status - Publication status of the interview (Draft, Published)
 * @state {string} description - Detailed description of the interview
 * @state {boolean} isSubmitting - Flag indicating if form is currently submitting
 * @state {boolean} isEditing - Flag indicating if component is in edit mode
 * 
 * @returns {JSX.Element} - Rendered form component for creating/editing interviews
 */
function CreateInterview() {
  const navigate = useNavigate();
  const location = useLocation();
  const interviewId = location.state?.interviewId;

  // State for the form inputs 
  const [title, setTitle] = useState('');
  const [job_role, setJobRole] = useState(''); 
  const [status, setStatus] = useState('Draft');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Load interview from API when component mounts
  useEffect(() => {
    const fetchInterview = async () => {
      if (!interviewId) return;
      
      try {
        setIsEditing(true);
        const interviewData = await getInterview(interviewId);
        setTitle(interviewData.title || '');
        setJobRole(interviewData.job_role || '');
        setStatus(interviewData.status || 'Draft');
        setDescription(interviewData.description || '');
      } catch (error) {
        alert('Failed to load interview data. Please try again.');
      }
    };

    fetchInterview();
  }, [interviewId]);

  // Handle input changes
  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };

  const handleJobRoleChange = (event) => {
    setJobRole(event.target.value);
  };

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
  };

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (title && job_role && status) {
      setIsSubmitting(true);
      
      try {
        const interviewData = {
          title,
          job_role,
          status,
          description: description || null,
        };

        if (isEditing) {
          await updateInterview(interviewId, interviewData);
          alert('Interview updated successfully');
        } else {
          await createInterview(interviewData);
          alert('Interview created successfully');
        }
        
        navigate('/interviews');
      } catch (error) {
        console.error('Error saving interview:', error);
        alert(`Failed to ${isEditing ? 'update' : 'create'} interview. Please try again.`);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      alert('Please fill in all required fields before submitting.');
    }
  };

  // Cancel button handler and navigate back to interviews
  const handleCancel = () => {
    if (window.confirm(`Are you sure you want to cancel ${isEditing ? 'editing' : 'creating'} this interview?`)) {
      navigate('/interviews');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button 
            type="button"
            onClick={() => navigate('/interviews')}
            className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Interviews
          </button>
        </div>
      </header>

      <div className="container mx-auto p-6 max-w-5xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {isEditing ? 'Edit Interview' : 'Create New Interview'}
        </h1>
        <p className="text-gray-600 mb-6">Please fill in all mandatory fields to submit</p>

        {/* Form to add new interviews */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-gray-700 font-medium mb-2" htmlFor="title">
                Interview Title *
              </label>
              <input
                id="title"
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={title}
                onChange={handleTitleChange}
                placeholder="Frontend Developer Interview"
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-gray-700 font-medium mb-2" htmlFor="job_role">
                Job Role *
              </label>
              <input
                id="job_role"
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={job_role}
                onChange={handleJobRoleChange}
                placeholder="Frontend Developer"
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-gray-700 font-medium mb-2" htmlFor="status">
                Status *
              </label>
              <select
                id="status"
                className="w-full px-6 py-2 border border-gray-300 rounded-lg"
                value={status}
                onChange={handleStatusChange}
                required
                disabled={isSubmitting}
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-gray-700 font-medium mb-2" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={description}
                onChange={handleDescriptionChange}
                placeholder="Describe the role, requirements, process, or any other special instructions..."
                disabled={isSubmitting}
              ></textarea>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 mt-6">
            <button 
              type="submit" 
              className="bg-primary hover:bg-headerblue text-white font-medium py-2 px-6 rounded-lg transition duration-200"
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? (isEditing ? 'Updating...' : 'Creating...') 
                : (isEditing ? 'Update Interview' : 'Create Interview')}
            </button>
            <button 
              type="button"
              onClick={handleCancel}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-lg transition duration-200"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateInterview;