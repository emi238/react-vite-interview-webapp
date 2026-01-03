import { useState, useEffect } from 'react';
import { getApplicantsByInterview } from '../app'; 
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Display and manage applicants for a specific interview
 * This component shows a list of applicants, allows adding new applicants,
 * editing existing ones, viewing answers, and generating interview links
 * 
 * @component
 * @param {object} location - React Router location object containing state
 * @param {string} location.state.interviewId - ID of the associated interview
 * @param {string} location.state.interviewTitle - Title of the associated interview
 * 
 * @state {Array} applicants - List of applicant objects
 * @state {boolean} loading - Flag indicating if data is currently loading
 * @state {string|null} error - Error message if data loading fails
 * @state {string|null} copiedLink - ID of applicant whose link was recently copied
 * 
 * @returns {JSX.Element} - Rendered component displaying applicants table and management interface
 */
function Applicants() {
  const location = useLocation();
  const navigate = useNavigate();

  const interviewId = location.state?.interviewId;
  const interviewTitle = location.state?.interviewTitle;

  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedLink, setCopiedLink] = useState(null); 

  // Load applicant from API when component mounts
  useEffect(() => {
    const fetchApplicants = async () => {
      if (!interviewId) {
        setError("Interview ID is missing");
        setLoading(false);
        return;
      }

      try {
        const data = await getApplicantsByInterview(interviewId);
        setApplicants(data);
      } catch (err) {
        console.error("Error fetching applicants:", err);
        setError("Failed to load applicants. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, [interviewId]);


  // Function to generate unique interview link 
  const generateInterviewLink = (applicantId) => {
    return `${window.location.origin}/applicant/${applicantId}/interview/${interviewId}`;
  };

  // Enables copy link to clipboard
  const copyLinkToClipboard = (applicantId) => {
    const link = generateInterviewLink(applicantId);
    navigator.clipboard.writeText(link)
      .then(() => {
        setCopiedLink(applicantId);
        setTimeout(() => setCopiedLink(null), 1000);
      })
  };

  // Navigates back to /applicants but passes the relevant identifiers to load applicants
  const handleAddApplicants = () => {
    navigate('/AddApplicants', { 
      state: { 
        interviewId: interviewId,   
        interviewTitle: interviewTitle 
      } 
    });
  };

  // Navigates to view answers for a specific applicant
  const handleViewAnswers = (applicantId) => {
    const applicantToView = applicants.find(a => a.id === applicantId);
    
    if (applicantToView) {
      navigate('/ViewApplicantAnswers', { 
        state: { 
          applicantId: applicantId,
          interviewId: interviewId,   
          interviewTitle: interviewTitle,
        } 
      });
    }
  };

  // Navigates to edit an existing applicant
  const handleEditApplicants = (applicantId) => {
    const applicantToEdit = applicants.find(a => a.id === applicantId);
    
    if (applicantToEdit) {
      navigate('/AddApplicants', { 
        state: { 
          applicantId: applicantId,
          interviewId: interviewId,   
          interviewTitle: interviewTitle,
        } 
      });
    }
  };

  // Navigates back to interviews list
  const handleBackToInterviews = () => {
    navigate('/interviews');
  };
 
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <button 
            onClick={handleBackToInterviews}
            className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <svg className="w-5 h-5 mr-1 text-headerblue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <p className='text-headerblue'>Back to Interviews</p>
          </button>
        </div>
      </header>

      <main className="max-w-7xl rounded-xl bg-grey-background mx-auto mt-6 px-4 sm:px-6 lg:px-8 py-8">
        {/* Interview Info Card*/}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Interview: {interviewTitle}</h2>
          {loading ? (
            <p className="text-gray-500">Loading applicants...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <p className="text-gray-600 mt-2">
              {applicants.length === 0 
                ? 'Applicants: 0' 
                : `Total Applicants: ${applicants.length}`}
            </p>
          )}
        </div>

        {/* Add Applicant Button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={handleAddApplicants}
            className="flex items-center bg-primary hover:bg-headerblue text-white font-medium py-2 px-4 rounded-lg transition duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Applicants
          </button>
        </div>

        {/* Applicants Table */}
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-3 py-3 text-left text-sm font-medium text-gray-500 uppercase">
                        Applicant Title
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">
                        Applicant First Name
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">
                        Applicant Last Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">
                        Phone
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">
                        Email
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">
                        Link to Interview
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">
                        Actions
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">
                        Status
                        </th>
                    </tr>
                </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : applicants.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500 border">
                    No applicants to interview. <br></br> Click "Add Applicants" to get started.
                  </td>
                </tr>
              ) : (
                applicants.map((applicant) => (
                  <tr key={applicant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{applicant.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{applicant.firstname}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{applicant.surname}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{applicant.phone_number}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{applicant.email_address}</div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => copyLinkToClipboard(applicant.id)}
                          className="text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded transition duration-200"
                        >
                          {copiedLink === applicant.id ? 'Copied!' : 'Copy Link'}
                        </button>
                      </div>
                    </td>
                    <td className="flex flex-row px-8 py-5 whitespace-nowrap text-sm font-medium gap-5">
                        <button 
                          onClick={() => handleEditApplicants(applicant.id)}
                          className="flex items-center justify-center text-gray-600 hover:text-gray-800 text-sm font-medium gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          Edit
                        </button>
                        <button 
                          onClick={() => handleViewAnswers(applicant.id)}
                          className="flex items-center justify-center text-gray-600 hover:text-gray-800 text-sm font-medium gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                          </svg>
                          View Answers
                        </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1.5 text-sm rounded
                        ${applicant.interview_status === 'Completed' ? 'bg-green-100 text-green-700 px-3' : 
                            'bg-grey-800 text-grey-700 border'}`}>
                        {applicant.interview_status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default Applicants;
