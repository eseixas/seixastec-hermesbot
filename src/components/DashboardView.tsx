import React, { useState } from 'react';
import { 
  Bot, 
  Power, 
  RotateCcw, 
  Trash2, 
  Radio, 
  Server, 
  Cpu, 
  Zap, 
  Activity, 
  Sparkles, 
  CheckCircle, 
  Flame, 
  Layers, 
  Terminal, 
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { BotState, HermesServer, BotRunMode } from '../types/hermes';
import { triggerHaptic } from '../services/hermesClient';

interface DashboardViewProps {
  botState: BotState;
  servers: HermesServer[];
  activeServer: HermesServer | null;
  onUpdateBotState: (newState: Partial<BotState>) => void;
  onOpenBroadcast: () => void;
  onNavigateToTerminal: () => void;
  onNavigateToServers: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  botState,
  servers,
  activeServer,
  onUpdateBotState,
  onOpenBroadcast,
  onNavigateToTerminal,
  onNavigateToServers,
}) => {
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const onlineServers = servers.filter(s => s.status === 'online');
  const totalAgents = servers.reduce((acc, s) => acc + (s.status === 'online' ? s.activeAgentsCount : 0), 0);
  const avgLatency = onlineServers.length > 0 
    ? Math.round(onlineServers.reduce((acc, s) => acc + (s.latencyMs || 0), 0) / onlineServers.length)
    : 0;

  const totalVramUsed = servers.reduce((acc, s) => acc + (s.gpuVramUsedGb || 0), 0);
  const totalVramMax = servers.reduce((acc, s) => acc + (s.gpuVramTotalGb || 0), 0);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleModeChange = (mode: BotRunMode) => {
    triggerHaptic(20);
    onUpdateBotState({ mode });
    showNotice(`Modo do Hermes Bot alterado para: ${mode.toUpperCase()}`);
  };

  const handleRestartWorkers = () => {
    triggerHaptic([30, 40]);
    showNotice('🔄 Reiniciando workers do Hermes em todos os servidores...');
  };

  const handleClearMemory = () => {
    triggerHaptic([20, 20]);
    showNotice('🧹 Memória de curto prazo dos nós foi purgada.');
  };

  return (
    <div className="space-y-4 pb-24 pt-2">
      {/* Action Notification Toast */}
      {actionNotice && (
        <div className="fixed top-16 left-4 right-4 z-50 bg-cyan-600 text-white text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-cyan-950 flex items-center justify-between animate-in fade-in slide-in-from-top duration-200">
          <span className="font-medium">{actionNotice}</span>
          <CheckCircle className="w-4 h-4 text-cyan-200" />
        </div>
      )}

      {/* Main Bot Controller Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-4 shadow-xl">
        {/* Glow backdrop */}
        <div className={`absolute -right-10 -top-10 w-44 h-44 rounded-full blur-3xl pointer-events-none ${
          botState.isRunning ? 'bg-cyan-500/15' : 'bg-amber-500/10'
        }`} />

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-inner ${
              botState.isRunning
                ? 'bg-gradient-to-tr from-cyan-600 to-blue-600 border-cyan-400/40 text-white shadow-cyan-500/30'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}>
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">Hermes Bot Master</h2>
                <span className={`w-2 h-2 rounded-full ${botState.isRunning ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {botState.isRunning 
                  ? 'Orquestração de agentes ativa no Android' 
                  : 'Em modo de espera / Standby manual'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              triggerHaptic([30, 50]);
              onUpdateBotState({ isRunning: !botState.isRunning });
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition active:scale-95 ${
              botState.isRunning
                ? 'bg-rose-500/15 text-rose-300 border-rose-500/40 hover:bg-rose-500/25'
                : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            {botState.isRunning ? 'Pausar' : 'Iniciar'}
          </button>
        </div>

        {/* Current Bot Task */}
        <div className="mt-3.5 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center gap-2.5">
          <Activity className="w-4 h-4 text-cyan-400 flex-shrink-0 animate-pulse" />
          <div className="min-w-0 flex-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Tarefa Atual:</span>
            <p className="text-xs text-slate-300 font-medium truncate">{botState.currentTask}</p>
          </div>
        </div>

        {/* Mode Selector Chips */}
        <div className="mt-3.5">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
            Modo de Operação do Agente:
          </span>
          <div className="grid grid-cols-4 gap-1.5">
            {(['autonomous', 'interactive', 'tools_only', 'standby'] as BotRunMode[]).map((mode) => {
              const isActive = botState.mode === mode;
              const labels: Record<BotRunMode, string> = {
                autonomous: 'Autônomo',
                interactive: 'Chat',
                tools_only: 'Tools',
                standby: 'Standby'
              };

              return (
                <button
                  key={mode}
                  onClick={() => handleModeChange(mode)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition active:scale-95 ${
                    isActive
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-sm'
                      : 'bg-slate-800/80 text-slate-400 border-slate-700/60 hover:text-slate-200'
                  }`}
                >
                  {labels[mode]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Command Buttons */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800">
          <button
            onClick={handleRestartWorkers}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 text-slate-300 text-[11px] active:scale-95 transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-blue-400 mb-1" />
            <span>Reiniciar Nós</span>
          </button>

          <button
            onClick={handleClearMemory}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 text-slate-300 text-[11px] active:scale-95 transition"
          >
            <Trash2 className="w-3.5 h-3.5 text-amber-400 mb-1" />
            <span>Limpar Memória</span>
          </button>

          <button
            onClick={onOpenBroadcast}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-gradient-to-br from-cyan-950 to-blue-950 border border-cyan-500/30 text-cyan-300 text-[11px] active:scale-95 transition"
          >
            <Radio className="w-3.5 h-3.5 text-cyan-400 mb-1 animate-pulse" />
            <span>Transmitir Todos</span>
          </button>
        </div>
      </div>

      {/* Fleet Telemetry Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Servers status */}
        <div 
          onClick={onNavigateToServers}
          className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 cursor-pointer active:scale-98 transition flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <Server className="w-3.5 h-3.5 text-cyan-400" />
              <span>Nós da Malha</span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-100 font-mono">
              {onlineServers.length}
            </span>
            <span className="text-xs text-slate-500">de {servers.length} ativos</span>
          </div>

          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-emerald-400 h-full rounded-full transition-all" 
              style={{ width: `${(onlineServers.length / Math.max(1, servers.length)) * 100}%` }}
            />
          </div>
        </div>

        {/* Latency meter */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Latência Média</span>
          </div>

          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-100 font-mono">
              {avgLatency}
            </span>
            <span className="text-xs text-slate-500 font-mono">ms</span>
          </div>

          <span className="text-[10px] text-emerald-400 font-medium mt-2">
            ● Alta responsividade (LAN/VPN)
          </span>
        </div>

        {/* Concurrency agents */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>Agentes Concorrentes</span>
          </div>

          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-100 font-mono">
              {totalAgents}
            </span>
            <span className="text-xs text-slate-500">threads de inferência</span>
          </div>

          <span className="text-[10px] text-slate-400 mt-2 truncate">
            Limite global: {botState.concurrencyLimit} tarefas
          </span>
        </div>

        {/* VRAM usage */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            <span>GPU VRAM Total</span>
          </div>

          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-100 font-mono">
              {totalVramUsed.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500 font-mono">/ {totalVramMax.toFixed(0)} GB</span>
          </div>

          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-blue-500 h-full rounded-full transition-all" 
              style={{ width: `${(totalVramUsed / Math.max(1, totalVramMax)) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Target Server Card banner with quick Terminal jump */}
      {activeServer && (
        <div 
          onClick={onNavigateToTerminal}
          className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-900/90 border border-cyan-500/30 hover:border-cyan-500/60 cursor-pointer active:scale-98 transition flex items-center justify-between gap-3 shadow-md"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center flex-shrink-0">
              <Terminal className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-100 truncate">{activeServer.name}</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded font-mono">
                  {activeServer.latencyMs || 25}ms
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                Modelo: <span className="text-cyan-300 font-mono">{activeServer.modelName.split('/').pop()}</span>
              </p>
            </div>
          </div>

          <button className="flex items-center gap-1 text-xs font-semibold text-cyan-400 bg-cyan-500/10 px-3 py-1.5 rounded-xl border border-cyan-500/30 flex-shrink-0">
            <span>Abrir Terminal</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Live Agent Activity Feed */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Fluxo Recente de Agentes Hermes
            </h3>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Ao Vivo</span>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-start gap-2.5 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">Sincronização de nós da malha</span>
                <span className="text-[10px] text-slate-500 font-mono">agora</span>
              </div>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Heartbeat confirmado em 3 servidores ativos com latência máxima de 92ms.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-xs">
            <span className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">Chamada de Ferramenta (Tool Call)</span>
                <span className="text-[10px] text-slate-500 font-mono">2 min atrás</span>
              </div>
              <p className="text-slate-400 text-[11px] mt-0.5 font-mono">
                node_telemetry_scan() completado no Nó Primário GPU.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-xs">
            <span className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">Alocação de Contexto Hermes-3</span>
                <span className="text-[10px] text-slate-500 font-mono">14 min atrás</span>
              </div>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Worker Cloud RunPod alocou 8,192 tokens de janela com KV cache unificado.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
