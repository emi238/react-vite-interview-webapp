import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createApplicant, updateApplicant, getApplicant } from '../app.js'; 

/**
 * Add or edit an applicant for a specific interview
 * This component provides a form to create a new applicant or edit an existing one
 * 
 * @component
 * @param {object} location - React Router location object containing state
 * @param {string} location.state.applicantId - ID of the applicant being edited
 * @param {string} location.state.interviewId - ID of the associated interview
 * @param {string} location.state.interviewTitle - Title of interview
 * 
 * @state {string} applicantTitle - Applicant's title 
 * @state {string} applicantFirstname - Applicant's first name
 * @state {string} applicantSurname - Applicant's surname
 * @state {string} applicantPhone - Applicant's phone number 
 * @state {string} applicantEmail - Applicant's email address
 * @state {string} applicantStatus - Interview status (Not Started, Completed)
 * @state {boolean} isSubmitting - Flag indicating if form is currently submitting
 * @state {boolean} isEditing - Flag indicating if component is in edit mode
 * 
 * @returns {JSX.Element} - Rendered form component for adding/editing applicants
 */ 
function AddApplicants() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get interview data from navigation state
  const applicantId = location.state?.applicantId;
  const interviewId = location.state?.interviewId;
  const interviewTitle = location.state?.interviewTitle;

  // State for form inputs
  const [applicantTitle, setApplicantTitle] = useState('');
  const [applicantFirstname, setApplicantFirstname] = useState('');
  const [applicantSurname, setApplicantSurname] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantStatus, setApplicantStatus] = useState('Not Started');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Load applicant data when component mounts
  useEffect(() => {
    const fetchApplicant = async () => {
      if (!applicantId) return;
      
      try {
        setIsEditing(true);
        const applicantData = await getApplicant(applicantId);
        
        setApplicantTitle(applicantData.title || '');
        setApplicantFirstname(applicantData.firstname || '');
        setApplicantSurname(applicantData.surname || '');
        setApplicantPhone(applicantData.phone_number || '');
        setApplicantEmail(applicantData.email_address || '');
        setApplicantStatus(applicantData.interview_status || 'Not Started'); 
      } catch (error) {
        alert('Failed to load applicant data. Please try again.');
      }
    };

    fetchApplicant();
  }, [applicantId]);

  // Handle input changes
  const handleApplicantTitleChange = (event) => {
    setApplicantTitle(event.target.value);
  };

  const handleApplicantFirstnameChange = (event) => {
    setApplicantFirstname(event.target.value);
  };

  const handleApplicantSurnameChange = (event) => {
    setApplicantSurname(event.target.value);
  };

  const handleApplicantPhoneChange = (event) => {
    setApplicantPhone(event.target.value);
  };

  const handleApplicantEmailChange = (event) => {
    setApplicantEmail(event.target.value);
  };

  const handleApplicantStatusChange = (event) => {
    setApplicantStatus(event.target.value);
  };

  // Add new applicant via API
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (applicantTitle && applicantFirstname && applicantSurname && applicantEmail) {
      setIsSubmitting(true);

      try {
        // Create Applicant object
        const applicantData = {
          interview_id: interviewId,
          title: applicantTitle,
          firstname: applicantFirstname,
          surname: applicantSurname,
          phone_number: applicantPhone, 
          email_address: applicantEmail,
          interview_status: applicantStatus,
        };

        if (isEditing) {
          await updateApplicant(applicantId, applicantData);
          alert('Applicant updated successfully');
        } else {
          await createApplicant(applicantData);
          alert('Applicant created successfully');
        }

        // Navigate back to applicants list
        navigate('/applicants', {
          state: {
            interviewId: interviewId,
            interviewTitle: interviewTitle,
          },
        });
      } catch (error) {
        alert(`Failed to ${isEditing ? 'update' : 'create'} applicant. Please try again.`);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      alert('Please fill in all required fields before submitting.');
    }
  };

  // Cancel button and redirect to /applicants
  const handleCancel = () => {
    if (window.confirm(`Are you sure you want to cancel ${isEditing ? 'editing' : 'adding'} this applicant?`)) {
      navigate('/applicants', {
        state: {
          interviewId: interviewId,
          interviewTitle: interviewTitle,
        },
      });
    }
  };

  // Redirect back to /applicants
  const handleBackToApplicants = () => {
    navigate('/applicants', {
      state: { 
        interviewId: interviewId, 
        interviewTitle: interviewTitle
      } 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <button 
            type="button"
            onClick={handleBackToApplicants}
            className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <svg className="w-5 h-5 mr-1 text-headerblue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <p className='text-headerblue'>Back to Applicants</p>
          </button>
        </div>
      </header>

      <div className="container mx-auto p-6 max-w-5xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {isEditing ? 'Edit Applicant' : 'Add New Applicant'}
        </h1>
        <p className="text-gray-600 mb-6">Interview: {interviewTitle} (ID: {interviewId})</p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="applicantTitle">
                Applicant Title *
              </label>
              <input
                id="applicantTitle"
                rows="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={applicantTitle}
                onChange={handleApplicantTitleChange}
                placeholder="Miss/Mrs/Mr"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="applicantFirstname">
                Applicant Firstname *
              </label>
              <input
                type="text"
                id="applicantFirstname"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={applicantFirstname}
                onChange={handleApplicantFirstnameChange}
                placeholder="Jane"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="applicantSurname">
                Applicant Surname *
              </label>
              <input
                type="text"
                id="applicantSurname"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={applicantSurname}
                onChange={handleApplicantSurnameChange}
                placeholder="Doe"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="applicantPhone">
                Applicant Phone
              </label>
              <input
                type="tel"
                id="applicantPhone"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={applicantPhone}
                onChange={handleApplicantPhoneChange}
                placeholder="000 000 000"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="applicantEmail">
                Applicant Email *
              </label>
              <input
                type="email"
                id="applicantEmail"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={applicantEmail}
                onChange={handleApplicantEmailChange}
                placeholder="jane.doe@email.com"
                required
                disabled={isSubmitting}
              />
            </div>

            <input
              type="hidden"
              value={applicantStatus}
              onChange={handleApplicantStatusChange}
            />
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="submit"
              className="bg-primary hover:bg-headerblue text-white font-medium py-2 px-6 rounded-lg transition duration-200"
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? (isEditing ? 'Updating...' : 'Creating...') 
                : (isEditing ? 'Update Applicant' : 'Add Applicant')}
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

export default AddApplicants;