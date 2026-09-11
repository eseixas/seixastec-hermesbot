import React, { useState } from 'react';
import { X, Users, Check, FolderPlus } from 'lucide-react';
import { BotGroup, HermesBot } from '../types/hermes';
import { BotAvatar } from './BotAvatar';
import { triggerHaptic } from '../services/hermesClient';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  bots: HermesBot[];
  onCreateGroup: (group: BotGroup) => void;
}

const COLOR_OPTIONS = [
  { name: 'Ciano', value: '#06b6d4' },
  { name: 'Roxo', value: '#a855f7' },
  { name: 'Azul', value: '#3b82f6' },
  { name: 'Verde', value: '#10b981' },
  { name: 'Rosa', value: '#ec4899' },
  { name: 'Amarelo', value: '#eab308' },
  { name: 'Laranja', value: '#f97316' },
];

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  bots,
  onCreateGroup,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0].value);
  const [selectedBotIds, setSelectedBotIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleBot = (botId: string) => {
    triggerHaptic(10);
    setSelectedBotIds(prev => 
      prev.includes(botId) ? prev.filter(id => id !== botId) : [...prev, botId]
    );
  };

  const handleSelectAll = () => {
    triggerHaptic(12);
    if (selectedBotIds.length === bots.length) {
      setSelectedBotIds([]);
    } else {
      setSelectedBotIds(bots.map(b => b.id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor, informe um nome para o grupo.');
      return;
    }
    if (selectedBotIds.length === 0) {
      setError('Selecione pelo menos um bot para integrar o grupo.');
      return;
    }

    triggerHaptic([20, 40]);
    const newGroup: BotGroup = {
      id: `grp-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || 'Grupo de bots orquestrados Hermes',
      color: selectedColor,
      avatarShape: 'cloud',
      botIds: selectedBotIds,
      createdAt: Date.now(),
      lastActivity: 'Grupo criado e pronto para orquestração mútua',
      lastSeen: 'agora'
    };

    onCreateGroup(newGroup);
    setName('');
    setDescription('');
    setSelectedBotIds([]);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <FolderPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Criar Novo Grupo de Bots</h2>
              <p className="text-[11px] text-slate-400">Agrupe agentes para colaboração e comandos conjuntos</p>
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

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              {error}
            </div>
          )}

          {/* Group Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nome do Grupo *
            </label>
            <input
              type="text"
              placeholder="Ex: Equipe Diretoria, DevOps & Cloud, Marketing..."
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Objetivo / Descrição
            </label>
            <input
              type="text"
              placeholder="Ex: Análise estratégica e alocação de infraestrutura"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Cor do Grupo
            </label>
            <div className="flex items-center gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  type="button"
                  key={c.value}
                  onClick={() => {
                    triggerHaptic(10);
                    setSelectedColor(c.value);
                  }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform ${
                    selectedColor === c.value ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c.value }}
                >
                  {selectedColor === c.value && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Select Bots */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300">
                Selecione os Bots ({selectedBotIds.length}/{bots.length})
              </label>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium"
              >
                {selectedBotIds.length === bots.length ? 'Desmarcar Todos' : 'Marcar Todos'}
              </button>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {bots.map((bot) => {
                const isChecked = selectedBotIds.includes(bot.id);
                return (
                  <div
                    key={bot.id}
                    onClick={() => toggleBot(bot.id)}
                    className={`flex items-center justify-between p-2 rounded-xl border transition cursor-pointer select-none ${
                      isChecked 
                        ? 'bg-cyan-500/10 border-cyan-500/40 text-slate-100' 
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <BotAvatar shape={bot.avatarShape} color={bot.avatarColor} size="sm" />
                      <div className="truncate">
                        <div className="text-xs font-semibold text-slate-200 truncate flex items-center gap-1.5">
                          <span>{bot.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-normal">
                            {bot.serverName || 'Servidor'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">{bot.role}</div>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                      isChecked ? 'bg-cyan-500 border-cyan-400 text-white' : 'border-slate-700 bg-slate-900'
                    }`}>
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
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
              <Users className="w-4 h-4" />
              <span>Criar Grupo</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
