import { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../services/api';

const Chatbot = () => {
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadSession();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadSession = async () => {
    try {
      setSessionLoading(true);
      const response = await chatAPI.getSession();
      setSession(response.session);
      setMessages(response.messages ?? []);
    } catch (error) {
      console.error('Failed to load session:', error);
    } finally {
      setSessionLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setLoading(true);

    // Add user message to UI immediately
    const tempUserMessage = {
      _id: Date.now(),
      role: 'user',
      content: userMessage,
      createdAt: new Date()
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      const response = await chatAPI.sendMessage(userMessage);
      const assistantMessage = response.message;
      
      // Replace temp message and add assistant response
      setMessages((prev) => [
        ...prev.filter(m => m._id !== tempUserMessage._id),
        {
          _id: Date.now(),
          role: 'user',
          content: userMessage,
          createdAt: new Date()
        },
        assistantMessage
      ]);

      // Update session info
      if (response.session) {
        setSession(response.session);
        
        // Show risk warning if needed
        if (response.session.isFlagged || response.session.suggestion) {
          alert(response.session.suggestion || 'Your session has been flagged for review. Please consider speaking with a counselor.');
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      alert(error.response?.data?.message || 'Failed to send message');
      // Remove temp message on error
      setMessages((prev) => prev.filter(m => m._id !== tempUserMessage._id));
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSession = async () => {
    if (session && window.confirm('Are you sure you want to close this session?')) {
      try {
        await chatAPI.closeSession(session.id);
        setSession(null);
        setMessages([]);
        loadSession();
      } catch (error) {
        console.error('Failed to close session:', error);
      }
    }
  };

  if (sessionLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">AI Chatbot Support</h1>
        {session && (
          <div className="flex items-center space-x-4">
            {session.riskScore > 0 && (
              <div className="text-sm">
                <span className="text-gray-600">Risk Score: </span>
                <span className={`font-semibold ${
                  session.riskScore >= 50 ? 'text-red-600' :
                  session.riskScore >= 30 ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {session.riskScore}
                </span>
              </div>
            )}
            <button
              onClick={handleCloseSession}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Close Session
            </button>
          </div>
        )}
      </div>

      {session?.isFlagged && (
        <div className="bg-yellow-50 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-4">
          <p className="font-semibold">Important Notice</p>
          <p>Your session has been flagged for review. We strongly recommend speaking with a professional counselor.</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md h-[600px] flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <p className="text-lg mb-2">👋 Hello! I'm here to support you.</p>
              <p>Feel free to share what's on your mind. Remember, I'm not a replacement for professional help.</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message._id || message.createdAt}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-primary-100' : 'text-gray-500'
                  }`}>
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t p-4">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <input
              type="text"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Type your message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-2">
            ⚠️ If you're in crisis, please contact emergency services immediately (988 or 911)
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
