import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, X, Brain, Heart, AlertTriangle } from 'lucide-react';
import { chatAPI } from '../services/api'; // Adjust path if needed

const Chatbot = () => {
  // --- Original State & Logic ---
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

    // Optimistic UI update
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

      if (response.session) {
        setSession(response.session);
        if (response.session.isFlagged || response.session.suggestion) {
          alert(response.session.suggestion || 'Your session has been flagged for review. Please consider speaking with a counselor.');
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      alert(error.response?.data?.message || 'Failed to send message');
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

  // --- UI Render ---

  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center h-[600px] max-w-4xl mx-auto">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="h-10 w-10 rounded-full border-2 border-indigo-500 border-t-transparent"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">

      {/* Background Floating Orbs */}
      <motion.div
        animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
        transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
        className="absolute -top-16 -left-16 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-40"
        style={{ background: 'radial-gradient(circle, rgba(99, 102, 241, 0.4), transparent)' }} // Indigo orb
      />
      <motion.div
        animate={{ x: [0, -15, 0], y: [0, 20, 0] }}
        transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
        className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-30"
        style={{ background: 'radial-gradient(circle, rgba(168, 85, 247, 0.4), transparent)' }} // Purple orb
      />

      {/* Main Glass Container */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/60 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl overflow-hidden flex flex-col h-[700px] relative z-10"
      >

        {/* Header */}
        <div className="px-6 py-4 border-b border-indigo-100 flex items-center justify-between bg-white/40">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200"
            >
              <Brain className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h2 className="font-semibold text-gray-800 flex items-center gap-1.5 text-lg">
                AI Companion <Sparkles className="w-4 h-4 text-indigo-500" />
              </h2>
              <div className="flex items-center gap-1.5">
                <motion.span
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-2 h-2 rounded-full bg-green-500"
                />
                <span className="text-xs text-gray-500 font-medium">Online • Ready to help</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Risk Score Integration */}
            {session && session.riskScore > 0 && (
              <div className="text-sm bg-white/50 px-3 py-1 rounded-full border border-gray-200 backdrop-blur-sm">
                <span className="text-gray-600">Risk: </span>
                <span className={`font-bold ${session.riskScore >= 50 ? 'text-red-600' :
                  session.riskScore >= 30 ? 'text-orange-500' :
                    'text-green-600'
                  }`}>
                  {session.riskScore}
                </span>
              </div>
            )}

            {session && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleCloseSession}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors text-gray-500"
                title="Close Session"
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Flagged Banner Integration */}
        {session?.isFlagged && (
          <div className="bg-yellow-50/80 backdrop-blur-md border-b border-yellow-200 text-yellow-800 px-6 py-3 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-yellow-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold">Important Notice</p>
              <p>Your session has been flagged for review. We strongly recommend speaking with a professional counselor.</p>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-transparent to-white/20">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mb-5 shadow-lg border border-white"
              >
                <span className="text-4xl">🧠</span>
              </motion.div>
              <p className="text-gray-800 font-bold text-xl mb-2">How can I help? ✨</p>
              <p className="text-gray-500 text-sm max-w-sm">
                I'm your AI companion. Share anything — no judgment, just support 💜
              </p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg._id}
                  initial={{ opacity: 0, scale: 0.9, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-3 mt-1 flex-shrink-0 shadow-md">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl px-5 py-3.5 ${msg.role === 'user'
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20 rounded-br-sm'
                      : 'bg-white border border-gray-100 text-gray-800 shadow-sm rounded-bl-sm'
                      }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    <p className={`text-[10px] mt-2 font-medium ${msg.role === 'user' ? 'text-indigo-100' : 'text-gray-400'
                      }`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center ml-3 mt-1 flex-shrink-0">
                      <Heart className="w-4 h-4 text-purple-600" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {/* Loading Animation */}
          {loading && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start items-start">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-3 flex-shrink-0 shadow-md">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-sm px-5 py-4 flex gap-1.5 items-center h-[52px]">
                <motion.span
                  animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                  className="w-2 h-2 bg-indigo-400 rounded-full"
                />
                <motion.span
                  animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                  className="w-2 h-2 bg-indigo-400 rounded-full"
                />
                <motion.span
                  animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                  className="w-2 h-2 bg-indigo-400 rounded-full"
                />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="p-4 border-t border-white/50 bg-white/40 backdrop-blur-md">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              className="flex-1 bg-white/70 backdrop-blur-sm rounded-2xl px-5 py-3.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 border border-gray-200 transition-all shadow-sm"
              placeholder="Share what's on your mind... 💬"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={loading}
            />
            <motion.button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl w-14 h-auto flex items-center justify-center hover:shadow-lg hover:shadow-indigo-500/30 disabled:opacity-50 transition-all"
            >
              <Send className="w-5 h-5 ml-1" />
            </motion.button>
          </form>
          <p className="text-xs text-center text-gray-500 mt-3 font-medium">
            ⚠️ If you're in crisis, please contact emergency services immediately (988 or 911)
          </p>
        </div>

      </motion.div>
    </div>
  );
};

export default Chatbot;