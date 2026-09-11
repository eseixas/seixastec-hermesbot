export interface LLMModelOption {
  id: string;
  name: string;
  provider: 'NousResearch' | 'DeepSeek' | 'Qwen' | 'Meta' | 'Ollama' | 'Custom';
  size: string;
  tag: string;
  description: string;
  recommendedRole?: string;
  supportsTools: boolean;
  supportsReasoning: boolean;
}

export const POPULAR_LLM_MODELS: LLMModelOption[] = [
  {
    id: 'NousResearch/Hermes-3-Llama-3.1-70B-FP8',
    name: 'Hermes 3 (70B FP8)',
    provider: 'NousResearch',
    size: '70B',
    tag: 'Raciocínio & Agentes',
    description: 'Modelo de raciocínio profundo treinado pela Nous Research para planejamento multi-etapas e agentes autônomos.',
    recommendedRole: 'Diretoria, CMO, Financeiro, Legal',
    supportsTools: true,
    supportsReasoning: true
  },
  {
    id: 'NousResearch/Hermes-3-Llama-3.1-8B-Instruct',
    name: 'Hermes 3 (8B Instruct)',
    provider: 'NousResearch',
    size: '8B',
    tag: 'Ultra Rápido',
    description: 'Versão ágil e de baixa latência para atendimento em tempo real, triagem de mensagens e tarefas rápidas.',
    recommendedRole: 'Secretaria, Social, Recrutamento',
    supportsTools: true,
    supportsReasoning: true
  },
  {
    id: 'NousResearch/Hermes-3-Llama-3.1-405B-FP8',
    name: 'Hermes 3 (405B Flagship)',
    provider: 'NousResearch',
    size: '405B',
    tag: 'Máxima Capacidade',
    description: 'O maior e mais potente modelo Hermes de pesos abertos. Capacidade extrema de síntese, estratégia e código.',
    recommendedRole: 'Orquestrador Mestre, Arquitetura',
    supportsTools: true,
    supportsReasoning: true
  },
  {
    id: 'NousResearch/Hermes-2-Pro-Llama-3-8B',
    name: 'Hermes 2 Pro (8B)',
    provider: 'NousResearch',
    size: '8B',
    tag: 'Function Calling Especializado',
    description: 'Otimizado especificamente para chamada de ferramentas (JSON structured outputs) e automação de APIs.',
    recommendedRole: 'Automação, Integrações API',
    supportsTools: true,
    supportsReasoning: false
  },
  {
    id: 'Qwen/Qwen2.5-Coder-32B-Instruct',
    name: 'Qwen 2.5 Coder (32B)',
    provider: 'Qwen',
    size: '32B',
    tag: 'Especialista em Código & DevOps',
    description: 'Líder em geração de scripts, comandos bash, depuração de containers Docker e sintaxe de infraestrutura.',
    recommendedRole: 'Infraestrutura, DevOps, Scripts',
    supportsTools: true,
    supportsReasoning: false
  },
  {
    id: 'deepseek-ai/DeepSeek-R1-Distill-Llama-70B',
    name: 'DeepSeek R1 (70B Distill)',
    provider: 'DeepSeek',
    size: '70B',
    tag: 'Deep Reasoning CoT',
    description: 'Modelo treinado com reforço de raciocínio passo a passo, ideal para análises lógicas, jurídicas e contratuais.',
    recommendedRole: 'Jurídico, Compliance, Auditoria',
    supportsTools: true,
    supportsReasoning: true
  },
  {
    id: 'meta-llama/Llama-3.3-70B-Instruct',
    name: 'Llama 3.3 (70B Instruct)',
    provider: 'Meta',
    size: '70B',
    tag: 'Propósito Geral',
    description: 'Base robusta com amplo conhecimento de mundo e fluência multilíngue impecável.',
    recommendedRole: 'Copywriting, Produção de Conteúdo',
    supportsTools: true,
    supportsReasoning: false
  },
  {
    id: 'hermes3:8b-q4_K_M',
    name: 'Hermes 3 Local (8B Q4 Ollama)',
    provider: 'Ollama',
    size: '8B Q4',
    tag: 'Local & Offline',
    description: 'Instalado localmente via Ollama no dispositivo. Funciona offline sem custos de nuvem.',
    recommendedRole: 'Dispositivo Local, Terminal CLI',
    supportsTools: true,
    supportsReasoning: true
  }
];
