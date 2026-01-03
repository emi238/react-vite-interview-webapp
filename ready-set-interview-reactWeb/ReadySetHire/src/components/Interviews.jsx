import { useState, useEffect } from 'react';
import { getInterviews, deleteInterview, getQuestionCount, getApplicantCount} from '../app';
import { Link, useNavigate } from 'react-router-dom';

/**
 * Display and manage all interviews with statistics and actions
 * This component shows a dashboard of interviews with question/applicant counts,
 * status indicators, and management options
 * 
 * @component
 * @state {Array} interviews - List of interview objects with counts
 * @state {boolean} loading - Flag indicating if data is currently loading
 * @state {string|null} error - Error message if data loading fails
 * 
 * @returns {JSX.Element} - Rendered interviews dashboard with statistics and management interface
 */
function Interviews() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  
  // Navigates to questions for a specific interview
  const handleEditQuestions = (interview) => {
    navigate('/questions', { state: { interviewId: interview.id, interviewTitle: interview.title, interviewJobRole: interview.job_role} });
  };  
  
  // Navigates to applicants for a specific interview
  const handleEditApplicants = (interview) => {
    navigate('/applicants', { state: { interviewId: interview.id, interviewTitle: interview.title} });
  };

  // Fetch interviews from API with loading state
  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const interviewData = await getInterviews();
      
      // Fetch interviews from API with question and applicant counts
      const interviewsWithCounts = await Promise.all(
        interviewData.map(async (interview) => {
          try {
            const [questionCount, applicantCount] = await Promise.all([
              getQuestionCount(interview.id), 
              getApplicantCount(interview.id)
            ]);
            
            return {
              ...interview,
              questionCount,
              applicantCount
            };
          } catch (error) {
            return {
              ...interview,
              questionCount: 0,
              applicantCount: 0
            };
          }
        })
      );
      setInterviews(interviewsWithCounts);
      setError(null);
    } catch (err) {
      setError('Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Navigates to edit an interview
  const handleEditInterview = (interview) => {    
    navigate('/CreateInterview', { 
      state: { 
        interviewId: interview.id,   
        interviewTitle: interview.title, 
      } 
    });
  }; 

  // Delete interview
  const handleDeleteInterview = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete the interview for ${title}? This action cannot be undone.`)) {
      try {
        await deleteInterview(id);
        // Removing interview from local state
        setInterviews(interviews.filter(interview => interview.id !== id));
      } catch (err) {
        alert('Failed to delete interview. Please try again.');
      }
    }
  };

  // Fetch interviews on component mount
  useEffect(() => {
    fetchInterviews();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-static-background p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading interviews...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-static-background p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600 font-semibold lg-2">Error Loading Interviews</p>
            <button
              onClick={fetchInterviews}
              className="mt-4 bg-red-500 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-static-background">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">All Interviews</h1>
          <p className="text-gray-600">Manage your interviews, questions and applicant information</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Interviews</h3>
            <p className="text-4xl font-bold text-blue-600">{interviews.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Published</h3>
            <p className="text-4xl font-bold text-green-600">
              {interviews.filter(i => i.status === 'Published').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Drafts</h3>
            <p className="text-4xl font-bold text-yellow-600">
              {interviews.filter(i => i.status === 'Draft').length}
            </p>
          </div>
        </div>

        {/* Interviews Grid */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">All Interviews</h2>
            <button
              onClick={fetchInterviews}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>

          {interviews.length === 0 ? (
            <div className="text-center py-10">
              <div className="bg-gray-100 border rounded-lg p-8">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-xl font-medium text-black mb-2">No Interviews Created Yet</h3>
                <p className="text-gray-500 mb-4">Get started by creating your first interview below!</p>
                <Link to="/CreateInterview">
                    <button
                    className="bg-primary hover:bg-headerblue text-white font-medium py-2 px-8 rounded-lg transition duration-200"
                    >
                    Create First Interview
                    </button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {interviews.map((interview) => (
                <div key={interview.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-gray-800">{interview.title}</h3>
                    <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      interview.status === 'Published' ? 'bg-green-100 text-green-800 border border-green-200' :
                      interview.status === 'Draft' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {interview.status}
                    </span>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div>
                      <span className="text-md font-medium text-gray-600"><h1>Job Role:</h1></span>
                      <p className="text-gray-800 text-md">{interview.job_role}</p>
                    </div>
                    
                    {interview.description && (
                      <div>
                        <span className="text-md font-medium text-gray-600"><h1>Description:</h1></span>
                        <p className="text-gray-700 text-md break-words">{interview.description}</p>
                      </div>
                    )}
                  </div>

                  {/* Questions and Applicants with counts */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-1 text-blue-600 gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                      </svg>
                      <span>{interview.questionCount} Questions</span>
                    </div>
                    <div className="flex items-center space-x-2 text-green-600">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                      </svg>
                      <span>{interview.applicantCount} Applicants</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <div className="flex space-x-3">
                      <button 
                        type="button"
                        onClick={() => handleEditQuestions(interview)}
                        className="text-blue-600 border border-blue-500 px-3 rounded hover:bg-blue-50 text-sm font-medium"
                      >
                        Edit Questions
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleEditApplicants(interview)}
                        className="text-green-600 border border-green-500 px-3 rounded hover:bg-green-50 text-sm font-medium"
                      >
                        Edit Applicants
                      </button>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleEditInterview(interview)}
                        className="flex items-center justify-center text-gray-600 hover:text-gray-800 text-sm font-medium">
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteInterview(interview.id, interview.title)}
                        className="flex items-center justify-center text-red-600 hover:text-red-800 text-sm font-medium">
                         <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                         </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Interviews;