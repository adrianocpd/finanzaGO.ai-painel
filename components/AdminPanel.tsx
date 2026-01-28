
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { User } from '../types';
import { generateLogo } from '../services/geminiService';

interface AdminPanelProps {
  currentUser: User;
  onClose: () => void;
  onUpdateLogo: (url: string | null) => void;
  customLogo: string | null;
}

const MOCK_USERS: User[] = [
  { id: '1', name: 'João Victor Silva', email: 'joao.victor@empresa.com', isPro: true, credits: Infinity },
  { id: '2', name: 'Maria Eduarda Santos', email: 'madu.santos@gmail.com', isPro: false, credits: 15 },
  { id: '3', name: 'Carlos Augusto Lima', email: 'carlos.augusto@outlook.com', isPro: false, credits: 2 },
  { id: '4', name: 'Ana Beatriz Moraes', email: 'ana.beatriz@icloud.com', isPro: true, credits: Infinity },
  { id: '5', name: 'Bruno Henrique Garcia', email: 'bruno.garcia@corp.com', isPro: false, credits: 25 },
  { id: '6', name: 'Fernanda Vasconcelos', email: 'fernanda.v@test.com', isPro: true, credits: Infinity },
];

const COLORS = ['#2563eb', '#fbbf24', '#94a3b8'];

