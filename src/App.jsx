import React, { useState } from 'react';
import Home from './pages/Home';
import IndexPage from './pages/IndexPage';

function App() {
  const [view, setView] = useState('workbench'); // 'workbench' | 'index'

  return (
    <>
      {view === 'workbench' ? (
        <Home onNavigate={setView} />
      ) : (
        <IndexPage onNavigate={setView} />
      )}
    </>
  )
}

export default App;
