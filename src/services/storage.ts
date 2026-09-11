import { HermesServer, BotState, HermesMessage, HermesBot, BotGroup } from '../types/hermes';
import { mapTemperatureToReasoning } from '../constants/reasoning';

const SERVERS_KEY = 'hermes_servers_fleet_v2';
const BOTS_KEY = 'hermes_bots_list_v2';
const GROUPS_KEY = 'hermes_bot_groups_v2';
const BOT_STATE_KEY = 'hermes_bot_state_v1';
const MESSAGES_KEY = 'hermes_chat_messages_v2';
const SETTINGS_KEY = 'hermes_app_settings_v1';

export const DEFAULT_SERVERS: HermesServer[] = [
  {
    id: 'srv-hermes-vpc',
    name: 'Hermes-VPC',
    url: 'http://10.0.1.5:8000',
    authToken: 'hermes-sec-tok_vpc',
    modelName: 'NousResearch/Hermes-3-Llama-3.1-8B-Instruct',
    role: 'primary',
    status: 'online',
    latencyMs: 32,
    lastPing: Date.now() - 8000,
    gpuVramUsedGb: 14.8,
    gpuVramTotalGb: 24.0,
    cpuPercent: 28,
    ramUsedGb: 22.4,
    ramTotalGb: 64.0,
    activeAgentsCount: 2,
    version: 'hermes-agent-v2.8.4',
    enabled: true,
    locationCategory: 'HERMES-VPC',
    notes: 'Cluster privado VPC para orquestração mestre e triagem.'
  },
  {
    id: 'srv-oracle-cloud',
    name: 'Oracle Cloud',
    url: 'https://oracle-h3-vllm.ai-internal.net/v1',
    authToken: 'bearer_oci_h3_cluster_master',
    modelName: 'NousResearch/Hermes-3-Llama-3.1-70B-FP8',
    role: 'reasoning',
    status: 'online',
    latencyMs: 76,
    lastPing: Date.now() - 14000,
    gpuVramUsedGb: 58.2,
    gpuVramTotalGb: 80.0,
    cpuPercent: 54,
    ramUsedGb: 64.0,
    ramTotalGb: 128.0,
    activeAgentsCount: 8,
    version: 'vLLM-0.6.3+hermes',
    enabled: true,
    locationCategory: 'ORACLE CLOUD',
    notes: 'Cluster de alto rendimento na Oracle Cloud para operações e agentes de domínio.'
  },
  {
    id: 'srv-this-device',
    name: 'This Device (Windows Laptop)',
    url: 'http://127.0.0.1:11434',
    authToken: '',
    modelName: 'hermes3:8b-q4_K_M',
    role: 'code',
    status: 'online',
    latencyMs: 6,
    lastPing: Date.now() - 2000,
    gpuVramUsedGb: 6.4,
    gpuVramTotalGb: 8.0,
    cpuPercent: 18,
    ramUsedGb: 14.2,
    ramTotalGb: 32.0,
    activeAgentsCount: 1,
    version: 'ollama-0.3.14-hermes',
    enabled: true,
    locationCategory: 'THIS DEVICE',
    notes: 'Dispositivo local com terminal CLI, Bitwarden e automações locais.'
  }
];

