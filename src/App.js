import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, Navigate } from 'react-router-dom';
import WordInput from './WordleInput';
import GuessingGame from './GuessingGame';

function App() {
  const [initialWord, setInitialWord] = useState('');
  const [allowGuessRoute, setAllowGuessRoute] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (initialWord) {
      setAllowGuessRoute(true);
      navigate('/guess');
    }
  }, [initialWord, navigate]);

  const handleWordSubmit = (word) => {
    setInitialWord(word);
  };

  const resetGame = () => {
    setInitialWord('');
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
