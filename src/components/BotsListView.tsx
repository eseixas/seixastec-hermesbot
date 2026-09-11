import React, { useState, useMemo } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  Bell, 
  BellOff, 
  Plus, 
  Globe, 
  Laptop, 
  ChevronDown, 
  ChevronRight, 
  Users, 
  Server,
  FolderPlus,
  Bot as BotIcon,
  Sparkles,
  Check,
  Sliders,
  BrainCircuit,
  MoreVertical
} from 'lucide-react';
import { HermesBot, BotGroup, HermesServer } from '../types/hermes';
import { BotAvatar } from './BotAvatar';
import { triggerHaptic } from '../services/hermesClient';
import { getReasoningConfig } from '../constants/reasoning';

interface BotsListViewProps {
  bots: HermesBot[];
  groups: BotGroup[];
  servers: HermesServer[];
  isMuted: boolean;
  selectedBotId?: string | null;
  onToggleMute: () => void;
  onSelectBot: (bot: HermesBot) => void;
  onSelectGroup: (group: BotGroup) => void;
  onOpenCreateGroup: () => void;
  onOpenCreateBot: () => void;
  onEditBot?: (bot: HermesBot) => void;
  onEditGroup?: (group: BotGroup) => void;
}

export const BotsListView: React.FC<BotsListViewProps> = ({
  bots,
  groups,
  servers,
  isMuted,
  selectedBotId,
  onToggleMute,
  onSelectBot,
  onSelectGroup,
  onOpenCreateGroup,
  onOpenCreateBot,
  onEditBot,
  onEditGroup,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [filterMode, setFilterMode] = useState<'all' | 'bots' | 'groups'>('all');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const toggleCategory = (catName: string) => {
    triggerHaptic(10);
    setCollapsedCategories(prev => ({
      ...prev,
      [catName]: !prev[catName]
    }));
  };

  // Filter bots & groups by search
  const filteredBots = useMemo(() => {
    if (!searchQuery.trim()) return bots;
    const q = searchQuery.toLowerCase();
    return bots.filter(b => 
      b.name.toLowerCase().includes(q) ||
      b.role.toLowerCase().includes(q) ||
      (b.serverName && b.serverName.toLowerCase().includes(q)) ||
      (b.locationCategory && b.locationCategory.toLowerCase().includes(q)) ||
      (b.lastActivity && b.lastActivity.toLowerCase().includes(q))
    );
  }, [bots, searchQuery]);

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groups;
    const q = searchQuery.toLowerCase();
    return groups.filter(g => 
      g.name.toLowerCase().includes(q) ||
      g.description.toLowerCase().includes(q)
    );
  }, [groups, searchQuery]);

  // Group bots by server category
  const categories = useMemo(() => {
    const map: Record<string, HermesBot[]> = {};

    filteredBots.forEach(bot => {
      const cat = bot.locationCategory || 'OUTROS NÓS';
      if (!map[cat]) map[cat] = [];
      map[cat].push(bot);
    });

    return map;
  }, [filteredBots]);

  // Specific ordering matching the screenshot: HERMES-VPC, ORACLE CLOUD, THIS DEVICE, etc.
  const orderedCategoryNames = useMemo(() => {
    const priority = ['HERMES-VPC', 'ORACLE CLOUD', 'THIS DEVICE'];
    const keys = Object.keys(categories);
    const sorted = keys.sort((a, b) => {
      const idxA = priority.indexOf(a);
      const idxB = priority.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
    return sorted;
  }, [categories]);

  const getCategoryIcon = (categoryName: string) => {
    if (categoryName.toUpperCase().includes('DEVICE') || categoryName.toUpperCase().includes('LAPTOP')) {
      return <Laptop className="w-3.5 h-3.5 text-slate-400" />;
    }
    return <Globe className="w-3.5 h-3.5 text-slate-400" />;
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col bg-slate-950 text-slate-100 min-h-[82vh] select-none pb-24">
      {/* Top Header matching exact screenshot */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-slate-900 sticky top-0 bg-slate-950/95 backdrop-blur-md z-20">
        <h1 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          BOTS
        </h1>

        <div className="flex items-center gap-1">
          {/* Mute toggle button */}
          <button
            onClick={() => {
              triggerHaptic(15);
              onToggleMute();
            }}
            className={`p-1.5 rounded-lg transition ${
              isMuted 
                ? 'text-slate-500 hover:text-slate-300' 
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
            }`}
            title={isMuted ? 'Notificações silenciadas' : 'Silenciar notificações'}
          >
            {isMuted ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
          </button>

          {/* Plus Add Button with Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                triggerHaptic(10);
                setShowAddMenu(prev => !prev);
              }}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900 transition active:scale-95"
              title="Adicionar"
            >
              <Plus className="w-4 h-4" />
            </button>

            {showAddMenu && (
              <div 
                className="absolute right-0 mt-1 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1.5 z-30 text-xs animate-in fade-in slide-in-from-top-2 duration-150"
                onClick={() => setShowAddMenu(false)}
              >
                <button
                  onClick={() => {
                    triggerHaptic(15);
                    onOpenCreateGroup();
                  }}
                  className="w-full px-3 py-2 flex items-center gap-2 text-slate-200 hover:bg-slate-800 text-left transition"
                >
                  <FolderPlus className="w-4 h-4 text-cyan-400" />
                  <span>Criar Grupo de Bots</span>
                </button>
                <button
                  onClick={() => {
                    triggerHaptic(15);
                    onOpenCreateBot();
                  }}
                  className="w-full px-3 py-2 flex items-center gap-2 text-slate-200 hover:bg-slate-800 text-left transition"
                >
                  <BotIcon className="w-4 h-4 text-purple-400" />
                  <span>Adicionar Novo Bot</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar matching screenshot */}
      <div className="p-3">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-3 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bots and group chats..."
            className="w-full bg-slate-900/90 border border-slate-800/80 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-700 transition"
          />

          {/* Filter dropdown button */}
          <button
            onClick={() => setShowFilterMenu(prev => !prev)}
            className={`absolute right-2.5 p-1 rounded-md transition ${
              filterMode !== 'all' ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Filtros"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>

          {showFilterMenu && (
            <div 
              className="absolute right-0 top-10 w-36 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1 z-30 text-xs"
              onClick={() => setShowFilterMenu(false)}
            >
              <button
                onClick={() => setFilterMode('all')}
                className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-slate-800 ${
                  filterMode === 'all' ? 'text-cyan-400 font-bold' : 'text-slate-300'
                }`}
              >
                <span>Todos</span>
                {filterMode === 'all' && <Check className="w-3 h-3" />}
              </button>
              <button
                onClick={() => setFilterMode('bots')}
                className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-slate-800 ${
                  filterMode === 'bots' ? 'text-cyan-400 font-bold' : 'text-slate-300'
                }`}
              >
                <span>Apenas Bots</span>
                {filterMode === 'bots' && <Check className="w-3 h-3" />}
              </button>
              <button
                onClick={() => setFilterMode('groups')}
                className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-slate-800 ${
                  filterMode === 'groups' ? 'text-cyan-400 font-bold' : 'text-slate-300'
                }`}
              >
                <span>Grupos</span>
                {filterMode === 'groups' && <Check className="w-3 h-3" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main List Container */}
      <div className="flex-1 space-y-4 px-1">
        {/* BOT GROUPS SECTION */}
        {(filterMode === 'all' || filterMode === 'groups') && filteredGroups.length > 0 && (
          <div className="space-y-1">
            {/* Category Header */}
            <div 
              onClick={() => toggleCategory('GROUPS')}
              className="flex items-center justify-between px-2.5 py-1 text-slate-400 hover:text-slate-200 cursor-pointer transition"
            >
              <div className="flex items-center gap-2">
                {collapsedCategories['GROUPS'] ? (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                )}
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                  GRUPOS DE BOTS
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                {filteredGroups.length}
              </span>
            </div>

            {/* Group items */}
            {!collapsedCategories['GROUPS'] && (
              <div className="space-y-1 pl-2">
                {filteredGroups.map(group => {
                  const memberBots = bots.filter(b => group.botIds.includes(b.id));

                  return (
                    <div
                      key={group.id}
                      onClick={() => {
                        triggerHaptic(15);
                        onSelectGroup(group);
                      }}
                      className="group flex items-center justify-between p-2 rounded-xl transition cursor-pointer hover:bg-slate-900/80 active:scale-[0.99] border border-transparent hover:border-slate-800/80"
                      title={`Conversar com o grupo ${group.name}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Group Avatar badge */}
                        <div 
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0"
                          style={{ backgroundColor: group.color || '#06b6d4' }}
                        >
                          <Users className="w-4 h-4" />
                        </div>

                        {/* Group info */}
                        <div className="truncate">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full border border-slate-400 flex-shrink-0" />
                            <span className="text-xs font-semibold text-slate-100 truncate group-hover:text-cyan-300 transition">
                              {group.name}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {group.lastActivity || `${memberBots.length} bots: ${memberBots.map(b => b.name).join(', ')}`}
                          </p>
                        </div>
                      </div>

                      {/* Right side: Last seen & Edit/Settings button */}
                      <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                        {group.lastSeen && (
                          <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                            {group.lastSeen}
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerHaptic(15);
                            if (onEditGroup) {
                              onEditGroup(group);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition active:scale-95"
                          title="Configurações do grupo (adicionar/remover bots, renomear ou apagar)"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SERVER CATEGORIES & BOTS (HERMES-VPC, ORACLE CLOUD, THIS DEVICE...) */}
        {(filterMode === 'all' || filterMode === 'bots') && (
          <>
            {orderedCategoryNames.map(categoryName => {
              const categoryBots = categories[categoryName] || [];
              const isCollapsed = !!collapsedCategories[categoryName];

              return (
                <div key={categoryName} className="space-y-1">
                  {/* Category Header exactly as in screenshot: Chevron icon NAME Count */}
                  <div
                    onClick={() => toggleCategory(categoryName)}
                    className="flex items-center justify-between px-2.5 py-1 text-slate-400 hover:text-slate-200 cursor-pointer transition select-none"
                  >
                    <div className="flex items-center gap-2">
                      {isCollapsed ? (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                      )}
                      {getCategoryIcon(categoryName)}
                      <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                        {categoryName}
                      </span>
                    </div>

                    <span className="text-[11px] font-mono text-slate-500">
                      {categoryBots.length}
                    </span>
                  </div>

                  {/* Bots in this Server category */}
                  {!isCollapsed && (
                    <div className="space-y-1 pl-1">
                      {categoryBots.map(bot => {
                        const isSelected = selectedBotId === bot.id;

                        return (
                          <div
                            key={bot.id}
                            onClick={() => {
                              triggerHaptic(15);
                              onSelectBot(bot);
                            }}
                            className={`group flex items-center justify-between p-2 rounded-xl transition cursor-pointer active:scale-[0.99] ${
                              isSelected
                                ? 'bg-slate-800/90 border border-slate-700/80 shadow-md'
                                : 'hover:bg-slate-900/80 border border-transparent hover:border-slate-800/60'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {/* Vector avatar of the bot */}
                              <BotAvatar 
                                shape={bot.avatarShape} 
                                color={bot.avatarColor} 
                                size="md" 
                              />

                              {/* Bullet & Bot Name & Subtitle */}
                              <div className="truncate min-w-0">
                                <div className="flex items-center gap-2">
                                  {/* Small status circle exactly as in screenshot */}
                                  <span className={`w-1.5 h-1.5 rounded-full border flex-shrink-0 ${
                                    bot.status === 'online' 
                                      ? 'border-emerald-400 bg-emerald-400' 
                                      : 'border-slate-400 bg-transparent'
                                  }`} />
                                  <span className="text-xs font-semibold text-slate-100 truncate">
                                    {bot.name}
                                  </span>

                                  {/* LLM Model Pill */}
                                  {bot.modelOverride && (
                                    <span 
                                      className="text-[9px] px-1.5 py-0.2 rounded-full bg-violet-500/15 border border-violet-500/25 text-violet-300 font-mono flex-shrink-0"
                                      title={`Modelo: ${bot.modelOverride}`}
                                    >
                                      {bot.modelOverride.split('/').pop()?.replace('-Instruct', '').replace('-FP8', '').replace('-Distill', '')}
                                    </span>
                                  )}

                                  {/* Reasoning Badge */}
                                  {bot.reasoningEffort && (
                                    <span 
                                      className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-900 border border-slate-700/60 text-slate-300 font-mono flex-shrink-0"
                                      title={`Nível de Raciocínio: ${getReasoningConfig(bot.reasoningEffort).label}`}
                                    >
                                      {getReasoningConfig(bot.reasoningEffort).badge.split(' ')[0]}
                                    </span>
                                  )}
                                </div>

                                {bot.lastActivity && (
                                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                    {bot.lastActivity}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Right side: Timestamp & Edit Quick Button */}
                            <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                              {bot.lastSeen && (
                                <span className="text-[10px] text-slate-500 font-mono">
                                  {bot.lastSeen}
                                </span>
                              )}

                              {onEditBot && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    triggerHaptic(15);
                                    onEditBot(bot);
                                  }}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-violet-300 hover:bg-slate-800 transition active:scale-95"
                                  title="Editar este bot e alterar modelo LLM"
                                >
                                  <Sliders className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}

        {/* Empty state if search returned no results */}
        {filteredBots.length === 0 && filteredGroups.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-xs">
            Nenhum bot ou grupo encontrado com o termo &quot;{searchQuery}&quot;.
          </div>
        )}
      </div>

      {/* Footer stats info */}
      <div className="p-3 border-t border-slate-900/80 bg-slate-950/90 flex items-center justify-center text-xs">
        <span className="text-[10px] text-slate-500 font-mono">
          {bots.length} bots cadastrados • {groups.length} grupos
        </span>
      </div>
    </div>
  );
};
