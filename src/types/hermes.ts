export type ServerStatus = 'online' | 'offline' | 'connecting' | 'error' | 'maintenance';

export type BotRunMode = 'autonomous' | 'interactive' | 'tools_only' | 'standby';

export type BotAvatarShape = 'ghost' | 'drop' | 'square' | 'round' | 'cloud' | 'triangle';

export type ReasoningEffort = 'instant' | 'low' | 'medium' | 'high' | 'extra_high' | 'max';

export interface HermesBot {
  id: string;
  name: string;
  serverId: string; // server node it is hosted on
  serverName?: string;
  locationCategory: 'HERMES-VPC' | 'ORACLE CLOUD' | 'THIS DEVICE' | string;
  avatarShape: BotAvatarShape;
  avatarColor: string; // hex color
  role: string; // e.g. 'Secretaria', 'CMO', 'Financeiro', 'Infraestrutura'
  status: 'online' | 'busy' | 'idle' | 'offline';
  lastActivity?: string; // e.g. "Concluído — Bitwarden CLI instalado | Item ..."
  lastSeen?: string; // e.g. "4h", "12m", "agora"
  systemPrompt?: string;
  quickActions?: string[];
  modelOverride?: string;
  reasoningEffort?: ReasoningEffort; // 'instant' | 'low' | 'medium' | 'high' | 'extra_high' | 'max'
  temperature?: number; // legacy optional fallback
  maxTokens?: number;
}

export interface BotGroup {
  id: string;
  name: string;
  description: string;
  color: string;
  avatarShape?: BotAvatarShape;
  botIds: string[];
  createdAt: number;
  lastActivity?: string;
  lastSeen?: string;
}

export interface HermesServer {
  id: string;
  name: string;
  url: string; // e.g., http://192.168.1.100:8000 or https://agent-1.myvpn.net
  authToken?: string;
  modelName: string; // e.g., NousResearch/Hermes-3-Llama-3.1-8B
  role: 'primary' | 'worker' | 'reasoning' | 'scraper' | 'code';
  status: ServerStatus;
  latencyMs: number | null;
  lastPing: number | null;
  gpuVramUsedGb?: number;
  gpuVramTotalGb?: number;
  cpuPercent?: number;
  ramUsedGb?: number;
  ramTotalGb?: number;
  activeAgentsCount: number;
  version: string;
  enabled: boolean;
  notes?: string;
  locationCategory?: 'HERMES-VPC' | 'ORACLE CLOUD' | 'THIS DEVICE' | string;
}

export interface AgentToolCall {
  id: string;
  tool: string; // e.g., 'web_search', 'python_exec', 'bash_exec', 'vector_rag', 'fs_read'
  arguments: Record<string, unknown> | string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: string;
  executionTimeMs?: number;
}

export interface HermesMessage {
  id: string;
  botId?: string;
  botName?: string;
  groupId?: string;
  serverId?: string;
  serverName?: string;
  sender: 'user' | 'bot' | 'system';
  content: string;
  thought?: string; // Hermes <thought> or internal reasoning chain
  toolCalls?: AgentToolCall[];
  timestamp: number;
  tokensPerSec?: number;
  totalTokens?: number;
}

export interface BotState {
  isRunning: boolean;
  mode: BotRunMode;
  autoHeal: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  concurrencyLimit: number;
  currentTask?: string;
}

export interface ServerBroadcastResult {
  serverId: string;
  serverName: string;
  status: 'success' | 'error' | 'pending';
  response?: string;
  latencyMs?: number;
  error?: string;
}
