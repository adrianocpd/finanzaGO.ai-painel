
import React, { useState, useRef, useEffect } from 'react';
import { chatWithAI } from '../services/geminiService';

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);
    try {
      const response = await chatWithAI(userMsg, messages);
      setMessages(prev => [...prev, { role: 'model', text: response.text }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Erro ao processar sua dúvida. Tente novamente." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-[350px] md:w-[400px] h-[500px] flex flex-col border border-gray-100 dark:border-white/10 animate-slide-up overflow-hidden transition-colors">
          <div className="bg-indigo-600 p-4 text-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
              </div>
              <span className="font-bold">FinanzaGo Support</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-slate-950/50 transition-colors">
            {messages.length === 0 && <p className="text-center text-gray-400 dark:text-slate-500 text-sm py-8">Olá! Tire suas dúvidas financeiras comigo.</p>}
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-white border border-gray-100 dark:border-white/5 shadow-sm rounded-tl-none'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && <div className="flex justify-start"><div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-gray-100 dark:border-white/5 shadow-sm"><div className="flex gap-1"><div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></div><div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce delay-100"></div><div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce delay-200"></div></div></div></div>}
          </div>

          <div className="p-4 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-white/5 flex gap-2">
            <input type="text" className="flex-1 bg-gray-100 dark:bg-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white font-medium transition-colors" placeholder="Pergunte algo..." value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} />
            <button onClick={handleSend} className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></button>
          </div>
        </div>
      ) : (
        <button onClick={() => setIsOpen(true)} className="bg-indigo-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:bg-indigo-700 transition transform hover:scale-110">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        </button>
      )}
    </div>
  );
};
