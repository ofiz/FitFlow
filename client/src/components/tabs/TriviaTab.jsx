import React, { useState } from 'react';
import { Brain } from 'lucide-react';
import '../../styles/tabs/TriviaTab.css';

const TriviaTab = () => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const question = "Which vitamin is known as the 'sunshine vitamin'?";
  const options = ['Vitamin A', 'Vitamin B12', 'Vitamin C', 'Vitamin D'];
  const correctAnswer = 'Vitamin D';

  return (
    <div className="trivia-tab">
      <div className="tab-header">
        <h1 className="tab-title gradient-indigo-purple">
          Nutrition Trivia 🧠
        </h1>
        <p className="tab-subtitle">Test your nutrition knowledge</p>
      </div>

      <div className="trivia-container">
        <div className="trivia-card">
          <h3 className="trivia-question">{question}</h3>
          
          <div className="trivia-options">
            {options.map((option) => (
              <button
                key={option}
                className={`trivia-option ${selectedAnswer === option ? 'selected' : ''}`}
                onClick={() => setSelectedAnswer(option)}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="trivia-footer">
            <div className="trivia-stats">
              <span>Score: 8/10</span>
              <span>•</span>
              <span>Streak: 3 days 🔥</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TriviaTab;