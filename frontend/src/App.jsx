import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Topics from './pages/Topics';
import RandomQuiz from './pages/RandomQuiz';
import QuizAttempt from './pages/QuizAttempt';
import Results from './pages/Results';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Analytics from './pages/Analytics';
import SubtopicQuizzes from './pages/SubtopicQuizzes';
import Formulas from './pages/Formulas';
import AdminDashboard from './pages/admin/Dashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/quizzes" element={<Topics />} />
          <Route path="/formulas" element={<Formulas />} />
          <Route path="/topics" element={<Topics />} />
          <Route path="/topics/:topicId" element={<Topics />} />
          <Route path="/subtopic/:subtopicId" element={<SubtopicQuizzes />} />
          <Route path="/random" element={<RandomQuiz />} />
          <Route path="/quiz/:quizId" element={<QuizAttempt />} />
          <Route path="/results/:attemptId" element={<Results />} />
          <Route path="/results/local" element={<Results />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/analytics" element={<Analytics />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
