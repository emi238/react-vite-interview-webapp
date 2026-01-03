import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getApplicant, getInterview, getAnswersByApplicant, getQuestionsByInterview } from '../app';

/**
 * Display interview answers for a specific applicant
 * This component shows all questions and corresponding answers submitted by an applicant
 * for a particular interview, providing a comprehensive review interface
 * 
 * @component
 * @param {Object} location - React Router location object containing state
 * @param {string} location.state.applicantId - ID of the applicant whose answers to view
 * @param {string} location.state.interviewId - ID of the associated interview
 * @param {string} location.state.interviewTitle - Title of the associated interview
 * 
 * @state {Object|null} applicant - Applicant data object
 * @state {Object|null} interview - Interview data object
 * @state {Array} questions - List of questions for the interview
 * @state {Array} answers - List of answers submitted by the applicant
 * @state {boolean} loading - Flag indicating if data is currently loading
 * 
 * @returns {JSX.Element} - Answers review interface with question-answer pairs
 */
function ViewApplicantAnswers() {
  const location = useLocation();
  const navigate = useNavigate();
  const { applicantId, interviewId, interviewTitle } = location.state || {};
  const [applicant, setApplicant] = useState(null);
  const [interview, setInterview] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Navigate back to applicants list while passing attributes
  const handleBackToApplicants = () => {
    navigate('/applicants', {
      state: { interviewId, interviewTitle },
    });
  };

  // Fetch applicant answers and related data when component mounts
  useEffect(() => {
    const fetchApplicantAnswers = async () => {
      if (!applicantId || !interviewId) return;

      try {
        // Fetch applicant and interview info
        const [applicantData, interviewData] = await Promise.all([
          getApplicant(applicantId),
          getInterview(interviewId),
        ]);

        // Fetch all answers for this applicant and interview
        const [questionData, applicantAnswers] = await Promise.all([
          getQuestionsByInterview(interviewId),
          getAnswersByApplicant(applicantId, interviewId),
        ]);
        
        setApplicant(applicantData[0]);
        setInterview(interviewData[0]);
        setQuestions(questionData);
        setAnswers(applicantAnswers);

      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchApplicantAnswers();
  }, [applicantId, interviewId]);

  // Create mapping of question IDs to question text for easier matching later
  const questionMap = {};
  questions.forEach(question => {
    questionMap[question.id] = question.question;
  });

  if (loading) return <div>Loading answers...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <button
            type="button"
            onClick={handleBackToApplicants}
            className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <svg
              className="w-5 h-5 mr-1 text-headerblue"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <p className="text-headerblue">Back to Applicants</p>
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="container mx-auto p-6 max-w-5xl">
        {/* Applicant Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold mb-4">
            Interview Answers for {interviewTitle}
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 text-gray-600">
            <div className="flex items-center gap-2">
              <span className="font-medium">
                <p>Applicant: {applicant?.firstname} {applicant?.surname}</p>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium"><p>Interview Role: {interview?.job_role}</p></span>
            </div>
          </div>
        </div>

        {/* Answers Section */}
        <div className="space-y-6">
          {answers.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <h3 className="text-xl font-semibold mb-2">No Answers Found</h3>
              <p>This applicant has submitted no answers to the interview questions. <br></br>Alternatively, the applicant may haven't completed the interview yet. You may check their status in the applicant dashboard.</p>
            </div>
          ) : (
            answers.map((answer, index) => (
              <div key={answer.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-headerblue rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-semibold">{index + 1}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      {questionMap[answer.question_id]}
                    </h3>
                  </div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">Answer:</h4>
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {answer.answer || <span className="text-gray-400 italic"><p>No answer provided, question skipped.</p></span>}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ViewApplicantAnswers;