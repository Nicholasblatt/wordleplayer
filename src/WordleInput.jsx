import axios from 'axios';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import './WordInput.css';
import CryptoJS from 'crypto-js'; 

const SECRET_KEY = "your-secret-key"; // Should be a long, random string

function encryptName(plaintext) {
    return CryptoJS.AES.encrypt(plaintext, SECRET_KEY).toString();
}

const WordInput = ({ onWordSubmit }) => {
    const [generatedLink, setGeneratedLink] = useState(''); // State to store the generated link
    const [letters, setLetters] = useState(Array(5).fill(''));
    const letterRefs = useRef(Array(5).fill().map(() => React.createRef()));
    const [errorMessage, setErrorMessage] = useState('');
    const [shakeError, setShakeError] = useState(false);

    useEffect(() => {
        letterRefs.current[0].current.focus();
    }, []);

    const generateLink = async (word) => {
        try {
            const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
            if (response.data.length > 0) {
                const encryptedWord = encryptName(word);
                const link = window.location.href + encodeURIComponent(encryptedWord);
                setErrorMessage('');
                setGeneratedLink(link);
            } else {
                setErrorMessage('Word not found.');
                setTimeout(() => setShakeError(false), 500);
                setGeneratedLink(""); 
            }
        } catch (error) {
            setErrorMessage('Word not found.');
            setTimeout(() => setShakeError(false), 500);
            setGeneratedLink("");
        }
    };


    useEffect(() => {
        // Automatically generate the link when the word is complete
        const word = letters.join('');
        if (word.length === 5 && letters.every(letter => letter !== '')) {
            generateLink(word);
        } else {
            setErrorMessage('');
            setShakeError(false);
            setGeneratedLink("");
        }
    }, [letters]);

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
            return "";
        }
        try {
            const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
            if (response.data.length > 0) {
                return window.location.href + encodeURIComponent(encryptName(word));
            } else {
                return "";
            }
        } catch (error) {
            return "";
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
                {generatedLink && (
                <div className="generated-link">
                    <p>Copy this link to play on separate devices:</p>
                    <input type="text" style={{width: "100%"}}value={generatedLink} readOnly />
                </div>
            )}
            </form>
            <p>
                Play by using the same device or copying the link to the word and sending it to a friend
            </p>
            {errorMessage && <div className="error-message">{errorMessage}</div>}
        </div>
    );
};

export default WordInput;
