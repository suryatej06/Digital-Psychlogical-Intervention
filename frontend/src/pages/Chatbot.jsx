import { useState, useEffect, useRef, useCallback } from 'react';
import { chatAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CrisisInterventionBanner from '../components/CrisisInterventionBanner';

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const ChatMessage = ({ msg }) => {
  const isUser = msg.role === 'user';
  const emotions = msg.metadata?.emotionTags || [];

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div className={`max-w-[85%] sm:max-w-[70%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div 
          className={`relative p-4 rounded-3xl shadow-lg backdrop-blur-md border ${
            isUser 
              ? 'bg-indigo-600/90 text-white border-white/10 rounded-br-sm shadow-indigo-500/10' 
              : 'bg-white/5 text-slate-100 border-white/5 rounded-bl-sm shadow-black/20'
          }`}
        >
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
          
          {!isUser && emotions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {emotions.map((tag, i) => (
                <span key={i} className="text-[10px] font-bold uppercase tracking-wider bg-white/10 text-indigo-300 px-2 py-0.5 rounded-full border border-white/5">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1.5 px-1">
          <span className="text-[10px] text-slate-500 font-medium">
            {formatTime(msg.createdAt)}
          </span>
          {isUser && (
            <div className="flex gap-0.5">
              <div className="w-1 h-1 rounded-full bg-indigo-500/50"></div>
              <div className="w-1 h-1 rounded-full bg-indigo-500/70"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function Chatbot() {
  const { user } = useAuth();
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const loadSession = useCallback(async () => {
    try {
      setLoading(true);
      const res = await chatAPI.getSession();
      setSession(res.session);
      if (res.messages) {
        setMessages(res.messages.map(m => ({
          ...m,
          createdAt: new Date(m.createdAt)
        })));
      }
    } catch (error) {
      console.error('Failed to load chat session:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    const content = input.trim();
    if (!content || isTyping) return;

    const optimisticId = Date.now().toString();
    const userMsg = {
      _id: optimisticId,
      role: 'user',
      content,
      createdAt: new Date()
    };

    setInput('');
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const res = await chatAPI.sendMessage(content);
      if (res.success) {
        setSession(prev => ({ ...prev, ...res.session }));
        const aiMsg = {
          ...res.message,
          createdAt: new Date(res.message.createdAt)
        };
        setMessages(prev => [...prev, aiMsg]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [...prev, {
        _id: Date.now().toString(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting to my brain right now. Please try again in a moment.",
        createdAt: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCloseSession = async () => {
    if (!session?._id) return;
    if (!window.confirm("Ending this session will archive our current conversation and generate a summary. Ready?")) return;

    try {
      setLoading(true);
      await chatAPI.closeSession(session._id);
      setMessages([]);
      await loadSession();
    } catch (error) {
      console.error('Failed to close session:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && messages.length === 0) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400 font-medium animate-pulse">Connecting to Aura...</p>
        </div>
      </div>
    );
  }

  const riskLevel = session?.riskLevel || 'low';
  const showCrisis = riskLevel === 'high' || session?.flaggedForReview;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 py-4 px-6 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl shadow-lg shadow-indigo-500/20">
              ✨
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#020617] ${isTyping ? 'bg-emerald-500 animate-pulse' : 'bg-emerald-500'}`}></div>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Aura
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Mental Support AI</span>
              <span className="w-1 h-1 rounded-full bg-slate-700"></span>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${riskLevel === 'low' ? 'text-emerald-400' : riskLevel === 'moderate' ? 'text-amber-400' : 'text-rose-400'}`}>
                Risk: {riskLevel}
              </span>
            </div>
          </div>
        </div>

        <button 
          onClick={handleCloseSession}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold transition-all active:scale-95"
        >
          End Session
        </button>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-8 lg:px-32 xl:px-64 scrollbar-hide">
        {showCrisis && (
          <div className="mb-8">
            <CrisisInterventionBanner />
          </div>
        )}

        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-80">
            <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center text-4xl mb-6 border border-white/5">
              👋
            </div>
            <h2 className="text-2xl font-bold mb-2">Welcome Back, {user?.name || 'Friend'}</h2>
            <p className="max-w-md text-slate-400 leading-relaxed">
              I'm Aura, your secure and empathetic space to talk. Whether it's stress, academic pressure, or just finding balance, I'm here to listen.
            </p>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
              {['Feeling overwhelmed with finals', 'How to handle burnout?', 'Just need to vent', 'Can we try a breathing exercise?'].map(txt => (
                <button 
                  key={txt}
                  onClick={() => setInput(txt)}
                  className="p-4 rounded-2xl bg-white/5 border border-white/5 text-sm text-left hover:bg-white/10 hover:border-indigo-500/30 transition-all"
                >
                  "{txt}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((msg) => (
              <ChatMessage key={msg._id} msg={msg} />
            ))}
            {isTyping && (
              <div className="flex justify-start animate-in fade-in duration-300">
                <div className="bg-white/5 border border-white/5 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/60 animate-bounce"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/60 animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/60 animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </main>

      {/* Input Area */}
      <footer className="p-4 sm:p-6 lg:px-32 xl:px-64 bg-gradient-to-t from-[#020617] to-transparent">
        <form 
          onSubmit={handleSend}
          className="relative max-w-4xl mx-auto"
        >
          <div className="relative rounded-[32px] overflow-hidden border border-white/10 bg-[#1e293b]/50 backdrop-blur-2xl shadow-2xl focus-within:border-indigo-500/50 transition-all p-1.5 flex items-end gap-2">
            <textarea
              ref={inputRef}
              rows="1"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Share what's on your mind..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-slate-100 placeholder:text-slate-500 py-3 pl-4 pr-2 resize-none max-h-48 scrollbar-hide"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className={`w-12 h-12 rounded-[24px] flex items-center justify-center transition-all ${
                input.trim() && !isTyping 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-100' 
                  : 'bg-white/5 text-slate-600 scale-90'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </div>
          <p className="mt-3 text-center text-[10px] text-slate-500 font-medium px-4">
            Aura is an AI companion for emotional support, not a medical professional. If in crisis, please seek immediate help.
          </p>
        </form>
      </footer>
    </div>
  );
}
