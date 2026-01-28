
import React, { useState, useEffect } from 'react';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { Uploader } from './components/Uploader';
import { ChatWidget } from './components/ChatWidget';
import { PricingOverlay } from './components/PricingOverlay';
import { ProfileOverlay } from './components/ProfileOverlay';
import { AdminPanel } from './components/AdminPanel';
import { analyzeStatement, speakSummary } from './services/geminiService';
import { User, FinancialAnalysis, AnalysisHistoryItem } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showUploader, setShowUploader] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [analysis, setAnalysis] = useState<FinancialAnalysis | null>(null);
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [customLogo, setCustomLogo] = useState<string | null>(() => localStorage.getItem('custom_logo'));
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });

  // Load history on startup
  useEffect(() => {
    if (user) {
      const savedHistory = localStorage.getItem(`history_${user.id}`);
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    }
  }, [user]);

  // Sync history to localStorage
  useEffect(() => {
    if (user && history.length > 0) {
      localStorage.setItem(`history_${user.id}`, JSON.stringify(history));
    }
  }, [history, user]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setAnalysis(null);
    setHistory([]);
    setShowProfile(false);
    setShowAdmin(false);
  };

  const startAnalysis = async (contents: (string | { data: string; mimeType: string })[]) => {
    if (!user) return;

    if (user.credits <= 0 && !user.isPro) {
      setShowPricing(true);
      return;
    }

    setIsLoading(true);
    try {
      const result = await analyzeStatement(contents);
      setAnalysis(result);
      
      // Save to history
      const newHistoryItem: AnalysisHistoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toLocaleString('pt-BR'),
        analysis: result
      };
      setHistory(prev => [newHistoryItem, ...prev]);

      if (!user.isPro) {
        setUser({ ...user, credits: Math.max(0, user.credits - 1) });
      }
      setShowUploader(false);
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Erro ao analisar extratos. Verifique se os formatos estão corretos.");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteHistoryItem = (id: string) => {
    const newHistory = history.filter(item => item.id !== id);
    setHistory(newHistory);
    localStorage.setItem(`history_${user?.id}`, JSON.stringify(newHistory));
  };

  const handleUpgrade = () => {
    if (user) {
      setUser({ ...user, isPro: true, credits: Infinity });
      setShowPricing(false);
      alert("Parabéns! Você agora é um membro FinanzaGo Pro!");
    }
  };

  const updateLogo = (logoUrl: string | null) => {
    setCustomLogo(logoUrl);
    if (logoUrl) {
      localStorage.setItem('custom_logo', logoUrl);
    } else {
      localStorage.removeItem('custom_logo');
    }
  };

  const ThemeToggleButton = () => (
    <button 
      onClick={toggleTheme}
      className="p-3 rounded-2xl bg-white dark:bg-slate-800 text-slate-500 dark:text-amber-400 hover:scale-110 transition-all shadow-lg border border-slate-200 dark:border-white/10 flex items-center justify-center"
      title={theme === 'light' ? 'Ativar Modo Escuro' : 'Ativar Modo Claro'}
    >
      {theme === 'light' ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
      )}
    </button>
  );

  if (!user) {
    return (
      <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="absolute top-6 right-6 z-50">
          <ThemeToggleButton />
        </div>
        <Auth onLogin={handleLogin} customLogo={customLogo} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900/80 dark:backdrop-blur-md border-b border-slate-200 dark:border-white/5 sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setAnalysis(null)}>
            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-indigo-600 text-white font-bold">
              {customLogo ? (
                <img src={customLogo} alt="Logo" className="w-full h-full object-cover" />
              ) : "F"}
            </div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">FinanzaGo.Ai</h1>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggleButton />
            
            <div className="hidden md:flex items-center gap-4 text-sm font-medium">
              {!user.isPro ? (
                <button 
                  onClick={() => setShowPricing(true)}
                  className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-full flex items-center gap-1 hover:scale-105 transition"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  {user.credits} créditos
                </button>
              ) : (
                <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full border border-indigo-200/20">Pro Member</span>
              )}
            </div>
            
            <div className="flex items-center gap-3 ml-2 border-l border-slate-200 dark:border-white/10 pl-4">
              <button 
                onClick={() => setShowProfile(true)}
                className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold hover:ring-2 hover:ring-indigo-500 transition-all"
              >
                {user.name.charAt(0).toUpperCase()}
              </button>
              <button 
                onClick={handleLogout}
                className="text-slate-400 hover:text-rose-600 transition"
                title="Sair"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white transition-colors">Olá, {user.name}!</h2>
            <p className="text-slate-500 dark:text-slate-400 transition-colors">Acompanhe seu progresso financeiro e tome melhores decisões.</p>
          </div>
          <button
            onClick={() => setShowUploader(true)}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition shadow-lg flex items-center gap-2 self-start"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Nova Análise
          </button>
        </div>

        <Dashboard 
          analysis={analysis} 
          history={history}
          user={user}
          onUploadClick={() => setShowUploader(true)}
          onSpeak={speakSummary}
          onSelectHistory={(h) => setAnalysis(h.analysis)}
          onDeleteHistory={deleteHistoryItem}
          onUpgradeClick={() => setShowPricing(true)}
        />
      </main>

      {/* Overlays */}
      {showUploader && (
        <Uploader 
          onUpload={startAnalysis} 
          onClose={() => setShowUploader(false)} 
          isLoading={isLoading}
        />
      )}

      {showPricing && (
        <PricingOverlay 
          onUpgrade={handleUpgrade} 
          onClose={() => setShowPricing(false)} 
        />
      )}

      {showProfile && (
        <ProfileOverlay 
          user={user} 
          onClose={() => setShowProfile(false)} 
          onUpgrade={handleUpgrade}
          onOpenAdmin={() => {
            setShowAdmin(true);
            setShowProfile(false);
          }}
        />
      )}

      {showAdmin && (
        <AdminPanel 
          currentUser={user} 
          onClose={() => setShowAdmin(false)}
          onUpdateLogo={updateLogo}
          customLogo={customLogo}
        />
      )}

      <ChatWidget />

      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-white/5 py-6 text-center text-sm text-slate-400 transition-colors">
        &copy; 2026 FinanzaGo.Ai - Educação Financeira com Inteligência
      </footer>
    </div>
  );
};

export default App;