export const DEFAULT_BOTS: HermesBot[] = [
  // HERMES-VPC (2 bots)
  {
    id: 'bot-hermes-vpc',
    name: 'Hermes-VPC',
    serverId: 'srv-hermes-vpc',
    serverName: 'Hermes-VPC',
    locationCategory: 'HERMES-VPC',
    avatarShape: 'ghost',
    avatarColor: '#8b5cf6', // purple
    role: 'Orquestrador Principal',
    status: 'online',
    lastActivity: 'Sincronizado com malha de inferência VPC',
    lastSeen: 'agora',
    modelOverride: 'NousResearch/Hermes-3-Llama-3.1-70B-FP8',
    reasoningEffort: 'high',
    temperature: 0.6,
    systemPrompt: 'Você é o orquestrador Hermes-VPC principal. Responda com raciocínio analítico, planejamento claro e ofereça chamadas de ferramentas especializadas.',
    quickActions: ['Status da Malha', 'Resumo dos Nós', 'Rebalancear Cargas', 'Limpar KV Cache']
  },
  {
    id: 'bot-secretaria',
    name: 'Secretaria',
    serverId: 'srv-hermes-vpc',
    serverName: 'Hermes-VPC',
    locationCategory: 'HERMES-VPC',
    avatarShape: 'ghost',
    avatarColor: '#3b82f6', // blue
    role: 'Atendimento & Triagem',
    status: 'idle',
    lastActivity: 'Aguardando novas mensagens e agendamentos',
    lastSeen: '12m',
    modelOverride: 'NousResearch/Hermes-3-Llama-3.1-8B-Instruct',
    reasoningEffort: 'low',
    temperature: 0.7,
    systemPrompt: 'Você é a Secretaria virtual, atenciosa, prestativa e focada em organização de agenda, triagem de recados e comunicação profissional.',
    quickActions: ['Agendar Reunião', 'Resumir Mensagens', 'Criar Lembrete', 'Redigir Comunicado']
  },

  // ORACLE CLOUD (8 bots)
  {
    id: 'bot-oracle-cloud',
    name: 'Oracle Cloud',
    serverId: 'srv-oracle-cloud',
    serverName: 'Oracle Cloud',
    locationCategory: 'ORACLE CLOUD',
    avatarShape: 'ghost',
    avatarColor: '#8b5cf6', // purple
    role: 'Controlador de Nós Cloud',
    status: 'online',
    lastActivity: 'Instâncias vLLM operando em 76ms de latência',
    lastSeen: '1h',
    modelOverride: 'NousResearch/Hermes-3-Llama-3.1-70B-FP8',
    reasoningEffort: 'medium',
    temperature: 0.5,
    systemPrompt: 'Você é o supervisor de instâncias e recursos na nuvem Oracle Cloud.',
    quickActions: ['Métricas de Cluster', 'Logs do vLLM', 'Verificar VRAM', 'Redimensionar Pool']
  },
  {
    id: 'bot-cmo',
    name: 'Cmo',
    serverId: 'srv-oracle-cloud',
    serverName: 'Oracle Cloud',
    locationCategory: 'ORACLE CLOUD',
    avatarShape: 'drop',
    avatarColor: '#ef4444', // red drop
    role: 'Chief Marketing Officer',
    status: 'idle',
    lastActivity: 'Planejamento de campanhas Q3 finalizado',
    lastSeen: '2h',
    modelOverride: 'NousResearch/Hermes-3-Llama-3.1-70B-FP8',
    reasoningEffort: 'high',
    temperature: 0.8,
    systemPrompt: 'Você é o CMO virtual focado em posicionamento estratégico, crescimento de audiência e inovação comercial.',
    quickActions: ['Estratégia de Lançamento', 'Análise de Concorrentes', 'Briefing de Marca', 'KPIs de Marketing']
  },
  {
    id: 'bot-finance',
    name: 'Finance',
    serverId: 'srv-oracle-cloud',
    serverName: 'Oracle Cloud',
    locationCategory: 'ORACLE CLOUD',
    avatarShape: 'drop',
    avatarColor: '#d946ef', // magenta drop
    role: 'Controladoria & Financeiro',
    status: 'idle',
    lastActivity: 'Conciliação bancária e projeção de custos de GPU',
    lastSeen: '3h',
    modelOverride: 'NousResearch/Hermes-3-Llama-3.1-70B-FP8',
    reasoningEffort: 'high',
    temperature: 0.3,
    systemPrompt: 'Você é o gestor financeiro analítico, responsável por fluxo de caixa, custos de computação e demonstrativos.',
    quickActions: ['Projeção de Custos', 'Auditoria de Faturas', 'ROI de Infraestrutura', 'Conciliação Contábil']
  },
  {
    id: 'bot-infra',
    name: 'Infra',
    serverId: 'srv-oracle-cloud',
    serverName: 'Oracle Cloud',
    locationCategory: 'ORACLE CLOUD',
    avatarShape: 'square',
    avatarColor: '#10b981', // teal/mint square
    role: 'Engenheiro de Infra & DevOps',
    status: 'online',
    lastActivity: 'Verificação de pods Kubernetes e pools vLLM ok',
    lastSeen: '45m',
    modelOverride: 'Qwen/Qwen2.5-Coder-32B-Instruct',
    reasoningEffort: 'extra_high',
    temperature: 0.2,
    systemPrompt: 'Você é o engenheiro de DevOps e infraestrutura, mestre em Docker, Kubernetes, Linux, redes e troubleshooting.',
    quickActions: ['docker ps', 'kubectl get pods', 'Verificar Uso de Disco', 'Reiniciar Serviço']
  },
  {
    id: 'bot-job-search',
    name: 'Job Search',
    serverId: 'srv-oracle-cloud',
    serverName: 'Oracle Cloud',
    locationCategory: 'ORACLE CLOUD',
    avatarShape: 'round',
    avatarColor: '#f43f5e', // red/pink circle
    role: 'Varredura de Vagas & Talentos',
    status: 'idle',
    lastActivity: 'Coletando oportunidades e perfis técnicos no LinkedIn',
    lastSeen: '3h',
    modelOverride: 'NousResearch/Hermes-3-Llama-3.1-8B-Instruct',
    reasoningEffort: 'medium',
    temperature: 0.7,
    systemPrompt: 'Você é o especialista em recrutamento e busca inteligente de vagas, triando requisitos e qualificações.',
    quickActions: ['Buscar Vagas Tech', 'Comparar Requisitos', 'Revisar Currículo', 'Carta de Apresentação']
  },
  {
    id: 'bot-legal',
    name: 'Legal',
    serverId: 'srv-oracle-cloud',
    serverName: 'Oracle Cloud',
    locationCategory: 'ORACLE CLOUD',
    avatarShape: 'cloud',
    avatarColor: '#db2777', // pink cloud
    role: 'Jurídico & Compliance',
    status: 'idle',
    lastActivity: 'Revisão de termos de serviço e conformidade LGPD',
    lastSeen: '5h',
    modelOverride: 'deepseek-ai/DeepSeek-R1-Distill-Llama-70B',
    reasoningEffort: 'extra_high',
    temperature: 0.4,
    systemPrompt: 'Você é o consultor jurídico corporativo, especialista em contratos de software, termos de uso e conformidade com LGPD/GDPR.',
    quickActions: ['Revisar Cláusula', 'Análise de Termos', 'Conformidade LGPD', 'Minuta de Contrato']
  },
  {
    id: 'bot-marketing',
    name: 'Marketing',
    serverId: 'srv-oracle-cloud',
    serverName: 'Oracle Cloud',
    locationCategory: 'ORACLE CLOUD',
    avatarShape: 'square',
    avatarColor: '#eab308', // yellow square
    role: 'Criação de Conteúdo & Copy',
    status: 'idle',
    lastActivity: 'Elaborando copies para lançamentos e newsletters',
    lastSeen: '2h',
    modelOverride: 'NousResearch/Hermes-3-Llama-3.1-70B-FP8',
    reasoningEffort: 'medium',
    temperature: 0.8,
    systemPrompt: 'Você é o redator publicitário e especialista em copywriting, criando textos magnéticos para conversão e engajamento.',
    quickActions: ['Criar Copy de Post', 'Rascunho de E-mail', 'Ganchos de Vídeo', 'Testes A/B de Títulos']
  },
  {
    id: 'bot-social',
    name: 'Social',
    serverId: 'srv-oracle-cloud',
    serverName: 'Oracle Cloud',
    locationCategory: 'ORACLE CLOUD',
    avatarShape: 'triangle',
    avatarColor: '#f97316', // orange triangle
    role: 'Gestão de Redes Sociais',
    status: 'idle',
    lastActivity: 'Agendamento de threads e monitoramento de menções',
    lastSeen: '1h',
    modelOverride: 'NousResearch/Hermes-3-Llama-3.1-8B-Instruct',
    reasoningEffort: 'instant',
    temperature: 0.85,
    systemPrompt: 'Você é o estrategista de mídias sociais, especialista em tendências, calendário editorial e comunidade.',
    quickActions: ['Programar Calendário', 'Análise de Tendências', 'Rascunho de Thread', 'Monitoramento de Menções']
  },

  // THIS DEVICE (1 bot)
  {
    id: 'bot-windows-laptop',
    name: 'Windows Laptop',
    serverId: 'srv-this-device',
    serverName: 'This Device',
    locationCategory: 'THIS DEVICE',
    avatarShape: 'square',
    avatarColor: '#ec4899', // pink square with eyes
    role: 'Agente Local no Computador',
    status: 'online',
    lastActivity: 'Concluído — Bitwarden CLI instalado | Item ...',
    lastSeen: '4h',
    modelOverride: 'hermes3:8b-q4_K_M',
    reasoningEffort: 'low',
    temperature: 0.4,
    systemPrompt: 'Você é o agente local no Windows Laptop com acesso direto ao terminal, CLI, arquivos e utilitários como Bitwarden.',
    quickActions: ['bw list items', 'Terminal PowerShell', 'Status da Bateria', 'Ver Arquivos Recentes']
  }
];

