import React, { useState } from 'react';
import { 
  Download, 
  Smartphone, 
  Wifi, 
  FileDown, 
  FileUp, 
  RefreshCw, 
  Vibrate, 
  ShieldCheck, 
  HelpCircle, 
  ExternalLink,
  Check,
  AlertCircle,
  Terminal,
  Server
} from 'lucide-react';
import { HermesServer } from '../types/hermes';
import { AppSettings } from '../services/storage';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { triggerHaptic } from '../services/hermesClient';

interface SettingsViewProps {
  settings: AppSettings;
  servers: HermesServer[];
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onImportServers: (servers: HermesServer[]) => void;
  onResetDefaults: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  servers,
  onUpdateSettings,
  onImportServers,
  onResetDefaults,
}) => {
  const { isInstallable, isInstalled, isAndroid, install } = usePWAInstall();
  const [copiedMsg, setCopiedMsg] = useState<string | null>(null);

  const handleExport = () => {
    triggerHaptic(15);
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(servers, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `hermes_fleet_servers_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setCopiedMsg('Backup baixado com sucesso!');
    setTimeout(() => setCopiedMsg(null), 3000);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    triggerHaptic(20);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0) {
          onImportServers(parsed);
          setCopiedMsg(`${parsed.length} servidores importados com sucesso!`);
        } else {
          alert('Arquivo JSON inválido. Deve ser uma lista de servidores Hermes.');
        }
      } catch (err) {
        alert('Erro ao ler arquivo JSON de backup.');
      }
    };
    reader.readAsText(file);
    setTimeout(() => setCopiedMsg(null), 3000);
  };

  return (
    <div className="space-y-4 pb-28 pt-2">
      {copiedMsg && (
        <div className="fixed top-16 left-4 right-4 z-50 bg-cyan-600 text-white text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center justify-between animate-in fade-in">
          <span>{copiedMsg}</span>
          <Check className="w-4 h-4" />
        </div>
      )}

      {/* Android PWA Install Card */}
      <div className="rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Instalação no Android (PWA)</h3>
            <p className="text-xs text-slate-400">
              {isInstalled 
                ? 'Hermes Bot Controller está instalado como app nativo.' 
                : 'Instale na tela inicial para execução em tela cheia e acesso rápido.'}
            </p>
          </div>
        </div>

        {!isInstalled && (
          <div className="mt-3 pt-3 border-t border-slate-800/80">
            {isInstallable ? (
              <button
                onClick={() => {
                  triggerHaptic([20, 30]);
                  install();
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Instalar Hermes Bot no Android</span>
              </button>
            ) : (
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1.5">
                <span className="font-semibold text-cyan-300 block">Como instalar no Chrome Android:</span>
                <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px] leading-relaxed">
                  <li>Toque no menu de 3 pontinhos (⋮) no canto superior direito do Chrome.</li>
                  <li>Selecione <strong className="text-slate-200">"Adicionar à tela inicial"</strong> ou <strong className="text-slate-200">"Instalar aplicativo"</strong>.</li>
                  <li>O ícone do Hermes Bot aparecerá no seu launcher como aplicativo independente!</li>
                </ol>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Connectivity & Android Networking Guide */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Wifi className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Guia de Conexão Android & Servidores Hermes
          </h3>
        </div>

        <div className="space-y-2.5 text-xs text-slate-300">
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
            <span className="font-bold text-cyan-300 block mb-0.5">1. Wi-Fi Local (LAN):</span>
            <p className="text-slate-400 text-[11px]">
              Se o seu servidor Hermes está no mesmo Wi-Fi do celular, use o IP local do computador (ex: <code className="text-cyan-400 font-mono">http://192.168.1.100:8000</code>).
            </p>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
            <span className="font-bold text-emerald-300 block mb-0.5">2. Conexão Remota 4G/5G com Tailscale:</span>
            <p className="text-slate-400 text-[11px]">
              Instale o app gratuito do <strong>Tailscale</strong> no seu Android e no servidor. Você poderá controlar seus agentes de qualquer lugar usando o IP privado 100.x.y.z sem precisar abrir portas no roteador.
            </p>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
            <span className="font-bold text-amber-300 block mb-0.5">3. Configuração de CORS no Servidor Hermes:</span>
            <p className="text-slate-400 text-[11px]">
              Para permitir chamadas diretas do navegador, inicie seu servidor vLLM ou FastChat com:
              <br />
              <code className="text-amber-300 font-mono bg-slate-900 px-1 py-0.5 rounded text-[10px] mt-1 inline-block">
                --host 0.0.0.0 --port 8000 --cors-allow-origins '*'
              </code>
            </p>
          </div>
        </div>
      </div>

      {/* App Preferences */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
          Preferências do Aplicativo
        </h3>

        <div className="space-y-3">
          {/* Vibration / Haptic */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Vibrate className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Feedback Tátil no Android</span>
                <span className="text-[10px] text-slate-400">Vibração suave ao tocar em comandos e botões</span>
              </div>
            </div>
            <button
              onClick={() => {
                triggerHaptic(20);
                onUpdateSettings({ vibrationFeedback: !settings.vibrationFeedback });
              }}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                settings.vibrationFeedback ? 'bg-cyan-500' : 'bg-slate-800'
              }`}
            >
              <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                settings.vibrationFeedback ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {/* Auto refresh rate */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <div>
              <span className="text-xs font-semibold text-slate-200 block">Atualização Automática</span>
              <span className="text-[10px] text-slate-400">Intervalo de verificação de heartbeat dos servidores</span>
            </div>
            <select
              value={settings.autoRefreshSeconds}
              onChange={(e) => {
                triggerHaptic(10);
                onUpdateSettings({ autoRefreshSeconds: Number(e.target.value) });
              }}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value={5}>5 seg</option>
              <option value={15}>15 seg</option>
              <option value={30}>30 seg</option>
              <option value={0}>Manual</option>
            </select>
          </div>
        </div>
      </div>

      {/* Backup & Restore */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
          Backup e Sincronização da Malha
        </h3>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 font-semibold active:scale-95 transition"
          >
            <FileDown className="w-4 h-4 text-cyan-400" />
            <span>Exportar JSON</span>
          </button>

          <label className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 font-semibold active:scale-95 transition cursor-pointer">
            <FileUp className="w-4 h-4 text-blue-400" />
            <span>Importar JSON</span>
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>

        <button
          onClick={() => {
            triggerHaptic(30);
            if (confirm('Restaurar lista padrão de servidores de demonstração?')) {
              onResetDefaults();
            }
          }}
          className="w-full mt-2.5 text-center text-xs text-slate-500 hover:text-slate-300 py-1.5 transition"
        >
          Restaurar nós padrão de teste
        </button>
      </div>

      {/* Version info */}
      <div className="text-center text-[10px] text-slate-600 font-mono pt-2">
        Hermes Bot Android Controller • v1.0.0 PWA • Powered by Nous Hermes Agent
      </div>
    </div>
  );
};
