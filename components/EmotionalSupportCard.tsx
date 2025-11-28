import React from 'react';
import { HeartHandshake, Phone, Users, MessageCircleHeart, Activity } from 'lucide-react';

export const EmotionalSupportCard: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-rose-50 p-4 border-b border-rose-100 flex items-center gap-2">
        <div className="bg-rose-100 p-1.5 rounded-lg text-rose-600">
           <HeartHandshake className="w-5 h-5" />
        </div>
        <h3 className="font-bold text-rose-900">情緒支援服務</h3>
      </div>
      
      <div className="p-4 space-y-4">
        <div className="space-y-3 text-xs text-slate-700">
           <div className="flex gap-2 items-start">
              <Users className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
              <span>醫務社工正為傷者及相關家屬提供情緒支援。</span>
           </div>
           <div className="flex gap-2 items-start">
              <Activity className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <span>香港紅十字會派員到臨時庇護中心提供情緒支援及簡單醫療服務。</span>
           </div>
           <div className="flex gap-2 items-start">
              <Phone className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
              <span>醫務衞生局安排 <strong>18 111</strong> 情緒通熱線增加人手。</span>
           </div>
           <div className="flex gap-2 items-start">
              <MessageCircleHeart className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
              <span>「陪我講 Shall We Talk」社交媒體已上載有關應對壓力或負面情緒的支援信息。</span>
           </div>
        </div>

        <div className="border-t border-slate-100 pt-3">
           <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">支援熱線</h4>
           <div className="space-y-1.5">
              {[
                  { name: "社會福利署熱線", phone: "2343 2255" },
                  { name: "香港撒瑪利亞防止自殺會", phone: "2389 2222" },
                  { name: "撒瑪利亞會 (多種語言)", phone: "2896 0000" },
                  { name: "生命熱線", phone: "2382 0000" },
                  { name: "明愛向晴熱線", phone: "18288" },
                  { name: "救主堂支援電話", phone: "2651 1998" }
              ].map((line, idx) => (
                 <div key={idx} className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded hover:bg-rose-50 transition-colors group border border-slate-100">
                    <span className="text-slate-600 font-medium">{line.name}</span>
                    <a href={`tel:${line.phone.replace(/ /g, '')}`} className="flex items-center gap-1 text-rose-600 font-bold font-mono hover:underline">
                       <Phone className="w-3 h-3" />
                       {line.phone}
                    </a>
                 </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};