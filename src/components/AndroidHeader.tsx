import React from 'react';
import { 
  Bot, 
  Activity, 
  RefreshCw, 
  Download, 
  Power, 
  ShieldAlert,
  Server as ServerIcon,
  Wifi,
  Sparkles
} from 'lucide-react';
import { BotState, HermesServer } from '../types/hermes';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { triggerHaptic } from '../services/hermesClient';

interface AndroidHeaderProps {
  botState: BotState;
  servers: HermesServer[];
  activeServer: HermesServer | null;
  isRefreshing: boolean;
  onRefreshAll: () => void;
  onToggleBot: () => void;
  onOpenQuickSwitch: () => void;
}

export const AndroidHeader: React.FC<AndroidHeaderProps> = ({
  botState,
  servers,
  activeServer,
  isRefreshing,
  onRefreshAll,
  onToggleBot,
  onOpenQuickSwitch,
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const onlineCount = servers.filter(s => s.status === 'online').length;

  const handleRefresh = () => {
    triggerHaptic(20);
    onRefreshAll();
  };

  const handleToggle = () => {
    triggerHaptic([30, 40]);
    onToggleBot();
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 select-none">
      {/* Top simulated status bar row */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 font-mono">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-cyan-400 font-semibold tracking-wider">
            <Sparkles className="w-3 h-3 animate-pulse" />
            HERMES 3 CONTROLLER
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300">ANDROID EDITION</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Wifi className={`w-3 h-3 ${onlineCount > 0 ? 'text-emerald-400' : 'text-rose-400'}`} />
            <span>{onlineCount}/{servers.length} nós</span>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="flex items-center justify-between gap-2">
        {/* Left: Bot Identity & Mode */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              botState.isRunning 
                ? 'bg-gradient-to-br from-cyan-500 to-blue-600 shadow-md shadow-cyan-500/20 text-white' 
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}>
              <Bot className="w-5 h-5" />
            </div>
            <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${
              botState.isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-amber-500'
            }`} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold text-slate-100 truncate">Hermes Bot</h1>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-semibold ${
                botState.isRunning 
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' 
                  : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              }`}>
                {botState.isRunning ? 'Ativo' : 'Pausado'}
              </span>
            </div>
            
            {/* Active Server Pill (Clickable quick switch) */}
            <button
              onClick={onOpenQuickSwitch}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-300 transition truncate mt-0.5"
            >
              <ServerIcon className="w-2.5 h-2.5 text-cyan-400 flex-shrink-0" />
              <span className="truncate max-w-[130px] sm:max-w-[200px]">
                {activeServer ? activeServer.name : 'Nenhum nó ativo'}
              </span>
              <span className="text-[10px] text-cyan-400/80 underline font-sans">mudar</span>
            </button>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* PWA Install Button (If available and not installed) */}
          {isInstallable && !isInstalled && (
            <button
              onClick={() => {
                triggerHaptic(20);
                install();
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-medium shadow-sm hover:brightness-110 active:scale-95 transition"
              title="Instalar App no Android"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Instalar</span>
            </button>
          )}

          {/* Refresh/Ping All */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 active:scale-95 transition ${
              isRefreshing ? 'opacity-75 cursor-not-allowed' : ''
            }`}
            title="Sincronizar e testar nós"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          {/* Bot Power Toggle */}
          <button
            onClick={handleToggle}
            className={`p-2 rounded-lg border active:scale-95 transition ${
              botState.isRunning
                ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30'
                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
            }`}
            title={botState.isRunning ? 'Pausar Hermes Bot' : 'Iniciar Hermes Bot'}
          >
            <Power className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
