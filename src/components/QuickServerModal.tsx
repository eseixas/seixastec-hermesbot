import React from 'react';
import { X, Check, Server, Radio, Cpu, HardDrive } from 'lucide-react';
import { HermesServer } from '../types/hermes';
import { triggerHaptic } from '../services/hermesClient';

interface QuickServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  servers: HermesServer[];
  activeServerId: string | null;
  onSelectServer: (server: HermesServer) => void;
}

export const QuickServerModal: React.FC<QuickServerModalProps> = ({
  isOpen,
  onClose,
  servers,
  activeServerId,
  onSelectServer,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl p-4 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-slate-100">Alternar Servidor Hermes</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-400 mt-2 mb-3">
          Selecione o servidor de destino para executar comandos e monitorar inferências no Hermes:
        </p>

        {/* Server list */}
        <div className="space-y-2 overflow-y-auto pr-1 flex-1">
          {servers.map((server) => {
            const isSelected = activeServerId === server.id;
            const isOnline = server.status === 'online';

            return (
              <button
                key={server.id}
                onClick={() => {
                  triggerHaptic(15);
                  onSelectServer(server);
                  onClose();
                }}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-500/50 shadow-sm shadow-cyan-500/10'
                    : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                    <span className="font-semibold text-sm text-slate-100 truncate">{server.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/80 text-slate-300 uppercase font-mono">
                      {server.role}
                    </span>
                  </div>
                  
                  <div className="text-xs text-slate-400 truncate mt-1 font-mono">
                    {server.url}
                  </div>

                  <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                    <span className="text-cyan-400 font-mono">{server.modelName.split('/').pop()}</span>
                    {server.latencyMs !== null && (
                      <span className="text-emerald-400">{server.latencyMs}ms</span>
                    )}
                  </div>
                </div>

                <div className="flex-shrink-0">
                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center text-slate-950">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border border-slate-600" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
