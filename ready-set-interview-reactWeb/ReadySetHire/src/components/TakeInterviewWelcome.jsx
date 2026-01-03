import { useNavigate, useParams, useOutletContext } from 'react-router-dom';

/**
 * Welcome screen for interview applicants
 * This component displays interview details, applicant information, and provides
 * a starting point for the interview process with validation checks
 * 
 * @component
 * @param {Object} useParams - React Router hook for URL parameters
 * @param {string} useParams.interviewId - ID of the current interview
 * @param {string} useParams.applicantId - ID of the current applicant
 * @param {Object} useOutletContext - Context from parent layout component
 * @param {Object} useOutletContext.interview - Interview data object
 * @param {Object} useOutletContext.applicant - Applicant data object
 * @param {Array} useOutletContext.questions - List of questions for this interview
 * 
 * @returns {JSX.Element} - Welcome interface with applicant details and interview start button
 */
function TakeInterviewWelcome() {
  const { interviewId, applicantId } = useParams();
  const navigate = useNavigate();
  const { interview, applicant, questions } = useOutletContext();

  // Start the interview process
  const startInterview = () => {
    if (questions.length > 0) {
      navigate(`/applicant/${applicantId}/interview/${interviewId}/question/${questions[0].id}`);
    }
  };

  return (
    <div className="min-h-screen bg-static-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          {/* Header Section */}
          <div className="bg-headerblue px-6 py-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Welcome to Your Interview</h1>
            <p className="text-gray-100 text-lg">Please check that your details are correct below.</p>
          </div>

          {/* Content Section */}
          <div className="px-6 py-8">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">{interview.title}</h2>
              <p className="text-gray-600">Role: {interview.job_role}</p>
            </div>

            {/* Applicant Details */}
            <div className="bg-gray-50 border rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Applicant Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Full Name:</p>
                  <p className="font-medium text-gray-800">{applicant.title} {applicant.firstname} {applicant.surname}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email Address:</p>
                  <p className="font-medium text-gray-800">{applicant.email_address}</p>
                </div>
                {applicant.phone_number && (
                  <div>
                    <p className="text-sm text-gray-500">Phone Number:</p>
                    <p className="font-medium text-gray-800">{applicant.phone_number}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Button */}
            <div className="text-center">
              <button
                onClick={startInterview}
                disabled={questions.length === 0}
                className="bg-primary hover:bg-headerblue text-white font-semibold py-3 px-8 rounded-lg text-lg"
              >
                {questions.length === 0 ? 'No Questions Available' : 'Start Interview'}
              </button>
              
              {questions.length === 0 && (
                <p className="text-red-500 mt-4">This interview doesn't have any questions yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TakeInterviewWelcome;