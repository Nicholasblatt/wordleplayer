import React, { useState, useRef, useEffect } from 'react';
import './WordInput.css';
import axios from 'axios';

const WordInput = ({ onWordSubmit }) => {
    const [letters, setLetters] = useState(Array(5).fill(''));
    const letterRefs = useRef(Array(5).fill().map(() => React.createRef()));
    const [errorMessage, setErrorMessage] = useState('');
    const [shakeError, setShakeError] = useState(false);

    useEffect(() => {
        letterRefs.current[0].current.focus();
    }, []);

    const handleKeyDown = (index) => (event) => {
        if (event.key === 'Backspace' && !letters[index] && index > 0) {
            letterRefs.current[index - 1].current.focus();
        }
    };

    const handleChange = (index) => (event) => {
        const newLetters = [...letters];
        newLetters[index] = event.target.value.toUpperCase().slice(0, 1);
        setLetters(newLetters);

        if (index < 4 && newLetters[index].length === 1) {
            letterRefs.current[index + 1].current.focus();
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const word = letters.join('');
        if (word.length < 5) {
            setShakeError(true);
            setErrorMessage('Word must be 5 letters.');
            setTimeout(() => setShakeError(false), 500);
            return;
        }
        try {
            const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
            if (response.data.length > 0) {
                onWordSubmit(word);
                setErrorMessage('');
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
    };

    return (
        <div className="app-container">
            <h1>Welcome to Word Guesser!</h1>
            <p className="intro-text">
                Create a secret word for someone to guess. They will receive hints in a wordle-like fashion.
            </p>
            <form onSubmit={handleSubmit} className="word-input-form">
                {letters.map((letter, index) => (
                    <input
                        key={index}
                        ref={letterRefs.current[index]}
                        type="text"
                        maxLength="1"
                        className={`letter-box ${shakeError ? 'shake-animation' : ''}`}
                        value={letter}
                        onChange={handleChange(index)}
                        onKeyDown={handleKeyDown(index)}
                        pattern="[A-Za-z]"
                        onInput={(e) => e.target.value = e.target.value.replace(/[^A-Za-z]/g, '')}
                    />
                ))}
                <button type="submit" className="submit-button">Set Word</button>
            </form>
            {errorMessage && <div className="error-message">{errorMessage}</div>}
        </div>
    );
};

export default WordInput;
