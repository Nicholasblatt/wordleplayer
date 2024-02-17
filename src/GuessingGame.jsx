import React, { useState, useRef, useEffect } from 'react';
import './GuessingGame.css'; // Make sure this is the correct path to your CSS file
import { useNavigate } from 'react-router-dom'; // Import useNavigate


const GuessingGame = ({ initialWord, onReset }) => {
  const [guesses, setGuesses] = useState([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [currentGuess, setCurrentGuess] = useState(Array(5).fill(''));
  const letterRefs = useRef(Array(5).fill().map(() => React.createRef()));
  const navigate = useNavigate(); // Hook for navigation
  const maxGuesses = 6; // Maximum number of incorrect guesses allowed
  // Check if the game is over due to too many incorrect guesses
  const isGameOver = guesses.length >= maxGuesses && !isCorrect;

  // Call this function when you want to reset the game state and navigate back
  const playAgain = () => {
    // Reset the game state
    setGuesses([]); // Resets the guesses array
    setIsCorrect(false); // Resets the isCorrect flag
    setCurrentGuess(Array(5).fill('')); // Resets the current guess
    // Call the onReset prop if it exists to reset the parent state
    if (onReset) {
      onReset();
    }
    // Navigate back to the home screen
    navigate('/');
  };

  useEffect(() => {
    letterRefs.current[0].current.focus(); // Automatically focus the first input on mount
  }, []);

  const handleBackspace = (index) => (event) => {
    if (event.key === 'Backspace' && !currentGuess[index] && index > 0) {
      // Set focus to previous input box if current is empty and it's not the first box
      letterRefs.current[index - 1].current.focus();
    }
  };

  const handleGuessChange = (index) => (event) => {
    const value = event.target.value.toUpperCase();
    setCurrentGuess((prev) =>
      prev.map((char, charIndex) => (charIndex === index ? value : char))
    );
    // Automatically move to the next input after entering a letter
    if (value && index < 4) {
      letterRefs.current[index + 1].current.focus();
    }
  };

  const handleGuessSubmit = (event) => {
    event.preventDefault();
    const guess = currentGuess.join('');
    if (guess.length === 5) {
      if (!isGameOver) {
        setGuesses((prevGuesses) => [...prevGuesses, guess]);
        setIsCorrect(guess === initialWord);
        setCurrentGuess(Array(5).fill(''));
        // Reset focus back to the first input
        if (guesses.length < maxGuesses - 1) {
          letterRefs.current[0].current.focus();
        }
      }
    }
  };

  const getLetterClass = (letter, position, guess, initialWord) => {
    // Convert the initialWord to an array to manipulate it
    const wordArray = initialWord.split('');

    // Create an array representing the correct status of each letter in the guess
    const correctStatus = guess.split('').map((g, i) => g === wordArray[i]);

    // If the letter is correct and in the correct position, mark it green
    if (correctStatus[position]) {
      return 'correct-letter'; // Correct letter in the correct spot
    }

    // If the letter is in the word but not in the correct position
    if (wordArray.includes(letter)) {
      // Count the number of occurrences of this letter in the guess that are in the correct position
      const correctOccurrencesInGuess = guess.split('').reduce((total, currentLetter, index) => {
        return total + (currentLetter === letter && correctStatus[index] ? 1 : 0);
      }, 0);

      // Count the number of occurrences of this letter in the initial word
      const occurrencesInWord = wordArray.reduce((total, currentLetter) => {
        return total + (currentLetter === letter ? 1 : 0);
      }, 0);

      // If there are more or equal correct occurrences in the guess than in the word,
      // then this letter should not be marked yellow because it's "used up" by the correct positions.
      if (correctOccurrencesInGuess >= occurrencesInWord) {
        return ''; // Not marked with a color
      }

      // Finally, check the guess up to the current position to make sure we don't mark more letters yellow than needed
      const pastOccurrencesInGuess = guess.substring(0, position).split('').filter((g) => g === letter).length;

      if (pastOccurrencesInGuess < occurrencesInWord) {
        return 'misplaced-letter'; // Correct letter in the wrong spot
      }
    }

    return ''; // No background for incorrect letters
  };


  return (
    <div className="guessing-game-container">
      <h2>Guess the Word!</h2>
      <form onSubmit={handleGuessSubmit} className="guess-form">
        {currentGuess.map((letter, index) => (
          <input
            key={index}
            ref={letterRefs.current[index]}
            type="text"
            maxLength="1"
            className="letter-box"
            value={letter}
            onChange={handleGuessChange(index)}
            onKeyDown={handleBackspace(index)}
            disabled={isCorrect}
            pattern="[A-Za-z]"
          />
        ))}
        <button type="submit" className="guess-button" disabled={isCorrect}>Guess</button>
      </form>
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
