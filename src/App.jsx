import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginScreen from './components/auth/LoginScreen';
import StudyPage from './pages/StudyPage';
import LibraryPage from './pages/LibraryPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-parchment-50 dark:bg-dark-bg">
        <div className="animate-pulse font-serif text-xl text-ink-400 dark:text-parchment-400">
          Loading...
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/study" replace />} />
      <Route path="/study" element={<StudyPage />} />
      <Route path="/library" element={<LibraryPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<Navigate to="/study" replace />} />
    </Routes>
  );
}
