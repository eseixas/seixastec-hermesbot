import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  Send, 
  Sparkles, 
  Trash2, 
  Terminal, 
  Bot, 
  Cpu, 
  Clock, 
  CheckCircle2, 
  Brain, 
  ChevronDown, 
  ChevronUp, 
  Zap,
  Users,
  Server,
  Sliders,
  BrainCircuit,
  Settings2
} from 'lucide-react';
import { HermesBot, BotGroup, HermesMessage, HermesServer } from '../types/hermes';
import { BotAvatar } from './BotAvatar';
import { triggerHaptic } from '../services/hermesClient';
import { getReasoningConfig } from '../constants/reasoning';

interface BotChatViewProps {
  bot?: HermesBot | null;
  group?: BotGroup | null;
  allBots: HermesBot[];
  servers: HermesServer[];
  messages: HermesMessage[];
  onSendMessage: (userMsg: HermesMessage, botMsgs: HermesMessage[]) => void;
  onClearMessages: (targetId: string) => void;
  onBack: () => void;
  onEditBot?: (bot: HermesBot) => void;
  onEditGroup?: (group: BotGroup) => void;
}

export const BotChatView: React.FC<BotChatViewProps> = ({
  bot,
  group,
  allBots,
  servers,
  messages,
  onSendMessage,
  onClearMessages,
  onBack,
  onEditBot,
  onEditGroup,
}) => {
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isGroup = !!group;
  const targetId = isGroup ? group?.id : bot?.id;
  const targetName = isGroup ? group?.name : bot?.name;

  // Filter messages for this bot or group
  const conversationMessages = messages.filter((m) => {
    if (isGroup) {
      return m.groupId === group?.id;
    }
    return m.botId === bot?.id;
  });

  // Associated server
  const server = !isGroup 
    ? servers.find(s => s.id === bot?.serverId) || servers[0]
    : null;

  // Group members
  const groupBots = isGroup 
    ? allBots.filter(b => group?.botIds.includes(b.id))
    : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages, isTyping]);

  const toggleThought = (msgId: string) => {
    triggerHaptic(10);
    setExpandedThoughts(prev => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const generateBotReply = (
    respondingBot: HermesBot, 
    userText: string, 
    groupContext?: string
  ): HermesMessage => {
    const isLocalCLI = respondingBot.id === 'bot-windows-laptop';
    const isInfra = respondingBot.id === 'bot-infra';
    const activeModel = respondingBot.modelOverride || server?.modelName || 'NousResearch/Hermes-3-Llama-3.1-70B-FP8';
    const modelShort = activeModel.split('/').pop() || activeModel;
    const reasoningConfig = getReasoningConfig(respondingBot.reasoningEffort);

    let replyContent = '';
    let thought = '';
    let toolCalls = undefined;

    if (userText.toLowerCase().includes('status') || userText.toLowerCase().includes('ajuda')) {
      replyContent = `Estou operacional no nó ${respondingBot.serverName || 'Hermes'} executando [${modelShort}]. Pronto para atuar como ${respondingBot.role}. Raciocínio configurado como [${reasoningConfig.label}].`;
      thought = `[${modelShort} | ${reasoningConfig.badge}] Analisada solicitação de status. Latência: ${server?.latencyMs || 25}ms. Nível de raciocínio ativo: ${reasoningConfig.label} (${reasoningConfig.subtitle}).`;
    } else if (isLocalCLI) {
      replyContent = `Comando verificado no ambiente local Windows com inferência via [${modelShort}] (Raciocínio: ${reasoningConfig.shortLabel}). Item processado com saída padrão [OK].`;
      thought = `[${modelShort} | ${reasoningConfig.badge}] Chamada CLI para subprocesso local em ${respondingBot.name}. Exit code: 0.`;
      toolCalls = [
        {
          id: `tool-${Date.now()}`,
          tool: 'cli_exec',
          arguments: { command: userText, cwd: 'C:\\Users\\Hermes\\Workspace' },
          status: 'completed' as const,
          result: 'Operação concluída com sucesso. 1 tarefa sincronizada.',
          executionTimeMs: 42
        }
      ];
    } else if (isInfra) {
      replyContent = `Ambiente de containers e clusters inspecionado. Todas as réplicas estão saudáveis com 0 falhas registradas nas últimas 24 horas. Inferência rodando em vLLM com ${modelShort} (Modo: ${reasoningConfig.label}).`;
      thought = `[${modelShort} | ${reasoningConfig.badge}] Consultando API do Kubernetes e status dos nós vLLM em ${respondingBot.serverName}. Profundidade de inferência: ${reasoningConfig.label}.`;
      toolCalls = [
        {
          id: `tool-${Date.now()}`,
          tool: 'cluster_health_check',
          arguments: { namespace: 'hermes-ai', metrics: ['gpu_vram', 'pod_status'] },
          status: 'completed' as const,
          result: 'Pods: 8/8 Running. VRAM utilizada: 58.2 / 80.0 GB.',
          executionTimeMs: 68
        }
      ];
    } else {
      replyContent = `Entendido! Como ${respondingBot.role} alimentado por [${modelShort}] (Raciocínio: ${reasoningConfig.shortLabel}), processei sua mensagem: "${userText}".\n\nPosso detalhar um plano de execução passo a passo ou delegar para os outros agentes conforme necessário.`;
      thought = `[${modelShort} | ${reasoningConfig.badge}] Interpretando intenção: "${userText}". Contexto: ${groupContext || 'conversa direta'}. Alinhado com persona ${respondingBot.name} em modo de raciocínio ${reasoningConfig.label}.`;
    }

    return {
      id: `msg-${Date.now()}-${respondingBot.id}`,
      botId: respondingBot.id,
      botName: respondingBot.name,
      groupId: isGroup ? group?.id : undefined,
      serverId: respondingBot.serverId,
      serverName: respondingBot.serverName,
      sender: 'bot',
      content: replyContent,
      thought,
      toolCalls,
      timestamp: Date.now(),
      tokensPerSec: 48,
      totalTokens: Math.floor(Math.random() * 80) + 60
    };
  };

  const handleSend = () => {
    if (!inputText.trim() || isTyping) return;

    triggerHaptic(20);
    const userMessage: HermesMessage = {
      id: `msg-user-${Date.now()}`,
      botId: bot?.id,
      botName: bot?.name,
      groupId: group?.id,
      serverId: server?.id,
      serverName: server?.name,
      sender: 'user',
      content: inputText.trim(),
      timestamp: Date.now()
    };

    const text = inputText.trim();
    setInputText('');
    setIsTyping(true);

    // Simulate async bot response
    setTimeout(() => {
      triggerHaptic([15, 25]);
      setIsTyping(false);

      if (isGroup && groupBots.length > 0) {
        // In group, 1 or 2 bots might respond or collaborate
        const firstBot = groupBots[0];
        const secondBot = groupBots.length > 1 && text.length > 25 ? groupBots[1] : null;

        const replies: HermesMessage[] = [
          generateBotReply(firstBot, text, `Grupo: ${group?.name}`)
        ];

        if (secondBot) {
          replies.push({
            id: `msg-${Date.now() + 100}-${secondBot.id}`,
            botId: secondBot.id,
            botName: secondBot.name,
            groupId: group?.id,
            serverId: secondBot.serverId,
            serverName: secondBot.serverName,
            sender: 'bot',
            content: `Complementando a resposta do ${firstBot.name}: como ${secondBot.role}, já alinei as prioridades para manter a sincronia da equipe.`,
            thought: `Entrada colaborativa no grupo ${group?.name}. Validando consistência com ${firstBot.name}.`,
            timestamp: Date.now() + 150
          });
        }

        onSendMessage(userMessage, replies);
      } else if (bot) {
        const reply = generateBotReply(bot, text);
        onSendMessage(userMessage, [reply]);
      }
    }, 650);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChipClick = (action: string) => {
    triggerHaptic(15);
    setInputText(action);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5.5rem)] bg-slate-950 rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-3 py-2.5 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md z-10">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={() => {
              triggerHaptic(10);
              onBack();
            }}
            className="p-1.5 -ml-1 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition active:scale-95"
            title="Voltar para a lista de bots"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {isGroup && group ? (
            <div 
              onClick={() => onEditGroup?.(group)}
              className="flex items-center gap-2 cursor-pointer p-1 -ml-1 rounded-xl hover:bg-slate-800/60 transition group"
              title="Clique para gerenciar, adicionar/remover bots, renomear ou apagar o grupo"
            >
              <div 
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0"
                style={{ backgroundColor: group?.color || '#06b6d4' }}
              >
                <Users className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition truncate">
                    {group.name}
                  </h2>
                  <Sliders className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 transition" />
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold">
                    {groupBots.length} bots
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">
                  {groupBots.map(b => b.name).join(', ')}
                </p>
              </div>
            </div>
          ) : bot ? (
            <div 
              onClick={() => onEditBot?.(bot)}
              className="flex items-center gap-2.5 min-w-0 cursor-pointer p-1 -ml-1 rounded-xl hover:bg-slate-800/60 transition group"
              title="Clique para editar este bot e alterar modelo LLM"
            >
              <div className="relative">
                <BotAvatar shape={bot.avatarShape} color={bot.avatarColor} size="md" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-900 animate-pulse" />
              </div>
              <div className="min-w-0 text-left">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-xs font-bold text-slate-100 group-hover:text-violet-300 transition truncate">
                    {bot.name}
                  </h2>
                  <Sliders className="w-3 h-3 text-slate-500 group-hover:text-violet-400 transition" />
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 truncate">
                  <span className="truncate">{bot.role}</span>
                  <span>•</span>
                  <span className="text-cyan-400 font-mono">{bot.serverName || bot.locationCategory}</span>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-1.5">
          {/* Group Manage Button */}
          {isGroup && group && onEditGroup && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic(15);
                onEditGroup(group);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-cyan-950/50 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/40 hover:border-cyan-400 transition text-[11px] font-medium shadow-sm active:scale-95"
              title="Gerenciar grupo: adicionar/remover bots, renomear ou apagar"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Gerenciar</span>
            </button>
          )}

          {/* Quick LLM Model & Reasoning Pill Button */}
          {!isGroup && bot && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic(15);
                onEditBot?.(bot);
              }}
              className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-violet-950/50 border border-violet-500/30 text-violet-300 hover:bg-violet-900/40 hover:border-violet-400 transition text-[11px] font-mono shadow-sm active:scale-95"
              title="Clique para trocar modelo ou nível de raciocínio deste bot"
            >
              <BrainCircuit className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
              <span className="truncate max-w-[100px] sm:max-w-[150px]">
                {(bot.modelOverride || 'Hermes-3-70B').split('/').pop()?.replace('-Instruct', '').replace('-FP8', '')}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-900/70 border border-violet-700/60 text-violet-200">
                {getReasoningConfig(bot.reasoningEffort).badge.split(' ')[0]}
              </span>
              <Sliders className="w-3 h-3 text-violet-400/70" />
            </button>
          )}

          {conversationMessages.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Deseja limpar as mensagens desta conversa?')) {
                  triggerHaptic(20);
                  if (targetId) onClearMessages(targetId);
                }
              }}
              className="p-1.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
              title="Limpar mensagens"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {!isGroup && server && (
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[10px] text-slate-400 font-mono">
              <Server className="w-3 h-3 text-cyan-400" />
              <span>{server.latencyMs ? `${server.latencyMs}ms` : 'ok'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5 bg-slate-950/60">
        {conversationMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            {isGroup ? (
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-3 shadow-lg"
                style={{ backgroundColor: group?.color || '#06b6d4' }}
              >
                <Users className="w-7 h-7" />
              </div>
            ) : bot ? (
              <div 
                onClick={() => onEditBot?.(bot)}
                className="mb-3 cursor-pointer group hover:scale-105 transition-transform"
                title="Editar este bot"
              >
                <BotAvatar shape={bot.avatarShape} color={bot.avatarColor} size="xl" />
              </div>
            ) : null}

            <h3 className="text-sm font-bold text-slate-200 mb-1">
              Conversar com {targetName}
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mb-3">
              {isGroup 
                ? group?.description || 'Envie uma ordem para que todos os bots do grupo colaborem na resposta.'
                : bot?.systemPrompt || `Assistente pronto para executar suas solicitações com o modelo Hermes.`}
            </p>

            {/* Model & Reasoning Card in empty chat */}
            {bot && (
              <div className="mb-4 p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3 text-left w-full max-w-sm">
                <div className="min-w-0">
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase font-semibold">
                    <BrainCircuit className="w-3 h-3 text-violet-400" />
                    <span>Configuração do Agente</span>
                  </div>
                  <p className="text-xs font-mono text-violet-300 font-bold truncate mt-0.5">
                    {(bot.modelOverride || 'NousResearch/Hermes-3-Llama-3.1-70B-FP8').split('/').pop()}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full border font-mono ${getReasoningConfig(bot.reasoningEffort).activeBgClass}`}>
                      {getReasoningConfig(bot.reasoningEffort).badge}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {getReasoningConfig(bot.reasoningEffort).shortLabel}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(15);
                    onEditBot?.(bot);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-violet-600/90 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-1 transition shadow-sm active:scale-95 flex-shrink-0"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Editar Bot</span>
                </button>
              </div>
            )}

            {/* Quick Starter Chips */}
            {bot?.quickActions && bot.quickActions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 justify-center max-w-md">
                {bot.quickActions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => handleChipClick(action)}
                    className="text-xs px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-300 transition active:scale-95"
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          conversationMessages.map((msg) => {
            const isUser = msg.sender === 'user';
            const msgBot = allBots.find(b => b.id === msg.botId) || bot;

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="flex-shrink-0 mt-0.5">
                    {msgBot ? (
                      <BotAvatar shape={msgBot.avatarShape} color={msgBot.avatarColor} size="sm" />
                    ) : (
                      <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[75%] space-y-1 ${isUser ? 'items-end' : 'items-start'}`}>
                  {/* Sender Name in Group Chat */}
                  {isGroup && !isUser && msg.botName && (
                    <div className="text-[10px] font-bold text-slate-400 px-1 flex items-center gap-1.5">
                      <span className="text-cyan-400">{msg.botName}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-500 font-normal font-mono">{msg.serverName || 'Hermes'}</span>
                    </div>
                  )}

                  {/* Reasoning Thought Chain (Hermes <thought>) */}
                  {msg.thought && (
                    <div className="rounded-xl border border-purple-500/30 bg-purple-950/20 text-purple-200 text-xs overflow-hidden">
                      <button
                        onClick={() => toggleThought(msg.id)}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 bg-purple-900/20 hover:bg-purple-900/30 transition text-[11px] font-semibold text-purple-300"
                      >
                        <div className="flex items-center gap-1.5">
                          <Brain className="w-3.5 h-3.5 text-purple-400" />
                          <span>Raciocínio Interno &laquo;thought&raquo;</span>
                        </div>
                        {expandedThoughts[msg.id] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                      {expandedThoughts[msg.id] && (
                        <div className="px-2.5 py-2 text-[11px] font-mono text-purple-300/90 whitespace-pre-wrap leading-relaxed border-t border-purple-500/20">
                          {msg.thought}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tool Calls */}
                  {msg.toolCalls && msg.toolCalls.map(tc => (
                    <div key={tc.id} className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-2 text-xs space-y-1 font-mono">
                      <div className="flex items-center justify-between text-amber-400 font-bold text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <Terminal className="w-3.5 h-3.5" />
                          <span>{tc.tool}()</span>
                        </div>
                        {tc.executionTimeMs && <span className="text-[10px] text-amber-500">{tc.executionTimeMs}ms</span>}
                      </div>
                      {tc.result && (
                        <div className="text-[11px] text-amber-200/90 bg-amber-950/40 p-1.5 rounded-lg">
                          {tc.result}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Main Bubble Content */}
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      isUser
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none shadow-md'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>

                  {/* Message Timestamp */}
                  <div className={`text-[9px] text-slate-500 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-2.5 items-center text-slate-400">
            {bot ? (
              <BotAvatar shape={bot.avatarShape} color={bot.avatarColor} size="sm" />
            ) : (
              <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-2 rounded-2xl text-xs text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1 text-[10px] text-slate-500 font-mono">Gerando resposta...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Chips row */}
      {bot?.quickActions && bot.quickActions.length > 0 && (
        <div className="px-3 py-1.5 bg-slate-900/60 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <Zap className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
          {bot.quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => handleChipClick(action)}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700/80 transition active:scale-95"
            >
              {action}
            </button>
          ))}
        </div>
      )}

      {/* Message Input Form */}
      <div className="p-2.5 bg-slate-900 border-t border-slate-800">
        <div className="flex items-end gap-2 bg-slate-950 border border-slate-800 rounded-2xl p-1.5 focus-within:border-cyan-500/80 transition">
          <textarea
            ref={inputRef}
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isGroup ? `Mensagem para o grupo ${group?.name}...` : `Conversar com ${bot?.name}...`}
            className="flex-1 max-h-24 bg-transparent border-0 px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none resize-none font-sans"
          />

          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isTyping}
            className={`p-2 rounded-xl transition ${
              inputText.trim() && !isTyping
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md active:scale-90 hover:brightness-110'
                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
