import React, { useMemo, useRef, useState } from 'react';
import { ReliefEntry, Status, UrgencyLevel, EntryType } from '../types';
import { MapPin, Phone, Clock, AlertCircle, CheckCircle, PackageOpen, Download, Loader2, Pencil, Save, X, Plus, Filter, StickyNote, FileSpreadsheet, Map, Trash2 } from 'lucide-react';
// @ts-ignore - html2canvas is loaded via importmap
import html2canvas from 'html2canvas';

interface ReliefTableProps {
  entries: ReliefEntry[];
  onUpdateStatus: (id: string, newStatus: Status) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, updatedEntry: Partial<ReliefEntry>) => void;
  onManualAdd: () => ReliefEntry;
}

export const ReliefTable: React.FC<ReliefTableProps> = ({ entries, onUpdateStatus, onDelete, onEdit, onManualAdd }) => {
  const tableRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ReliefEntry>>({});

  // Filter state
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'NEED' | 'OFFER'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');

  // Derive unique categories for auto-complete
  const existingCategories = useMemo(() => {
    const cats = new Set(entries.map(e => e.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [entries]);

  // Filter and Sort entries
  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      // Type Filter
      if (typeFilter !== 'ALL' && entry.type !== typeFilter) return false;
      
      // Status Filter
      if (statusFilter === 'ACTIVE') {
         // Show Pending or In Progress (Anything not completed)
         if (entry.status === 'COMPLETED') return false;
      } else if (statusFilter === 'COMPLETED') {
         if (entry.status !== 'COMPLETED') return false;
      }
      
      return true;
    }).sort((a, b) => {
      // Sort logic: Completed last, then High Urgency, then Newest
      if (a.status === 'COMPLETED' && b.status !== 'COMPLETED') return 1;
      if (a.status !== 'COMPLETED' && b.status === 'COMPLETED') return -1;
      
      const urgencyScore: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      // Fallback for safety, though types enforce 'HIGH'|'MEDIUM'|'LOW'
      const scoreA = urgencyScore[a.urgency as string] || 1;
      const scoreB = urgencyScore[b.urgency as string] || 1;
      
      if (scoreA !== scoreB) {
        return scoreB - scoreA;
      }
      return b.timestamp - a.timestamp;
    });
  }, [entries, typeFilter, statusFilter]);

  const handleDownload = async () => {
    if (!tableRef.current) return;
    setIsDownloading(true);
    try {
      // Use html2canvas to capture the specific element
      const canvas = await html2canvas(tableRef.current, {
        useCORS: true,
        scale: 2, // Higher scale for better text clarity
        backgroundColor: '#ffffff',
        // Ignore elements with 'no-print' class (like the download button itself)
        ignoreElements: (element) => element.classList.contains('no-print')
      });
      
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      link.download = `Taipo-Relief-Update-${timestamp}.png`;
      link.href = url;
      link.click();
    } catch (error) {
      console.error('Download failed:', error);
      alert('圖片下載失敗，請稍後再試。');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleExportCSV = () => {
    if (filteredEntries.length === 0) {
      alert("沒有可導出的數據");
      return;
    }

    // CSV Headers
    const headers = ["類型", "狀態", "急迫性", "類別", "物品", "數量", "地點", "聯絡方法", "備註", "時間", "原始訊息"];
    
    // Map data
    const rows = filteredEntries.map(entry => {
      const time = new Date(entry.timestamp).toLocaleString('zh-HK');
      // Translate urgency for CSV
      const urgencyMap: Record<string, string> = { 'HIGH': '緊急', 'MEDIUM': '中等', 'LOW': '一般' };
      const urgencyText = urgencyMap[entry.urgency] || entry.urgency;

      return [
        entry.type === 'NEED' ? '需求' : '提供',
        entry.status === 'COMPLETED' ? '已完成' : '待處理',
        urgencyText,
        entry.category,
        entry.item,
        entry.quantity,
        entry.location,
        entry.contactInfo,
        entry.notes || '',
        time,
        entry.originalMessage
      ].map(field => {
        // Escape quotes and wrap in quotes if necessary
        const stringField = String(field || '');
        if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
          return `"${stringField.replace(/"/g, '""')}"`;
        }
        return stringField;
      });
    });

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    
    // Add BOM for Excel UTF-8 compatibility
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    link.href = url;
    link.download = `Taipo-Relief-Data-${timestamp}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleManualAddClick = () => {
    // Reset filters to ensure the new item is visible
    setTypeFilter('ALL');
    setStatusFilter('ALL'); 
    
    const newEntry = onManualAdd();
    setEditingId(newEntry.id);
    setEditForm(newEntry);
  };

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  const getUrgencyBadge = (level: UrgencyLevel) => {
    switch (level) {
      case 'HIGH':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><AlertCircle className="w-3 h-3"/> 緊急</span>;
      case 'MEDIUM':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">中等</span>;
      case 'LOW':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">一般</span>;
    }
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300 relative">
         <div className="absolute top-4 right-4">
             <button 
              onClick={handleManualAddClick}
              className="flex items-center gap-1 text-sm text-brand-600 hover:bg-brand-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" /> 手動新增
            </button>
         </div>
        <PackageOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-slate-900 font-medium">暫無資料</h3>
        <p className="text-slate-500 text-sm">請在上方輸入訊息以建立第一筆記錄，或點擊手動新增。</p>
      </div>
    );
  }

  return (
    <div ref={tableRef} className="bg-white rounded-xl shadow-sm border border-slate-200 relative w-full">
      <datalist id="category-list">
        {existingCategories.map(cat => (
          <option key={cat} value={cat} />
        ))}
      </datalist>

      {/* Header bar for screenshot context and actions */}
      <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap gap-4 justify-between items-center bg-slate-50">
          <div className="flex flex-col flex-grow min-w-[200px]">
             <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                即時需求與供應列表
             </h2>
             <span className="text-[10px] text-slate-500 font-mono">更新於: {new Date().toLocaleTimeString('zh-HK')}</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
                onClick={handleManualAddClick}
                className="no-print flex items-center gap-1.5 px-3 py-1.5 bg-white border border-brand-200 text-brand-600 rounded-lg shadow-sm text-xs font-medium hover:bg-brand-50 transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">新增項目</span>
            </button>
            <button 
              onClick={handleExportCSV}
              className="no-print flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm text-slate-600 text-xs font-medium hover:bg-slate-50 hover:text-green-600 transition-all active:scale-95"
              title="導出為 CSV 檔案"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">導出 CSV</span>
            </button>
            <button 
              onClick={handleDownload}
              disabled={isDownloading}
              className="no-print flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm text-slate-600 text-xs font-medium hover:bg-slate-50 hover:text-brand-600 transition-all active:scale-95"
              title="下載為圖片以便在 WhatsApp/WeChat 轉發"
            >
              {isDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Download className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">下載圖片轉發</span>
              <span className="sm:hidden">下載</span>
            </button>
          </div>
      </div>

      {/* Filter Toolbar */}
      <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100 flex flex-wrap gap-3 items-center no-print">
         <div className="flex items-center gap-2">
             <span className="text-xs font-medium text-slate-500 flex items-center gap-1"><Filter className="w-3 h-3"/> 類型:</span>
             <div className="flex bg-slate-200/50 rounded-lg p-0.5">
                 <button 
                    onClick={() => setTypeFilter('ALL')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${typeFilter === 'ALL' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                    全部
                 </button>
                 <button 
                    onClick={() => setTypeFilter('NEED')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${typeFilter === 'NEED' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                    需求
                 </button>
                 <button 
                    onClick={() => setTypeFilter('OFFER')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${typeFilter === 'OFFER' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                    提供
                 </button>
             </div>
         </div>

         <div className="w-px h-4 bg-slate-300 hidden sm:block"></div>

         <div className="flex items-center gap-2">
             <span className="text-xs font-medium text-slate-500">狀態:</span>
             <div className="flex bg-slate-200/50 rounded-lg p-0.5">
                 <button 
                    onClick={() => setStatusFilter('ALL')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${statusFilter === 'ALL' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                    全部
                 </button>
                 <button 
                    onClick={() => setStatusFilter('ACTIVE')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${statusFilter === 'ACTIVE' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                    待處理
                 </button>
                 <button 
                    onClick={() => setStatusFilter('COMPLETED')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${statusFilter === 'COMPLETED' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                    已完成
                 </button>
             </div>
         </div>

         <div className="ml-auto text-xs text-slate-400">
             顯示 {filteredEntries.length} 筆
         </div>
      </div>

      {/* Table Container - Removed overflow-x-auto, added table-fixed */}
      <div className="w-full">
        <table className="w-full text-left text-sm table-fixed">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate-700 w-[12%]">狀態 / 急迫性</th>
              <th className="px-4 py-3 font-semibold text-slate-700 w-[28%]">物品 / 類別 / 數量</th>
              <th className="px-4 py-3 font-semibold text-slate-700 w-[25%]">地點 / 時間 / 聯絡</th>
              <th className="px-4 py-3 font-semibold text-slate-700 w-[35%]">備註 / 完成狀態 / 操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredEntries.map((entry) => {
              const isEditing = editingId === entry.id;

              if (isEditing) {
                return (
                   <tr key={entry.id} className="bg-amber-50 shadow-inner">
                      <td className="px-4 py-4 align-top">
                        <div className="flex flex-col gap-2">
                           <select 
                              value={editForm.type}
                              onChange={(e) => handleFormChange('type', e.target.value)}
                              className="text-xs border-slate-300 rounded p-1 w-full focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                              onKeyDown={handleKeyDown}
                           >
                              <option value="NEED">需求</option>
                              <option value="OFFER">提供</option>
                           </select>
                           <select 
                              value={editForm.urgency}
                              onChange={(e) => handleFormChange('urgency', e.target.value)}
                              className="text-xs border-slate-300 rounded p-1 w-full focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                              onKeyDown={handleKeyDown}
                           >
                              <option value="HIGH">緊急</option>
                              <option value="MEDIUM">中等</option>
                              <option value="LOW">一般</option>
                           </select>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top">
                         <div className="flex flex-col gap-2">
                            <input 
                              type="text" 
                              value={editForm.item || ''} 
                              onChange={(e) => handleFormChange('item', e.target.value)}
                              className="text-sm border-slate-300 rounded p-1 w-full placeholder:text-slate-400 font-medium focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                              placeholder="物品名稱"
                              onKeyDown={handleKeyDown}
                              autoFocus
                            />
                            <div className="flex gap-2">
                                <input 
                                  type="text" 
                                  value={editForm.category || ''} 
                                  onChange={(e) => handleFormChange('category', e.target.value)}
                                  className="text-xs border-slate-300 rounded p-1 w-1/2 placeholder:text-slate-400 bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                  placeholder="類別"
                                  list="category-list"
                                  onKeyDown={handleKeyDown}
                                />
                                <input 
                                  type="text" 
                                  value={editForm.quantity || ''} 
                                  onChange={(e) => handleFormChange('quantity', e.target.value)}
                                  className="text-xs border-slate-300 rounded p-1 w-1/2 placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                  placeholder="數量"
                                  onKeyDown={handleKeyDown}
                                />
                            </div>
                         </div>
                      </td>
                      <td className="px-4 py-4 align-top">
                         <div className="flex flex-col gap-2">
                            <input 
                              type="text" 
                              value={editForm.location || ''} 
                              onChange={(e) => handleFormChange('location', e.target.value)}
                              className="text-sm border-slate-300 rounded p-1 w-full placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                              placeholder="地點"
                              onKeyDown={handleKeyDown}
                            />
                            <input 
                              type="text" 
                              value={editForm.contactInfo || ''} 
                              onChange={(e) => handleFormChange('contactInfo', e.target.value)}
                              className="text-xs border-slate-300 rounded p-1 w-full placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                              placeholder="聯絡方法"
                              onKeyDown={handleKeyDown}
                            />
                            <div className="text-[10px] text-slate-400 italic">
                               * 儲存後自動更新時間
                            </div>
                         </div>
                      </td>
                      <td className="px-4 py-4 align-top">
                         <div className="flex flex-col gap-3 h-full justify-between">
                            <textarea
                                value={editForm.notes || ''}
                                onChange={(e) => handleFormChange('notes', e.target.value)}
                                className="text-xs border-slate-300 rounded p-1 w-full h-[60px] placeholder:text-slate-400 resize-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                placeholder="額外備註..."
                            />
                            <div className="flex items-center justify-end gap-2 no-print">
                                <button onClick={saveEdit} className="text-green-600 flex items-center gap-1 text-xs font-bold hover:bg-green-50 px-2 py-1 rounded border border-green-200 bg-white shadow-sm">
                                <Save className="w-4 h-4" /> 儲存
                                </button>
                                <button onClick={cancelEdit} className="text-slate-500 flex items-center gap-1 text-xs hover:bg-slate-200 px-2 py-1 rounded">
                                <X className="w-4 h-4" /> 取消
                                </button>
                            </div>
                         </div>
                      </td>
                   </tr>
                );
              }

              // Read-only View
              return (
              <tr key={entry.id} className={`hover:bg-slate-50 transition-colors ${entry.status === 'COMPLETED' ? 'bg-slate-50/50 opacity-60' : ''}`}>
                <td className="px-4 py-4 align-top">
                  <div className="flex flex-col items-start gap-2">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                      entry.type === 'NEED' 
                        ? 'bg-rose-50 text-rose-700 border-rose-200' 
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    }`}>
                      {entry.type === 'NEED' ? '需求' : '提供'}
                    </span>
                    {getUrgencyBadge(entry.urgency)}
                  </div>
                </td>
                <td className="px-4 py-4 align-top">
                  <div>
                    <div className="text-slate-900 font-medium text-base break-words">{entry.item}</div>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                       <div className="text-slate-500 text-xs bg-slate-100 px-2 py-0.5 rounded-full inline-block border border-slate-200">
                          {entry.category}
                       </div>
                       <div className="text-blue-700 text-xs bg-blue-50 px-2 py-0.5 rounded-full inline-block border border-blue-100 font-bold">
                          {entry.quantity}
                       </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 align-top">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start gap-1.5 text-slate-700">
                      <MapPin className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" />
                      <div className="flex flex-col items-start gap-0.5 w-full">
                        <span className="break-words font-medium w-full">{entry.location}</span>
                        {entry.location && (
                           <a 
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(entry.location + " 大埔 香港")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="no-print inline-flex items-center gap-1 text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 hover:bg-blue-100 transition-colors"
                              title="在 Google 地圖查看"
                           >
                              <Map className="w-3 h-3" /> 地圖查看
                           </a>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{new Date(entry.timestamp).toLocaleTimeString('zh-HK', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    {entry.contactInfo !== 'None' && (
                       <div className="flex items-start gap-1.5 text-slate-600 text-xs">
                        <Phone className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" />
                        <span className="font-mono break-all">{entry.contactInfo}</span>
                      </div>
                    )}

                    {entry.originalMessage !== 'Manual Entry' && entry.originalMessage !== '手動新增項目' && (
                       <div className="mt-1 text-[10px] text-slate-400 max-w-full truncate no-print cursor-help border-t border-slate-100 pt-1" title={entry.originalMessage}>
                          源: {entry.originalMessage}
                       </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 align-top">
                   <div className="flex flex-col justify-between h-full gap-3">
                      <div>
                        {entry.notes ? (
                            <div className="flex items-start gap-1 text-xs text-slate-600 bg-amber-50/50 p-2 rounded border border-amber-100/50">
                                <StickyNote className="w-3 h-3 mt-0.5 text-amber-400 shrink-0" />
                                <span className="whitespace-pre-wrap break-words">{entry.notes}</span>
                            </div>
                        ) : (
                            <span className="text-slate-300 text-xs italic pl-1">- 無備註 -</span>
                        )}
                      </div>
                      
                      <div className="no-print pt-3 border-t border-slate-100 flex items-center justify-end gap-3 mt-auto">
                        {/* Completion Toggle */}
                        <label className="inline-flex items-center cursor-pointer group" title="切換完成狀態">
                            <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={entry.status === 'COMPLETED'}
                            onChange={() => onUpdateStatus(entry.id, entry.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED')}
                            />
                            <div className="relative w-7 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
                            <span className={`ml-2 text-xs font-bold transition-colors ${entry.status === 'COMPLETED' ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {entry.status === 'COMPLETED' ? '已完成' : '進行中'}
                            </span>
                        </label>
                        
                        <div className="h-4 w-px bg-slate-200"></div>

                        <div className="flex items-center gap-1">
                            <button 
                            onClick={() => startEdit(entry)}
                            className="text-slate-400 hover:text-brand-600 p-1 rounded hover:bg-brand-50 transition-colors"
                            title="編輯"
                            >
                            <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button 
                            onClick={() => {
                                if(confirm('確定要刪除這條記錄嗎？')) onDelete(entry.id);
                            }}
                            className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                            title="刪除"
                            >
                            <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                      </div>
                   </div>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>

      {/* Footer watermark for exported images */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-center text-[10px] text-slate-400">
         大埔火災支援協調平台 • 資訊由大埔火災支援系統整理 • 請以官方消息為準 • Design by KINGKAZMAX
      </div>
    </div>
  );
};