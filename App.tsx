import React, { useState, useEffect } from 'react';
import { ReliefEntry, Stats, Status, LocationStatus } from './types';
import { SmartInput } from './components/SmartInput';
import { StatsCards } from './components/StatsCards';
import { ReliefTable } from './components/ReliefTable';
import { SuppliesSummary } from './components/SuppliesSummary';
import { LocationStatusBoard } from './components/LocationStatusBoard';
import { SFExpressNotice } from './components/SFExpressNotice';
import { EmotionalSupportCard } from './components/EmotionalSupportCard';
import { Flame, Info, Menu, X, BarChart3, ExternalLink } from 'lucide-react';

const MOCK_INITIAL_DATA: ReliefEntry[] = [
  {
    id: '1',
    type: 'NEED',
    category: '食品',
    item: '便當/熱食',
    quantity: '50 份',
    location: '大埔體育館避難中心',
    contactInfo: '陳社工 9123 4567',
    urgency: 'HIGH',
    status: 'PENDING',
    timestamp: Date.now() - 1000 * 60 * 30,
    originalMessage: '急！避難中心缺50個便當，老人多，需要熱食。',
    notes: '需包含 10 份素食',
  },
  {
    id: '2',
    type: 'OFFER',
    category: '交通',
    item: '7人車義載',
    quantity: '2 部車',
    location: '大埔墟站 A 出口',
    contactInfo: 'Gary 6666 7777',
    urgency: 'MEDIUM',
    status: 'PENDING',
    timestamp: Date.now() - 1000 * 60 * 60,
    originalMessage: '我可以出兩部車幫手運物資，係火車站等。',
    notes: '晚上 8 點後可出車',
  }
];

const STATIC_LOCATION_DATA: LocationStatus[] = [
  {
    "id": "loc-1",
    "location_name": "大埔社區會堂",
    "contacts": [
      { "name": "Chester", "phone": "91786880" },
      { "name": "Moon", "phone": "53479409" }
    ],
    "current_status": "暫無特別註明",
    "needs_support": null
  },
  {
    "id": "loc-2",
    "location_name": "文娛中心",
    "contacts": [
      { "name": "Carman", "phone": "54463262" },
      { "name": "呀林", "phone": "64183307" }
    ],
    "current_status": "目前有大量人手及物資，暫時唔需要",
    "needs_support": false
  },
  {
    "id": "loc-3",
    "location_name": "信義會太和青年中心",
    "contacts": [
      { "name": "Michelle", "phone": "94008823" }
    ],
    "current_status": "已經唔需要人",
    "needs_support": false
  },
  {
    "id": "loc-4",
    "location_name": "那打素醫院",
    "contacts": [
      { "name": "Him", "phone": "52999685" },
      { "name": "Sammi", "phone": "52368668" }
    ],
    "current_status": "現時約10人，基本足夠；暫時唔需要車手，等緊病人資料送返醫院",
    "needs_support": "Pending (稍後需要車手拎藥落區)"
  },
  {
    "id": "loc-5",
    "location_name": "廣福道油站",
    "contacts": [
      { "name": "Rainie", "phone": "51219619" }
    ],
    "current_status": "11點後要人",
    "needs_support": true
  },
  {
    "id": "loc-6",
    "location_name": "銘恩堂中心",
    "contacts": [
      { "name": "Fung", "phone": "63738900" },
      { "name": "Hotline", "phone": "98504852" },
      { "name": "Yoko", "phone": "67610110" }
    ],
    "current_status": "暫無特別註明",
    "needs_support": null
  },
  {
    "id": "loc-7",
    "location_name": "彩虹",
    "contacts": [
      { "name": "Hin仔", "phone": "69228330" }
    ],
    "current_status": "暫無特別註明",
    "needs_support": null
  },
  {
    "id": "loc-8",
    "location_name": "逸東餃子",
    "contacts": [
      { "name": "Fung", "phone": "92628135" }
    ],
    "current_status": "暫無特別註明",
    "needs_support": null
  },
  {
    "id": "loc-9",
    "location_name": "富善社區中心",
    "contacts": [
      { "name": "Gigi", "phone": "64924846" }
    ],
    "current_status": "需要物資分類工具",
    "needs_support": true,
    "needed_items": ["紙箱", "紅白藍膠袋"]
  },
  {
    "id": "loc-10",
    "location_name": "廣福球場對面",
    "contacts": [
      { "name": "Yin", "phone": "66200489" }
    ],
    "current_status": "已清場，❌ 任何任何",
    "needs_support": false
  },
  {
    "id": "loc-11",
    "location_name": "廣福平台",
    "contacts": [
      { "name": "Ivan", "phone": "68999983" }
    ],
    "current_status": "暫無特別註明",
    "needs_support": null
  },
  {
    "id": "loc-12",
    "location_name": "東昌街體育館",
    "contacts": [
      { "name": "Mandy", "phone": "51839582", "note": "Raydan轉介" },
      { "name": "Raydan", "phone": "93484795" },
      { "name": "Hang", "phone": "66705434" }
    ],
    "current_status": "目前有適量人手及物資，需要特定物品",
    "needs_support": true,
    "needed_items": ["牙刷"]
  },
  {
    "id": "loc-13",
    "location_name": "新達物資站",
    "contacts": [
      { "name": "Isabelle", "phone": "68999502" },
      { "name": "Carley", "phone": "63432029" }
    ],
    "current_status": "目前有大量人手同物資，暫不需更多",
    "needs_support": false
  },
  {
    "id": "loc-14",
    "location_name": "運頭塘社區中心",
    "contacts": [
      { "name": "Peace", "phone": "66449677" },
      { "name": "靚姑娘", "phone": "66947752" }
    ],
    "current_status": "暫無特別註明",
    "needs_support": null
  },
  {
    "id": "loc-15",
    "location_name": "大埔社區中心",
    "contacts": [
      { "name": "Soup", "phone": "95653738" }
    ],
    "current_status": "暫無特別註明",
    "needs_support": null
  },
  {
    "id": "loc-16",
    "location_name": "大埔墟火車站B出口",
    "contacts": [
      { "name": "Jojo", "phone": "59702999" }
    ],
    "current_status": "暫無特別註明",
    "needs_support": null
  }
];

