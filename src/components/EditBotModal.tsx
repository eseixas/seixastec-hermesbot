import React, { useState, useEffect } from 'react';
import { 
  X, 
  Cpu, 
  Trash2, 
  Sparkles, 
  Server, 
  Check, 
  Plus, 
  Sliders, 
  BrainCircuit, 
  Layers, 
  Bot,
  Zap,
  Info
} from 'lucide-react';
import { HermesBot, HermesServer, BotAvatarShape, ReasoningEffort } from '../types/hermes';
import { BotAvatar } from './BotAvatar';
import { triggerHaptic } from '../services/hermesClient';
import { POPULAR_LLM_MODELS } from '../constants/models';
import { REASONING_LEVELS, getReasoningConfig, mapTemperatureToReasoning } from '../constants/reasoning';

interface EditBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  bot: HermesBot | null;
  servers: HermesServer[];
  onSaveBot: (updatedBot: HermesBot) => void;
  onDeleteBot?: (botId: string) => void;
}

const SHAPES: { shape: BotAvatarShape; label: string }[] = [
  { shape: 'ghost', label: 'Fantasma' },
  { shape: 'drop', label: 'Gota' },
  { shape: 'square', label: 'Quadrado' },
  { shape: 'round', label: 'Círculo' },
  { shape: 'cloud', label: 'Nuvem' },
  { shape: 'triangle', label: 'Triângulo' },
];

const COLORS = [
  { hex: '#8b5cf6', label: 'Roxo' },
  { hex: '#3b82f6', label: 'Azul' },
  { hex: '#06b6d4', label: 'Ciano' },
  { hex: '#10b981', label: 'Esmeralda' },
  { hex: '#eab308', label: 'Amarelo' },
  { hex: '#f97316', label: 'Laranja' },
  { hex: '#ef4444', label: 'Vermelho' },
  { hex: '#ec4899', label: 'Rosa' },
  { hex: '#d946ef', label: 'Magenta' },
];

const PROMPT_PRESETS = [
  {
    title: 'Orquestrador VPC',
    role: 'Orquestrador Principal',
    prompt: 'Você é o orquestrador Hermes-VPC principal. Responda com raciocínio analítico estruturado, planejamento multi-etapas e acione ferramentas de rede e nós com precisão.',
    modelId: 'NousResearch/Hermes-3-Llama-3.1-70B-FP8'
  },
  {
    title: 'Secretaria & Agenda',
    role: 'Atendimento & Triagem',
    prompt: 'Você é a Secretaria virtual, ágil, atenciosa e focada em organização de agenda, triagem de mensagens e comunicações profissionais.',
    modelId: 'NousResearch/Hermes-3-Llama-3.1-8B-Instruct'
  },
  {
    title: 'DevOps & Código',
    role: 'Engenheiro de Infra & DevOps',
    prompt: 'Você é o especialista em infraestrutura, Linux, Docker, scripts bash, Kubernetes e resolução de incidentes em tempo real.',
    modelId: 'Qwen/Qwen2.5-Coder-32B-Instruct'
  },
  {
    title: 'Raciocínio & Jurídico',
    role: 'Compliance & Análise Contratual',
    prompt: 'Você é o consultor analítico com foco em raciocínio lógico dedutivo, revisão minuciosa de cláusulas e conformidade regulatória.',
    modelId: 'deepseek-ai/DeepSeek-R1-Distill-Llama-70B'
  },
  {
    title: 'CMO & Marketing',
    role: 'Chief Marketing Officer',
    prompt: 'Você é o CMO virtual focado em posicionamento estratégico, crescimento acelerado, copywriting e análise competitiva.',
    modelId: 'NousResearch/Hermes-3-Llama-3.1-70B-FP8'
  },
];

