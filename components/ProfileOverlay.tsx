
import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface ProfileOverlayProps {
  user: User;
  onClose: () => void;
  onUpgrade: () => void;
  onOpenAdmin: () => void;
}

type PaymentMethod = 'pix' | 'card' | null;

export const ProfileOverlay: React.FC<ProfileOverlayProps> = ({ user, onClose, onUpgrade, onOpenAdmin }) => {
  const [notifications, setNotifications] = useState(() => localStorage.getItem('pref_notifications') !== 'false');
  const [sound, setSound] = useState(() => localStorage.getItem('pref_sound') !== 'false');
  const [referralLink] = useState(`https://finanzago.ai/join?ref=${user.id.slice(0, 6)}`);
  const [copied, setCopied] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const pixKey = "00020126580014BR.GOV.BCB.PIX0136f87171-f871-4a7b-a78b-a78bfa818cf8520400005303986540519.995802BR5913FINANZAGO.AI6009SAO PAULO62070503***6304ABCD";

  useEffect(() => {
    localStorage.setItem('pref_notifications', String(notifications));
    localStorage.setItem('pref_sound', String(sound));
  }, [notifications, sound]);

  const copyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePayment = () => {
    if (!selectedMethod) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onUpgrade();
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl animate-slide-left flex flex-col transition-colors">
        <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Meu Perfil</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* User Info */}
          <div className="flex items-center gap-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-500/10">
            <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-500/20">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">{user.name}</h3>
              <p className="text-sm text-slate-500 dark:text-indigo-300/60">{user.email}</p>
              <div className="flex gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${user.isPro ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
                  {user.isPro ? 'Membro Pro' : 'Plano Gratuito'}
                </span>
                <button 
                  onClick={onOpenAdmin}
                  className="bg-slate-800 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase hover:bg-indigo-600 transition"
                >
                  Admin Panel
                </button>
              </div>
            </div>
          </div>

          {/* Subscription Section */}
          {!user.isPro && (
            <section className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Plano e Assinatura</h4>
              <div className="p-5 bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-500/20 rounded-3xl">
                <p className="text-sm text-indigo-900 dark:text-indigo-300 font-bold mb-4">Atualize para o PRO por apenas R$ 19,99</p>
                
                <div className="flex gap-3 mb-6">
                  <button 
                    onClick={() => setSelectedMethod('pix')}
                    className={`flex-1 p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${selectedMethod === 'pix' ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg' : 'border-slate-200 dark:border-white/5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 512 512" fill="currentColor"><path d="M256 0l256 256-256 256L0 256 256 0zm104 256l-104-104-104 104 104 104 104-104z"/></svg>
                    <span className="text-[10px] font-bold">PIX</span>
                  </button>
                  <button 
                    onClick={() => setSelectedMethod('card')}
                    className={`flex-1 p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${selectedMethod === 'card' ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg' : 'border-slate-200 dark:border-white/5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                    <span className="text-[10px] font-bold">CARTÃO</span>
                  </button>
                </div>

                {selectedMethod === 'pix' && (
                  <div className="mb-6 animate-fade-in text-center p-4 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-indigo-200 dark:border-indigo-500/30">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(pixKey)}`} alt="PIX" className="mx-auto mb-3 rounded-lg shadow-sm" />
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(pixKey);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      {copied ? 'CHAVE COPIADA!' : 'COPIAR CÓDIGO PIX'}
                    </button>
                  </div>
                )}

                {selectedMethod === 'card' && (
                  <div className="mb-6 animate-fade-in space-y-3">
                    <input type="text" className="w-full p-3 bg-white dark:bg-slate-800 border dark:border-white/5 rounded-xl text-xs" placeholder="Número do Cartão" />
                    <div className="flex gap-2">
                      <input type="text" className="flex-1 p-3 bg-white dark:bg-slate-800 border dark:border-white/5 rounded-xl text-xs" placeholder="MM/AA" />
                      <input type="text" className="w-20 p-3 bg-white dark:bg-slate-800 border dark:border-white/5 rounded-xl text-xs" placeholder="CVV" />
                    </div>
                  </div>
                )}

                <button 
                  onClick={handlePayment}
                  disabled={!selectedMethod || isProcessing}
                  className={`w-full p-4 rounded-xl font-bold text-sm transition-all shadow-xl flex items-center justify-center gap-2 ${!selectedMethod || isProcessing ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                >
                  {isProcessing ? (
                    <><svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> PROCESSANDO...</>
                  ) : 'CONTRATAR AGORA'}
                </button>
              </div>
            </section>
          )}

          {/* Settings */}
          <section className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Configurações</h4>
            
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Notificações Push</span>
              </div>
              <button 
                onClick={() => setNotifications(!notifications)}
                className={`w-11 h-6 rounded-full transition-all relative ${notifications ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifications ? 'left-6' : 'left-1'}`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Sons de Alerta</span>
              </div>
              <button 
                onClick={() => setSound(!sound)}
                className={`w-11 h-6 rounded-full transition-all relative ${sound ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${sound ? 'left-6' : 'left-1'}`}></div>
              </button>
            </div>
          </section>

          {/* Referral System */}
          <section className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Indique e Ganhe</h4>
            <div className="p-5 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-500/10 rounded-2xl">
              <p className="text-sm text-amber-800 dark:text-amber-400 mb-4 font-medium leading-relaxed">
                Convide amigos e ganhe <strong>20% de desconto</strong> vitalício por cada amigo que assinar o Pro!
              </p>
              <div className="flex gap-2">
                <div className="flex-1 bg-white dark:bg-slate-800 border border-amber-200 dark:border-white/5 rounded-xl px-4 py-2 text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center truncate">
                  {referralLink}
                </div>
                <button 
                  onClick={copyReferral}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${copied ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                >
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>
          </section>
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-white/5">
           <button 
            onClick={onClose}
            className="w-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 p-3 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
           >
            Fechar Perfil
           </button>
        </div>
      </div>
    </div>
  );
};
