
import React, { useState, useEffect } from 'react';

interface UploaderProps {
  onUpload: (data: (string | { data: string; mimeType: string })[]) => void;
  onClose: () => void;
  isLoading: boolean;
}

interface StagedFile {
  id: string;
  name: string;
  type: string;
  data: string;
}

const TEXT_LIMIT = 50000;
const ALLOWED_EXTENSIONS = ['pdf', 'png', 'jpg', 'jpeg', 'csv'];

export const Uploader: React.FC<UploaderProps> = ({ onUpload, onClose, isLoading }) => {
  const [inputText, setInputText] = useState('');
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLinkingBank, setIsLinkingBank] = useState(false);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles: StagedFile[] = [];
    let invalidFilesCount = 0;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const extension = file.name.split('.').pop()?.toLowerCase();
      
      if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
        invalidFilesCount++;
        continue;
      }

      const reader = new FileReader();
      const filePromise = new Promise<StagedFile>((resolve) => {
        reader.onload = (event) => {
          const result = event.target?.result as string;
          const base64Data = result.split(',')[1];
          resolve({
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            type: file.type,
            data: base64Data
          });
        };
      });
      reader.readAsDataURL(file);
      newFiles.push(await filePromise);
    }

    if (invalidFilesCount > 0) setError(`${invalidFilesCount} arquivo(s) ignorado(s). Use PDF, PNG, JPG ou CSV.`);
    setStagedFiles(prev => [...prev, ...newFiles]);
    e.target.value = '';
  };

  const removeFile = (id: string) => {
    if (isLoading) return;
    setStagedFiles(prev => prev.filter(f => f.id !== id));
  };

  const simulateBankLink = () => {
    setIsLinkingBank(true);
    setTimeout(() => {
      setIsLinkingBank(false);
      onUpload(["SIMULATED_BANK_DATA: CONTA CORRENTE ITAÚ - SALDO R$ 5.420,00 - GASTOS RECENTES EM RESTAURANTES E STREAMING"]);
    }, 2500);
  };

  const handleStartAnalysis = () => {
    if (inputText.length > TEXT_LIMIT) return;
    const payload: (string | { data: string; mimeType: string })[] = [];
    if (inputText.trim()) payload.push(inputText.trim());
    stagedFiles.forEach(f => payload.push({ data: f.data, mimeType: f.type }));
    if (payload.length > 0) onUpload(payload);
  };

  const isTextOverLimit = inputText.length > TEXT_LIMIT;
  const hasContent = (inputText.trim() && !isTextOverLimit) || stagedFiles.length > 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto transition-all">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-xl p-8 shadow-2xl relative overflow-hidden transition-colors border border-gray-100 dark:border-white/10">
        {(isLoading || isLinkingBank) && (
          <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-100 dark:bg-indigo-950 overflow-hidden">
            <div className="h-full bg-indigo-600 animate-progress-indeterminate"></div>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
              {isLoading ? 'Analisando...' : isLinkingBank ? 'Conectando...' : 'Nova Análise'}
            </h3>
            {(isLoading || isLinkingBank) && <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Processando informações financeiras...</p>}
          </div>
          {!isLoading && !isLinkingBank && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>

        <div className={`space-y-6 ${(isLoading || isLinkingBank) ? 'opacity-50 pointer-events-none' : ''}`}>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-indigo-400 dark:hover:border-indigo-50 transition group cursor-pointer relative bg-gray-50 dark:bg-slate-800/50">
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept=".pdf,.png,.jpg,.jpeg,.csv" multiple onChange={handleFileChange} />
              <div className="text-indigo-600 dark:text-indigo-400 mb-2 group-hover:scale-110 transition">
                <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
              </div>
              <p className="text-gray-700 dark:text-slate-200 text-xs font-bold uppercase tracking-wider">Subir Arquivos</p>
            </div>

            <button 
              onClick={simulateBankLink}
              className="border-2 border-indigo-100 dark:border-indigo-900/30 rounded-2xl p-6 text-center hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition group bg-white dark:bg-slate-900 shadow-sm"
            >
              <div className="text-indigo-600 dark:text-indigo-400 mb-2 group-hover:scale-110 transition">
                <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
              </div>
              <p className="text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">Vincular Banco</p>
            </button>
          </div>

          {stagedFiles.length > 0 && (
            <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {stagedFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between bg-gray-50 dark:bg-slate-800 p-3 rounded-xl border border-gray-100 dark:border-white/5 group">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-slate-200 truncate">{file.name}</span>
                  </div>
                  <button onClick={() => removeFile(file.id)} className="text-gray-400 hover:text-rose-500 transition p-1"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
              ))}
            </div>
          )}

          <div className="relative">
            <textarea
              className={`w-full p-4 bg-gray-50 dark:bg-slate-800 border dark:border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px] text-sm text-gray-900 dark:text-white font-medium placeholder-gray-400 dark:placeholder-slate-500 transition-all`}
              placeholder="Ou cole o texto de um extrato aqui..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            ></textarea>
          </div>

          <button onClick={handleStartAnalysis} disabled={!hasContent || isLoading} className={`w-full p-4 rounded-xl font-bold text-lg transition shadow-xl ${!hasContent || isLoading ? 'bg-gray-100 dark:bg-slate-800 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'}`}>
            {isLoading ? 'Lendo Dados...' : 'Iniciar Análise'}
          </button>
        </div>
      </div>
    </div>
  );
};
