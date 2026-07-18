import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User, CheckCircle, Sparkles } from 'lucide-react';

export interface GateDetails {
  title: string;
  description: string;
}

interface AiRolePlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  gateDetails: GateDetails | null;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
}

export default function AiRolePlayModal({
  isOpen,
  onClose,
  onSuccess,
  gateDetails,
}: AiRolePlayModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [stage, setStage] = useState<'intro' | 'challenge' | 'evaluating' | 'passed'>('intro');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && gateDetails) {
      setMessages([
        {
          id: '1',
          sender: 'ai',
          text: `Hi Katy! I'm your AI Readiness Coach. Ready for your certification: **${gateDetails.title}**?`,
        },
      ]);
      setStage('intro');
    } else {
      setMessages([]);
      setInputValue('');
      setStage('intro');
    }
  }, [isOpen, gateDetails]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newUserMsg: Message = { id: Date.now().toString(), sender: 'user', text: inputValue };
    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response based on stage
    setTimeout(() => {
      setIsTyping(false);
      if (stage === 'intro') {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            sender: 'ai',
            text: `Great. To pass this gate, let's do a quick role-play. ${gateDetails?.description} \n\nHow would you begin your pitch or explanation?`,
          },
        ]);
        setStage('challenge');
      } else if (stage === 'challenge') {
        setStage('evaluating');
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          
          const text = inputValue.trim().toLowerCase();
          const words = text.split(/\s+/);
          
          if (words.length < 15) {
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now().toString(),
                sender: 'ai',
                text: `That was a bit too brief! To pass this certification, I need to see a more detailed explanation of your approach. Can you elaborate?`,
              },
            ]);
            setStage('challenge');
          } else {
            const keywords = ['value', 'pain', 'champion', 'budget', 'timeline', 'decision', 'process', 'bap', 'meddpicc', 'demo', 'close', 'align', 'metrics', 'economic', 'buyer'];
            const matchCount = keywords.filter(kw => text.includes(kw)).length;
            
            if (matchCount < 2 && words.length < 35) {
               setMessages((prev) => [
                ...prev,
                {
                  id: Date.now().toString(),
                  sender: 'ai',
                  text: `You're on the right track, but your response is missing some of our core methodology terminology. Can you try again and make sure to explicitly use our framework language?`,
                },
              ]);
              setStage('challenge');
            } else {
              setMessages((prev) => [
                ...prev,
                {
                  id: Date.now().toString(),
                  sender: 'ai',
                  text: `Analyzing your response against our winning methodologies...\n\nExcellent work! You hit the core value propositions and demonstrated clear alignment with our framework. I am marking you as **CERTIFIED** for this phase! 🚀`,
                },
              ]);
              setStage('passed');
            }
          }
        }, 1500);
      }
    }, 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop filter for glassmorphism */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-stone-900/40 backdrop-blur-md"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl bg-white/90 backdrop-blur-xl border border-white/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-stone-200/60 flex items-center justify-between bg-gradient-to-r from-pink-500/10 to-violet-500/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center shadow-sm">
                <Bot size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-stone-800">AI Readiness Coach</h3>
                <p className="text-[11px] text-stone-500 font-medium uppercase tracking-wider">
                  Certification Simulator
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:bg-stone-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Chat Area */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
            style={{ minHeight: '300px' }}
          >
            {messages.map((msg) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={msg.id}
                className={`flex gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.sender === 'user' ? 'bg-stone-200 text-stone-600' : 'bg-pink-100 text-pink-600'
                  }`}
                >
                  {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div
                  className={`px-4 py-3 rounded-2xl max-w-[80%] text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-stone-800 text-white rounded-tr-sm'
                      : 'bg-white border border-stone-200/60 shadow-sm text-stone-700 rounded-tl-sm'
                  }`}
                >
                  {msg.text.split('**').map((part, i) => 
                    i % 2 === 1 ? <strong key={i} className={msg.sender === 'user' ? 'text-white' : 'text-stone-900'}>{part}</strong> : part
                  )}
                </div>
              </motion.div>
            ))}

            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-4"
              >
                <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
                  <Bot size={14} />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-white border border-stone-200/60 shadow-sm flex items-center gap-1.5 rounded-tl-sm">
                  <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-stone-400 rounded-full" />
                  <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-stone-400 rounded-full" />
                  <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-stone-400 rounded-full" />
                </div>
              </motion.div>
            )}

            {stage === 'passed' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring' }}
                className="flex flex-col items-center justify-center py-6"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4 text-emerald-500 shadow-inner">
                  <CheckCircle size={32} />
                </div>
                <button
                  onClick={() => {
                    onSuccess();
                    onClose();
                  }}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                  Unlock Next Phase
                </button>
              </motion.div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-stone-200/60 bg-white">
            <div className="relative flex items-center">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={stage === 'passed' ? 'Certification Complete!' : "Type your response..."}
                disabled={stage === 'passed' || stage === 'evaluating' || isTyping}
                className="w-full pl-5 pr-12 py-3.5 bg-stone-100/50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500/50 transition-all text-sm disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || stage === 'passed' || stage === 'evaluating' || isTyping}
                className="absolute right-2 w-9 h-9 flex items-center justify-center rounded-lg bg-pink-500 text-white disabled:opacity-50 hover:bg-pink-600 transition-colors"
              >
                <Send size={16} className="-ml-0.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
