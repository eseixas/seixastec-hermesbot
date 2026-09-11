import React, { useState } from 'react';
import { Radio, X, Send, CheckCircle2, AlertCircle, Loader2, Sparkles, Zap } from 'lucide-react';
import { HermesServer, ServerBroadcastResult } from '../types/hermes';
import { sendHermesPrompt, triggerHaptic } from '../services/hermesClient';

interface BroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  servers: HermesServer[];
}

export const BroadcastModal: React.FC<BroadcastModalProps> = ({
  isOpen,
  onClose,
  servers,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [results, setResults] = useState<ServerBroadcastResult[]>([]);

  if (!isOpen) return null;

  const onlineServers = servers.filter(s => s.status === 'online' || s.enabled);

  const handleBroadcast = async () => {
    if (!prompt.trim() || isBroadcasting) return;

    triggerHaptic([20, 30]);
    setIsBroadcasting(true);

    const initialResults: ServerBroadcastResult[] = onlineServers.map(s => ({
      serverId: s.id,
      serverName: s.name,
      status: 'pending'
    }));
    setResults(initialResults);

    // Dispatch parallel requests to all servers
    const promises = onlineServers.map(async (server, index) => {
      const startTime = performance.now();
      try {
        const msg = await sendHermesPrompt(server, prompt, []);
        const latency = Math.round(performance.now() - startTime);

        setResults(prev => prev.map(item => {
          if (item.serverId === server.id) {
            return {
              ...item,
              status: 'success',
              response: msg.content,
              latencyMs: latency
            };
          }
          return item;
        }));
      } catch (err: any) {
        setResults(prev => prev.map(item => {
          if (item.serverId === server.id) {
            return {
              ...item,
              status: 'error',
              error: err?.message || 'Falha na resposta do nó'
            };
          }
          return item;
        }));
      }
    });

    await Promise.allSettled(promises);
    setIsBroadcasting(false);
    triggerHaptic(40);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Transmissão em Malha (Broadcast)</h3>
              <p className="text-xs text-slate-400">
                Despachar ordem para todos os {onlineServers.length} nós Hermes online
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input */}
        <div className="mt-4">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Instrução para os Servidores Hermes Agent:
          </label>
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: Verificar ferramentas de busca e status de inferência..."
              rows={3}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 resize-none font-sans"
            />
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex gap-1.5 overflow-x-auto py-1">
              <button
                type="button"
                onClick={() => setPrompt('Verificar status e memória de contexto')}
                className="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap"
              >
                /status
              </button>
              <button
                type="button"
                onClick={() => setPrompt('Testar sandbox de execução Python')}
                className="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap"
              >
                /test-python
              </button>
              <button
                type="button"
                onClick={() => setPrompt('Reciclar cache e limpar contexto')}
                className="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap"
              >
                /flush-cache
              </button>
            </div>

            <button
              onClick={handleBroadcast}
              disabled={isBroadcasting || !prompt.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-semibold shadow-md hover:brightness-110 active:scale-95 disabled:opacity-50 transition"
            >
              {isBroadcasting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Disparando...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Transmitir</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Stream */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-2 pr-1 border-t border-slate-800 pt-3">
          <div className="text-xs font-semibold text-slate-400 mb-1">Respostas dos Nós Conectados:</div>
          
          {results.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              Digite uma instrução e clique em Transmitir para acionar todos os nós simultaneamente.
            </div>
          ) : (
            results.map((res) => (
              <div 
                key={res.serverId}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs"
              >
                <div className="flex items-center justify-between font-semibold mb-1">
                  <span className="text-slate-200">{res.serverName}</span>
                  {res.status === 'pending' && (
                    <span className="text-cyan-400 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> Processando
                    </span>
                  )}
                  {res.status === 'success' && (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {res.latencyMs}ms
                    </span>
                  )}
                  {res.status === 'error' && (
                    <span className="text-rose-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Erro
                    </span>
                  )}
                </div>

                {res.response && (
                  <p className="text-slate-300 whitespace-pre-wrap mt-1 text-[11px] leading-relaxed bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                    {res.response}
                  </p>
                )}

                {res.error && (
                  <p className="text-rose-400 mt-1 text-[11px]">{res.error}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
