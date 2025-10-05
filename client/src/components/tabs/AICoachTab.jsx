import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader } from 'lucide-react';
import { userAPI, aiCoachAPI } from '../../utils/api';
import '../../styles/tabs/AICoachTab.css';

const AICoachTab = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchUserName();
    setMessages([{
      sender: 'ai',
      message: `Hello! I'm your AI fitness coach. How can I help you today?`,
      timestamp: new Date()
    }]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchUserName = async () => {
    try {
      const data = await userAPI.getProfile();
      setUserName(data.name || 'there');
      
      setMessages([{
        sender: 'ai',
        message: `Hello ${data.name || 'there'}! I'm your AI fitness coach. How can I help you today?`,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Error fetching user name:', error);
    }
  };

  const handleSendMessage = async () => {
    console.log('=== SEND CLICKED ===');
    console.log('Message:', message);
    console.log('Is Loading:', isLoading);

    if (!message.trim()) {
      console.log('Empty message, returning');
      return;
    }

    if (isLoading) {
      console.log('Already loading, returning');
      return;
    }

    const userMessage = {
      sender: 'user',
      message: message.trim(),
      timestamp: new Date()
    };

    console.log('Adding user message to state');
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setMessage('');
    setIsLoading(true);

    try {
      console.log('Calling AI API...');
      const recentMessages = newMessages.slice(-10);
      
      const response = await aiCoachAPI.chat({
        message: userMessage.message,
        conversationHistory: recentMessages
      });

      console.log('AI Response received:', response);

      const aiMessage = {
        sender: 'ai',
        message: response.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      console.log('AI message added to state');
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        sender: 'ai',
        message: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      console.log('Loading finished');
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSendMessage();
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
          {messages.map((msg, index) => (
            <ChatMessage 
              key={`msg-${index}-${msg.timestamp}`}
              sender={msg.sender} 
              message={msg.message}
            />
          ))}
          {isLoading && (
            <div className="chat-message ai-message">
              <div className="message-bubble">
                <Loader className="spinner" size={16} /> Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <form className="chat-input-container" onSubmit={handleFormSubmit}>
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Ask me anything about fitness or nutrition..."
            className="chat-input"
            value={message}
            onChange={handleInputChange}
            disabled={isLoading}
            autoComplete="off"
          />
          <button 
            className="chat-send-btn"
            type="submit"
            disabled={isLoading || !message.trim()}
          >
            <Send size={20} />
          </button>
        </form>
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