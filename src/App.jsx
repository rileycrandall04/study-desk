import { Routes, Route, Navigate } from 'react-router-dom';
import StudyPage from './pages/StudyPage';
import LibraryPage from './pages/LibraryPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
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
