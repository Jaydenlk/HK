import React, { useState, useMemo } from 'react';
import { LocationStatus, Contact } from '../types';
import { MapPin, Phone, CheckCircle2, AlertCircle, HelpCircle, Clock, Map, Pencil, Save, X, Plus, Trash2 } from 'lucide-react';

interface LocationStatusBoardProps {
  locations: LocationStatus[];
  onUpdateLocation: (id: string, updatedData: Partial<LocationStatus>) => void;
  onAddLocation: () => void;
  onDeleteLocation: (id: string) => void;
}

export const LocationStatusBoard: React.FC<LocationStatusBoardProps> = ({ locations, onUpdateLocation, onAddLocation, onDeleteLocation }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<LocationStatus>>({});

  const sortedLocations = useMemo(() => {
    return [...locations].sort((a, b) => {
      // Logic: 
      // 1. True (Urgent)
      // 2. String (Pending/Other)
      // 3. Null (Unknown)
      // 4. False (Not needed)
      
      const score = (val: boolean | string | null) => {
        if (val === true) return 4;
        if (typeof val === 'string') return 3;
        if (val === null) return 2;
        return 1;
      };

      return score(b.needs_support) - score(a.needs_support);
    });
  }, [locations]);

  const startEdit = (loc: LocationStatus) => {
    setEditingId(loc.id);
    setEditForm(JSON.parse(JSON.stringify(loc))); // Deep copy
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = () => {
    if (editingId && editForm) {
      onUpdateLocation(editingId, editForm);
      setEditingId(null);
      setEditForm({});
    }
  };

  const handleContactChange = (index: number, field: keyof Contact, value: string) => {
    const updatedContacts = [...(editForm.contacts || [])];
    updatedContacts[index] = { ...updatedContacts[index], [field]: value };
    setEditForm(prev => ({ ...prev, contacts: updatedContacts }));
  };

  const addContact = () => {
    setEditForm(prev => ({ 
      ...prev, 
      contacts: [...(prev.contacts || []), { name: '', phone: '' }] 
    }));
  };

  const removeContact = (index: number) => {
    const updatedContacts = [...(editForm.contacts || [])];
    updatedContacts.splice(index, 1);
    setEditForm(prev => ({ ...prev, contacts: updatedContacts }));
  };

  const confirmDelete = (id: string, name: string) => {
    if (window.confirm(`確定要刪除「${name}」這個站點嗎？此動作無法復原。`)) {
      onDeleteLocation(id);
      if (editingId === id) cancelEdit();
    }
  };

  const getStatusColor = (status: boolean | string | null) => {
    if (status === true) return 'bg-red-50 border-red-200 shadow-red-100';
    if (status === false) return 'bg-emerald-50 border-emerald-200 shadow-emerald-100';
    if (typeof status === 'string') return 'bg-amber-50 border-amber-200 shadow-amber-100';
    return 'bg-white border-slate-200 shadow-slate-100';
  };

  const getStatusIcon = (status: boolean | string | null) => {
    if (status === true) return <AlertCircle className="w-5 h-5 text-red-600" />;
    if (status === false) return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
    if (typeof status === 'string') return <Clock className="w-5 h-5 text-amber-600" />;
    return <HelpCircle className="w-5 h-5 text-slate-400" />;
  };

  const renderEditMode = (loc: LocationStatus) => {
    return (
      <div className="rounded-xl border border-blue-200 bg-white p-4 shadow-md relative flex flex-col h-full gap-3">
         <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <input 
               className="font-bold text-slate-900 border-b border-dashed border-slate-300 focus:border-blue-500 outline-none w-full mr-2"
               value={editForm.location_name}
               onChange={(e) => setEditForm(prev => ({...prev, location_name: e.target.value}))}
               placeholder="站點名稱"
            />
            <div className="flex items-center gap-1 shrink-0">
               <button onClick={saveEdit} className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200" title="儲存"><Save className="w-4 h-4"/></button>
               <button onClick={cancelEdit} className="p-1.5 bg-slate-100 text-slate-600 rounded hover:bg-slate-200" title="取消"><X className="w-4 h-4"/></button>
            </div>
         </div>

         <div>
            <label className="text-xs font-bold text-slate-500 uppercase">狀態類別</label>
            <select 
               className="w-full text-sm border-slate-300 rounded p-1.5 mt-1"
               value={String(editForm.needs_support)}
               onChange={(e) => {
                  const val = e.target.value;
                  let newVal: boolean | string | null = null;
                  if (val === 'true') newVal = true;
                  else if (val === 'false') newVal = false;
                  else if (val === 'string') newVal = 'Pending';
                  
                  setEditForm(prev => ({ 
                     ...prev, 
                     needs_support: val === 'string' ? 'Pending' : newVal,
                  }));
               }}
            >
               <option value="true">急需支援 (紅色)</option>
               <option value="string">待定/特殊 (黃色)</option>
               <option value="false">充足/無需 (綠色)</option>
               <option value="null">未註明 (灰色)</option>
            </select>
         </div>

         {typeof editForm.needs_support === 'string' && (
            <input 
               type="text"
               value={editForm.needs_support}
               onChange={(e) => setEditForm(prev => ({...prev, needs_support: e.target.value}))}
               className="w-full text-sm border-amber-300 bg-amber-50 rounded p-1.5"
               placeholder="輸入待定狀態詳情..."
            />
         )}

         <div>
            <label className="text-xs font-bold text-slate-500 uppercase">目前詳細狀態</label>
            <textarea 
               className="w-full text-sm border-slate-300 rounded p-1.5 mt-1 h-20 resize-none"
               value={editForm.current_status}
               onChange={(e) => setEditForm(prev => ({...prev, current_status: e.target.value}))}
            />
         </div>

         <div>
            <div className="flex justify-between items-center mb-1">
               <label className="text-xs font-bold text-slate-500 uppercase">聯絡人</label>
               <button onClick={addContact} className="text-xs bg-slate-100 px-2 py-0.5 rounded hover:bg-slate-200"><Plus className="w-3 h-3"/></button>
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
               {editForm.contacts?.map((contact, idx) => (
                  <div key={idx} className="flex gap-1">
                     <input 
                        className="w-1/3 text-xs border-slate-300 rounded p-1"
                        placeholder="姓名"
                        value={contact.name}
                        onChange={(e) => handleContactChange(idx, 'name', e.target.value)}
                     />
                     <input 
                        className="flex-1 text-xs border-slate-300 rounded p-1"
                        placeholder="電話"
                        value={contact.phone}
                        onChange={(e) => handleContactChange(idx, 'phone', e.target.value)}
                     />
                     <button onClick={() => removeContact(idx)} className="text-slate-400 hover:text-red-500 px-1"><X className="w-3 h-3"/></button>
                  </div>
               ))}
            </div>
         </div>

         <div className="mt-auto pt-3 border-t border-slate-100 flex justify-between items-center">
            <span className="text-[10px] text-slate-400">ID: {loc.id.slice(0, 8)}</span>
            <button 
               onClick={() => confirmDelete(loc.id, loc.location_name)}
               className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded"
            >
               <Trash2 className="w-3 h-3" /> 刪除站點
            </button>
         </div>
      </div>
    );
  };

  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
         <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-slate-700" />
            <h2 className="text-lg font-bold text-slate-800">各救援站點實時狀態</h2>
            <span className="hidden sm:inline text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full">實時更新 • 按緊急度排序</span>
         </div>
         <button 
            onClick={onAddLocation}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
         >
            <Plus className="w-4 h-4" /> 新增站點
         </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sortedLocations.map((loc) => {
          if (editingId === loc.id) {
             return <div key={loc.id} className="h-full">{renderEditMode(loc)}</div>;
          }

          return (
            <div 
               key={loc.id} 
               className={`rounded-xl border p-4 transition-all hover:shadow-lg flex flex-col h-full group relative ${getStatusColor(loc.needs_support)}`}
            >
               {/* Action Buttons - Visible on hover */}
               <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button 
                     onClick={() => startEdit(loc)}
                     className="p-1.5 bg-white/90 backdrop-blur rounded-full shadow-sm text-slate-400 hover:text-blue-600 border border-slate-200 hover:border-blue-200"
                     title="編輯此站點資訊"
                  >
                     <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button 
                     onClick={() => confirmDelete(loc.id, loc.location_name)}
                     className="p-1.5 bg-white/90 backdrop-blur rounded-full shadow-sm text-slate-400 hover:text-red-600 border border-slate-200 hover:border-red-200"
                     title="刪除此站點"
                  >
                     <Trash2 className="w-3.5 h-3.5" />
                  </button>
               </div>

               <div className="flex justify-between items-start mb-3 pr-14">
                  <h3 className="font-bold text-slate-900 text-lg leading-tight break-words">{loc.location_name}</h3>
                  <div className="mt-0.5 shrink-0">{getStatusIcon(loc.needs_support)}</div>
               </div>

               <div className="mb-3 flex-grow">
                  <div className="flex justify-between items-center mb-1">
                     <div className="text-xs uppercase tracking-wider font-bold opacity-60">目前狀態</div>
                     {loc.location_name && (
                        <a 
                           href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.location_name + " 大埔")}`}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="text-[10px] flex items-center gap-1 text-blue-600 hover:underline bg-blue-50/50 px-1.5 py-0.5 rounded"
                        >
                           <Map className="w-3 h-3" /> 地圖
                        </a>
                     )}
                  </div>
                  <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                     {loc.current_status || "暫無狀態更新"}
                  </div>
                  {typeof loc.needs_support === 'string' && (
                     <div className="mt-2 text-xs text-amber-800 bg-amber-100/80 px-2 py-1 rounded border border-amber-200 inline-block font-medium">
                        {loc.needs_support}
                     </div>
                  )}
               </div>

               {loc.needed_items && loc.needed_items.length > 0 && (
                  <div className="mb-3 bg-white/60 p-2 rounded-lg border border-black/5">
                  <div className="text-xs font-bold text-red-600 mb-1 flex items-center gap-1">
                     <AlertCircle className="w-3 h-3" /> 缺以下物資:
                  </div>
                  <div className="flex flex-wrap gap-1">
                     {loc.needed_items.map((item, i) => (
                        <span key={i} className="text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded">
                        {item}
                        </span>
                     ))}
                  </div>
                  </div>
               )}

               <div className="pt-3 border-t border-black/5 mt-auto">
                  <div className="text-xs uppercase tracking-wider font-bold opacity-60 mb-2">聯絡人</div>
                  <div className="space-y-1.5">
                  {loc.contacts.map((contact, cIdx) => (
                     <div key={cIdx} className="flex items-center justify-between text-sm bg-white/50 px-2 py-1 rounded">
                        <span className="font-medium text-slate-700 truncate mr-2">{contact.name}</span>
                        {contact.phone && (
                           <a href={`tel:${contact.phone}`} className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline shrink-0 font-mono">
                              <Phone className="w-3 h-3" />
                              {contact.phone}
                           </a>
                        )}
                     </div>
                  ))}
                  {loc.contacts.length === 0 && <span className="text-xs text-slate-400 italic">無聯絡資料</span>}
                  </div>
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};