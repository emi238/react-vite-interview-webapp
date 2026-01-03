import { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { submitApplicantAnswer, updateApplicantStatus } from '../app';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

/**
 * Interview question interface with speech-to-text recording functionality
 * This component shows one question one by one, answered via audio recording with pause/continue capability,
 * answer submission, and navigation between questions.
 * 
 * @component
 * @state {Object} answers - Dictionary storing recorded answers by question ID
 * @state {boolean} submitting - Flag indicating if answer is being submitted
 * @state {boolean} isPaused - Controls recording pause state (starts paused)
 * 
 * @returns {JSX.Element} - Question interface with recording controls, transcript display, and navigation
 */
function InterviewQuestion() {
  const { interviewId, applicantId, questionId } = useParams();
  const navigate = useNavigate();
  const { questions } = useOutletContext();

  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [isPaused, setIsPaused] = useState(true); 
  
  // Finding current question
  const currentQuestionIndex = questions.findIndex(q => q.id === parseInt(questionId));
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  
  // React-speech-recognition hook
  const {
    transcript,
    listening,
    browserSupportsSpeechRecognition,
    resetTranscript,
    isMicrophoneAvailable
  } = useSpeechRecognition();

  // Initialize question changes
  useEffect(() => {
    setIsPaused(true);
    
    // Load existing answer or reset transcript
    if (answers[questionId]) {
      resetTranscript();
    } else {
      resetTranscript();
    }
  }, [questionId, resetTranscript, answers]);

  // Start recording for the first time
  const handleStartRecording = () => {
    setIsPaused(false);
    SpeechRecognition.startListening({ 
      continuous: true,
      language: 'en-US'
    });
  };

  // Pause recording
  const handlePauseRecording = () => {
    setIsPaused(true);
    SpeechRecognition.stopListening();
  };

  // Continue recording after pause
  const handleContinueRecording = () => {
    setIsPaused(false);
    SpeechRecognition.startListening({ 
      continuous: true,
      language: 'en-US'
    });
  };

  // Navigate to next question or complete interview screen
  const goToNextQuestion = async () => {
    if (listening) {
      handlePauseRecording();
    }
    
    setSubmitting(true);
    try {
      const answerToSubmit = transcript || '';

      const answerData = {
        interview_id: parseInt(interviewId),
        question_id: parseInt(questionId),
        applicant_id: parseInt(applicantId),
        answer: answerToSubmit
      };
      
      await submitApplicantAnswer(answerData);

      setAnswers(prev => ({
        ...prev,
        [questionId]: answerToSubmit
      }));

      if (isLastQuestion) {
        await updateApplicantStatus(parseInt(applicantId), 'Completed');
      }
    } catch (error) {
      window.alert(`Error saving answer, please try again.`);
    } finally {
      setSubmitting(false);
    }

    if (!isLastQuestion) {
      const nextQuestionId = questions[currentQuestionIndex + 1].id;
      navigate(`/applicant/${applicantId}/interview/${interviewId}/question/${nextQuestionId}`);
    } else {
      navigate(`/applicant/${applicantId}/interview/${interviewId}/complete`);
    }
  };

  // Determine which button to show based on state
  const getRecordingButton = () => {
    if (!listening && isPaused && !transcript) {
      // Not started yet
      return (
        <button 
          onClick={handleStartRecording}
          className="flex items-center gap-2 bg-green-100 text-green-800 border border-green-300 hover:bg-green-200 rounded-md py-3 px-6"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
          </svg>
          Start Recording
        </button>
      );
    } else if (listening && !isPaused) {
      // recording and need to show pause button
      return (
        <button 
          onClick={handlePauseRecording}
          className="flex items-center gap-2 bg-yellow-100 text-yellow-800 border border-yellow-300 hover:bg-yellow-200 rounded-md py-3 px-6"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
          </svg>
          Pause Recording
        </button>
      );
    } else if (!listening && isPaused && transcript) {
      // paused but need to show continue button
      return (
        <button 
          onClick={handleContinueRecording}
          className="flex items-center gap-2 bg-blue-100 text-blue-800 border border-blue-300 hover:bg-blue-200 rounded-md py-3 px-6"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
          </svg>
          Continue Recording
        </button>
      );
    }
  };

  // Error state if question cannot be found
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">Question Not Found or Removed.</h2>
        </div>
      </div>
    );
  }

  // Render browser compatibility error if speech recognition is unsupported
  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <span className="text-red-600 text-lg">Browser doesn't support speech recognition, try Chrome as per ReadMe.</span>
      </div>
    );
  }

  // Check if microphone is available
  if (!isMicrophoneAvailable) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <span className="text-red-600 text-lg">Microphone access is blocked. Please allow microphone permissions and refresh.</span>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded block mx-auto"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Question */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
            Question {currentQuestionIndex + 1}:
          </h2>
          <div className="border border-black bg-question-quote rounded-lg p-6 mb-6 text-center">
            <h1 className="text-xl">{currentQuestion.question}</h1>
          </div>
          
          {/* Recording */}
          <div className="mb-6">
            <p className="text-lg mb-3 text-center">
              {!transcript ? 'Click below to start recording your audio.' : 'Unpause to continue speaking.'}
            </p>
            
            <div className="flex flex-col items-center mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-md font-medium">
                  Status: <span className={
                    listening ? "text-green-600" : 
                    isPaused && transcript ? "text-blue-600" : "text-gray-600"
                  }>
                    {listening ? 'Recording...' : 
                     isPaused && transcript ? 'Paused' : 'Ready to Start'}
                  </span>
                </span>
              </div>
            </div>
            
            <div className="flex justify-center gap-4 mb-6">
              {getRecordingButton()}
            </div>            
          </div>
        </div>

        {/* Navigation button */}
        <div className="flex justify-end">
          <button
            onClick={goToNextQuestion}
            disabled={submitting}
            className="bg-primary hover:bg-headerblue disabled:bg-gray-400 text-white py-2 px-8 rounded-lg"
          >
            <h3>{submitting ? 'Saving...' : isLastQuestion ? 'Complete Interview' : 'Next Question'} </h3>
          </button>
        </div>
      </div>
    </div>
  );
}

export default InterviewQuestion;