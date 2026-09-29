import React from 'react';
import { Search, Navigation, Compass, Bookmark, Clock, Sparkles } from './Icons';
import type { ActiveTab } from '../types/map';

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; color?: string }[] = [
    { id: 'search', label: 'Explore', icon: <Search className="w-4 h-4" /> },
    { id: 'route', label: 'Route', icon: <Navigation className="w-4 h-4" /> },
    { id: 'isochrone', label: 'Isochrone', icon: <Clock className="w-4 h-4" />, color: 'text-emerald-400' },
    { id: 'mesh', label: 'Mesh', icon: <Compass className="w-4 h-4" />, color: 'text-teal-400' },
    { id: 'saved', label: 'Saved', icon: <Bookmark className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[600] md:hidden glass border-t border-white/[0.08] px-3 py-2 backdrop-blur-2xl bg-[#060913]/95 select-none">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = activeTab === item.id && sidebarOpen;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(true);
              }}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all ${
                isActive
                  ? 'bg-blue-500/20 text-blue-300 font-bold scale-105 border border-blue-500/30 shadow-lg shadow-blue-500/20'
                  : `text-slate-400 hover:text-slate-200 ${item.color || ''}`
              }`}
            >
              {item.icon}
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
