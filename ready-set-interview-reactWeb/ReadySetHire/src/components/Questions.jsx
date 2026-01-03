import { useState, useEffect } from 'react';
import { getQuestionsByInterview, deleteQuestion, createQuestion } from '../app'; 
import { useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';

// Zod schema for client-side validation, defines expected structure to be returned by API
const QuestionSchema = z.object({
  questions: z.array(z.object({
    question: z.string(),
    difficulty: z.enum(["Easy", "Intermediate", "Advanced"])
  })).nonempty(),
});

// Promise cache keyed by job role to avoid redundant API calls
const questionPromiseCache = new Map();

/**
 * Fetch AI-generated questions from the LLM server
 * @param {string} job_role - The job role to generate questions for
 * @returns {Promise<Array>} - Array of validated question objects
 * @throws {Error} - When API request fails or response validation fails
 */
function fetchAIQuestions(job_role) {
  return fetch("http://localhost:3001/api/generate-question", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ job_role }),
  }).then(async (res) => {
    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      throw new Error(msg || "Failed to generate questions");
    }
    const data = await res.json();
    const parsed = QuestionSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error("Questions did not match expected schema");
    }
    return parsed.data.questions;
  });
}

/**
 * Get or create a cached promise for AI questions generation
 * @param {string} job_role - The job role to generate questions for
 * @returns {Promise} - Cached promise for the question generation request
 */
function getQuestionPromise(job_role) {
  if (!questionPromiseCache.has(job_role)) {
    questionPromiseCache.set(job_role, fetchAIQuestions(job_role));
  }
  return questionPromiseCache.get(job_role);
}

/**
 * Display and manage questions for a specific interview with AI integration
 * This component shows manually created questions and provides AI-generated suggestions
 * based on the interview's job role
 * 
 * @component
 * @param {Object} location - React Router location object containing state
 * @param {string} location.state.interviewId - ID of the associated interview
 * @param {string} location.state.interviewTitle - Title of the associated interview
 * @param {string} location.state.interviewJobRole - Job role from interviews to be parsed into AI for question generation
 * 
 * @state {Array} questions - List of manually created question objects
 * @state {Array} aiQuestions - List of AI-generated question suggestions
 * @state {boolean} loading - Flag indicating if manual questions are loading
 * @state {string|null} error - Error message for manual questions loading
 * @state {boolean} generating - Flag indicating if AI questions are being generated
 * @state {string|null} generationError - Error message for AI generation process
 * 
 * @returns {JSX.Element} - Rendered questions management interface with AI integration
 */
