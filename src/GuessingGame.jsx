import React, { useState, useRef, useEffect } from 'react';
import './GuessingGame.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useParams, Navigate } from 'react-router-dom';
import CryptoJS from 'crypto-js'; 

const SECRET_KEY = "your-secret-key"; // Should be a long, random string

function decryptName(ciphertext) {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
}

const GuessingGame = ({ initialWord, onReset, fromParams = false }) => {
  const [guesses, setGuesses] = useState([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [currentGuess, setCurrentGuess] = useState(Array(5).fill(''));
  const [errorMessage, setErrorMessage] = useState('');
  const [shakeError, setShakeError] = useState(false);
  const [validInput, setValidInput] = useState(false);

  const { wordParam } = useParams();
  initialWord = fromParams ? decryptName(decodeURIComponent(wordParam)).toUpperCase() : initialWord;

  const letterRefs = useRef(Array(5).fill().map(() => React.createRef()));
  const navigate = useNavigate();

  const maxGuesses = 6;
  const isGameOver = guesses.length >= maxGuesses && !isCorrect;

  const playAgain = () => {
    setGuesses([]);
    setIsCorrect(false);
    setCurrentGuess(Array(5).fill(''));
    if (onReset) {
      onReset();
    }
    navigate('/');
  };

  useEffect(() => {
    letterRefs.current[0].current?.focus();
  }, []);

  const handleBackspace = (index) => (event) => {
    if (event.key === 'Backspace' && !currentGuess[index] && index > 0) {
      letterRefs.current[index - 1].current.focus();
    }
  };

  const handleGuessChange = (index) => (event) => {
    const value = event.target.value.toUpperCase();
    setCurrentGuess((prev) =>
      prev.map((char, charIndex) => (charIndex === index ? value : char))
    );
    if (value && index < 4) {
      letterRefs.current[index + 1].current.focus();
    }
  };

  const handleGuessSubmit = async (event) => {
    event.preventDefault();
    const guess = currentGuess.join('').toLowerCase();
    if (guess.length === 5 && !isGameOver) {
      try {
        const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${guess}`);
        if (response.data.length > 0) {
          setGuesses((prevGuesses) => [...prevGuesses, guess.toUpperCase()]);
          setIsCorrect(guess.toUpperCase() === initialWord.toUpperCase());
          setCurrentGuess(Array(5).fill(''));
          setValidInput(true);
          setTimeout(() => setValidInput(false), 500);
          setErrorMessage('');
          if (guesses.length < maxGuesses - 1) {
            letterRefs.current[0].current.focus();
          }
        } else {
          setShakeError(true);
          setErrorMessage('Word not found.');
          setTimeout(() => setShakeError(false), 500);
        }
      } catch (error) {
        setShakeError(true);
        setErrorMessage('Word not found.');
        setTimeout(() => setShakeError(false), 500);
      }
    }
  };

  const getLetterClass = (letter, position, guess, initialWord) => {
    const wordArray = initialWord.split('');
    const correctStatus = guess.split('').map((g, i) => g === wordArray[i]);

    if (correctStatus[position]) {
      return 'correct-letter';
    }

    if (wordArray.includes(letter)) {
      const correctOccurrencesInGuess = guess.split('').reduce((total, currentLetter, index) => 
        total + (currentLetter === letter && correctStatus[index] ? 1 : 0), 0);
      const occurrencesInWord = wordArray.reduce((total, currentLetter) => 
        total + (currentLetter === letter ? 1 : 0), 0);

      if (correctOccurrencesInGuess >= occurrencesInWord) {
        return '';
      }

      const pastOccurrencesInGuess = guess.substring(0, position).split('').filter((g) => g === letter).length;
      if (pastOccurrencesInGuess < occurrencesInWord) {
        return 'misplaced-letter';
      }
    }

    return '';
  };


  if( initialWord === '') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="guessing-game-container">
      <h2>Guess the Word!</h2>
      <form onSubmit={handleGuessSubmit} className="guess-form">
          <div>
        {currentGuess.map((letter, index) => (
          <input
            key={index}
            ref={letterRefs.current[index]}
            type="text"
            maxLength="1"
            className={`letter-box ${shakeError ? 'shake-animation' : ''} ${validInput ? 'green-border' : ''}`}
            value={letter}
            onChange={handleGuessChange(index)}
            onKeyDown={handleBackspace(index)}
            disabled={isCorrect}
            pattern="[A-Za-z]"
          />
          ))}
          </div>
        <button type="submit" className="guess-button" disabled={isCorrect}>Guess</button>
      </form>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      <div className="guesses-container">
        {guesses.map((userGuess, guessIndex) => (
          <div key={guessIndex} className="guess">
            {userGuess.split('').map((char, charIndex) => {
              const letterClass = getLetterClass(char, charIndex, userGuess, initialWord);
              return (
                <div key={charIndex} className={`guessed-letter ${letterClass}`}>
                  {char}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      {isCorrect && <div className="congratulations-message">Congratulations! You guessed the word!</div>}
      {isGameOver && !isCorrect && (
        <div className="game-over-message">
          Game Over! <span className="revealed-word">The word was {initialWord}.</span>
        </div>
      )}
      {(isCorrect || isGameOver) && (
        <button onClick={playAgain} className="play-again-button">
          Play Again
        </button>
      )}
    </div>
  );
};

export default GuessingGame;
