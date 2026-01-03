import { useParams, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getInterview, getApplicant, getQuestionsByInterview } from '../app';
import Header from './Header';

/**
 * Layout component for the interview taking interface
 * This component serves as a wrapper that loads interview, applicant, and question data
 * and provides this context to nested routes via React Router Outlet
 * 
 * @component
 * @param {Object} useParams - React Router hook for URL parameters
 * @param {string} useParams.applicantId - ID of the applicant from URL parameters
 * @param {string} useParams.interviewId - ID of the interview from URL parameters
 * 
 * @state {Object|null} interview - Interview data object
 * @state {Object|null} applicant - Applicant data object
 * @state {Array} questions - List of questions for the interview
 * @state {boolean} loading - Flag indicating if data is currently loading
 * @state {string|null} error - Error message if data loading fails
 * 
 * @returns {JSX.Element} - Layout component with header and outlet for interview content
 */
function TakeInterviewLayout() {
  const { applicantId, interviewId } = useParams();
  const [interview, setInterview] = useState(null);
  const [applicant, setApplicant] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch interview, applicant, and question data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [interviewResponse, applicantResponse, questionsResponse] = await Promise.all([
          getInterview(interviewId),
          getApplicant(applicantId),
          getQuestionsByInterview(interviewId)
        ]);
        
        // Extract objects from arrays
        const interviewData = interviewResponse[0];
        const applicantData = applicantResponse[0];
        
        setInterview(interviewData);
        setApplicant(applicantData);
        setQuestions(questionsResponse || []);
        
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (interviewId && applicantId) {
      fetchData();
    } else {
      setError('Missing interview / applicant ID');
      setLoading(false);
    }
  }, [interviewId, applicantId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading interview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Interview</h2>
          <p className="text-gray-600 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  // Renders main layout with header and provides context to nested routes via outlet
  return (
    <>
      <Header 
        title={`${interview.title} Interview`} 
        subtitle={`Applicant: ${applicant.firstname} ${applicant.surname}`}
        showInterviewsButton={false} 
      />
      <main className="flex-grow">
        <Outlet context={{ interview, applicant, questions }} />
      </main>
    </>
  );
}

export default TakeInterviewLayout;