import React, { useState } from 'react';
import { parseMessageToEntries } from '../services/aiService';
import { ReliefEntry } from '../types';
import { Sparkles, ArrowRight, Loader2, MessageSquarePlus } from 'lucide-react';

interface SmartInputProps {
  onEntriesParsed: (entries: ReliefEntry[]) => void;
}

export const SmartInput: React.FC<SmartInputProps> = ({ onEntriesParsed }) => {
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!input.trim()) return;

    setIsAnalyzing(true);
    try {
      const entries = await parseMessageToEntries(input);
      onEntriesParsed(entries);
      setInput(''); // Clear input on success
    } catch (e) {
      alert("無法分析訊息，請稍後再試。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-500" />
          智能訊息整合 (AI Parser)
        </h3>
        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">Powered by Gemini 2.5</span>
      </div>
      <div className="p-4">
        <p className="text-sm text-slate-500 mb-3">
          直接貼上 WhatsApp/WeChat 的轉發訊息。AI 會自動提取地點、物資、聯絡人等資訊。
        </p>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="例如：急！大埔體育館避難中心現在缺 50 份便當和飲用水，搵陳生 91234567..."
          className="w-full h-32 p-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all resize-none mb-3"
        />
        <div className="flex justify-end">
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !input.trim()}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isAnalyzing || !input.trim()
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-brand-600 hover:bg-brand-700 text-white shadow-md hover:shadow-lg'
            }`}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                正在分析...
              </>
            ) : (
              <>
                <MessageSquarePlus className="w-4 h-4" />
                提取資訊並新增
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};