import React, { useState } from 'react';
import Home from './pages/Home';
import IndexPage from './pages/IndexPage';
import ContentManager from './pages/ContentManager';

function App() {
  const [view, setView] = useState('workbench'); // 'workbench' | 'index' | 'manager'
  const isDevelopment = import.meta.env.DEV;

  // Only allow manager in development
  const handleNavigate = (newView) => {
    if (newView === 'manager' && !isDevelopment) {
      console.warn('Content Manager only available in development mode');
      return;
    }
    setView(newView);
  };

  return (
    <>
      {view === 'workbench' ? (
        <Home onNavigate={handleNavigate} isDevelopment={isDevelopment} />
      ) : view === 'index' ? (
        <IndexPage onNavigate={handleNavigate} />
      ) : isDevelopment && view === 'manager' ? (
        <ContentManager onNavigate={handleNavigate} />
      ) : (
        <Home onNavigate={handleNavigate} isDevelopment={isDevelopment} />
      )}
    </>
  )
}

export default App;
