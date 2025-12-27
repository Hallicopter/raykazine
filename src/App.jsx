import React, { useState } from 'react';
import Home from './pages/Home';
import IndexPage from './pages/IndexPage';
import ContentManager from './pages/ContentManager';

function App() {
  const [view, setView] = useState('workbench'); // 'workbench' | 'index' | 'manager'

  return (
    <>
      {view === 'workbench' ? (
        <Home onNavigate={setView} />
      ) : view === 'index' ? (
        <IndexPage onNavigate={setView} />
      ) : (
        <ContentManager onNavigate={setView} />
      )}
    </>
  )
}

export default App;
