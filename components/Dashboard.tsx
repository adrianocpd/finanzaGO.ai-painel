
import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from 'recharts';
import { FinancialAnalysis, Transaction, AnalysisHistoryItem, User } from '../types';

interface DashboardProps {
  analysis: FinancialAnalysis | null;
  history: AnalysisHistoryItem[];
  user: User;
  onUploadClick: () => void;
  onSpeak: (text: string) => void;
  onSelectHistory: (item: AnalysisHistoryItem) => void;
  onDeleteHistory: (id: string) => void;
  onUpgradeClick: () => void;
}

const COLORS = ['#818cf8', '#34d399', '#fbbf24', '#f87171', '#a78bfa'];

const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 12) * cos;
  const sy = cy + (outerRadius + 12) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill="currentColor" className="font-bold text-xl transition-all fill-gray-900 dark:fill-white">
        {payload.category}
      </text>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8} startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <Sector cx={cx} cy={cy} startAngle={startAngle} endAngle={endAngle} innerRadius={outerRadius + 12} outerRadius={outerRadius + 15} fill={fill} opacity={0.3} />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" strokeWidth={2} />
      <circle cx={ex} cy={ey} r={3} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="currentColor" className="text-sm font-bold fill-gray-900 dark:fill-white">
        {`R$ ${value.toLocaleString('pt-BR')}`}
      </text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#94a3b8" className="text-[11px] font-medium">
        {`${(percent * 100).toFixed(2)}% do total`}
      </text>
    </g>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ 
  analysis, 
  history, 
  user,
  onUploadClick, 
  onSpeak, 
  onSelectHistory, 
  onDeleteHistory,
  onUpgradeClick
}) => {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Transaction; direction: 'asc' | 'desc' } | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  
  const itemsPerPage = 10;
  const referralLink = `https://finanzago.ai/join?ref=${user.id.slice(0, 6)}`;

  const sortedTransactions = useMemo(() => {
    if (!analysis?.transactions) return [];
    const items = [...analysis.transactions];
    if (sortConfig !== null) {
      items.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [analysis?.transactions, sortConfig]);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedTransactions, currentPage]);

  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);

  const onPieEnter = (_: any, index: number) => setActiveIndex(index);
  const onPieLeave = () => setActiveIndex(undefined);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!analysis) return;
    const shareText = `📊 FinanzaGo.Ai: Receitas: R$ ${analysis.totalIncome.toLocaleString('pt-BR')} | Despesas: R$ ${analysis.totalExpenses.toLocaleString('pt-BR')}`;
    if (navigator.share) {
      try { await navigator.share({ title: 'Minha Saúde Financeira', text: shareText, url: window.location.origin }); } catch (err) { }
    } else {
      navigator.clipboard.writeText(shareText);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const HistorySection = () => (
    <div className="mt-12 bg-white dark:bg-slate-900/50 p-8 rounded-3xl border border-gray-100 dark:border-white/5 transition-all">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Histórico de Análises</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400">Revisite seus dados financeiros anteriores.</p>
        </div>
        <div className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full text-xs font-bold">
          {history.length} registradas
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-10 text-gray-400 dark:text-slate-600 border-2 border-dashed border-gray-100 dark:border-slate-800 rounded-2xl">
          Nenhuma análise anterior encontrada.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {history.map((item) => {
            const balance = item.analysis.totalIncome - item.analysis.totalExpenses;
            const isCurrent = analysis && JSON.stringify(analysis) === JSON.stringify(item.analysis);
            
            return (
              <div 
                key={item.id} 
                className={`group relative p-5 rounded-2xl border transition-all cursor-pointer ${isCurrent ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-500/30' : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-white/5 hover:border-indigo-200 dark:hover:border-indigo-500/20 hover:shadow-lg'}`}
                onClick={() => onSelectHistory(item)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-tighter">Análise em</span>
                    <span className="text-sm font-bold text-gray-700 dark:text-slate-200">{item.timestamp}</span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteHistory(item.id);
                    }}
                    className="p-1.5 text-gray-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <div className="text-xs text-gray-500 dark:text-slate-400">Saldo Final</div>
                  <div className={`text-sm font-bold ${balance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    R$ {balance.toLocaleString('pt-BR')}
                  </div>
                </div>
                {isCurrent && (
                  <div className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase shadow-lg">
                    Atual
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const ChartComponent = ({ height = 300, expanded = false }: { height?: number | string, expanded?: boolean }) => (
    <ResponsiveContainer width="100%" height={height as any}>
      <PieChart>
        {/* Fix: Bypassing type check for activeIndex and activeShape which are sometimes missing in Recharts Pie type definitions */}
        <Pie
          {...({
            activeIndex: activeIndex,
            activeShape: renderActiveShape,
            data: analysis?.topCategories || [],
            cx: "50%",
            cy: "50%",
            innerRadius: expanded ? 100 : 70,
            outerRadius: expanded ? 160 : 110,
            paddingAngle: 5,
            dataKey: "amount",
            nameKey: "category",
            onMouseEnter: onPieEnter,
            onMouseLeave: onPieLeave,
            animationBegin: 0,
            animationDuration: 800,
            stroke: "none"
          } as any)}
        />
        <Tooltip 
           content={({ active, payload }) => {
             if (active && payload && payload.length) {
               return (
                 <div className="bg-white dark:bg-slate-950/90 backdrop-blur-md text-gray-900 dark:text-white p-3 rounded-xl text-xs shadow-2xl border border-gray-100 dark:border-white/10">
                   <p className="font-bold mb-1">{payload[0].name}</p>
                   <p className="text-indigo-600 dark:text-indigo-400 font-bold">R$ {payload[0].value?.toLocaleString('pt-BR')}</p>
                 </div>
               );
             }
             return null;
           }}
        />
      </PieChart>
    </ResponsiveContainer>
  );

  return (
    <div className="space-y-8 animate-fade-in relative transition-colors duration-300">
      {/* Summary Cards with Credits Indicator */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Receitas', value: analysis?.totalIncome || 0, color: 'text-emerald-500' },
          { label: 'Total Despesas', value: analysis?.totalExpenses || 0, color: 'text-rose-500' },
          { label: 'Saldo Final', value: (analysis?.totalIncome || 0) - (analysis?.totalExpenses || 0), color: 'text-indigo-600 dark:text-indigo-400' },
          { 
            label: 'Seu Plano', 
            value: user.isPro ? 'Pro (Ilimitado)' : `${user.credits} Créditos`, 
            color: user.isPro ? 'text-indigo-500' : 'text-amber-500',
            isSpecial: true
          }
        ].map((item, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-white/5 transition-all hover:translate-y-[-2px]">
            <p className="text-gray-500 dark:text-slate-400 text-sm font-medium">{item.label}</p>
            <h3 className={`text-2xl font-bold ${item.color}`}>
              {typeof item.value === 'number' ? `R$ ${item.value.toLocaleString('pt-BR')}` : item.value}
            </h3>
            {item.isSpecial && !user.isPro && (
              <button 
                onClick={onUpgradeClick}
                className="mt-2 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:underline"
              >
                Assinar Pro Agora
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Referral Link Section */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl p-6 shadow-xl shadow-indigo-600/20 text-white relative overflow-hidden group">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-400/10 rounded-full blur-3xl"></div>
        
        <div className="relative flex flex-col md:flex-row items-center gap-6">
          <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm shadow-inner shrink-0">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h4 className="text-xl font-bold mb-1">Indique e Ganhe Assinatura Pro!</h4>
            <p className="text-indigo-100 text-sm mb-4">Compartilhe o FinanzaGo com seus amigos. Se eles assinarem o Pro, você ganha <strong>20% de desconto vitalício</strong> em sua mensalidade por indicação.</p>
            
            <div className="flex flex-col sm:flex-row gap-3 items-stretch max-w-2xl">
              <div className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2 text-sm font-mono flex items-center justify-between group/input overflow-hidden">
                <span className="truncate mr-2 text-indigo-50 font-medium">{referralLink}</span>
              </div>
              <button 
                onClick={handleCopyLink}
                className={`px-8 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 ${linkCopied ? 'bg-emerald-500 text-white' : 'bg-white text-indigo-700 hover:bg-indigo-50'}`}
              >
                {linkCopied ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    Copiado!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                    Copiar Link de Convite
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {!user.isPro && user.credits <= 1 && (
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 rounded-3xl text-white shadow-xl shadow-amber-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <div>
              <h4 className="text-lg font-bold">Seus créditos estão acabando!</h4>
              <p className="text-white/80 text-sm">Não perca o acesso à sua consultoria financeira ilimitada e relatórios avançados.</p>
            </div>
          </div>
          <button 
            onClick={onUpgradeClick}
            className="bg-white text-amber-600 px-8 py-3 rounded-xl font-bold hover:bg-amber-50 transition active:scale-95 shrink-0"
          >
            Quero o Plano Pro
          </button>
        </div>
      )}

      {!analysis ? (
        <div className="space-y-12">
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-center p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-gray-100 dark:border-white/5 transition-all">
            <div className="w-20 h-20 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center mb-6 border border-indigo-500/20">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Pronto para organizar sua vida?</h2>
            <p className="text-gray-500 dark:text-slate-400 max-w-md mb-8">Envie seus extratos ou conecte sua conta para uma análise instantânea.</p>
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <button onClick={onUploadClick} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition shadow-lg flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                Analisar Extrato
              </button>
            </div>
          </div>
          <HistorySection />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-white/5 transition-colors">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Resumo da IA</h3>
                <div className="flex items-center gap-1">
                  <button onClick={handleShare} className="text-gray-400 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-2 rounded-full transition">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                  </button>
                  <button onClick={() => onSpeak(analysis.summary)} className="text-indigo-600 dark:text-indigo-400 p-2 rounded-full transition">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                  </button>
                </div>
              </div>
              <p className="text-gray-700 dark:text-slate-300 leading-relaxed mb-6">{analysis.summary}</p>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">Sugestões Personalizadas</h4>
              <ul className="space-y-3">
                {analysis.suggestions.map((suggestion, idx) => (
                  <li key={idx} className="flex gap-3 text-sm text-gray-600 dark:text-slate-400 p-2 hover:bg-gray-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-white/5 transition-colors">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Maiores Gastos</h3>
                <button onClick={() => setIsExpanded(true)} className="p-2 text-gray-400 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                </button>
              </div>
              <div className="flex-1 min-h-[300px]">
                <ChartComponent />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                {analysis.topCategories.map((cat, idx) => (
                  <div key={idx} className={`flex items-center gap-2 p-2 rounded-xl transition-all border ${activeIndex === idx ? 'bg-indigo-50 dark:bg-slate-800 border-indigo-500/50 scale-105 shadow-lg' : 'border-transparent'}`} onMouseEnter={() => setActiveIndex(idx)} onMouseLeave={() => setActiveIndex(undefined)}>
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] text-gray-500 dark:text-slate-500 font-bold uppercase truncate">{cat.category}</span>
                      <span className="text-xs font-bold text-gray-900 dark:text-slate-200">R$ {cat.amount.toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-gray-100 dark:border-white/5 overflow-hidden transition-colors">
            <div className="p-8 border-b border-gray-100 dark:border-slate-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Transações Detalhadas</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400">Lista consolidada dos seus extratos.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-800/50 text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider">
                    <th className="px-8 py-4">Data</th>
                    <th className="px-4 py-4">Descrição</th>
                    <th className="px-4 py-4">Categoria</th>
                    <th className="px-8 py-4 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-100 dark:divide-slate-800">
                  {paginatedTransactions.map((t, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors">
                      <td className="px-8 py-4 text-gray-500 dark:text-slate-400 font-medium">{t.date}</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-slate-100 font-semibold">{t.description}</td>
                      <td className="px-4 py-4">
                        <span className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 px-3 py-1 rounded-full text-[10px] font-bold uppercase border border-gray-200 dark:border-slate-700">
                          {t.category}
                        </span>
                      </td>
                      <td className={`px-8 py-4 text-right font-bold ${t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {t.type === 'income' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="p-6 border-t border-gray-100 dark:border-slate-800 flex items-center justify-center gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${currentPage === i + 1 ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-slate-800 text-gray-400 hover:border-indigo-500'}`}>
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
          <HistorySection />
        </>
      )}

      {isExpanded && (
        <div className="fixed inset-0 z-[60] bg-white/80 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-5xl h-[80vh] rounded-3xl p-8 relative flex flex-col shadow-2xl border border-gray-100 dark:border-white/10 transition-colors">
            <button onClick={() => setIsExpanded(false)} className="absolute top-6 right-6 p-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition text-gray-500 dark:text-slate-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 px-4">Detalhamento de Categorias</h3>
            <div className="flex-1">
              <ChartComponent height="100%" expanded={true} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-8 px-4">
              {analysis?.topCategories.map((cat, idx) => (
                <div key={idx} className={`flex flex-col p-3 rounded-2xl border transition-all duration-300 ${activeIndex === idx ? 'bg-indigo-50 dark:bg-slate-800 border-indigo-500/50 shadow-lg scale-105' : 'bg-gray-50 dark:bg-slate-800/40 border-gray-100 dark:border-slate-700'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                    <span className="text-xs text-gray-500 dark:text-slate-400 font-bold truncate">{cat.category}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">R$ {cat.amount.toLocaleString('pt-BR')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-white dark:bg-slate-900 text-gray-900 dark:text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-gray-100 dark:border-white/10">
          <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
          Resumo copiado com sucesso!
        </div>
      )}
    </div>
  );
};
