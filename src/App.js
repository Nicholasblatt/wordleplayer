import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useParams, useNavigate, Navigate } from 'react-router-dom';
import WordInput from './WordleInput';
import GuessingGame from './GuessingGame';

function App() {
  const [initialWord, setInitialWord] = useState('');
  const [allowGuessRoute, setAllowGuessRoute] = useState(false);
  const navigate = useNavigate();

  let { wordParam } = useParams(); // Get the word parameter from the URL

  useEffect(() => {
    // If there's a word in the URL path, use it to start the game
    if (wordParam) {
      setInitialWord(wordParam);
      setAllowGuessRoute(true);
    } else if (initialWord) {
      // Navigate to the guessWord route if initialWord is set through the form
      setAllowGuessRoute(true);
      navigate('/guessWord');
    }
  }, [wordParam, initialWord, navigate]);

  const handleWordSubmit = (word) => {
    setInitialWord(word);
  };

  const resetGame = () => {
    setInitialWord('');
    setAllowGuessRoute(false);
    navigate('/');
  };

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<WordInput onWordSubmit={handleWordSubmit} />} />
        <Route path="/:wordParam" element={<GuessingGame initialWord={initialWord} onReset={resetGame} fromParams />} />
        <Route path="/guessWord" element={
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
