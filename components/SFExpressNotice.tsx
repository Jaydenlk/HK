import React from 'react';
import { Phone, PackageCheck, Truck } from 'lucide-react';

export const SFExpressNotice: React.FC = () => {
  return (
    <div className="bg-[#1a1a1a] text-white rounded-xl shadow-lg border border-slate-800 overflow-hidden">
      <div className="bg-black p-4 border-b border-slate-800 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <div className="bg-red-600 text-white p-1 rounded">
               <Truck className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm">順豐香港支援</span>
         </div>
         <span className="text-[10px] bg-red-900/40 text-red-200 px-2 py-0.5 rounded-full border border-red-900/50">義務收集</span>
      </div>
      
      <div className="p-5 space-y-4">
        <div>
           <h3 className="font-bold text-base mb-1 text-white leading-tight">全港146個順豐站<br/>義務收集應急資源</h3>
           <p className="text-[10px] text-slate-500 mb-3">自即日起 • 全力支援大埔火災救援</p>
           
           <ul className="grid grid-cols-1 gap-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <PackageCheck className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
                <span>洗護用品 (洗髮水、沐浴露)</span>
              </li>
              <li className="flex items-start gap-2">
                <PackageCheck className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
                <span>床品 (床單、被子)</span>
              </li>
              <li className="flex items-start gap-2">
                <PackageCheck className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
                <span>衛生用品 (紙巾、衛生巾)</span>
              </li>
              <li className="flex items-start gap-2">
                <PackageCheck className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
                <span>數據卡、充電器</span>
              </li>
              <li className="flex items-start gap-2">
                <PackageCheck className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
                <span>衣物 (內衣除外)</span>
              </li>
              <li className="flex items-start gap-2">
                <PackageCheck className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
                <span>醫療用品 (急救包、常用藥物)</span>
              </li>
           </ul>
        </div>

        <div className="text-xs text-slate-400 space-y-1.5 bg-slate-800/40 p-3 rounded-lg border border-slate-800">
           <p className="flex gap-2">
              <span className="text-red-500 font-bold">•</span>
              <span>公司提供免費運輸，協助送至受影響居民手中。</span>
           </p>
           <p className="flex gap-2">
              <span className="text-red-500 font-bold">•</span>
              <span>順豐站免費提供封箱膠紙、紙箱等包裝材料。</span>
           </p>
        </div>

        <div className="flex flex-col gap-1 border-t border-slate-800 pt-3">
           <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">緊急救援物流專線</span>
           <div className="flex items-center gap-2 text-red-500 font-bold text-xl">
              <Phone className="w-5 h-5" />
              2929 2929 - 2
           </div>
           <span className="text-[10px] text-slate-600">順豐香港客服專員</span>
        </div>
      </div>
    </div>
  );
};