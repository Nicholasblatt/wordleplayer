import React, { useState, useRef, useEffect } from 'react';
import './WordInput.css'; // Make sure this is the correct path to your CSS file

const WordInput = ({ onWordSubmit }) => {
    const [letters, setLetters] = useState(Array(5).fill(''));
    const letterRefs = useRef(Array(5).fill().map(() => React.createRef()));

    useEffect(() => {
        letterRefs.current[0].current.focus(); // Automatically focus the first input on mount
    }, []);

    const handleKeyDown = (index) => (event) => {
        if (event.key === 'Backspace' && !letters[index] && index > 0) {
            // Set focus to previous input box if current is empty and it's not the first box
            letterRefs.current[index - 1].current.focus();
        }
    };

    const handleChange = (index) => (event) => {
        const newLetters = [...letters];
        newLetters[index] = event.target.value.toUpperCase().slice(0, 1);
        setLetters(newLetters);

        // Move to the next input box if we've entered a letter
        if (index < 4 && newLetters[index].length === 1) {
            letterRefs.current[index + 1].current.focus();
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const word = letters.join('');
        onWordSubmit(word);
    };

    return (
        <div className="app-container">
            <h1>Welcome to Word Guesser!</h1>
            <p className="intro-text">
                Create a secret word for someone to guess. They will recieve hints in a wordle like fasion.
            </p>
            <form onSubmit={handleSubmit} className="word-input-form">
                {letters.map((letter, index) => (
                    <input
                        key={index}
                        ref={letterRefs.current[index]}
                        type="text"
                        maxLength="1"
                        className="letter-box"
                        value={letter}
                        onChange={handleChange(index)}
                        onKeyDown={handleKeyDown(index)}
                        pattern="[A-Za-z]" // This pattern ensures only alphabetical characters are allowed
                        onInput={(e) => e.target.value = e.target.value.replace(/[^A-Za-z]/g, '')} // Prevents non-alphabetical characters
                    />
                ))}
                <button type="submit" className="submit-button">Set Word</button>
            </form>
        </div>
    );
};

export default WordInput;
