
import React, { useState } from 'react';

interface PricingOverlayProps {
  onUpgrade: () => void;
  onClose: () => void;
}

type CheckoutStage = 'selection' | 'checkout' | 'success';
type PaymentMethod = 'pix' | 'card';

export const PricingOverlay: React.FC<PricingOverlayProps> = ({ onUpgrade, onClose }) => {
  const [stage, setStage] = useState<CheckoutStage>('selection');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [coupon, setCoupon] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  const finalPrice = coupon.toLowerCase() === 'indica20' ? 15.99 : 19.99;
  const pixKey = "00020126580014BR.GOV.BCB.PIX0136f87171-f871-4a7b-a78b-a78bfa818cf8520400005303986540519.995802BR5913FINANZAGO.AI6009SAO PAULO62070503***6304ABCD";

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePayment = () => {
    setIsProcessing(true);
    // Simula comunicação com a Gateway de Pagamento
    setTimeout(() => {
      setIsProcessing(false);
      setStage('success');
      setTimeout(() => {
        onUpgrade();
      }, 2000);
    }, 3000);
  };

  if (stage === 'success') {
    return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[120]">
        <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm p-10 text-center animate-bounce-in shadow-[0_0_50px_rgba(34,197,94,0.3)]">
          <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/40">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Pagamento Aprovado!</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Sua conta Pro está sendo ativada...</p>
        </div>
      </div>
    );
  }

  if (stage === 'checkout') {
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[110]">
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 shadow-2xl relative overflow-hidden transition-colors border border-gray-100 dark:border-white/10">
          
          {/* Left Side: Order Summary */}
          <div className="md:col-span-5 bg-slate-50 dark:bg-slate-800/50 p-8 md:p-12 border-r border-slate-100 dark:border-white/5">
            <button onClick={() => setStage('selection')} className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition mb-10 font-bold text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              VOLTAR
            </button>

            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Resumo do Pedido</h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-sm">Plano Finanza Pro (Mensal)</span>
                <span className="font-bold dark:text-white">R$ 19,99</span>
              </div>
              {coupon.toLowerCase() === 'indica20' && (
                <div className="flex justify-between items-center text-emerald-500 text-sm font-bold">
                  <span>Desconto Indicação (20%)</span>
                  <span>- R$ 4,00</span>
                </div>
              )}
              <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex justify-between items-center">
                <span className="text-slate-800 dark:text-white font-bold">Total a pagar</span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">R$ {finalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gateway Segura</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">Sua transação é processada por nossa gateway criptografada. Nenhum dado de cartão é salvo em nossos servidores.</p>
            </div>
          </div>

          {/* Right Side: Payment Methods */}
          <div className="md:col-span-7 p-8 md:p-12">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Pagamento</h3>
              <div className="flex gap-2">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4 opacity-50 dark:invert" alt="Visa" />
                 <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-4 opacity-50" alt="Mastercard" />
              </div>
            </div>

            <div className="flex gap-4 mb-8">
              <button 
                onClick={() => setPaymentMethod('pix')}
                className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-2xl border transition-all ${paymentMethod === 'pix' ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'border-slate-200 dark:border-white/5 bg-white dark:bg-slate-800/40 text-slate-600 dark:text-slate-400'}`}
              >
                <svg className="w-5 h-5" viewBox="0 0 512 512" fill="currentColor"><path d="M256 0l256 256-256 256L0 256 256 0zm104 256l-104-104-104 104 104 104 104-104z"/></svg>
                <span className="font-bold">PIX</span>
              </button>
              <button 
                onClick={() => setPaymentMethod('card')}
                className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-2xl border transition-all ${paymentMethod === 'card' ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'border-slate-200 dark:border-white/5 bg-white dark:bg-slate-800/40 text-slate-600 dark:text-slate-400'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                <span className="font-bold">CARTÃO</span>
              </button>
            </div>

            <div className="space-y-6">
              {paymentMethod === 'pix' ? (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-slate-50 dark:bg-slate-800/40 rounded-3xl p-6 border border-slate-100 dark:border-white/5 text-center">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixKey)}`} alt="QR Code" className="mx-auto rounded-xl mb-4 shadow-sm bg-white p-2" />
                    <p className="text-xs text-slate-500 mb-6">Escaneie o código com o app do seu banco</p>
                    
                    <div className="space-y-3">
                       <button 
                        onClick={handleCopyPix}
                        className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed transition-all ${copied ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300'}`}
                       >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                        <span className="text-xs font-bold uppercase tracking-tight">{copied ? 'CÓDIGO COPIADO!' : 'PIX COPIA E COLA'}</span>
                       </button>
                    </div>
                  </div>
                  <button onClick={handlePayment} disabled={isProcessing} className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-xl hover:bg-indigo-700 transition active:scale-95 disabled:bg-slate-400">
                    {isProcessing ? 'Verificando Pagamento...' : 'Já realizei o pagamento'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4 animate-fade-in">
                   <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Número do Cartão</label>
                    <div className="relative">
                      <input type="text" className="w-full p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-indigo-500 dark:text-white" placeholder="0000 0000 0000 0000" />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
                        <div className="w-8 h-5 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        <div className="w-8 h-5 bg-slate-200 dark:bg-slate-700 rounded"></div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Validade</label>
                      <input type="text" className="w-full p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-indigo-500 dark:text-white" placeholder="MM/AA" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">CVV</label>
                      <input type="text" className="w-full p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-indigo-500 dark:text-white" placeholder="123" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Nome Impresso</label>
                    <input type="text" className="w-full p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-indigo-500 dark:text-white" placeholder="NOME COMO NO CARTÃO" />
                  </div>
                  <button 
                    onClick={handlePayment} 
                    disabled={isProcessing}
                    className="w-full bg-indigo-600 text-white p-5 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl hover:bg-indigo-700 transition active:scale-95 disabled:bg-slate-400 mt-6"
                  >
                    {isProcessing ? (
                      <><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> PROCESSANDO...</>
                    ) : `PAGAR R$ ${finalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                  </button>
                </div>
              )}
            </div>
            
            <div className="mt-8 flex items-center justify-center gap-6 opacity-40 grayscale group hover:grayscale-0 transition-all">
               <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-4" alt="PayPal" />
               <img src="https://upload.wikimedia.org/wikipedia/commons/b/b7/Google_Pay_Logo.svg" className="h-4" alt="Google Pay" />
               <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_Pay_logo.svg" className="h-4" alt="Apple Pay" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg p-10 text-center shadow-2xl relative overflow-hidden transition-colors border border-gray-100 dark:border-white/10">
        <div className="absolute top-0 right-0 p-4">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-8">
            <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">Assinatura Anual</span>
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white mt-4">Vantagens Ilimitadas</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Você usou seus créditos gratuitos. Assine o Pro para crescer.</p>
        </div>

        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-6 mb-6 border border-indigo-100 dark:border-indigo-500/10">
          <div className="text-indigo-600 dark:text-indigo-400 font-bold text-4xl mb-2">R$ 19,99<span className="text-sm font-medium text-slate-500 dark:text-slate-500">/mês</span></div>
          <ul className="text-left space-y-3 mt-6">
            {[
              "Análises de extrato ilimitadas",
              "Suporte VIP com IA via Chat",
              "Consultoria via Áudio (TTS)",
              "Dicas de investimento integradas"
            ].map((feature, idx) => (
              <li key={idx} className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm">
                <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-6">
          <div className="relative group">
            <input 
              type="text" 
              className="w-full p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/5 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white"
              placeholder="Tem um código de convite?"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
            />
            {coupon.toLowerCase() === 'indica20' && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 text-xs font-bold">VÁLIDO! -20%</span>
            )}
          </div>
        </div>

        <button
          onClick={() => setStage('checkout')}
          className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition shadow-xl transform hover:scale-[1.02] active:scale-95"
        >
          Ir para o Pagamento
        </button>
        <p className="mt-4 text-xs text-slate-400 flex items-center justify-center gap-2">
           <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
           Ambiente 100% Seguro
        </p>
      </div>
    </div>
  );
};
