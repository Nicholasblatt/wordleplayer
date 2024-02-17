import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, Navigate } from 'react-router-dom';
import WordInput from './WordleInput';
import GuessingGame from './GuessingGame';

function App() {
  const [initialWord, setInitialWord] = useState('');
  const [allowGuessRoute, setAllowGuessRoute] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // If initialWord is set, allow navigating to /guess and navigate there
    if (initialWord) {
      setAllowGuessRoute(true); // Allow access to /guess route
      navigate('/guess');
    }
  }, [initialWord, navigate]); // Depend on initialWord and navigate function

  const handleWordSubmit = (word) => {
    setInitialWord(word); // This will trigger the useEffect to navigate to /guess
  };

  // Reset the initialWord and any other state as necessary
  const resetGame = () => {
    setInitialWord('');
    // other resets if necessary
  };

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<WordInput onWordSubmit={handleWordSubmit} />} />
        <Route path="/guess" element={
          allowGuessRoute 
            ? <GuessingGame initialWord={initialWord} onReset={resetGame} />
            : <Navigate replace to="/" />
        } />
      </Routes>
    </div>
  );
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;
