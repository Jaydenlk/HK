import React, { useMemo, useState } from 'react';
import { ReliefEntry } from '../types';
import { X, BarChart3, ArrowDownCircle, ArrowUpCircle, PackageOpen, Pencil, Trash2, Save, Check } from 'lucide-react';

interface SuppliesSummaryProps {
  entries: ReliefEntry[];
  isOpen: boolean;
  onClose: () => void;
  onEdit: (id: string, data: Partial<ReliefEntry>) => void;
  onDelete: (id: string) => void;
}

export const SuppliesSummary: React.FC<SuppliesSummaryProps> = ({ entries, isOpen, onClose, onEdit, onDelete }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ReliefEntry>>({});

  const { needsMap, offersMap, totalNeeds, totalOffers } = useMemo(() => {
    const needsMap: Record<string, ReliefEntry[]> = {};
    const offersMap: Record<string, ReliefEntry[]> = {};
    let totalNeeds = 0;
    let totalOffers = 0;

    entries.filter(e => e.status !== 'COMPLETED').forEach(e => {
      const cat = e.category?.trim() || '未分類';
      if (e.type === 'NEED') {
        if (!needsMap[cat]) needsMap[cat] = [];
        needsMap[cat].push(e);
        totalNeeds++;
      } else {
        if (!offersMap[cat]) offersMap[cat] = [];
        offersMap[cat].push(e);
        totalOffers++;
      }
    });

    return { needsMap, offersMap, totalNeeds, totalOffers };
  }, [entries]);

  const startEdit = (entry: ReliefEntry) => {
    setEditingId(entry.id);
    setEditForm({ ...entry });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = () => {
    if (editingId && editForm) {
      onEdit(editingId, editForm);
      setEditingId(null);
      setEditForm({});
    }
  };

  const handleFormChange = (field: keyof ReliefEntry, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const renderItemRow = (item: ReliefEntry, isNeed: boolean) => {
    const isEditing = editingId === item.id;

    if (isEditing) {
       return (
          <div key={item.id} className="px-4 py-3 text-sm bg-amber-50/50 flex flex-col gap-2 border-b border-amber-100">
             <div className="flex gap-2">
                <input 
                  type="text"
                  value={editForm.item || ''}
                  onChange={(e) => handleFormChange('item', e.target.value)}
                  className="flex-1 text-sm border-slate-300 rounded p-1.5 focus:ring-1 focus:ring-amber-500"
                  placeholder="物品名稱"
                  autoFocus
                />
                <input 
                  type="text"
                  value={editForm.quantity || ''}
                  onChange={(e) => handleFormChange('quantity', e.target.value)}
                  className="w-24 text-sm border-slate-300 rounded p-1.5 focus:ring-1 focus:ring-amber-500 text-right"
                  placeholder="數量"
                />
             </div>
             <div className="flex gap-2">
                <input 
                  type="text"
                  value={editForm.location || ''}
                  onChange={(e) => handleFormChange('location', e.target.value)}
                  className="flex-1 text-xs border-slate-300 rounded p-1.5 focus:ring-1 focus:ring-amber-500"
                  placeholder="地點"
                />
             </div>
             <div className="flex justify-end gap-2 mt-1">
                <button 
                   onClick={saveEdit}
                   className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                >
                   <Save className="w-3 h-3" /> 儲存
                </button>
                <button 
                   onClick={cancelEdit}
                   className="flex items-center gap-1 px-2 py-1 bg-slate-200 text-slate-600 text-xs rounded hover:bg-slate-300"
                >
                   <X className="w-3 h-3" /> 取消
                </button>
             </div>
          </div>
       );
    }

    return (
       <div key={item.id} className="px-4 py-3 text-sm flex justify-between items-start gap-3 hover:bg-slate-50 transition-colors group">
          <div className="flex-1 min-w-0">
             <div className="font-medium text-slate-800 break-words">{item.item}</div>
             <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <span className="truncate max-w-[200px]">{item.location}</span>
             </div>
          </div>
          <div className="text-right shrink-0 flex flex-col items-end gap-1">
             <div className={`${isNeed ? 'text-rose-700 bg-rose-50 border-rose-100/50' : 'text-emerald-700 bg-emerald-50 border-emerald-100/50'} font-bold px-2.5 py-1 rounded-lg text-xs inline-block border`}>
                {item.quantity}
             </div>
             {item.urgency === 'HIGH' && isNeed && (
                <div className="text-[10px] text-red-500 font-bold">緊急</div>
             )}
             
             {/* Edit/Delete Actions - Visible on Hover or Focus */}
             <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity mt-1">
                <button 
                   onClick={() => startEdit(item)}
                   className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                   title="編輯"
                >
                   <Pencil className="w-3 h-3" />
                </button>
                <button 
                   onClick={() => {
                      if(confirm('確定要刪除此統計項目嗎？')) onDelete(item.id);
                   }}
                   className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                   title="刪除"
                >
                   <Trash2 className="w-3 h-3" />
                </button>
             </div>
          </div>
       </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col scale-100">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
             <div className="flex items-center gap-3">
                <div className="bg-indigo-100 p-2.5 rounded-xl">
                   <BarChart3 className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                   <h2 className="text-xl font-bold text-slate-900">全區物資統計總覽</h2>
                   <p className="text-xs text-slate-500 font-medium">實時彙整未完成的需求與供應 (不含已完成項目)</p>
                </div>
             </div>
             <button 
                onClick={onClose} 
                className="p-2 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
             >
                <X className="w-6 h-6" />
             </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
             <div className="grid md:grid-cols-2 gap-8">
                
                {/* Needs Column */}
                <div className="space-y-5">
                   <div className="flex items-center justify-between pb-2 border-b border-rose-100">
                      <h3 className="flex items-center gap-2 font-bold text-lg text-slate-800">
                         <ArrowDownCircle className="w-5 h-5 text-rose-500" />
                         急需物資
                      </h3>
                      <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2.5 py-1 rounded-full">{totalNeeds} 筆需求</span>
                   </div>
                   
                   {Object.keys(needsMap).length === 0 && (
                      <div className="p-12 text-center flex flex-col items-center gap-3 text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                         <PackageOpen className="w-10 h-10 opacity-50" />
                         <span>目前暫無待處理的需求</span>
                      </div>
                   )}

                   {Object.entries(needsMap).map(([category, items]) => (
                      <div key={category} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden group hover:shadow-md transition-shadow">
                         <div className="px-4 py-2.5 bg-rose-50/50 border-b border-rose-100 flex justify-between items-center">
                            <span className="font-bold text-rose-900 text-sm flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                {category}
                            </span>
                            <span className="text-[10px] font-mono bg-white border border-rose-100 text-rose-600 px-2 py-0.5 rounded-md">
                                {items.length} 項目
                            </span>
                         </div>
                         <div className="divide-y divide-slate-50">
                            {items.map(item => renderItemRow(item, true))}
                         </div>
                      </div>
                   ))}
                </div>

                {/* Offers Column */}
                <div className="space-y-5">
                   <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
                      <h3 className="flex items-center gap-2 font-bold text-lg text-slate-800">
                         <ArrowUpCircle className="w-5 h-5 text-emerald-500" />
                         可用資源/義工
                      </h3>
                      <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">{totalOffers} 筆提供</span>
                   </div>

                   {Object.keys(offersMap).length === 0 && (
                      <div className="p-12 text-center flex flex-col items-center gap-3 text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                         <PackageOpen className="w-10 h-10 opacity-50" />
                         <span>目前暫無可用資源記錄</span>
                      </div>
                   )}

                   {Object.entries(offersMap).map(([category, items]) => (
                      <div key={category} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden group hover:shadow-md transition-shadow">
                         <div className="px-4 py-2.5 bg-emerald-50/50 border-b border-emerald-100 flex justify-between items-center">
                            <span className="font-bold text-emerald-900 text-sm flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                {category}
                            </span>
                            <span className="text-[10px] font-mono bg-white border border-emerald-100 text-emerald-600 px-2 py-0.5 rounded-md">
                                {items.length} 項目
                            </span>
                         </div>
                         <div className="divide-y divide-slate-50">
                            {items.map(item => renderItemRow(item, false))}
                         </div>
                      </div>
                   ))}
                </div>

             </div>
          </div>
          
          {/* Footer Actions */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
             <button 
                onClick={onClose} 
                className="px-6 py-2.5 bg-slate-900 text-white shadow-lg shadow-slate-200 hover:shadow-xl rounded-xl font-medium hover:bg-slate-800 transition-all active:scale-95"
             >
                關閉列表
             </button>
          </div>
       </div>
    </div>
  );
};