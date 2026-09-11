import React from 'react';
import { Bot, Server, Settings } from 'lucide-react';
import { triggerHaptic } from '../services/hermesClient';

export type NavTab = 'bots' | 'servers' | 'settings';

interface BottomNavProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onlineServersCount: number;
  activeBotsCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
  onlineServersCount,
  activeBotsCount,
}) => {
  const tabs = [
    { 
      id: 'bots' as NavTab, 
      label: 'Bots', 
      icon: Bot,
      badge: activeBotsCount > 0 ? `${activeBotsCount}` : undefined,
      badgeColor: 'bg-cyan-500'
    },
    { 
      id: 'servers' as NavTab, 
      label: 'Servidores', 
      icon: Server, 
      badge: onlineServersCount > 0 ? `${onlineServersCount}` : undefined,
      badgeColor: 'bg-emerald-500'
    },
    { id: 'settings' as NavTab, label: 'Ajustes', icon: Settings },
  ];

  const handleSelect = (tab: NavTab) => {
    triggerHaptic(12);
    onTabChange(tab);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800/80 px-2 py-1.5 pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleSelect(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 min-w-[64px] rounded-xl transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'text-cyan-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              {/* Active pill background effect */}
              {isActive && (
                <div className="absolute inset-x-2 top-0.5 bottom-0.5 bg-cyan-500/10 rounded-xl -z-10 border border-cyan-500/20" />
              )}

              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                {tab.badge && (
                  <span className={`absolute -top-1 -right-2 ${tab.badgeColor || 'bg-cyan-500'} text-slate-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[16px] text-center border-2 border-slate-900 leading-tight`}>
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
