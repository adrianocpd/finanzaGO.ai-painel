
import React, { useState } from 'react';

interface AuthProps {
  onLogin: (user: any) => void;
  customLogo?: string | null;
}

export const Auth: React.FC<AuthProps> = ({ onLogin, customLogo }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({
      id: '123',
      name: email.split('@')[0],
      email: email,
      isPro: false,
      credits: 2
    });
  };

  const handleGoogleLogin = () => {
    onLogin({
      id: 'google-123',
      name: 'Usuário Google',
      email: 'google@example.com',
      isPro: false,
      credits: 2
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 p-4 transition-colors duration-300">
      <div className="bg-white dark:bg-slate-900/80 dark:backdrop-blur-xl p-8 rounded-3xl shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-full max-w-md border border-gray-200 dark:border-white/10 transition-all">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-2xl mb-4 shadow-lg shadow-indigo-500/20 overflow-hidden">
            {customLogo ? (
              <img src={customLogo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl font-bold text-white">F</span>
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">FinanzaGo.Ai</h1>
          <p className="text-gray-500 dark:text-indigo-300/60 mt-2 text-sm">Sua jornada financeira inteligente</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-widest mb-2 ml-1">Email</label>
            <input
              type="email"
              required
              className="w-full p-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-900 dark:text-white font-medium placeholder-gray-400 dark:placeholder-slate-500 transition-all"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-widest mb-2 ml-1">Senha</label>
            <input
              type="password"
              required
              className="w-full p-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-900 dark:text-white font-medium placeholder-gray-400 dark:placeholder-slate-500 transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
          >
            {isLogin ? 'Entrar na Conta' : 'Criar minha Conta'}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-white/5"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-4 bg-white dark:bg-slate-900 text-gray-500 dark:text-slate-500 uppercase tracking-tighter transition-colors">Ou acessar com</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-4 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all group"
        >
          <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-5 h-5 group-hover:scale-110 transition-transform" alt="Google" />
          <span className="font-bold text-gray-700 dark:text-slate-200 transition-colors">Google Account</span>
        </button>

        <p className="text-center mt-8 text-sm text-gray-600 dark:text-slate-400">
          {isLogin ? 'Novo por aqui?' : 'Já possui cadastro?'}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="ml-2 text-indigo-600 dark:text-indigo-400 font-bold hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
          >
            {isLogin ? 'Cadastre-se' : 'Fazer Login'}
          </button>
        </p>
      </div>
    </div>
  );
};
