import { ReasoningEffort } from '../types/hermes';

export interface ReasoningLevelConfig {
  id: ReasoningEffort;
  label: string;
  shortLabel: string;
  subtitle: string;
  description: string;
  badge: string;
  latencyHint: string;
  colorClass: string;
  activeBgClass: string;
  borderClass: string;
  equivalentTemp: number;
}

export const REASONING_LEVELS: ReasoningLevelConfig[] = [
  {
    id: 'instant',
    label: 'Instantâneo',
    shortLabel: 'Instant',
    subtitle: 'Sem CoT estendido',
    description: 'Resposta direta sem deliberação prévia. Mínima latência, ideal para comandos simples e triagem.',
    badge: '⚡ Instantâneo',
    latencyHint: '< 250ms',
    colorClass: 'text-amber-400',
    activeBgClass: 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-amber-950/40',
    borderClass: 'border-amber-500/30',
    equivalentTemp: 0.1
  },
  {
    id: 'low',
    label: 'Baixo',
    shortLabel: 'Baixo',
    subtitle: 'Raciocínio conciso',
    description: 'Breve verificação interna antes de responder. Excelente para rotinas, confirmações e tarefas comuns.',
    badge: '🔹 Baixo',
    latencyHint: '~600ms',
    colorClass: 'text-blue-400',
    activeBgClass: 'bg-blue-500/15 border-blue-500/40 text-blue-300 shadow-blue-950/40',
    borderClass: 'border-blue-500/30',
    equivalentTemp: 0.3
  },
  {
    id: 'medium',
    label: 'Médio',
    shortLabel: 'Médio',
    subtitle: 'Equilíbrio ideal',
    description: 'Reflexão balanceada passo-a-passo. Recomendado para a maioria das conversas, análises e resumos.',
    badge: '⚖️ Médio',
    latencyHint: '~1.2s',
    colorClass: 'text-cyan-400',
    activeBgClass: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-cyan-950/40',
    borderClass: 'border-cyan-500/30',
    equivalentTemp: 0.6
  },
  {
    id: 'high',
    label: 'Alto',
    shortLabel: 'Alto',
    subtitle: 'Raciocínio avançado',
    description: 'Planejamento e cadeia de pensamento detalhados. Ideal para estratégias, redação técnica e tomada de decisão.',
    badge: '🧠 Alto',
    latencyHint: '~2.8s',
    colorClass: 'text-violet-400',
    activeBgClass: 'bg-violet-500/15 border-violet-500/40 text-violet-300 shadow-violet-950/40',
    borderClass: 'border-violet-500/30',
    equivalentTemp: 0.8
  },
  {
    id: 'extra_high',
    label: 'Extra Alto',
    shortLabel: 'Extra Alto',
    subtitle: 'Raciocínio exaustivo',
    description: 'Grande capacidade de deliberação lógica, auto-correção e decomposição de código e arquitetura.',
    badge: '🔬 Extra Alto',
    latencyHint: '~5.0s',
    colorClass: 'text-fuchsia-400',
    activeBgClass: 'bg-fuchsia-500/15 border-fuchsia-500/40 text-fuchsia-300 shadow-fuchsia-950/40',
    borderClass: 'border-fuchsia-500/30',
    equivalentTemp: 0.95
  },
  {
    id: 'max',
    label: 'Máximo',
    shortLabel: 'Max',
    subtitle: 'Raciocínio máximo',
    description: 'Máxima capacidade deliberativa contínua, verificação formal e encadeamento lógico irrestrito.',
    badge: '🚀 Max',
    latencyHint: '~7.5s',
    colorClass: 'text-rose-400',
    activeBgClass: 'bg-rose-500/15 border-rose-500/40 text-rose-300 shadow-rose-950/40',
    borderClass: 'border-rose-500/30',
    equivalentTemp: 1.0
  }
];

export function getReasoningConfig(effort?: ReasoningEffort): ReasoningLevelConfig {
  if (!effort) return REASONING_LEVELS[2]; // Default: 'medium'
  const found = REASONING_LEVELS.find(r => r.id === effort);
  return found || REASONING_LEVELS[2];
}

/**
 * Maps legacy temperature values (0.0 to 1.2) to closest reasoning effort
 */
export function mapTemperatureToReasoning(temp?: number): ReasoningEffort {
  if (temp === undefined) return 'medium';
  if (temp < 0.2) return 'instant';
  if (temp < 0.45) return 'low';
  if (temp < 0.7) return 'medium';
  if (temp < 0.85) return 'high';
  if (temp < 1.05) return 'extra_high';
  return 'max';
}
