import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';  
import '../styles/components/Home.css'; 


const Home = () => {
    useEffect(() => {
    // Smooth header background change on scroll
    const handleScroll = () => {
        const header = document.querySelector('.header');
        if (header) {
        if (window.scrollY > 50) {
            header.style.background = 'rgba(0, 0, 0, 0.95)';
        } else {
            header.style.background = 'rgba(0, 0, 0, 0.8)';
        }
        }
    };

    window.addEventListener('scroll', handleScroll);

    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
        });
    }, observerOptions);

    // Observe all fade-in elements
    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });

    // Parallax effect for hero section
    const handleParallax = () => {
        const scrolled = window.pageYOffset;
        const heroVideo = document.querySelector('.hero-video');
        if (heroVideo) {
        heroVideo.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    };

    window.addEventListener('scroll', handleParallax);

    // Cleanup function
    return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('scroll', handleParallax);
        observer.disconnect();
    };
    }, []);

  return (
    <>
      {/* Header */}
      <header className="header">
        <nav className="nav">
          <div className="logo-container">
            <div className="logo-icon"></div>
            <div className="logo-text">FitFlow</div>
          </div>
          <div className="auth-buttons">
            <Link to="/login" className="btn btn-primary">Sign In</Link>
            <Link to="/register" className="btn btn-primary">Sign Up</Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-video"></div>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Transform Your Fitness Journey</h1>
          <p className="hero-subtitle">The ultimate platform for tracking, training, and achieving your fitness goals</p>
          <div className="hero-cta">
            <Link to="/register" className="btn btn-hero btn-explore">Start Your Journey</Link>
            <Link to="/dashboard" className="btn btn-hero btn-guest">Explore as Guest</Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Everything You Need</h2>
            <p className="section-subtitle">Comprehensive fitness tools designed to help you reach your peak performance</p>
          </div>

          <div className="features-grid">
            <div className="feature-card fade-in">
              <div className="feature-icon">💪</div>
              <h3 className="feature-title">Custom Workout Programs</h3>
              <p className="feature-description">Personalized training plans adapted to your fitness level, goals, and available equipment</p>
            </div>

            <div className="feature-card fade-in">
              <div className="feature-icon">📊</div>
              <h3 className="feature-title">Advanced Analytics</h3>
              <p className="feature-description">Track your progress with detailed statistics, interactive graphs, and comprehensive workout history</p>
            </div>

            <div className="feature-card fade-in">
              <div className="feature-icon">🍎</div>
              <h3 className="feature-title">Nutrition Tracking</h3>
              <p className="feature-description">Monitor your daily, weekly, and monthly calorie intake with our intelligent food database</p>
            </div>
          </div>

          <div className="additional-features">
            <div className="mini-feature fade-in">
              <span className="mini-icon">🔥</span>
              <div className="mini-title">Calorie Calculator</div>
              <p className="mini-description">Advanced BMR and TDEE calculations</p>
            </div>

            <div className="mini-feature fade-in">
              <span className="mini-icon">📸</span>
              <div className="mini-title">Progress Gallery</div>
              <p className="mini-description">Share your fitness journey with photos</p>
            </div>

            <div className="mini-feature fade-in">
              <span className="mini-icon">🎯</span>
              <div className="mini-title">Goal Setting</div>
              <p className="mini-description">Set and track your fitness milestones</p>
            </div>

            <div className="mini-feature fade-in">
              <span className="mini-icon">🤖</span>
              <div className="mini-title">AI Fitness Coach</div>
              <p className="mini-description">24/7 nutrition and workout guidance</p>
            </div>

            <div className="mini-feature fade-in">
              <span className="mini-icon">🧠</span>
              <div className="mini-title">Nutrition Trivia</div>
              <p className="mini-description">Learn while you train with fun quizzes</p>
            </div>

            <div className="mini-feature fade-in">
              <span className="mini-icon">⚖️</span>
              <div className="mini-title">Weight Tracker</div>
              <p className="mini-description">Monitor weight changes with trends</p>
            </div>

            <div className="mini-feature fade-in">
              <span className="mini-icon">📱</span>
              <div className="mini-title">Food Logger</div>
              <p className="mini-description">Easy meal tracking and calorie counting</p>
            </div>

            <div className="mini-feature fade-in">
              <span className="mini-icon">🏃</span>
              <div className="mini-title">Workout History</div>
              <p className="mini-description">Complete exercise performance logs</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2 className="cta-title">Ready to Transform?</h2>
          <p className="cta-description">Join thousands of users who have already started their fitness transformation with FitFlow</p>
          <Link to="/register" className="cta-button">Get Started Today</Link>
        </div>
      </section>
    </>
  );
};

export default Home;