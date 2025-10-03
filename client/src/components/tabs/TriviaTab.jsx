import React, { useState, useEffect } from 'react';
import { Brain, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { triviaAPI } from '../../utils/api';
import '../../styles/tabs/TriviaTab.css';

const TriviaTab = () => {
  const [question, setQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [result, setResult] = useState(null);
  const [stats, setStats] = useState({
    totalScore: 0,
    totalAnswered: 0,
    correctAnswers: 0,
    currentStreak: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadQuestion();
    loadStats();
  }, []);

  const loadQuestion = async () => {
    try {
      setLoading(true);
      const data = await triviaAPI.getQuestion();
      setQuestion(data);
      setSelectedAnswer(null);
      setHasAnswered(false);
      setResult(null);
    } catch (error) {
      console.error('Error loading question:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await triviaAPI.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAnswer || hasAnswered) return;

    try {
      setLoading(true);
      const data = await triviaAPI.submitAnswer({
        questionId: question.id,
        selectedAnswer
      });
      
      setResult(data);
      setHasAnswered(true);
      setStats(data.userScore);
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    loadQuestion();
  };

  if (loading && !question) {
    return (
      <div className="trivia-tab">
        <div className="tab-header">
          <h1 className="tab-title gradient-indigo-purple">
            Nutrition Trivia
          </h1>
          <p className="tab-subtitle">Test your nutrition knowledge</p>
        </div>
        <div className="trivia-loading">Loading question...</div>
      </div>
    );
  }

  return (
    <div className="trivia-tab">
      <div className="tab-header">
        <h1 className="tab-title gradient-indigo-purple">
          Nutrition Trivia
        </h1>
        <p className="tab-subtitle">Test your nutrition knowledge</p>
      </div>

      <div className="trivia-container">
        <div className="trivia-card">
          {question && (
            <>
              <div className="trivia-category-badge">
                {question.category} - {question.difficulty}
              </div>
              
              <h3 className="trivia-question">{question.question}</h3>
              
              <div className="trivia-options">
                {question.options.map((option) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrect = hasAnswered && option === result?.correctAnswer;
                  const isWrong = hasAnswered && isSelected && !result?.isCorrect;
                  
                  return (
                    <button
                      key={option}
                      className={`trivia-option ${isSelected ? 'selected' : ''} ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`}
                      onClick={() => !hasAnswered && setSelectedAnswer(option)}
                      disabled={hasAnswered}
                    >
                      <span>{option}</span>
                      {isCorrect && <CheckCircle size={20} />}
                      {isWrong && <XCircle size={20} />}
                    </button>
                  );
                })}
              </div>

              {!hasAnswered ? (
                <button 
                  className="trivia-submit-btn"
                  onClick={handleSubmit}
                  disabled={!selectedAnswer || loading}
                >
                  {loading ? 'Submitting...' : 'Submit Answer'}
                </button>
              ) : (
                <div className="trivia-result">
                  <div className={`result-badge ${result?.isCorrect ? 'correct' : 'wrong'}`}>
                    {result?.isCorrect ? 'Correct!' : 'Incorrect'}
                  </div>
                  {result?.explanation && (
                    <p className="result-explanation">{result.explanation}</p>
                  )}
                  <button className="trivia-next-btn" onClick={handleNext}>
                    Next Question
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="trivia-stats-card">
          <h3 className="stats-title">
            <TrendingUp size={20} />
            Your Stats
          </h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Total Score</span>
              <span className="stat-value">{stats.totalScore}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Questions Answered</span>
              <span className="stat-value">{stats.totalAnswered}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Correct Answers</span>
              <span className="stat-value">{stats.correctAnswers}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Current Streak</span>
              <span className="stat-value">{stats.currentStreak} days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TriviaTab;