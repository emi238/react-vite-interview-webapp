import { useOutletContext } from 'react-router-dom';

/**
 * Completion screen shown after an applicant finishes an interview
 * Displays a success confirmation message with interview details
 * 
 * @component
 * @param {Object} useOutletContext - React Router hook for accessing context from parent layout
 * @param {Object} useOutletContext.interview - Interview data object containing title and details
 * 
 * @returns {JSX.Element} - Completion screen with success message and interview information
 */
function InterviewComplete() {
  const { interview } = useOutletContext();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Interview Completed!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for completing the interview for {interview.title}. 
            You may now close this window. 
          </p>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800">
                Your responses have been successfully recorded.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InterviewComplete;