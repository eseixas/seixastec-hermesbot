import React, { useState, useEffect, useCallback } from 'react';
import { 
  getStoredServers, 
  saveServers, 
  getStoredBots,
  saveBots,
  getStoredGroups,
  saveGroups,
  getStoredBotState, 
  saveBotState, 
  getStoredMessages, 
  saveMessages,
  getStoredSettings,
  saveSettings,
  DEFAULT_SERVERS,
  DEFAULT_BOTS,
  DEFAULT_GROUPS,
  AppSettings
} from './services/storage';
import { HermesServer, BotState, HermesMessage, HermesBot, BotGroup } from './types/hermes';
import { pingServer, triggerHaptic } from './services/hermesClient';
import { AndroidHeader } from './components/AndroidHeader';
import { BottomNav, NavTab } from './components/BottomNav';
import { BotsListView } from './components/BotsListView';
import { BotChatView } from './components/BotChatView';
import { ServersView } from './components/ServersView';
import { SettingsView } from './components/SettingsView';
import { QuickServerModal } from './components/QuickServerModal';
import { BroadcastModal } from './components/BroadcastModal';
import { CreateGroupModal } from './components/CreateGroupModal';
import { EditGroupModal } from './components/EditGroupModal';
import { CreateBotModal } from './components/CreateBotModal';
import { EditBotModal } from './components/EditBotModal';
import { OfflineIndicator } from './components/OfflineIndicator';

