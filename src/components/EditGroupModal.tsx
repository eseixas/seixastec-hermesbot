import React, { useState, useEffect } from 'react';
import { X, Users, Trash2, Check, AlertTriangle, MessageSquare, Sliders, Plus, UserMinus, UserPlus } from 'lucide-react';
import { BotGroup, HermesBot } from '../types/hermes';
import { BotAvatar } from './BotAvatar';
import { triggerHaptic } from '../services/hermesClient';

interface EditGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: BotGroup | null;
  bots: HermesBot[];
  onSaveGroup: (updatedGroup: BotGroup) => void;
  onDeleteGroup: (groupId: string) => void;
  onOpenChat?: (group: BotGroup) => void;
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

export const EditGroupModal: React.FC<EditGroupModalProps> = ({
  isOpen,
  onClose,
  group,
  bots,
  onSaveGroup,
  onDeleteGroup,
  onOpenChat,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0].value);
  const [selectedBotIds, setSelectedBotIds] = useState<string[]>([]);
  const [botFilter, setBotFilter] = useState<'all' | 'members' | 'available'>('all');
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (group) {
      setName(group.name);
      setDescription(group.description || '');
      setSelectedColor(group.color || COLOR_OPTIONS[0].value);
      setSelectedBotIds(group.botIds || []);
      setBotFilter('all');
      setError(null);
      setConfirmDelete(false);
    }
  }, [group, isOpen]);

  if (!isOpen || !group) return null;

  const addBot = (botId: string) => {
    triggerHaptic(12);
    if (!selectedBotIds.includes(botId)) {
      setSelectedBotIds(prev => [...prev, botId]);
      if (error) setError(null);
    }
  };

  const removeBot = (botId: string) => {
    triggerHaptic(15);
    if (selectedBotIds.length <= 1 && selectedBotIds.includes(botId)) {
      setError('O grupo precisa manter pelo menos um bot integrante.');
      return;
    }
    setSelectedBotIds(prev => prev.filter(id => id !== botId));
  };

  const toggleBot = (botId: string) => {
    if (selectedBotIds.includes(botId)) {
      removeBot(botId);
    } else {
      addBot(botId);
    }
  };

  const handleSelectAll = () => {
    triggerHaptic(12);
    if (selectedBotIds.length === bots.length) {
      if (bots.length > 0) {
        setSelectedBotIds([bots[0].id]); // keep at least 1
      }
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

    triggerHaptic([20, 30]);
    const updated: BotGroup = {
      ...group,
      name: name.trim(),
      description: description.trim() || 'Grupo de bots orquestrados Hermes',
      color: selectedColor,
      botIds: selectedBotIds,
    };

    onSaveGroup(updated);
    onClose();
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      triggerHaptic(25);
      setConfirmDelete(true);
      return;
    }

    triggerHaptic([40, 50]);
    onDeleteGroup(group.id);
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
          <div className="flex items-center gap-2.5">
            <div 
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm"
              style={{ backgroundColor: selectedColor }}
            >
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Gerenciar Grupo de Bots</h2>
              <p className="text-[11px] text-slate-400">Renomeie, adicione/remova bots ou exclua o grupo</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Chat Jump Button */}
        {onOpenChat && (
          <div className="px-4 pt-3 pb-1">
            <button
              type="button"
              onClick={() => {
                triggerHaptic(15);
                onOpenChat(group);
                onClose();
              }}
              className="w-full py-2 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Abrir Conversa do Grupo</span>
            </button>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 overflow-y-auto flex-1">
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Group Name (Renomear) */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              Nome do Grupo
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Squad de Engenharia e Operações"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          {/* Group Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              Descrição / Finalidade
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Resolução de incidentes e infraestrutura"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          {/* Color Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Cor do Grupo
            </label>
            <div className="flex items-center gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => {
                    triggerHaptic(10);
                    setSelectedColor(c.value);
                  }}
                  className={`w-7 h-7 rounded-xl flex items-center justify-center transition ${
                    selectedColor === c.value ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                >
                  {selectedColor === c.value && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Member Bots Selection (Adicionar e Remover Bots) */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Bots Integrantes</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                    {selectedBotIds.length}/{bots.length}
                  </span>
                </label>
                <p className="text-[10px] text-slate-400">
                  Adicione ou remova os agentes que participam das respostas deste grupo.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSelectAll}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium px-2 py-0.5 rounded-lg hover:bg-slate-800 transition"
              >
                {selectedBotIds.length === bots.length ? 'Manter 1' : 'Adicionar Todos'}
              </button>
            </div>

            {/* Filter Tabs: Todos, Integrantes, Disponíveis */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800/90 text-[11px]">
              <button
                type="button"
                onClick={() => setBotFilter('all')}
                className={`flex-1 py-1 px-2 rounded-lg font-medium transition ${
                  botFilter === 'all'
                    ? 'bg-slate-800 text-slate-100 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Todos ({bots.length})
              </button>
              <button
                type="button"
                onClick={() => setBotFilter('members')}
                className={`flex-1 py-1 px-2 rounded-lg font-medium transition ${
                  botFilter === 'members'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Integrantes ({selectedBotIds.length})
              </button>
              <button
                type="button"
                onClick={() => setBotFilter('available')}
                className={`flex-1 py-1 px-2 rounded-lg font-medium transition ${
                  botFilter === 'available'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Disponíveis ({bots.length - selectedBotIds.length})
              </button>
            </div>

            {/* Bots list with explicit Adicionar and Remover buttons */}
            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
              {bots
                .filter((bot) => {
                  const isSelected = selectedBotIds.includes(bot.id);
                  if (botFilter === 'members') return isSelected;
                  if (botFilter === 'available') return !isSelected;
                  return true;
                })
                .map((bot) => {
                  const isSelected = selectedBotIds.includes(bot.id);
                  return (
                    <div
                      key={bot.id}
                      onClick={() => toggleBot(bot.id)}
                      className={`flex items-center justify-between p-2 rounded-xl border transition cursor-pointer select-none ${
                        isSelected
                          ? 'bg-slate-900/90 border-cyan-500/40 text-slate-100 shadow-sm'
                          : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:bg-slate-900 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <BotAvatar shape={bot.avatarShape} color={bot.avatarColor} size="sm" />
                        <div className="truncate">
                          <div className="text-xs font-semibold text-slate-200 truncate flex items-center gap-1.5">
                            <span>{bot.name}</span>
                            {isSelected && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-medium">
                                Integrante
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {bot.role} • <span className="text-cyan-400">{bot.serverName || bot.locationCategory}</span>
                          </div>
                        </div>
                      </div>

                      {/* Explicit Action Button: Remover ou Adicionar */}
                      <div className="flex-shrink-0">
                        {isSelected ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeBot(bot.id);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500/25 text-[11px] font-semibold flex items-center gap-1 transition active:scale-95"
                            title={`Remover ${bot.name} do grupo`}
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Remover</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              addBot(bot.id);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25 text-[11px] font-semibold flex items-center gap-1 transition active:scale-95"
                            title={`Adicionar ${bot.name} ao grupo`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Adicionar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

              {bots.filter((bot) => {
                const isSelected = selectedBotIds.includes(bot.id);
                if (botFilter === 'members') return isSelected;
                if (botFilter === 'available') return !isSelected;
                return true;
              }).length === 0 && (
                <div className="p-4 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
                  {botFilter === 'members'
                    ? 'Nenhum bot integrante selecionado.'
                    : botFilter === 'available'
                    ? 'Todos os bots cadastrados já foram adicionados a este grupo.'
                    : 'Nenhum bot encontrado.'}
                </div>
              )}
            </div>
          </div>

          {/* Delete Warning / Confirmation Section */}
          <div className="pt-2 border-t border-slate-800/80">
            {confirmDelete ? (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 space-y-2">
                <div className="flex items-center gap-2 text-rose-300 text-xs font-semibold">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Tem certeza que deseja apagar o grupo &quot;{group.name}&quot;?</span>
                </div>
                <p className="text-[11px] text-rose-300/80">
                  Os bots individuais não serão apagados, apenas o agrupamento e o histórico deste grupo.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                  >
                    Sim, Apagar Grupo
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-rose-950/20 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Apagar este grupo</span>
                </button>
              </div>
            )}
          </div>

          {/* Footer Save & Cancel buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition shadow-md shadow-cyan-950/40"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
