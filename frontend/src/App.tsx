import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';

function App() {
  const { user, token } = useAuth();
  const [view, setView] = useState<'login' | 'register'>('login');

  // If user is not authenticated, show Login or Register page
  if (!token || !user) {
    if (view === 'register') {
      return (
        <Register onNavigateToLogin={() => setView('login')} />
      );
    }

    return (
      <Login onNavigateToRegister={() => setView('register')} />
    );
  }

  // Authenticated Dashboard view
  return (
    <Dashboard />
  );
}

export default App;
