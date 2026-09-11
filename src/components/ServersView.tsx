import React, { useState } from 'react';
import { 
  Server, 
  Plus, 
  Check, 
  Copy, 
  Trash2, 
  Edit3, 
  RotateCw, 
  Key, 
  X,
  Sparkles
} from 'lucide-react';
import { HermesServer } from '../types/hermes';
import { pingServer, triggerHaptic } from '../services/hermesClient';

interface ServersViewProps {
  servers: HermesServer[];
  activeServerId: string | null;
  onSelectServer: (server: HermesServer) => void;
  onAddServer: (server: HermesServer) => void;
  onUpdateServer: (server: HermesServer) => void;
  onDeleteServer: (serverId: string) => void;
  onPingAll?: () => void;
}

export const ServersView: React.FC<ServersViewProps> = ({
  servers,
  activeServerId,
  onSelectServer,
  onAddServer,
  onUpdateServer,
  onDeleteServer,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingServer, setEditingServer] = useState<HermesServer | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formToken, setFormToken] = useState('');
  const [formModel, setFormModel] = useState('NousResearch/Hermes-3-Llama-3.1-8B-Instruct');
  const [formRole, setFormRole] = useState<'primary' | 'worker' | 'reasoning' | 'scraper' | 'code'>('worker');
  const [formNotes, setFormNotes] = useState('');
  const [isTestingModalUrl, setIsTestingModalUrl] = useState(false);
  const [modalTestResult, setModalTestResult] = useState<string | null>(null);

  const openAddModal = () => {
    triggerHaptic(15);
    setEditingServer(null);
    setFormName('');
    setFormUrl('');
    setFormToken('');
    setFormModel('NousResearch/Hermes-3-Llama-3.1-8B-Instruct');
    setFormRole('worker');
    setFormNotes('');
    setModalTestResult(null);
    setIsModalOpen(true);
  };

  const openEditModal = (server: HermesServer) => {
    triggerHaptic(15);
    setEditingServer(server);
    setFormName(server.name);
    setFormUrl(server.url);
    setFormToken(server.authToken || '');
    setFormModel(server.modelName);
    setFormRole(server.role);
    setFormNotes(server.notes || '');
    setModalTestResult(null);
    setIsModalOpen(true);
  };

  const applyPreset = (preset: { name: string; url: string; model: string; role: HermesServer['role'] }) => {
    triggerHaptic(10);
    setFormName(preset.name);
    setFormUrl(preset.url);
    setFormModel(preset.model);
    setFormRole(preset.role);
  };

  const handleTestModalConnection = async () => {
    if (!formUrl.trim()) return;
    setIsTestingModalUrl(true);
    setModalTestResult(null);

    const tempServer: HermesServer = {
      id: 'temp-test',
      name: formName || 'Teste',
      url: formUrl.trim(),
      authToken: formToken.trim() || undefined,
      modelName: formModel,
      role: formRole,
      status: 'connecting',
      latencyMs: null,
      lastPing: null,
      activeAgentsCount: 0,
      version: 'test',
      enabled: true
    };

    const res = await pingServer(tempServer);
    setIsTestingModalUrl(false);

    if (res.ok) {
      setModalTestResult(`✅ Conectado com sucesso! Latência: ${res.latencyMs}ms`);
    } else if (res.corsSuspected) {
      setModalTestResult(`⚠️ Servidor detectado, mas requer CORS habilitado (--cors-allow-origins '*') para chamadas de navegador.`);
    } else {
      setModalTestResult(`❌ Falha: ${res.error || 'Não foi possível alcançar o nó'}`);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formUrl.trim()) return;

    triggerHaptic(25);

    if (editingServer) {
      const updated: HermesServer = {
        ...editingServer,
        name: formName.trim(),
        url: formUrl.trim(),
        authToken: formToken.trim() || undefined,
        modelName: formModel.trim(),
        role: formRole,
        notes: formNotes.trim()
      };
      onUpdateServer(updated);
      setStatusMessage(`Servidor "${updated.name}" atualizado!`);
    } else {
      const newServer: HermesServer = {
        id: `srv-${Date.now()}`,
        name: formName.trim(),
        url: formUrl.trim(),
        authToken: formToken.trim() || undefined,
        modelName: formModel.trim(),
        role: formRole,
        status: 'online',
        latencyMs: 32,
        lastPing: Date.now(),
        gpuVramUsedGb: 8.0,
        gpuVramTotalGb: 16.0,
        cpuPercent: 20,
        ramUsedGb: 14.0,
        ramTotalGb: 32.0,
        activeAgentsCount: 1,
        version: 'hermes-node-v2.8',
        enabled: true,
        notes: formNotes.trim()
      };
      onAddServer(newServer);
      setStatusMessage(`Novo servidor Hermes adicionado com sucesso!`);
    }

    setIsModalOpen(false);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const copyUrl = (id: string, url: string) => {
    triggerHaptic(10);
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4 pb-28 pt-2">
      {/* Toast */}
      {statusMessage && (
        <div className="fixed top-16 left-4 right-4 z-50 bg-emerald-600 text-white text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center justify-between animate-in fade-in">
          <span>{statusMessage}</span>
          <Check className="w-4 h-4" />
        </div>
      )}

      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Server className="w-4 h-4 text-cyan-400" />
            Servidores Hermes Agent
          </h2>
          <p className="text-xs text-slate-400">
            {servers.length} nós cadastrados para controle remoto no Android
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-semibold shadow-md shadow-cyan-950 active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Nó</span>
        </button>
      </div>

      {/* Server Cards List */}
      <div className="space-y-3">
        {servers.map((server) => {
          const isSelected = activeServerId === server.id;
          const isOnline = server.status === 'online';

          const roleColors: Record<HermesServer['role'], string> = {
            primary: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
            reasoning: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
            worker: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
            code: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
            scraper: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          };

          return (
            <div
              key={server.id}
              className={`rounded-2xl border transition-all p-4 ${
                isSelected
                  ? 'bg-slate-900 border-cyan-500/60 shadow-lg shadow-cyan-950/30 ring-1 ring-cyan-500/30'
                  : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800'
              }`}
            >
              {/* Top Row: Name, Role, Status */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                    <h3 className="text-sm font-bold text-slate-100 truncate">{server.name}</h3>
                    <span className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border ${roleColors[server.role]}`}>
                      {server.role}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] bg-cyan-500 text-slate-950 font-bold px-1.5 py-0.2 rounded-full">
                        Alvo Ativo
                      </span>
                    )}
                  </div>

                  {/* URL Row */}
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400">
                    <button
                      onClick={() => copyUrl(server.id, server.url)}
                      className="flex items-center gap-1 font-mono text-cyan-400 hover:text-cyan-300 truncate max-w-[220px] sm:max-w-[320px]"
                      title="Copiar URL"
                    >
                      <span className="truncate">{server.url}</span>
                      {copiedId === server.id ? (
                        <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <Copy className="w-3 h-3 flex-shrink-0 text-slate-500" />
                      )}
                    </button>

                    {server.authToken && (
                      <span className="flex items-center gap-0.5 text-[10px] text-amber-400/90 font-mono bg-amber-500/10 px-1 py-0.2 rounded border border-amber-500/20">
                        <Key className="w-2.5 h-2.5" /> Token
                      </span>
                    )}
                  </div>
                </div>

                {/* Online/Offline Status Badge */}
                <div className="text-right flex-shrink-0">
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                    isOnline 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}>
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>

              {/* Model Tag */}
              <div className="mt-2.5 flex items-center gap-2 text-xs bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                <span className="text-slate-400 text-[11px]">Modelo:</span>
                <span className="text-slate-200 font-mono text-[11px] truncate flex-1 font-medium">
                  {server.modelName}
                </span>
              </div>

              {/* Card Actions */}
              <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(server)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium active:scale-95 transition"
                    title="Editar servidor"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Editar</span>
                  </button>

                  {servers.length > 1 && (
                    <button
                      onClick={() => {
                        triggerHaptic(30);
                        if (confirm(`Remover servidor "${server.name}"?`)) {
                          onDeleteServer(server.id);
                        }
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 text-xs font-medium active:scale-95 transition"
                      title="Excluir servidor"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Excluir</span>
                    </button>
                  )}
                </div>

                <button
                  onClick={() => {
                    triggerHaptic(15);
                    onSelectServer(server);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition active:scale-95 ${
                    isSelected
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {isSelected ? '✓ Servidor Ativo' : 'Definir Ativo'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add or Edit Server */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div 
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Server className="w-4 h-4 text-cyan-400" />
                {editingServer ? 'Editar Servidor Hermes' : 'Adicionar Servidor Hermes'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-3 overflow-y-auto flex-1 pr-1">
              {/* Presets if adding new */}
              {!editingServer && (
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                    Preenchimento Rápido (Presets):
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => applyPreset({
                        name: 'Nó GPU Local (vLLM)',
                        url: 'http://192.168.1.100:8000',
                        model: 'NousResearch/Hermes-3-Llama-3.1-8B-Instruct',
                        role: 'primary'
                      })}
                      className="p-2 text-left rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-[11px]"
                    >
                      <div className="font-semibold text-slate-200">vLLM / FastChat</div>
                      <div className="text-slate-500 font-mono text-[10px]">192.168.1.X:8000</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => applyPreset({
                        name: 'Ollama Hermes Agent',
                        url: 'http://192.168.1.50:11434',
                        model: 'hermes3:8b',
                        role: 'worker'
                      })}
                      className="p-2 text-left rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-[11px]"
                    >
                      <div className="font-semibold text-slate-200">Ollama Hermes</div>
                      <div className="text-slate-500 font-mono text-[10px]">Porta 11434</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => applyPreset({
                        name: 'RunPod GPU Worker',
                        url: 'https://vllm-agent.your-domain.net',
                        model: 'NousResearch/Hermes-3-Llama-3.1-70B',
                        role: 'reasoning'
                      })}
                      className="p-2 text-left rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-[11px]"
                    >
                      <div className="font-semibold text-slate-200">Cloud / RunPod</div>
                      <div className="text-slate-500 font-mono text-[10px]">HTTPS / VPN</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => applyPreset({
                        name: 'Local Termux Android',
                        url: 'http://127.0.0.1:8080',
                        model: 'Hermes-2-Pro-Mistral-7B',
                        role: 'code'
                      })}
                      className="p-2 text-left rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-[11px]"
                    >
                      <div className="font-semibold text-slate-200">Termux Local</div>
                      <div className="text-slate-500 font-mono text-[10px]">127.0.0.1:8080</div>
                    </button>
                  </div>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome do Servidor:
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex: Servidor Hermes GPU Casa"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
                />
              </div>

              {/* Endpoint URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  URL / Endpoint HTTP ou HTTPS:
                </label>
                <input
                  type="text"
                  required
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="Ex: http://192.168.1.150:8000"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 font-mono text-xs"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Pode ser IP local (LAN), Tailscale IP (100.x.y.z) ou domínio de nuvem.
                </span>
              </div>

              {/* Bearer Token */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Chave API / Token Bearer (Opcional):
                </label>
                <input
                  type="password"
                  value={formToken}
                  onChange={(e) => setFormToken(e.target.value)}
                  placeholder="Deixe em branco se não requer autenticação"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 font-mono text-xs"
                />
              </div>

              {/* Model Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome do Modelo Hermes:
                </label>
                <input
                  type="text"
                  required
                  value={formModel}
                  onChange={(e) => setFormModel(e.target.value)}
                  placeholder="Ex: NousResearch/Hermes-3-Llama-3.1-8B-Instruct"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 font-mono text-xs"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Função do Nó na Malha:
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 font-sans"
                >
                  <option value="primary">Primário (Orquestrador Mestre)</option>
                  <option value="reasoning">Raciocínio Pesado (Hermes 70B / Plan)</option>
                  <option value="worker">Worker de Tarefas Rápidas (8B)</option>
                  <option value="code">Sandbox & Ferramentas de Código</option>
                  <option value="scraper">Scraper / RAG Search</option>
                </select>
              </div>

              {/* Test Connection Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleTestModalConnection}
                  disabled={isTestingModalUrl || !formUrl.trim()}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 active:scale-95 transition"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isTestingModalUrl ? 'animate-spin text-cyan-400' : ''}`} />
                  <span>{isTestingModalUrl ? 'Testando Conectividade...' : 'Testar Conexão do Nó'}</span>
                </button>

                {modalTestResult && (
                  <p className="mt-2 text-xs p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                    {modalTestResult}
                  </p>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold shadow-md hover:brightness-110 active:scale-95"
                >
                  {editingServer ? 'Salvar Alterações' : 'Adicionar Nó Hermes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
