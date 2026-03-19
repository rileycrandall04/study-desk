import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut } from 'lucide-react';
import ThemeToggle from '../components/shared/ThemeToggle';
import BackupRestore from '../components/shared/BackupRestore';
import { useAuth } from '../contexts/AuthContext';

/**
 * Settings page — appearance + data management.
 */
export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-parchment-50 dark:bg-dark-bg">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-parchment-200 dark:border-dark-border">
        <button
          onClick={() => navigate('/study')}
          className="p-1.5 rounded-lg text-ink-300 dark:text-parchment-400 hover:bg-parchment-100 dark:hover:bg-dark-muted transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-serif text-xl font-bold text-ink-600 dark:text-parchment-200">Settings</h1>
      </div>

      <div className="max-w-lg mx-auto px-6 py-6 space-y-6">
        {/* Appearance */}
        <div className="card">
          <h2 className="font-serif text-base font-semibold text-ink-500 dark:text-parchment-200 mb-3">Appearance</h2>
          <div className="flex items-center justify-between">
            <span className="text-sm font-sans text-ink-400 dark:text-parchment-400">Theme</span>
            <ThemeToggle showLabel />
          </div>
        </div>

        {/* Data */}
        <div className="card">
          <h2 className="font-serif text-base font-semibold text-ink-500 dark:text-parchment-200 mb-3">Data</h2>
          <p className="text-xs text-ink-300 dark:text-parchment-500 mb-3">
            Export your journal entries as a JSON backup or restore from a previous backup.
          </p>
          <BackupRestore />
        </div>

        {/* Account */}
        <div className="card">
          <h2 className="font-serif text-base font-semibold text-ink-500 dark:text-parchment-200 mb-3">Account</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-sans text-ink-400 dark:text-parchment-400">
                {user?.displayName || user?.email || 'Signed in'}
              </p>
              {user?.email && user?.displayName && (
                <p className="text-xs text-parchment-400 dark:text-parchment-500">{user.email}</p>
              )}
            </div>
            <button
              onClick={logout}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        </div>

        {/* About */}
        <div className="card">
          <h2 className="font-serif text-base font-semibold text-ink-500 dark:text-parchment-200 mb-3">About</h2>
          <p className="text-sm text-ink-300 dark:text-parchment-400">
            Study Desk v0.1.0
          </p>
          <p className="text-xs text-parchment-400 dark:text-parchment-500 mt-1">
            A scripture study companion for journaling and research.
          </p>
        </div>
      </div>
    </div>
  );
}