export default function App() {
  const [servers, setServers] = useState<HermesServer[]>(getStoredServers);
  const [bots, setBots] = useState<HermesBot[]>(getStoredBots);
  const [groups, setGroups] = useState<BotGroup[]>(getStoredGroups);

  const [activeServerId, setActiveServerId] = useState<string | null>(() => {
    const stored = getStoredServers();
    const primary = stored.find(s => s.role === 'primary') || stored[0];
    return primary ? primary.id : null;
  });

  const [activeChatBot, setActiveChatBot] = useState<HermesBot | null>(null);
  const [activeChatGroup, setActiveChatGroup] = useState<BotGroup | null>(null);

  const [editingBot, setEditingBot] = useState<HermesBot | null>(null);
  const [isEditBotOpen, setIsEditBotOpen] = useState(false);

  const [editingGroup, setEditingGroup] = useState<BotGroup | null>(null);
  const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);

  const [botState, setBotState] = useState<BotState>(getStoredBotState);
  const [messages, setMessages] = useState<HermesMessage[]>(getStoredMessages);
  const [settings, setSettings] = useState<AppSettings>(getStoredSettings);
  const [currentTab, setCurrentTab] = useState<NavTab>('bots');

  const [isQuickSwitchOpen, setIsQuickSwitchOpen] = useState(false);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isCreateBotOpen, setIsCreateBotOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync to storage
  useEffect(() => {
    saveServers(servers);
  }, [servers]);

  useEffect(() => {
    saveBots(bots);
  }, [bots]);

  useEffect(() => {
    saveGroups(groups);
  }, [groups]);

  useEffect(() => {
    saveBotState(botState);
  }, [botState]);

  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const activeServer = servers.find(s => s.id === activeServerId) || servers[0] || null;

  // Refresh all servers connection status & latency
  const refreshAllServers = useCallback(async () => {
    setIsRefreshing(true);

    const pingPromises = servers.map(async (server) => {
      try {
        const res = await pingServer(server);
        return {
          ...server,
          status: res.status,
          latencyMs: res.latencyMs,
          lastPing: Date.now()
        };
      } catch {
        return {
          ...server,
          status: 'offline' as const,
          latencyMs: null
        };
      }
    });

    const updated = await Promise.all(pingPromises);
    setServers(updated);
    setIsRefreshing(false);
  }, [servers]);

  // Periodic auto-refresh
  useEffect(() => {
    if (settings.autoRefreshSeconds <= 0) return;

    const interval = setInterval(() => {
      refreshAllServers();
    }, settings.autoRefreshSeconds * 1000);

    return () => clearInterval(interval);
  }, [settings.autoRefreshSeconds, refreshAllServers]);

  // Bot & Server state handlers
  const handleToggleBot = () => {
    setBotState(prev => ({ ...prev, isRunning: !prev.isRunning }));
  };

  const handleSelectServer = (server: HermesServer) => {
    setActiveServerId(server.id);
  };

  const handleAddServer = (server: HermesServer) => {
    setServers(prev => [...prev, server]);
    if (!activeServerId) {
      setActiveServerId(server.id);
    }
  };

  const handleUpdateServer = (updatedServer: HermesServer) => {
    setServers(prev => prev.map(s => s.id === updatedServer.id ? updatedServer : s));
  };

  const handleDeleteServer = (serverId: string) => {
    setServers(prev => prev.filter(s => s.id !== serverId));
    if (activeServerId === serverId) {
      const remaining = servers.filter(s => s.id !== serverId);
      setActiveServerId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  // Group creation & Bot creation handlers
  const handleCreateGroup = (newGroup: BotGroup) => {
    setGroups(prev => [newGroup, ...prev]);
    setActiveChatGroup(newGroup);
    setActiveChatBot(null);
    setCurrentTab('bots');
  };

  const handleCreateBot = (newBot: HermesBot) => {
    setBots(prev => [newBot, ...prev]);
    setActiveChatBot(newBot);
    setActiveChatGroup(null);
    setCurrentTab('bots');
  };

  const handleOpenEditBot = (bot: HermesBot) => {
    setEditingBot(bot);
    setIsEditBotOpen(true);
  };

  const handleSaveBot = (updatedBot: HermesBot) => {
    setBots(prev => prev.map(b => b.id === updatedBot.id ? updatedBot : b));
    if (activeChatBot?.id === updatedBot.id) {
      setActiveChatBot(updatedBot);
    }
    setEditingBot(null);
    setIsEditBotOpen(false);
  };

  const handleDeleteBot = (botId: string) => {
    setBots(prev => prev.filter(b => b.id !== botId));
    setGroups(prev => prev.map(g => ({
      ...g,
      botIds: g.botIds.filter(id => id !== botId)
    })));
    if (activeChatBot?.id === botId) {
      setActiveChatBot(null);
    }
    setEditingBot(null);
    setIsEditBotOpen(false);
  };

  const handleOpenEditGroup = (group: BotGroup) => {
    setEditingGroup(group);
    setIsEditGroupOpen(true);
  };

  const handleSaveGroup = (updatedGroup: BotGroup) => {
    setGroups(prev => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g));
    if (activeChatGroup?.id === updatedGroup.id) {
      setActiveChatGroup(updatedGroup);
    }
    setEditingGroup(null);
    setIsEditGroupOpen(false);
  };

  const handleDeleteGroup = (groupId: string) => {
    setGroups(prev => prev.filter(g => g.id !== groupId));
    if (activeChatGroup?.id === groupId) {
      setActiveChatGroup(null);
    }
    setEditingGroup(null);
    setIsEditGroupOpen(false);
  };

  // Chat message handlers
  const handleChatSendMessage = (userMsg: HermesMessage, botMsgs: HermesMessage[]) => {
    setMessages(prev => [...prev, userMsg, ...botMsgs]);
    
    // Update last activity on the bot or group
    if (activeChatBot) {
      setBots(prev => prev.map(b => 
        b.id === activeChatBot.id 
          ? { ...b, lastActivity: userMsg.content.slice(0, 48), lastSeen: 'agora' } 
          : b
      ));
    } else if (activeChatGroup) {
      setGroups(prev => prev.map(g => 
        g.id === activeChatGroup.id 
          ? { ...g, lastActivity: userMsg.content.slice(0, 48), lastSeen: 'agora' } 
          : g
      ));
    }
  };

  const handleClearTargetMessages = (targetId: string) => {
    setMessages(prev => prev.filter(m => m.botId !== targetId && m.groupId !== targetId));
  };

  const handleToggleMute = () => {
    setSettings(prev => ({ ...prev, muted: !prev.muted }));
  };

  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const handleImportServers = (imported: HermesServer[]) => {
    setServers(imported);
    if (imported.length > 0) {
      setActiveServerId(imported[0].id);
    }
  };

  const handleResetDefaults = () => {
    setServers(DEFAULT_SERVERS);
    setBots(DEFAULT_BOTS);
    setGroups(DEFAULT_GROUPS);
    setActiveServerId(DEFAULT_SERVERS[0].id);
    setActiveChatBot(null);
    setActiveChatGroup(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30">
      {/* Mobile Android Container with fluid sizing */}
      <div className="w-full max-w-xl mx-auto flex-1 flex flex-col px-2 sm:px-4">
        {/* If in other tabs or in server management, show AndroidHeader status bar */}
        {currentTab !== 'bots' && (
          <AndroidHeader
            botState={botState}
            servers={servers}
            activeServer={activeServer}
            isRefreshing={isRefreshing}
            onRefreshAll={refreshAllServers}
            onToggleBot={handleToggleBot}
            onOpenQuickSwitch={() => setIsQuickSwitchOpen(true)}
          />
        )}

        {/* Main View Body based on Current Tab */}
        <main className="flex-1">
          {currentTab === 'bots' && (
            <>
              {activeChatBot || activeChatGroup ? (
                <div className="pt-2">
                  <BotChatView
                    bot={activeChatBot}
                    group={activeChatGroup}
                    allBots={bots}
                    servers={servers}
                    messages={messages}
                    onSendMessage={handleChatSendMessage}
                    onClearMessages={handleClearTargetMessages}
                    onEditBot={handleOpenEditBot}
                    onEditGroup={handleOpenEditGroup}
                    onBack={() => {
                      setActiveChatBot(null);
                      setActiveChatGroup(null);
                    }}
                  />
                </div>
              ) : (
                <BotsListView
                  bots={bots}
                  groups={groups}
                  servers={servers}
                  isMuted={settings.muted}
                  selectedBotId={activeChatBot?.id}
                  onToggleMute={handleToggleMute}
                  onSelectBot={(bot) => {
                    setActiveChatBot(bot);
                    setActiveChatGroup(null);
                  }}
                  onSelectGroup={(group) => {
                    setActiveChatGroup(group);
                    setActiveChatBot(null);
                  }}
                  onOpenCreateGroup={() => setIsCreateGroupOpen(true)}
                  onOpenCreateBot={() => setIsCreateBotOpen(true)}
                  onEditBot={handleOpenEditBot}
                  onEditGroup={handleOpenEditGroup}
                />
              )}
            </>
          )}

          {currentTab === 'servers' && (
            <div className="pt-2">
              <ServersView
                servers={servers}
                activeServerId={activeServerId}
                onSelectServer={(srv) => {
                  handleSelectServer(srv);
                }}
                onAddServer={handleAddServer}
                onUpdateServer={handleUpdateServer}
                onDeleteServer={handleDeleteServer}
                onPingAll={refreshAllServers}
              />
            </div>
          )}

          {currentTab === 'settings' && (
            <div className="pt-2">
              <SettingsView
                settings={settings}
                servers={servers}
                onUpdateSettings={handleUpdateSettings}
                onImportServers={handleImportServers}
                onResetDefaults={handleResetDefaults}
              />
            </div>
          )}
        </main>
      </div>

      {/* Floating Offline Indicator */}
      <OfflineIndicator />

      {/* Modals */}
      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        bots={bots}
        onCreateGroup={handleCreateGroup}
      />

      <EditGroupModal
        isOpen={isEditGroupOpen}
        onClose={() => {
          setIsEditGroupOpen(false);
          setEditingGroup(null);
        }}
        group={editingGroup}
        bots={bots}
        onSaveGroup={handleSaveGroup}
        onDeleteGroup={handleDeleteGroup}
        onOpenChat={(grp) => {
          setActiveChatGroup(grp);
          setActiveChatBot(null);
          setCurrentTab('bots');
        }}
      />

      <CreateBotModal
        isOpen={isCreateBotOpen}
        onClose={() => setIsCreateBotOpen(false)}
        servers={servers}
        onCreateBot={handleCreateBot}
      />

      <EditBotModal
        isOpen={isEditBotOpen}
        onClose={() => {
          setIsEditBotOpen(false);
          setEditingBot(null);
        }}
        bot={editingBot}
        servers={servers}
        onSaveBot={handleSaveBot}
        onDeleteBot={handleDeleteBot}
      />

      <QuickServerModal
        isOpen={isQuickSwitchOpen}
        onClose={() => setIsQuickSwitchOpen(false)}
        servers={servers}
        activeServerId={activeServerId}
        onSelectServer={handleSelectServer}
      />

      <BroadcastModal
        isOpen={isBroadcastOpen}
        onClose={() => setIsBroadcastOpen(false)}
        servers={servers}
      />

      {/* Material 3 Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          // If tapping bots while in chat, return to list or stay
        }}
        onlineServersCount={servers.filter(s => s.status === 'online').length}
        activeBotsCount={bots.length}
      />
    </div>
  );
}
