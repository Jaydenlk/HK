import React from 'react';
import { Stats } from '../types';
import { AlertTriangle, CheckCircle2, Package, Truck } from 'lucide-react';

interface StatsCardsProps {
  stats: Stats;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex flex-col">
        <div className="flex items-center gap-2 mb-2 text-red-600">
          <AlertTriangle className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">緊急需求</span>
        </div>
        <span className="text-2xl font-bold text-slate-900">{stats.highUrgency}</span>
        <span className="text-xs text-red-700/60 mt-1">需要立即關注</span>
      </div>

      <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col">
        <div className="flex items-center gap-2 mb-2 text-slate-500">
          <Package className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">總需求</span>
        </div>
        <span className="text-2xl font-bold text-slate-900">{stats.totalNeeds}</span>
        <span className="text-xs text-slate-400 mt-1">等待物資中</span>
      </div>

      <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col">
        <div className="flex items-center gap-2 mb-2 text-blue-600">
          <Truck className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">可用資源</span>
        </div>
        <span className="text-2xl font-bold text-slate-900">{stats.totalOffers}</span>
        <span className="text-xs text-slate-400 mt-1">義工/物資提供</span>
      </div>

      <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex flex-col">
        <div className="flex items-center gap-2 mb-2 text-emerald-600">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">已完成</span>
        </div>
        <span className="text-2xl font-bold text-slate-900">{stats.completed}</span>
        <span className="text-xs text-emerald-700/60 mt-1">成功配對案件</span>
      </div>
    </div>
  );
};