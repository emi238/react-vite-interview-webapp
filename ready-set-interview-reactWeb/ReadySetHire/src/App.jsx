import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Header from "./components/Header";
import Interviews from "./components/Interviews";
import CreateInterview from "./components/CreateInterview";
import Questions from "./components/Questions";
import Applicants from "./components/Applicants";
import AddApplicants from './components/AddApplicants';
import AddQuestions from './components/AddQuestions';
import ViewApplicantAnswers from './components/ViewApplicantAnswers';
import TakeInterview from './components/TakeInterview'; 
import TakeInterviewWelcome from './components/TakeInterviewWelcome';
import TakeInterviewQuestions from './components/TakeInterviewQuestions';
import TakeInterviewComplete from './components/TakeInterviewComplete';

function App() {
  return (
    <Router>
      <div className="App min-h-screen flex flex-col">
        <Routes>
          <Route path="/" element={<Navigate to="/interviews" replace />} />

          <Route 
            path="/interviews" 
            element={
              <>
                <Header 
                  title="Interview Management" 
                  subtitle="Manage your interview campaigns" 
                  buttonText=" + Create Interview"
                />
                <main className="flex-grow">
                  <Interviews />
                </main>
              </>
            } 
          />

          <Route 
            path="/createinterview" 
            element={
              <>
                <Header 
                  title="Create Interview" 
                  subtitle="Fill out the form to create a new interview" 
                  buttonText=" Back to interviews"
                />
                <main className="flex-grow"> 
                  <CreateInterview />
                </main>
              </>
            }
          />

          <Route 
            path="/addapplicants" 
            element={
              <>
                <Header 
                  title="Applicants" 
                  subtitle="Manage your applicants" 
                />
                <main className="flex-grow">
                  <AddApplicants />
                </main>
              </>
            } 
          />

          <Route 
            path="/questions" 
            element={
              <>
                <Header 
                  title="Questions Management" 
                  subtitle="Manage your interview questions" 
                />
                <main className="flex-grow">
                  <Questions />
                </main>
              </>
            } 
          />

          <Route 
            path="/applicants" 
            element={
              <>
                <Header 
                  title="Applicant Management" 
                  subtitle="Manage your applicants" 
                />
                <main className="flex-grow">
                  <Applicants />
                </main>
              </>
            } 
          />

          <Route 
            path="/addquestions" 
            element={
              <>
                <Header 
                  title="Questions Management" 
                  subtitle="Manage your questions" 
                />
                <main className="flex-grow">
                  <AddQuestions />
                </main>
              </>
            } 
          />

          <Route 
            path="/viewapplicantanswers" 
            element={
              <>
                <Header 
                  title="Applicant Answers" 
                  subtitle="View applicant response" 
                />
                <main className="flex-grow">
                  <ViewApplicantAnswers />
                </main>
              </>
            } 
          />

          <Route 
            path="/applicant/:applicantId/interview/:interviewId" 
            element={<TakeInterview />} 
          >
            <Route index element={<TakeInterviewWelcome />} />
            <Route path="welcome" element={<TakeInterviewWelcome />} />
            <Route path="question/:questionId" element={<TakeInterviewQuestions />} />
            <Route path="complete" element={<TakeInterviewComplete />} />
          </Route>
        </Routes>

        <footer className="bg-headerblue p-4 text-center text-white">
          <p>&copy; {new Date().getFullYear()} ReadySetHire. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;