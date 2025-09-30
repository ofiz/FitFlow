import React, { useState, useEffect } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { userAPI } from '../../utils/api';
import '../../styles/tabs/AICoachTab.css';

const AICoachTab = () => {
  const [message, setMessage] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    fetchUserName();
  }, []);

  const fetchUserName = async () => {
    try {
      const data = await userAPI.getProfile();
      setUserName(data.name || 'there');
    } catch (error) {
      console.error('Error fetching user name:', error);
      setUserName('there');
    }
  };

  return (
    <div className="ai-coach-tab">
      <div className="tab-header">
        <h1 className="tab-title gradient-violet-purple">
          AI Fitness Coach 🤖
        </h1>
        <p className="tab-subtitle">Get personalized fitness and nutrition advice 24/7</p>
      </div>

      <div className="chat-container">
        <div className="chat-messages">
          <ChatMessage 
            sender="ai" 
            message={`Hello ${userName}! I'm your AI fitness coach. How can I help you today?`}
          />
          <ChatMessage 
            sender="user" 
            message="What's a good workout for building muscle?" 
          />
          <ChatMessage 
            sender="ai" 
            message="For muscle building, I recommend a progressive overload program focusing on compound movements like squats, deadlifts, and bench press. Aim for 3-4 sets of 8-12 reps with proper form and adequate rest between sets." 
          />
        </div>
        
        <div className="chat-input-container">
          <input 
            type="text" 
            placeholder="Ask me anything about fitness or nutrition..."
            className="chat-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button className="chat-send-btn">
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

const ChatMessage = ({ sender, message }) => (
  <div className={`chat-message ${sender === 'user' ? 'user-message' : 'ai-message'}`}>
    <div className="message-bubble">
      {message}
    </div>
  </div>
);

export default AICoachTab;