export const DEFAULT_GROUPS: BotGroup[] = [
  {
    id: 'grp-executive',
    name: 'Diretoria & C-Level',
    description: 'CMO, Financeiro e Jurídico para decisões executivas e planejamento integrado',
    color: '#a855f7',
    avatarShape: 'cloud',
    botIds: ['bot-cmo', 'bot-finance', 'bot-legal'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    lastActivity: 'Debate estratégico de alocação de recursos',
    lastSeen: '1d'
  },
  {
    id: 'grp-devops-infra',
    name: 'DevOps & Cloud Clusters',
    description: 'Infraestrutura, Nós Cloud e Agente Local do Laptop para automação de ambiente',
    color: '#06b6d4',
    avatarShape: 'square',
    botIds: ['bot-infra', 'bot-oracle-cloud', 'bot-hermes-vpc', 'bot-windows-laptop'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
    lastActivity: 'Automação de rotinas de backup e monitoramento',
    lastSeen: '4h'
  },
  {
    id: 'grp-growth-comms',
    name: 'Growth & Comunicação',
    description: 'Marketing, Redes Sociais e Secretaria para campanhas e atendimento sincronizado',
    color: '#eab308',
    avatarShape: 'triangle',
    botIds: ['bot-marketing', 'bot-social', 'bot-secretaria', 'bot-job-search'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    lastActivity: 'Alinhamento do tom de voz e postagens programadas',
    lastSeen: '2h'
  }
];

export const DEFAULT_BOT_STATE: BotState = {
  isRunning: true,
  mode: 'autonomous',
  autoHeal: true,
  logLevel: 'info',
  concurrencyLimit: 8,
  currentTask: 'Orquestrando nós Hermes e respondendo em tempo real'
};

export const DEFAULT_MESSAGES: HermesMessage[] = [
  {
    id: 'msg-init-1',
    botId: 'bot-secretaria',
    botName: 'Secretaria',
    serverId: 'srv-hermes-vpc',
    serverName: 'Hermes-VPC',
    sender: 'bot',
    content: 'Olá! Sou a Secretaria do cluster Hermes. Como posso ajudar com sua agenda, triagem ou despacho de mensagens hoje?',
    thought: 'Inicializando canal de atendimento. Nó Hermes-VPC respondendo com latência de 32ms.',
    timestamp: Date.now() - 1000 * 60 * 12
  },
  {
    id: 'msg-init-2',
    botId: 'bot-windows-laptop',
    botName: 'Windows Laptop',
    serverId: 'srv-this-device',
    serverName: 'This Device',
    sender: 'bot',
    content: 'Concluído — Bitwarden CLI instalado com sucesso e credenciais locais sincronizadas no Windows Laptop.',
    thought: 'Executado via comando CLI silencioso. 0 erros reportados.',
    timestamp: Date.now() - 1000 * 60 * 60 * 4
  }
];

export function getStoredBots(): HermesBot[] {
  try {
    const raw = localStorage.getItem(BOTS_KEY);
    if (!raw) {
      saveBots(DEFAULT_BOTS);
      return DEFAULT_BOTS;
    }
    const parsed: HermesBot[] = JSON.parse(raw);
    return parsed.map(b => {
      const defaultMatch = DEFAULT_BOTS.find(d => d.id === b.id);
      return {
        ...b,
        modelOverride: b.modelOverride || defaultMatch?.modelOverride || 'NousResearch/Hermes-3-Llama-3.1-70B-FP8',
        reasoningEffort: b.reasoningEffort || defaultMatch?.reasoningEffort || mapTemperatureToReasoning(b.temperature),
        temperature: b.temperature !== undefined ? b.temperature : (defaultMatch?.temperature ?? 0.7)
      };
    });
  } catch (err) {
    console.error('Error loading bots from storage:', err);
    return DEFAULT_BOTS;
  }
}

export function saveBots(bots: HermesBot[]): void {
  try {
    localStorage.setItem(BOTS_KEY, JSON.stringify(bots));
  } catch (err) {
    console.error('Error saving bots to storage:', err);
  }
}

export function getStoredGroups(): BotGroup[] {
  try {
    const raw = localStorage.getItem(GROUPS_KEY);
    if (!raw) {
      saveGroups(DEFAULT_GROUPS);
      return DEFAULT_GROUPS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading bot groups from storage:', err);
    return DEFAULT_GROUPS;
  }
}

export function saveGroups(groups: BotGroup[]): void {
  try {
    localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
  } catch (err) {
    console.error('Error saving bot groups to storage:', err);
  }
}

export function getStoredServers(): HermesServer[] {
  try {
    const raw = localStorage.getItem(SERVERS_KEY);
    if (!raw) {
      saveServers(DEFAULT_SERVERS);
      return DEFAULT_SERVERS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading servers from storage:', err);
    return DEFAULT_SERVERS;
  }
}

export function saveServers(servers: HermesServer[]): void {
  try {
    localStorage.setItem(SERVERS_KEY, JSON.stringify(servers));
  } catch (err) {
    console.error('Error saving servers to storage:', err);
  }
}

export function getStoredBotState(): BotState {
  try {
    const raw = localStorage.getItem(BOT_STATE_KEY);
    if (!raw) {
      saveBotState(DEFAULT_BOT_STATE);
      return DEFAULT_BOT_STATE;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading bot state:', err);
    return DEFAULT_BOT_STATE;
  }
}

export function saveBotState(state: BotState): void {
  try {
    localStorage.setItem(BOT_STATE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Error saving bot state:', err);
  }
}

export function getStoredMessages(): HermesMessage[] {
  try {
    const raw = localStorage.getItem(MESSAGES_KEY);
    if (!raw) {
      saveMessages(DEFAULT_MESSAGES);
      return DEFAULT_MESSAGES;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading messages:', err);
    return DEFAULT_MESSAGES;
  }
}

export function saveMessages(messages: HermesMessage[]): void {
  try {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
  } catch (err) {
    console.error('Error saving messages:', err);
  }
}

export interface AppSettings {
  vibrationFeedback: boolean;
  autoRefreshSeconds: number;
  connectionMode: 'hybrid' | 'direct' | 'simulated';
  theme: 'dark' | 'midnight';
  muted: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  vibrationFeedback: true,
  autoRefreshSeconds: 15,
  connectionMode: 'hybrid',
  theme: 'dark',
  muted: false
};

export function getStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      saveSettings(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (err) {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Error saving settings:', err);
  }
}
