import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Resumes from './pages/Resumes';
import MatchJob from './pages/MatchJob';
import MatchResult from './pages/MatchResult';
import Interview from './pages/Interview';
import PromptLab from './pages/PromptLab';
import AnalyzeResume from './pages/AnalyzeResume';
import ImproveResume from './pages/ImproveResume';

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-navy-600">Loading...</div>
      </div>
    );
  }
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/app"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="resumes" element={<Resumes />} />
        <Route path="analyze" element={<AnalyzeResume />} />
        <Route path="improve" element={<ImproveResume />} />
        <Route path="match" element={<MatchJob />} />
        <Route path="match/:id" element={<MatchResult />} />
        <Route path="interview" element={<Interview />} />
        <Route path="prompt-lab" element={<PromptLab />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
