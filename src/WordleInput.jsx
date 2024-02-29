import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import './WordInput.css';
import CryptoJS from 'crypto-js'; 

const SECRET_KEY = "your-secret-key"; // Should be a long, random string

function encryptName(plaintext) {
    return CryptoJS.AES.encrypt(plaintext, SECRET_KEY).toString();
}

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

    const handleCopyClick = async () => {
        const word = letters.join('').toLowerCase(); // Ensure the word is in lowercase for the URL
        if (word.length < 5) {
            setShakeError(true);
            setErrorMessage('Word must be 5 letters.');
            setTimeout(() => setShakeError(false), 500);
            return;
        }
        try {
            const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
            if (response.data.length > 0) {
                const url = `${window.location.origin}/${encodeURIComponent(encryptName(word))}`;
                navigator.clipboard.writeText(url)
                    .then(() => {
                        setErrorMessage('Link copied to clipboard!');
                        setTimeout(() => setErrorMessage(''), 2000);
                    })
                    .catch(err => {
                        // Handle any errors here
                        console.error('Could not copy the link: ', err);
                        setErrorMessage('Failed to copy the link.');
                        setTimeout(() => setErrorMessage(''), 2000);
                    });
            } else {
                setShakeError(true);
                setErrorMessage('Word not found.');
                setTimeout(() => setShakeError(false), 500);
                return;
            }
        } catch (error) {
            setShakeError(true);
            setErrorMessage('Word not found.');
            setTimeout(() => setShakeError(false), 500);
            return;
        }
    };

    return (
        <div className="app-container">
            <h1>Welcome to Word Guesser!</h1>
            <p className="intro-text">
                Create a secret word for someone to guess. They will receive hints in a wordle-like fashion.
            </p>
            <form onSubmit={handleSubmit} className="word-input-form">
                <div>
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
                </div>
                <button type="submit" className="submit-button">Play Here</button>
                <button type="button" onClick={handleCopyClick} className="copy-button">
                    <svg className="copy-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    Copy play link
                </button>
            </form>
            <p>
                Play by using the same device or copying the link to the word and sending it to a friend
            </p>
            {errorMessage && <div className="error-message">{errorMessage}</div>}
        </div>
    );
};

export default WordInput;
