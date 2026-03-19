import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithGoogle, signOut } from '../firebase/auth';
import { hasConfig } from '../firebase/config';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!hasConfig) {
      setUser(null);
      return;
    }
    return onAuthStateChanged(setUser);
  }, []);

  const login = async () => {
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message);
    }
  };

  const logout = async () => {
    await signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading: user === undefined, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