export default function App() {
  const [entries, setEntries] = useState<ReliefEntry[]>(() => {
    // Try to load from local storage
    const saved = localStorage.getItem('relief_entries');
    return saved ? JSON.parse(saved) : MOCK_INITIAL_DATA;
  });
  
  const [locations, setLocations] = useState<LocationStatus[]>(() => {
    // Try to load locations from local storage to allow editing
    const saved = localStorage.getItem('relief_locations');
    if (saved) return JSON.parse(saved);
    return STATIC_LOCATION_DATA;
  });
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  // Persistence for entries
  useEffect(() => {
    localStorage.setItem('relief_entries', JSON.stringify(entries));
  }, [entries]);

  // Persistence for locations
  useEffect(() => {
    localStorage.setItem('relief_locations', JSON.stringify(locations));
  }, [locations]);

  // Derived Stats
  const stats: Stats = {
    totalNeeds: entries.filter(e => e.type === 'NEED' && e.status !== 'COMPLETED').length,
    totalOffers: entries.filter(e => e.type === 'OFFER' && e.status !== 'COMPLETED').length,
    completed: entries.filter(e => e.status === 'COMPLETED').length,
    highUrgency: entries.filter(e => e.urgency === 'HIGH' && e.status !== 'COMPLETED').length,
  };

  const handleNewEntries = (newEntries: ReliefEntry[]) => {
    setEntries(prev => [...newEntries, ...prev]);
  };

  const handleUpdateStatus = (id: string, newStatus: Status) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, status: newStatus } : e));
  };

  const handleDelete = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const handleEditEntry = (id: string, updatedEntry: Partial<ReliefEntry>) => {
    // When editing, also update the timestamp to reflect recent activity
    setEntries(prev => prev.map(e => e.id === id ? { ...e, ...updatedEntry, timestamp: Date.now() } : e));
  };

  const handleManualAdd = () => {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `manual-${Date.now()}`;
    const newEntry: ReliefEntry = {
      id,
      type: 'NEED',
      category: '未分類',
      item: '新增物品',
      quantity: '1',
      location: '待定',
      contactInfo: '無',
      urgency: 'MEDIUM',
      status: 'PENDING',
      timestamp: Date.now(),
      originalMessage: '手動新增項目',
      notes: '',
    };
    setEntries(prev => [newEntry, ...prev]);
    return newEntry;
  };

  // Location Management Handlers
  const handleUpdateLocation = (id: string, updatedData: Partial<LocationStatus>) => {
    setLocations(prev => prev.map(loc => loc.id === id ? { ...loc, ...updatedData } : loc));
  };

  const handleAddLocation = () => {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `loc-${Date.now()}`;
    const newLocation: LocationStatus = {
      id,
      location_name: "新救援站點",
      contacts: [],
      current_status: "請更新站點狀態...",
      needs_support: null, // Default to grey/unknown
    };
    setLocations(prev => [newLocation, ...prev]);
  };

  const handleDeleteLocation = (id: string) => {
    setLocations(prev => prev.filter(loc => loc.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <SuppliesSummary 
         entries={entries} 
         isOpen={isSummaryOpen} 
         onClose={() => setIsSummaryOpen(false)} 
         onEdit={handleEditEntry}
         onDelete={handleDelete}
      />

      {/* Navbar */}
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-red-600 p-1.5 rounded-lg shadow-red-900/50 shadow-inner">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold leading-tight tracking-tight">大埔火災支援協調</h1>
                <p className="text-[10px] text-slate-400 font-medium tracking-wide">RELIEF COORDINATOR</p>
              </div>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
              <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700/50">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                系統即時運作中
              </span>
              
              <button 
                onClick={() => setIsSummaryOpen(true)}
                className="flex items-center gap-2 text-white hover:text-brand-100 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-all"
              >
                 <BarChart3 className="w-4 h-4" />
                 物資統計總覽
              </button>

              <a 
                href="https://taipo1126.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white transition-colors flex items-center gap-1"
              >
                宏福苑互助 <ExternalLink className="w-3 h-3 opacity-70" />
              </a>
              
              <a 
                href="https://firerescue.ccthk.hk/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white transition-colors flex items-center gap-1"
              >
                聯絡我們 <ExternalLink className="w-3 h-3 opacity-70" />
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-slate-300 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-800 border-t border-slate-700 p-4 space-y-3 shadow-xl">
             <button 
                onClick={() => {
                   setIsSummaryOpen(true);
                   setMobileMenuOpen(false);
                }} 
                className="flex w-full items-center gap-2 text-white bg-slate-700 p-3 rounded-lg"
             >
                <BarChart3 className="w-4 h-4" />
                物資統計總覽
             </button>
             <a 
               href="https://taipo1126.com/" 
               target="_blank" 
               rel="noopener noreferrer"
               className="block text-slate-300 hover:text-white p-2 flex items-center gap-2"
             >
               宏福苑互助 <ExternalLink className="w-3 h-3" />
             </a>
             <a 
               href="https://firerescue.ccthk.hk/" 
               target="_blank" 
               rel="noopener noreferrer"
               className="block text-slate-300 hover:text-white p-2 flex items-center gap-2"
             >
               聯絡我們 <ExternalLink className="w-3 h-3" />
             </a>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header Message */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div>
               <h2 className="text-2xl font-bold text-slate-900">即時物資調配中心</h2>
               <p className="text-slate-500 mt-1">
                 整合 WhatsApp/WeChat 訊息，自動提取地點與需求，消除資訊不對稱。
               </p>
             </div>
             <div className="text-right hidden md:block">
               <div className="text-sm text-slate-500">最後更新</div>
               <div className="font-mono text-lg font-bold text-slate-700">
                 {new Date().toLocaleTimeString('zh-HK')}
               </div>
             </div>
          </div>

          <StatsCards stats={stats} />

          <LocationStatusBoard 
             locations={locations} 
             onUpdateLocation={handleUpdateLocation}
             onAddLocation={handleAddLocation}
             onDeleteLocation={handleDeleteLocation}
          />

          {/* Tools Grid Area - Moved from sidebar to top for better layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
             <div className="space-y-6">
                <SmartInput onEntriesParsed={handleNewEntries} />
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <div className="flex gap-3">
                    <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-blue-900 text-sm">如何使用？</h4>
                      <p className="text-xs text-blue-800/80 mt-1 leading-relaxed">
                        1. 複製各大群組 (WeChat/WhatsApp) 的求助訊息。<br/>
                        2. 貼上到上方輸入框並按「分析」。<br/>
                        3. AI 會自動將雜亂的文字轉換為表格。<br/>
                        4. 義工可根據表格資訊進行物資派送。
                      </p>
                    </div>
                  </div>
                </div>
             </div>
             <div>
                <SFExpressNotice />
             </div>
             <div>
                <EmotionalSupportCard />
             </div>
          </div>

          {/* Full Width Table - No more scroll wheel needed */}
          <div className="w-full">
               <ReliefTable 
                  entries={entries} 
                  onUpdateStatus={handleUpdateStatus} 
                  onDelete={handleDelete}
                  onEdit={handleEditEntry}
                  onManualAdd={handleManualAdd}
               />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
           <p className="text-slate-400 text-sm mb-2">
             此平台為緊急即時開發，僅供大埔火災資訊協調使用。
           </p>
           <div className="flex items-center justify-center gap-2 text-slate-300 text-xs">
             <span>Privacy: Local Storage Only</span>
           </div>
        </div>
      </footer>
    </div>
  );
}