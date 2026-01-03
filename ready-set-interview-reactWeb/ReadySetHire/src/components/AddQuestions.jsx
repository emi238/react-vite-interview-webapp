import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createQuestion, getQuestion, updateQuestion } from '../app.js'; 

/**
 * Add or edit a question for a specific interview
 * This component provides a form to create a new question or edit an existing one
 * 
 * @component
 * @param {object} location - React Router location object containing state
 * @param {string} location.state.questionId - ID of the question being edited (optional)
 * @param {string} location.state.interviewId - ID of the associated interview
 * @param {string} location.state.interviewTitle - Title of the associated interview
 * 
 * @state {string} questionText - The text content of the question
 * @state {string} difficulty - Difficulty level of the question (Easy, Intermediate, Advanced)
 * @state {boolean} isSubmitting - Flag indicating if form is currently submitting
 * @state {boolean} isEditing - Flag indicating if component is in edit mode
 * 
 * @returns {JSX.Element} - Rendered form component for adding/editing questions
 */
function AddQuestions() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get question and interview data from navigation state
  const questionId = location.state?.questionId;
  const interviewId = location.state?.interviewId;
  const interviewTitle = location.state?.interviewTitle;

  // State for form inputs
  const [questionText, setQuestionText] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Load question data when component mounts
  useEffect(() => {
    const fetchQuestion = async () => {
      if (!questionId) return;
      
      try {
        setIsEditing(true);
        // FIX: Use the getQuestion function to fetch a specific question
        const questionData = await getQuestion(questionId);
        setQuestionText(questionData.question);
        setDifficulty(questionData.difficulty);
      } catch (error) {
        console.error('Error fetching question:', error);
        alert('Failed to load question data. Please try again.');
      }
    };

    fetchQuestion();
  }, [questionId]);

  // Handle input changes
  const handleQuestionTextChange = (event) => {
    setQuestionText(event.target.value);
  };

  // Handle difficulty level selection change
  const handleDifficultyChange = (event) => {
    setDifficulty(event.target.value);
  };

  // Add new question or update question upon form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (questionText && difficulty && interviewId) {
      setIsSubmitting(true);

      try {
        // Create Question object
        const questionData = {
          interview_id: interviewId,
          question: questionText,
          difficulty: difficulty,
        };

        if (isEditing) {
          // Update existing question
          await updateQuestion(questionId, questionData);
          alert('Question updated successfully');
        } else {
          // Create new question
          await createQuestion(questionData);
          alert('Question created successfully');
        }

        // Navigate back to questions list
        navigate('/questions', {
          state: {
            interviewId: interviewId,
            interviewTitle: interviewTitle,
          },
        });
      } catch (error) {
        console.error('Error saving question:', error);
        alert(`Failed to ${isEditing ? 'update' : 'create'} question. Please try again.`);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      alert('Please fill in all required fields before submitting.');
    }
  };

  // Cancel button handler
  const handleCancel = () => {
    if (window.confirm(`Are you sure you want to cancel ${isEditing ? 'editing' : 'adding'} this question?`)) {
      navigate('/questions', {
        state: {
          interviewId: interviewId,
          interviewTitle: interviewTitle,
        },
      });
    }
  };

  // Redirect back to /questions
  const handleBackToQuestions = () => {
    navigate('/questions', {
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
            onClick={handleBackToQuestions}
            className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <svg className="w-5 h-5 mr-1 text-headerblue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <p className='text-headerblue'>Back to Questions</p>
          </button>
        </div>
      </header>

      <div className="container mx-auto p-6 max-w-5xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {isEditing ? 'Edit Question' : 'Add New Question'}
        </h1>
        <p className="text-gray-600 mb-6">Interview: {interviewTitle} (ID: {interviewId})</p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="questionText">
                Question Text *
              </label>
              <textarea
                id="questionText"
                rows="2"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={questionText}
                onChange={handleQuestionTextChange}
                placeholder="Enter your question here"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="difficulty">
                Difficulty Level *
              </label>
              <select
                id="difficulty"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={difficulty}
                onChange={handleDifficultyChange}
                required
                disabled={isSubmitting}
              >
                <option value="">Select difficulty</option>
                <option value="Easy">Easy</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
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
                : (isEditing ? 'Update Question' : 'Add Question')}
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

export default AddQuestions;