export const AdminPanel: React.FC<AdminPanelProps> = ({ currentUser, onClose, onUpdateLogo, customLogo }) => {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'branding'>('overview');
  const [logoPrompt, setLogoPrompt] = useState('FinanzaGo.Ai - Inteligência Financeira');
  const [isGeneratingLogo, setIsGeneratingLogo] = useState(false);
  const [tempLogo, setTempLogo] = useState<string | null>(null);

  const stats = useMemo(() => {
    const pro = users.filter(u => u.isPro).length;
    const free = users.filter(u => !u.isPro).length;
    return {
      total: users.length,
      pro,
      free,
      credits: users.reduce((acc, u) => acc + (u.isPro ? 0 : u.credits), 0),
      chartData: [
        { name: 'Pro', value: pro },
        { name: 'Free', value: free }
      ],
      usageData: [
        { label: 'Jan', value: 400 },
        { label: 'Fev', value: 700 },
        { label: 'Mar', value: 500 },
        { label: 'Abr', value: 900 },
        { label: 'Mai', value: 600 },
      ]
    };
  }, [users]);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleGenerateLogo = async () => {
    // Fix: Users must select their own API key before using gemini-3-pro-image-preview.
    const aistudio = (window as any).aistudio;
    if (aistudio && !(await aistudio.hasSelectedApiKey())) {
      await aistudio.openSelectKey();
    }

    setIsGeneratingLogo(true);
    setTempLogo(null);
    try {
      const result = await generateLogo(logoPrompt);
      setTempLogo(result);
    } catch (error: any) {
      // Fix: If entity not found, re-prompt for key as it might be a project configuration issue.
      if (error?.message?.includes("Requested entity was not found.") && aistudio) {
        await aistudio.openSelectKey();
      }
      alert("Erro ao gerar logo. Tente novamente.");
    } finally {
      setIsGeneratingLogo(false);
    }
  };

  const togglePro = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const becomingPro = !u.isPro;
        return { ...u, isPro: becomingPro, credits: becomingPro ? Infinity : 5 };
      }
      return u;
    }));
  };

  const addCredits = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId && !u.isPro) {
        return { ...u, credits: u.credits + 10 };
      }
      return u;
    }));
  };

  return (
    <div className="fixed inset-0 z-[150] bg-slate-100 flex flex-col overflow-hidden animate-fade-in">
      {/* Top Bar Navigation */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 font-black text-blue-600">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs overflow-hidden">
              {customLogo ? <img src={customLogo} className="w-full h-full object-cover" /> : "A"}
            </div>
            ADMIN CORE
          </div>
          <div className="h-4 w-px bg-slate-200"></div>
          <nav className="flex items-center gap-6 text-sm font-bold text-slate-400">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`${activeTab === 'overview' ? 'text-blue-600' : 'hover:text-slate-600'} transition-colors`}
            >
              Visão Geral
            </button>
            <button 
              onClick={() => setActiveTab('branding')}
              className={`${activeTab === 'branding' ? 'text-blue-600' : 'hover:text-slate-600'} transition-colors`}
            >
              Identidade Visual
            </button>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-rose-500 hover:text-white rounded-full transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-8 max-w-[1600px] mx-auto w-full">
        {activeTab === 'overview' ? (
          <>
            {/* Header Title */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Análises de Usuários</h1>
                <div className="flex items-center gap-4 mt-2 text-sm font-bold text-slate-400">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 border-2 border-slate-300 rounded-sm"></span> Painéis / {users.length}</span>
                </div>
              </div>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200/60">
                <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-8">Meta de Assinantes</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-5xl font-black text-slate-900">R$ 120.000,00</h3>
                  <span className="text-slate-400 font-bold">/ Mês</span>
                </div>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200/60">
                <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-8">Efetivo Premium</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-5xl font-black text-slate-900">{stats.pro}</h3>
                  <span className="text-emerald-500 font-bold text-lg">↑ 12%</span>
                </div>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200/60">
                <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-8">Créditos em Aberto</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-5xl font-black text-slate-900">{stats.credits}</h3>
                  <span className="text-amber-500 font-bold text-lg">● Alerta</span>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4 bg-white p-8 rounded-3xl shadow-sm border border-slate-200/60">
                <h4 className="text-lg font-black text-slate-900 mb-8">Atividade de Login</h4>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.usageData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 700, fontSize: 12}} dy={10} />
                      <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                      <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={35} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="lg:col-span-4 bg-white p-8 rounded-3xl shadow-sm border border-slate-200/60">
                <h4 className="text-lg font-black text-slate-900 mb-8">Mix de Assinatura</h4>
                <div className="h-[250px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.chartData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {stats.chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                    <span className="text-3xl font-black text-slate-900">{((stats.pro / stats.total) * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 bg-white p-8 rounded-3xl shadow-sm border border-slate-200/60">
                <h4 className="text-lg font-black text-slate-900 mb-8">Uso de IA por Rep.</h4>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.usageData} layout="vertical">
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="label" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 700, fontSize: 12}} />
                      <Bar dataKey="value" fill="#2dd4bf" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* User Management Table */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200/60 overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h4 className="text-xl font-black text-slate-900">Base de Assinantes</h4>
                <div className="relative group max-w-md w-full">
                  <input 
                    type="text" 
                    placeholder="Buscar por nome ou e-mail..."
                    className="w-full pl-12 pr-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold text-slate-600"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="px-10 py-5">Assinante Detalhado</th>
                      <th className="px-10 py-5">Nível de Acesso</th>
                      <th className="px-10 py-5">Quota de Créditos</th>
                      <th className="px-10 py-5 text-right">Controles Rápidos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map(user => (
                      <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-lg">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-lg font-black text-slate-900 leading-none mb-1">{user.name}</p>
                              <p className="text-sm font-bold text-slate-400">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight ${user.isPro ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                            {user.isPro ? 'PLANO PRO' : 'FREE USER'}
                          </span>
                        </td>
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 max-w-[100px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full ${user.isPro ? 'w-full bg-blue-500' : 'w-1/2 bg-amber-500'}`}></div>
                            </div>
                            <span className="text-sm font-black text-slate-900">
                              {user.isPro ? '∞' : `${user.credits}`}
                            </span>
                          </div>
                        </td>
                        <td className="px-10 py-6 text-right">
                          <div className="flex justify-end gap-2">
                            {!user.isPro && (
                              <button 
                                onClick={() => addCredits(user.id)}
                                className="w-10 h-10 flex items-center justify-center bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white rounded-xl transition-all"
                                title="Bonificar +10"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                              </button>
                            )}
                            <button 
                              onClick={() => togglePro(user.id)}
                              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${user.isPro ? 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="animate-fade-in space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Identidade Visual IA</h1>
                <p className="text-slate-500 font-bold mt-2">Gere logotipos e assets de marca exclusivos usando Inteligência Artificial (Modelo Gemini 3 Pro).</p>
                <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
                   <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                   Exige seleção de chave de API própria. <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline hover:text-blue-500">Documentação de Billing</a>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Logo Generator Tool */}
              <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-200/60 flex flex-col space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Contexto da Marca</label>
                  <input 
                    type="text" 
                    value={logoPrompt}
                    onChange={(e) => setLogoPrompt(e.target.value)}
                    className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold text-slate-600"
                    placeholder="Ex: FinanzaGo.Ai - Tecnologia e Futuro"
                  />
                </div>

                <button 
                  onClick={handleGenerateLogo}
                  disabled={isGeneratingLogo}
                  className="w-full bg-blue-600 text-white p-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all disabled:bg-slate-300"
                >
                  {isGeneratingLogo ? (
                    <>
                      <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      GERANDO LOGOTIPO (4K)...
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h14a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      GERAR ALTA QUALIDADE (4K)
                    </>
                  )}
                </button>

                <div className="pt-4 space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">IA Generativa Otimizada para</p>
                  <div className="flex justify-center gap-4 opacity-30 grayscale text-[9px] font-black uppercase tracking-tighter">
                    <span>Branding</span>
                    <span>•</span>
                    <span>Minimalismo</span>
                    <span>•</span>
                    <span>Fintech</span>
                  </div>
                </div>
              </div>

              {/* Preview Section */}
              <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-10 flex flex-col items-center justify-center min-h-[400px] border border-white/5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                {!tempLogo && !isGeneratingLogo && !customLogo && (
                  <div className="text-center">
                    <div className="w-24 h-24 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center text-white/20 text-4xl font-black mb-4 mx-auto">
                      ?
                    </div>
                    <p className="text-white/40 font-bold">Aguardando geração...</p>
                  </div>
                )}

                {(tempLogo || customLogo) && !isGeneratingLogo && (
                  <div className="w-full flex flex-col items-center animate-scale-in">
                    <div className="w-48 h-48 bg-white rounded-3xl shadow-2xl overflow-hidden border-8 border-white/10 p-2">
                      <img src={tempLogo || customLogo || ""} alt="Logo Preview" className="w-full h-full object-contain rounded-xl" />
                    </div>
                    <div className="mt-8 flex gap-3 w-full max-w-sm">
                      <button 
                        onClick={() => {
                          onUpdateLogo(tempLogo);
                          setTempLogo(null);
                          alert("Identidade visual aplicada globalmente!");
                        }}
                        disabled={!tempLogo}
                        className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black text-sm hover:bg-blue-700 transition disabled:opacity-50"
                      >
                        APLICAR LOGO
                      </button>
                      <button 
                        onClick={() => {
                          onUpdateLogo(null);
                          setTempLogo(null);
                        }}
                        className="flex-1 bg-white/10 text-white/60 py-4 rounded-2xl font-black text-sm hover:bg-rose-600 hover:text-white transition"
                      >
                        RESETAR
                      </button>
                    </div>
                  </div>
                )}

                {isGeneratingLogo && (
                  <div className="text-center animate-pulse">
                    <div className="w-48 h-48 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center mb-4">
                      <svg className="w-12 h-12 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="3" d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/></svg>
                    </div>
                    <p className="text-blue-500 font-black tracking-widest text-xs uppercase">IA em Ação...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