export const EditBotModal: React.FC<EditBotModalProps> = ({
  isOpen,
  onClose,
  bot,
  servers,
  onSaveBot,
  onDeleteBot,
}) => {
  const [activeTab, setActiveTab] = useState<'model' | 'profile' | 'prompt'>('model');
  
  // Form states
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [serverId, setServerId] = useState('');
  const [shape, setShape] = useState<BotAvatarShape>('ghost');
  const [color, setColor] = useState('#8b5cf6');
  const [model, setModel] = useState('NousResearch/Hermes-3-Llama-3.1-70B-FP8');
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [customModelText, setCustomModelText] = useState('');
  const [reasoningEffort, setReasoningEffort] = useState<ReasoningEffort>('medium');
  const [maxTokens, setMaxTokens] = useState(8192);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [quickActions, setQuickActions] = useState<string[]>([]);
  const [newActionInput, setNewActionInput] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state whenever `bot` changes
  useEffect(() => {
    if (bot) {
      setName(bot.name || '');
      setRole(bot.role || '');
      setServerId(bot.serverId || servers[0]?.id || '');
      setShape(bot.avatarShape || 'ghost');
      setColor(bot.avatarColor || '#8b5cf6');
      
      const botModel = bot.modelOverride || 'NousResearch/Hermes-3-Llama-3.1-70B-FP8';
      const isPredefined = POPULAR_LLM_MODELS.some(m => m.id === botModel);
      if (isPredefined) {
        setModel(botModel);
        setIsCustomModel(false);
        setCustomModelText('');
      } else {
        setModel('custom');
        setIsCustomModel(true);
        setCustomModelText(botModel);
      }

      const initialReasoning = bot.reasoningEffort || mapTemperatureToReasoning(bot.temperature);
      setReasoningEffort(initialReasoning);
      setMaxTokens(bot.maxTokens || 8192);
      setSystemPrompt(bot.systemPrompt || '');
      setQuickActions(bot.quickActions || []);
      setConfirmDelete(false);
      setError(null);
    }
  }, [bot, servers]);

  if (!isOpen || !bot) return null;

  const currentEffectiveModel = isCustomModel ? (customModelText.trim() || 'Modelo Personalizado') : model;
  const currentModelMeta = POPULAR_LLM_MODELS.find(m => m.id === model);
  const selectedReasoningConfig = getReasoningConfig(reasoningEffort);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('O nome do bot é obrigatório.');
      setActiveTab('profile');
      return;
    }

    const effectiveModel = isCustomModel 
      ? (customModelText.trim() || 'NousResearch/Hermes-3-Llama-3.1-8B-Instruct')
      : model;

    const srv = servers.find(s => s.id === serverId) || servers[0];

    triggerHaptic([20, 40]);

    const updatedBot: HermesBot = {
      ...bot,
      name: name.trim(),
      role: role.trim() || 'Assistente Especialista',
      serverId: srv ? srv.id : bot.serverId,
      serverName: srv ? srv.name : bot.serverName,
      locationCategory: srv?.locationCategory || bot.locationCategory,
      avatarShape: shape,
      avatarColor: color,
      modelOverride: effectiveModel,
      reasoningEffort,
      temperature: selectedReasoningConfig.equivalentTemp,
      maxTokens,
      systemPrompt: systemPrompt.trim(),
      quickActions,
    };

    onSaveBot(updatedBot);
    onClose();
  };

  const handleAddQuickAction = () => {
    if (!newActionInput.trim()) return;
    if (quickActions.includes(newActionInput.trim())) return;
    triggerHaptic(10);
    setQuickActions([...quickActions, newActionInput.trim()]);
    setNewActionInput('');
  };

  const handleRemoveQuickAction = (actionToRemove: string) => {
    triggerHaptic(10);
    setQuickActions(quickActions.filter(a => a !== actionToRemove));
  };

  const applyPreset = (preset: typeof PROMPT_PRESETS[0]) => {
    triggerHaptic(20);
    setSystemPrompt(preset.prompt);
    setRole(preset.role);
    setModel(preset.modelId);
    setIsCustomModel(false);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/95 sticky top-0 z-20">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 flex-shrink-0">
              <Sliders className="w-4 h-4" />
            </div>
            <div className="truncate">
              <h2 className="text-sm font-bold text-slate-100 truncate">Configurações & Modelo do Bot</h2>
              <p className="text-[11px] text-slate-400 truncate">Edite o modelo de LLM, avatar e diretrizes do agente</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Preview Hero Card */}
        <div className="px-4 py-3.5 bg-gradient-to-b from-slate-800/60 to-slate-900/40 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative">
              <BotAvatar shape={shape} color={color} size="lg" />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 bg-emerald-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-100 truncate">{name || 'Sem nome'}</h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800 text-cyan-400 font-mono border border-slate-700">
                  {bot.locationCategory}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate mt-0.5">{role || 'Sem função definida'}</p>
              
              {/* Active Model & Reasoning Pills */}
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <div className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-mono font-medium truncate max-w-[200px]">
                  <BrainCircuit className="w-3 h-3 text-violet-400 flex-shrink-0" />
                  <span className="truncate">
                    {currentModelMeta?.name || currentEffectiveModel.split('/').pop() || currentEffectiveModel}
                  </span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono ${selectedReasoningConfig.activeBgClass}`}>
                  {selectedReasoningConfig.badge}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/40 px-3 pt-1">
          <button
            type="button"
            onClick={() => {
              triggerHaptic(10);
              setActiveTab('model');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition ${
              activeTab === 'model'
                ? 'border-violet-500 text-violet-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Modelo LLM</span>
            {currentModelMeta && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-violet-500/20 text-violet-300 font-mono">
                {currentModelMeta.size}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic(10);
              setActiveTab('profile');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition ${
              activeTab === 'profile'
                ? 'border-violet-500 text-violet-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Identidade & Avatar</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic(10);
              setActiveTab('prompt');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition ${
              activeTab === 'prompt'
                ? 'border-violet-500 text-violet-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Prompt & Ações</span>
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {error && (
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <Info className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: MODEL SELECTION & INFERENCE */}
          {activeTab === 'model' && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <BrainCircuit className="w-3.5 h-3.5 text-violet-400" />
                    <span>Selecione o Modelo de LLM</span>
                  </label>
                  <span className="text-[11px] text-slate-400">Hermes & Open Weights</span>
                </div>

                {/* Predefined Models List */}
                <div className="space-y-2">
                  {POPULAR_LLM_MODELS.map((item) => {
                    const isSelected = !isCustomModel && model === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          triggerHaptic(15);
                          setModel(item.id);
                          setIsCustomModel(false);
                        }}
                        className={`p-2.5 rounded-xl border transition cursor-pointer active:scale-[0.99] ${
                          isSelected
                            ? 'bg-violet-950/40 border-violet-500 shadow-md ring-1 ring-violet-500/30'
                            : 'bg-slate-950/60 border-slate-800/90 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-100">{item.name}</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-semibold">
                                {item.size}
                              </span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-violet-500/20 text-violet-300 font-medium">
                                {item.tag}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                              {item.description}
                            </p>
                            {item.recommendedRole && (
                              <p className="text-[10px] text-slate-500 mt-1">
                                <span className="text-slate-400 font-medium">Recomendado para:</span> {item.recommendedRole}
                              </p>
                            )}
                          </div>

                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            isSelected ? 'border-violet-400 bg-violet-500 text-white' : 'border-slate-700'
                          }`}>
                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Custom Model Option */}
                  <div
                    onClick={() => {
                      triggerHaptic(15);
                      setIsCustomModel(true);
                    }}
                    className={`p-2.5 rounded-xl border transition cursor-pointer ${
                      isCustomModel
                        ? 'bg-violet-950/40 border-violet-500 shadow-md ring-1 ring-violet-500/30'
                        : 'bg-slate-950/60 border-slate-800/90 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-100">Modelo Personalizado (Custom ID)</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300">
                            vLLM / Ollama / HF
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Informe o identificador de modelo hospedado em seu servidor ou nó vLLM.
                        </p>

                        {isCustomModel && (
                          <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              value={customModelText}
                              onChange={(e) => setCustomModelText(e.target.value)}
                              placeholder="ex: NousResearch/Hermes-3-Llama-3.1-70B ou ollama/hermes:latest"
                              className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-violet-400 font-mono"
                            />
                          </div>
                        )}
                      </div>

                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isCustomModel ? 'border-violet-400 bg-violet-500 text-white' : 'border-slate-700'
                      }`}>
                        {isCustomModel && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reasoning Effort (Nível de Raciocínio) */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                    <span className="text-xs font-semibold text-slate-200">Nível de Raciocínio (Reasoning)</span>
                  </div>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full border font-mono font-medium ${selectedReasoningConfig.activeBgClass}`}>
                    {selectedReasoningConfig.badge}
                  </span>
                </div>

                {/* Segmented Level Buttons: Instant, Low, Medium, High, Extra High, Max */}
                <div className="grid grid-cols-6 gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800/80">
                  {REASONING_LEVELS.map((level) => {
                    const isSelected = reasoningEffort === level.id;
                    return (
                      <button
                        key={level.id}
                        type="button"
                        onClick={() => {
                          triggerHaptic(15);
                          setReasoningEffort(level.id);
                        }}
                        className={`py-2 px-0.5 rounded-lg text-center transition-all flex flex-col items-center justify-center gap-0.5 ${
                          isSelected
                            ? `${level.activeBgClass} font-bold shadow-md scale-[1.02]`
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`}
                      >
                        <span className="text-xs leading-none">{level.badge.split(' ')[0]}</span>
                        <span className="text-[10px] leading-tight mt-0.5 tracking-tight truncate max-w-full">
                          {level.shortLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: IDENTITY & AVATAR */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome do Bot
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ex: Hermes-VPC, Secretaria, Engenheiro DevOps"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Especialidade / Função (Subtítulo)
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="ex: Orquestrador Principal, Atendimento & Triagem"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nó de Execução / Servidor Hermes
                </label>
                <select
                  value={serverId}
                  onChange={(e) => setServerId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-violet-400 font-mono"
                >
                  {servers.map((srv) => (
                    <option key={srv.id} value={srv.id}>
                      {srv.name} ({srv.locationCategory || 'NÓ'}) - {srv.url}
                    </option>
                  ))}
                </select>
              </div>

              {/* Avatar Shape Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Formato do Avatar
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {SHAPES.map((item) => {
                    const isSelected = shape === item.shape;
                    return (
                      <button
                        key={item.shape}
                        type="button"
                        onClick={() => {
                          triggerHaptic(10);
                          setShape(item.shape);
                        }}
                        className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition active:scale-95 ${
                          isSelected
                            ? 'border-violet-500 bg-violet-950/30'
                            : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                        }`}
                      >
                        <BotAvatar shape={item.shape} color={color} size="md" />
                        <span className="text-[10px] text-slate-300">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Avatar Color Palette */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Cor do Avatar
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {COLORS.map((c) => {
                    const isSelected = color === c.hex;
                    return (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => {
                          triggerHaptic(10);
                          setColor(c.hex);
                        }}
                        title={c.label}
                        className={`w-7 h-7 rounded-full transition transform active:scale-90 flex items-center justify-center ${
                          isSelected ? 'ring-2 ring-white scale-110' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: c.hex }}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SYSTEM PROMPT & QUICK ACTIONS */}
          {activeTab === 'prompt' && (
            <div className="space-y-4">
              {/* Presets */}
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                  Predefinições Rápidas de Persona:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PROMPT_PRESETS.map((p) => (
                    <button
                      key={p.title}
                      type="button"
                      onClick={() => applyPreset(p)}
                      className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-violet-500/50 hover:bg-violet-950/20 text-[11px] text-slate-300 transition active:scale-95"
                    >
                      {p.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* System Prompt Textarea */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                  <span>Instruções do Sistema (System Prompt)</span>
                  <span className="text-[10px] text-slate-500 font-mono">{systemPrompt.length} chars</span>
                </label>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows={5}
                  placeholder="Defina o papel, restrições e comportamento de raciocínio do modelo Hermes..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-400 font-mono leading-relaxed"
                />
              </div>

              {/* Quick Actions / Suggested Chips */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Ações Rápidas Sugeridas (Chips do Chat)
                </label>
                
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={newActionInput}
                    onChange={(e) => setNewActionInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddQuickAction();
                      }
                    }}
                    placeholder="Adicionar comando rápido..."
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-400"
                  />
                  <button
                    type="button"
                    onClick={handleAddQuickAction}
                    className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white transition active:scale-95 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Inserir</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {quickActions.map((action) => (
                    <span
                      key={action}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300"
                    >
                      <span>{action}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveQuickAction(action)}
                        className="p-0.5 hover:text-red-400 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {quickActions.length === 0 && (
                    <span className="text-[11px] text-slate-500 italic">Nenhum comando rápido cadastrado.</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Actions */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-900/95 flex items-center justify-between gap-2">
          {/* Delete bot button */}
          {onDeleteBot ? (
            confirmDelete ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic([30, 40]);
                    onDeleteBot(bot.id);
                    onClose();
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition active:scale-95"
                >
                  Confirmar Exclusão
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-2 py-1.5 rounded-xl text-slate-400 hover:text-slate-200 text-xs transition"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(20);
                  setConfirmDelete(true);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition active:scale-95"
                title="Excluir este Bot"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )
          ) : <div />}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition active:scale-95"
            >
              Fechar
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition shadow-lg shadow-violet-600/20 active:scale-95 flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Salvar Alterações</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