function Questions() {
  const location = useLocation();
  const navigate = useNavigate();

  const interviewId = location.state?.interviewId;
  const interviewTitle = location.state?.interviewTitle;
  const interviewJobRole = location.state?.interviewJobRole; 

  const [questions, setQuestions] = useState([]);
  const [aiQuestions, setAiQuestions] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState(null);

  // Load questions from API when component mounts
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!interviewId) {
        setError("Interview ID is missing");
        setLoading(false);
        return;
      }

      try {
        const data = await getQuestionsByInterview(interviewId);
        setQuestions(data);
      } catch (err) {
        setError("Failed to load questions. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [interviewId]);

  // Generate AI questions
  const generateAIQuestions = async () => {
    if (!interviewJobRole) {
      setGenerationError("Please add a job role to the interview first");
      return;
    }

    setGenerating(true);
    setGenerationError(null);
    
    try {
      const aiQuestions = await getQuestionPromise(interviewJobRole);
      setAiQuestions(aiQuestions);
    } catch (err) {
      setGenerationError(err.message || "Failed to generate questions");
    } finally {
      setGenerating(false);
    }
  };

  // Add AI question to interview
  const addAIQuestion = async (questionText, difficulty) => {
    try {
      const questionData = {
        interview_id: interviewId,
        question: questionText,
        difficulty: difficulty,
      };

      await createQuestion(questionData);
      
      // Refresh questions list
      const updatedQuestions = await getQuestionsByInterview(interviewId);
      setQuestions(updatedQuestions);
      
      // Remove the added question from AI suggestions
      setAiQuestions(prev => prev.filter(q => q.question !== questionText));
      
    } catch (err) {
      alert("Failed to add question. Please try again.");
    }
  };

  // Adds Questions via sending params to API as 'POST'
  const handleAddQuestion = () => {
    navigate('/AddQuestions', { 
      state: { 
        interviewId: interviewId,   
        interviewTitle: interviewTitle 
      } 
    });
  };

  // Navigates to add questions to edit interviews
  const handleEditQuestion = (questionId) => {
    const questionToEdit = questions.find(q => q.id === questionId);
    
    if (questionToEdit) {
      navigate('/AddQuestions', { 
        state: { 
          questionId: questionId,
          interviewId: interviewId,   
          interviewTitle: interviewTitle,
        } 
      });
    }
  };

  // Delete interview
  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await deleteQuestion(questionId);
        setQuestions(questions.filter(q => q.id !== questionId));
      } catch (err) {
        alert("Failed to delete question. Please try again.");
      }
    }
  };

  // Navigates back to the interview interface
  const handleBackToInterviews = () => {
    navigate('/interviews');
  };
 
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
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

      <main className="max-w-7xl mx-auto mt-6 px-4 sm:px-6 lg:px-8 py-8">
        {/* Interview Info Card*/}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Interview: {interviewTitle}</h2>
          {interviewJobRole && (
            <p className="text-gray-600 mb-2">Role: {interviewJobRole}</p>
          )}
          {loading ? (
            <p className="text-gray-500">Loading questions...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <p className="text-gray-600 mt-2">
              {questions.length === 0 
                ? 'Questions: 0' 
                : `Created Questions: ${questions.length}`}
            </p>
          )}
        </div>

        {/* Add Question Button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={handleAddQuestion}
            className="flex items-center bg-primary hover:bg-headerblue text-white font-medium py-2 px-4 rounded-lg transition duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Question
          </button>
        </div>

        {/* Two column-stacked containers */}
        <div className="flex flex-col lg:flex-col gap-6">
          
          {/* Questions Table */}
          <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Questions
                </th>
                <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Difficulty
                </th>
                <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : questions.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                    No questions made yet for interview: {interviewTitle}. <br></br> Click "Add Question" to get started.
                  </td>
                </tr>
              ) : (
                questions.map((question) => (
                  <tr key={question.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{question.question}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-lg
                        ${question.difficulty === 'Easy' ? 'bg-green-100 text-green-800 px-9 border border-green-200' : 
                          question.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : 
                          'bg-red-100 text-red-800 px-5 border border-red-200'}`}>
                        {question.difficulty}
                      </span>
                    </td>
                    <td className="px-1 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-8">
                        <button 
                          onClick={() => handleEditQuestion(question.id)}
                          className="flex items-center justify-center text-gray-600 hover:text-gray-800 text-sm font-medium">
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="flex items-center justify-center text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
          
          <span className={`flex flex-col mt-6 px-3 py-3 border border-button-active text-xl bg-headerblue text-white shadow-md rounded-lg`}>
            <h1 className='flex justify-center'>Wanting inspiration for questions?</h1>
            <p className='flex justify-center text-sm'>Generate and Quick Add AI-generated questions based on the interview role description</p>
          </span>
          
          {/* AI Generation Section */}
          <div className="flex flex-col bg-white rounded-lg shadow-md px-4">
            <button 
              onClick={generateAIQuestions}
              disabled={generating || !interviewJobRole}
              className="bg-primary hover:bg-headerblue text-white font-medium py-2 px-4 rounded-lg transition duration-200 mb-4"
            >
              {generating ? 'Generating Questions...' : 'Generate Interview Questions'}
            </button>
            
            {generationError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-red-600">{generationError}</p>
              </div>
            )}
          </div>

          {/* AI Generated Questions */}
          {aiQuestions.length > 0 && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden flex-1">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">
                      AI Generated Questions
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">
                      Difficulty
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">
                      Quick Add
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {aiQuestions.map((question, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-normal">
                        <div className="text-sm font-medium text-gray-900">{question.question}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-lg
                          ${question.difficulty === 'Easy' ? 'bg-green-100 text-green-800 px-9 border border-green-200' : 
                            question.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : 
                            'bg-red-100 text-red-800 px-5 border border-red-200'}`}>
                          {question.difficulty}
                        </span>
                      </td>
                      <td className="px-1 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-8 px-3">
                          <button 
                            onClick={() => addAIQuestion(question.question, question.difficulty)}
                            className="flex items-center justify-center text-primary hover:text-headerblue text-sm">
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add Question
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Questions;