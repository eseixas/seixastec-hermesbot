import React, { useState } from 'react';
import { X, Bot, Check, Plus, BrainCircuit, Cpu, Sparkles } from 'lucide-react';
import { HermesBot, HermesServer, BotAvatarShape, ReasoningEffort } from '../types/hermes';
import { BotAvatar } from './BotAvatar';
import { triggerHaptic } from '../services/hermesClient';
import { POPULAR_LLM_MODELS } from '../constants/models';
import { REASONING_LEVELS, getReasoningConfig } from '../constants/reasoning';

interface CreateBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  servers: HermesServer[];
  onCreateBot: (bot: HermesBot) => void;
}

const SHAPES: { shape: BotAvatarShape; label: string }[] = [
  { shape: 'ghost', label: 'Fantasma' },
  { shape: 'square', label: 'Quadrado' },
  { shape: 'drop', label: 'Gota' },
  { shape: 'round', label: 'Círculo' },
  { shape: 'cloud', label: 'Nuvem' },
  { shape: 'triangle', label: 'Triângulo' },
];

const COLORS = [
  '#8b5cf6', // purple
  '#3b82f6', // blue
  '#06b6d4', // cyan
  '#10b981', // emerald
  '#eab308', // yellow
  '#f97316', // orange
  '#ef4444', // red
  '#ec4899', // pink
  '#d946ef', // magenta
];

export const CreateBotModal: React.FC<CreateBotModalProps> = ({
  isOpen,
  onClose,
  servers,
  onCreateBot,
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [selectedServerId, setSelectedServerId] = useState(servers[0]?.id || '');
  const [model, setModel] = useState('NousResearch/Hermes-3-Llama-3.1-70B-FP8');
  const [shape, setShape] = useState<BotAvatarShape>('ghost');
  const [color, setColor] = useState(COLORS[0]);
  const [reasoningEffort, setReasoningEffort] = useState<ReasoningEffort>('medium');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor, informe um nome para o bot.');
      return;
    }

    const srv = servers.find(s => s.id === selectedServerId) || servers[0];
    triggerHaptic([20, 30]);

    const selectedReasoningConfig = getReasoningConfig(reasoningEffort);

    const newBot: HermesBot = {
      id: `bot-${Date.now()}`,
      name: name.trim(),
      serverId: srv?.id || 'srv-custom',
      serverName: srv?.name || 'Servidor Personalizado',
      locationCategory: srv?.locationCategory || 'HERMES-VPC',
      avatarShape: shape,
      avatarColor: color,
      role: role.trim() || 'Assistente Especialista',
      status: 'idle',
      lastActivity: 'Bot registrado e conectado ao cluster',
      lastSeen: 'agora',
      modelOverride: model,
      reasoningEffort,
      temperature: selectedReasoningConfig.equivalentTemp,
      systemPrompt: systemPrompt.trim() || `Você é ${name.trim()}, um agente Hermes inteligente.`,
      quickActions: ['Resumo de Tarefas', 'Status do Bot', 'Executar Análise']
    };

    onCreateBot(newBot);
    setName('');
    setRole('');
    setSystemPrompt('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Adicionar Novo Bot</h2>
              <p className="text-[11px] text-slate-400">Cadastre um agente com persona e avatar personalizados</p>
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic(10);
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              {error}
            </div>
          )}

          {/* Avatar Preview */}
          <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
            <BotAvatar shape={shape} color={color} size="lg" />
            <div>
              <span className="text-xs font-bold text-slate-200 block">{name || 'Nome do Bot'}</span>
              <span className="text-[11px] text-slate-400 block">{role || 'Papel ou Especialidade'}</span>
              <span className="text-[10px] text-cyan-400 font-mono">
                {servers.find(s => s.id === selectedServerId)?.name || 'Servidor'}
              </span>
            </div>
          </div>

          {/* Bot Name & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nome do Bot *</label>
              <input
                type="text"
                placeholder="Ex: Suporte, Copywriter..."
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError(null);
                }}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Especialidade / Papel</label>
              <input
                type="text"
                placeholder="Ex: Triagem de Tickets"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Server Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Hospedado no Servidor</label>
            <select
              value={selectedServerId}
              onChange={(e) => setSelectedServerId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              {servers.map(s => (
                <option key={s.id} value={s.id}>
                  {s.locationCategory ? `[${s.locationCategory}] ` : ''}{s.name} ({s.status})
                </option>
              ))}
            </select>
          </div>

          {/* LLM Model Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <BrainCircuit className="w-3.5 h-3.5 text-violet-400" />
              <span>Modelo de LLM</span>
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-violet-400 font-mono"
            >
              {POPULAR_LLM_MODELS.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} - [{m.tag}]
                </option>
              ))}
            </select>
          </div>

          {/* Reasoning Effort Select */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Nível de Raciocínio (Reasoning)</span>
              </label>
              <span className="text-[10px] text-cyan-400 font-mono">
                {getReasoningConfig(reasoningEffort).badge}
              </span>
            </div>
            <div className="grid grid-cols-6 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
              {REASONING_LEVELS.map((level) => {
                const isSelected = reasoningEffort === level.id;
                return (
                  <button
                    key={level.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic(10);
                      setReasoningEffort(level.id);
                    }}
                    className={`py-1.5 px-0.5 rounded-lg text-center transition flex flex-col items-center justify-center ${
                      isSelected
                        ? `${level.activeBgClass} font-bold shadow-sm`
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <span className="text-xs">{level.badge.split(' ')[0]}</span>
                    <span className="text-[9px] mt-0.5 truncate max-w-full">{level.shortLabel}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {getReasoningConfig(reasoningEffort).description}
            </p>
          </div>

          {/* Avatar Shape Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Formato do Avatar</label>
            <div className="grid grid-cols-6 gap-2">
              {SHAPES.map((s) => (
                <button
                  type="button"
                  key={s.shape}
                  onClick={() => {
                    triggerHaptic(10);
                    setShape(s.shape);
                  }}
                  className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 transition ${
                    shape === s.shape 
                      ? 'border-cyan-400 bg-cyan-500/10' 
                      : 'border-slate-800 bg-slate-950 hover:bg-slate-800'
                  }`}
                >
                  <BotAvatar shape={s.shape} color={color} size="sm" />
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Cor do Avatar</label>
            <div className="flex items-center gap-2">
              {COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => {
                    triggerHaptic(10);
                    setColor(c);
                  }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform ${
                    color === c ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Bot</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
