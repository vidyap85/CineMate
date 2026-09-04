import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  Send,
  Sparkles,
  Plus,
  Trash2,
  Copy,
  Check,
  ShieldCheck,
  Loader2,
  Download,
  Film,
  DollarSign,
  Sun,
  User,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import type { JournalEntry, UserRole } from '../../types';

export const GeminiJournal: React.FC = () => {
  const { currentUser, userRole, switchRole, availableRoles } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [newEntryTitle, setNewEntryTitle] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isCreatingEntry, setIsCreatingEntry] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedEntry = entries.find((e) => e.entryId === selectedEntryId) || entries[0] || null;

  useEffect(() => {
    loadEntries();
  }, [userRole, currentUser?.uid]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedEntry?.messages, isSending]);

  const loadEntries = async () => {
    setIsLoadingEntries(true);
    try {
      const res = await api.getJournalEntries('project-aurora-001', userRole, currentUser?.uid);
      if (res.success && res.entries) {
        setEntries(res.entries);
        if (res.entries.length > 0) {
          setSelectedEntryId(res.entries[0].entryId);
        } else {
          setSelectedEntryId(null);
        }
      }
    } catch (err: unknown) {
      console.warn('Failed to load journal entries:', err);
    } finally {
      setIsLoadingEntries(false);
    }
  };

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntryTitle.trim()) return;

    setIsCreatingEntry(true);
    try {
      const res = await api.createJournalEntry('project-aurora-001', {
        title: newEntryTitle.trim(),
        roleTag: userRole,
        initialMessage: `Started brainstorm thread: ${newEntryTitle.trim()}`,
        userId: currentUser?.uid,
      });

      if (res.success && res.entry) {
        setEntries((prev) => [res.entry, ...prev]);
        setSelectedEntryId(res.entry.entryId);
        setNewEntryTitle('');
      }
    } catch (err: unknown) {
      alert('Failed to create entry: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsCreatingEntry(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedEntry) return;

    const msg = inputMessage;
    setInputMessage('');
    setIsSending(true);

    try {
      const res = await api.chatJournalEntry('project-aurora-001', selectedEntry.entryId, msg, userRole, currentUser?.uid);
      if (res.success && res.messages) {
        setEntries((prev) =>
          prev.map((item) =>
            item.entryId === selectedEntry.entryId
              ? {
                  ...item,
                  messages: res.messages,
                  summary: res.summary || item.summary,
                  updatedAt: new Date().toISOString(),
                }
              : item
          )
        );
      }
    } catch (err: unknown) {
      alert('Failed to chat with journal: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteEntry = async (e: React.MouseEvent, entryId: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this brainstorm thread?')) return;

    try {
      const res = await api.deleteJournalEntry('project-aurora-001', entryId, userRole);
      if (res.success) {
        setEntries(res.entries);
        if (selectedEntryId === entryId) {
          setSelectedEntryId(res.entries[0]?.entryId || null);
        }
      }
    } catch (err: unknown) {
      console.error('Failed to delete entry:', err);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportTranscript = () => {
    if (!selectedEntry) return;
    let transcript = `CINEMATE JOURNAL - ROLE: ${userRole}\n`;
    transcript += `Topic: ${selectedEntry.title}\n`;
    transcript += `Author: ${currentUser?.name || userRole} (${currentUser?.email})\n`;
    transcript += `Date: ${new Date(selectedEntry.createdAt).toLocaleString()}\n`;
    transcript += `----------------------------------------\n\n`;

    selectedEntry.messages.forEach((m) => {
      transcript += `[${m.role === 'user' ? currentUser?.name || userRole : 'Gemini AI Assistant'}] (${new Date(m.timestamp).toLocaleTimeString()}):\n`;
      transcript += `${m.content}\n\n`;
    });

    const blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cinemate-journal-${userRole.toLowerCase()}-${selectedEntry.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const roleMeta = {
    DIRECTOR: {
      title: "Director's Creative & Narrative Journal",
      subtitle: 'Explores character blocking, scene pacing, emotional subtext & dramatic framing',
      badgeColor: 'bg-[#C5A059]/20 text-[#C5A059] border-[#C5A059]/40',
      icon: Film,
      prompts: [
        'Explore protagonist psychological shift during the Marina dawn scene',
        'Brainstorm dramatic tension beats for Scene 3 heritage alley chase',
        'What subtext and non-verbal blocking can we amplify during the confrontation?',
        'How should we transition camera motion from handheld to stationary lock-off?',
      ],
    },
    PRODUCER: {
      title: "Producer's Logistics & Risk Mitigation Journal",
      subtitle: 'Analyzes financial contingencies, permit logistics, crew staging & safety protocol',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      icon: DollarSign,
      prompts: [
        'Draft a contingency plan for a sudden 45 km/h desert dust storm on Day 3',
        'How can we optimize equipment transit between Dubai Marina and Al Quoz?',
        'Review DFTC expedited drone filming permit surcharges and turnaround windows',
        'Calculate overtime thresholds if morning Marina lighting window extends 45 min',
      ],
    },
    CINEMATOGRAPHER: {
      title: "Cinematographer's Optics & Light Journal",
      subtitle: 'Calculates solar ephemeris, anamorphic lens packages, filtration & diffusion ratios',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      icon: Sun,
      prompts: [
        'Compare Cooke Anamorphic 40mm vs 50mm for tight 2.5m coral stone alleys',
        'Recommend lighting bounce setup to fill talent against 14° morning sun',
        'What ND filtration stops are required to shoot wide open at T2.0 at 06:15 AM?',
        'Analyze highlight roll-off risks on skyscraper glass reflections at 82° azimuth',
      ],
    },
  };

  const currentRoleMeta = roleMeta[userRole] || roleMeta.DIRECTOR;
  const RoleIcon = currentRoleMeta.icon;

  const filteredEntries = entries.filter((e) =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.messages.some((m) => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6" id="gemini-journal-view">
      {/* Top Header & Role Switcher Bar */}
      <div className="bg-[#121212] border border-white/10 p-5 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              <RoleIcon className="w-6 h-6 text-[#C5A059]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-semibold uppercase tracking-wider ${currentRoleMeta.badgeColor}`}>
                  {userRole} PERSONAL BRAINSTORM
                </span>
                <span className="text-[11px] font-mono text-white/40 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Isolated Account
                </span>
              </div>
              <h1 className="text-xl font-serif text-[#F5F2ED] mt-1">{currentRoleMeta.title}</h1>
              <p className="text-xs text-white/60">{currentRoleMeta.subtitle}</p>
            </div>
          </div>

          {/* Active User Card & Switcher */}
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-2.5 rounded-xl self-start md:self-auto">
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
              alt={currentUser?.name}
              className="w-9 h-9 rounded-full object-cover border border-white/20"
            />
            <div className="pr-2">
              <div className="text-xs font-semibold text-[#F5F2ED]">{currentUser?.name}</div>
              <div className="text-[10px] font-mono text-white/50">{currentUser?.email}</div>
            </div>
          </div>
        </div>

        {/* Role Switcher Tabs */}
        <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-white/50">
            <span className="font-mono text-[11px]">Active Journal Space:</span>
          </div>
          <div className="flex items-center gap-2">
            {availableRoles.map((item) => {
              const isCurrent = userRole === item.role;
              return (
                <button
                  key={item.role}
                  onClick={() => switchRole(item.role)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-[#C5A059] text-black font-bold shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10'
                  }`}
                  id={`journal-switch-role-${item.role.toLowerCase()}`}
                >
                  <span>{item.label}</span>
                  {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-black"></span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main 2-Column Journal Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Topics / Threads List (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Create New Brainstorm Form */}
          <form
            onSubmit={handleCreateEntry}
            className="p-4 rounded-2xl bg-[#121212] border border-white/10 space-y-3"
            id="journal-new-thread-form"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-xs uppercase tracking-wider text-white/80 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-[#C5A059]" />
                New {userRole} Topic
              </h3>
              <span className="text-[10px] font-mono text-white/40">{entries.length} Threads</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newEntryTitle}
                onChange={(e) => setNewEntryTitle(e.target.value)}
                placeholder={
                  userRole === 'DIRECTOR'
                    ? 'e.g. Marina Dawn Protagonist Blocking...'
                    : userRole === 'PRODUCER'
                    ? 'e.g. Day 3 Sandstorm Backup Set Plan...'
                    : 'e.g. Cooke Anamorphic Flare Test...'
                }
                className="flex-1 rounded-xl bg-[#0A0A0A] border border-white/15 px-3 py-2 text-xs text-[#F5F2ED] placeholder-white/30 focus:outline-none focus:border-[#C5A059]"
                id="journal-new-thread-input"
              />
              <button
                type="submit"
                disabled={isCreatingEntry || !newEntryTitle.trim()}
                className="px-3.5 py-2 rounded-xl bg-[#C5A059] hover:bg-[#D4AF37] disabled:opacity-50 text-black font-semibold text-xs transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                id="journal-create-thread-btn"
              >
                {isCreatingEntry ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 stroke-[2.5]" />}
                <span>Add</span>
              </button>
            </div>
          </form>

          {/* Search Filter */}
          {entries.length > 2 && (
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search brainstorm threads..."
                className="w-full rounded-xl bg-[#121212] border border-white/10 px-3.5 py-2 text-xs text-white/80 placeholder-white/30 focus:outline-none focus:border-[#C5A059]"
              />
            </div>
          )}

          {/* Conversation Threads List */}
          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {isLoadingEntries ? (
              <div className="p-8 text-center rounded-2xl border border-white/10 bg-[#121212] text-xs text-white/40 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#C5A059]" />
                <span>Loading {userRole} journal threads...</span>
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-white/10 bg-[#121212] text-xs text-white/40">
                {searchQuery ? 'No matching threads found.' : `No journal entries for ${userRole} yet. Create one above.`}
              </div>
            ) : (
              filteredEntries.map((entry) => {
                const isSelected = selectedEntry?.entryId === entry.entryId;
                return (
                  <div
                    key={entry.entryId}
                    onClick={() => setSelectedEntryId(entry.entryId)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 group relative ${
                      isSelected
                        ? 'bg-[#C5A059]/10 border-[#C5A059]/50 shadow-lg'
                        : 'bg-[#121212] border-white/10 hover:bg-white/5 hover:border-white/20'
                    }`}
                    id={`journal-thread-${entry.entryId}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-[#F5F2ED] text-xs leading-snug line-clamp-2">
                        {entry.title}
                      </h4>
                      <button
                        onClick={(e) => handleDeleteEntry(e, entry.entryId)}
                        title="Delete Thread"
                        className="opacity-0 group-hover:opacity-100 hover:text-red-400 text-white/40 p-1 transition-opacity cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[11px] text-white/60 line-clamp-2 font-sans">
                      {entry.summary || entry.messages[entry.messages.length - 1]?.content || 'Empty entry'}
                    </p>

                    <div className="flex items-center justify-between text-[10px] font-mono text-white/40 pt-1 border-t border-white/5">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-[#C5A059]" />
                        {entry.messages.length} exchanges
                      </span>
                      <span>{new Date(entry.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Multi-Turn Chat Canvas (8 cols) */}
        <div className="lg:col-span-8 rounded-2xl border border-white/10 bg-[#121212] p-5 flex flex-col justify-between h-[680px] shadow-2xl">
          {selectedEntry ? (
            <>
              {/* Chat Thread Header */}
              <div className="border-b border-white/10 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-mono text-[#C5A059]">
                      {selectedEntry.roleTag}
                    </span>
                    <h3 className="font-semibold text-[#F5F2ED] text-sm truncate max-w-md">
                      {selectedEntry.title}
                    </h3>
                  </div>
                  <p className="text-[11px] text-white/50 mt-0.5">
                    Multi-turn Gemini 3.6 Flash reasoning • Contextually tailored for {userRole.toLowerCase()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportTranscript}
                    title="Export transcript as text"
                    className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-white/70 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                    id="journal-export-transcript-btn"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export</span>
                  </button>
                  <span className="px-2.5 py-1.5 rounded-lg bg-[#0A0A0A] border border-white/10 text-[11px] font-mono text-white/60">
                    {selectedEntry.messages.length} messages
                  </span>
                </div>
              </div>

              {/* Messages Scroll Area */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
                {selectedEntry.messages.map((msg, idx) => {
                  const isUser = msg.role === 'user';
                  const msgKey = `${selectedEntry.entryId}-msg-${idx}`;
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[88%] rounded-2xl p-4 text-xs leading-relaxed space-y-2 relative group shadow-lg ${
                          isUser
                            ? 'bg-[#C5A059] text-black font-medium rounded-tr-sm'
                            : 'bg-[#0A0A0A] border border-white/15 text-[#F5F2ED] rounded-tl-sm'
                        }`}
                      >
                        {/* Header tag */}
                        <div className="flex items-center justify-between gap-3 text-[10px] opacity-75 font-mono border-b border-current/15 pb-1">
                          <div className="flex items-center gap-1.5">
                            {isUser ? (
                              <span className="font-semibold flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {currentUser?.name || userRole}
                              </span>
                            ) : (
                              <span className="font-semibold flex items-center gap-1 text-[#C5A059]">
                                <Sparkles className="w-3 h-3" />
                                Gemini Production Assistant
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span>
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <button
                              onClick={() => handleCopy(msg.content, msgKey)}
                              title="Copy text"
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:scale-110 cursor-pointer"
                            >
                              {copiedId === msgKey ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="whitespace-pre-line font-sans text-xs">
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {isSending && (
                  <div className="flex items-center gap-2 p-3.5 rounded-xl bg-[#0A0A0A] border border-white/10 text-xs text-white/60 max-w-sm">
                    <Loader2 className="w-4 h-4 animate-spin text-[#C5A059]" />
                    <span>Gemini is synthesizing {userRole.toLowerCase()} insights...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts Suggestions */}
              <div className="py-2.5 border-t border-white/10 overflow-x-auto flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#C5A059] shrink-0 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Quick Ask:
                </span>
                {currentRoleMeta.prompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => setInputMessage(prompt)}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-white/70 hover:text-white whitespace-nowrap transition-colors cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendMessage} className="pt-2 flex items-center gap-2 shrink-0">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={`Ask Gemini for ${userRole.toLowerCase()} guidance or add notes...`}
                  className="flex-1 rounded-xl bg-[#0A0A0A] border border-white/15 px-4 py-3 text-xs text-[#F5F2ED] placeholder-white/30 focus:outline-none focus:border-[#C5A059]"
                  id="journal-chat-input"
                />
                <button
                  type="submit"
                  disabled={isSending || !inputMessage.trim()}
                  className="px-5 py-3 rounded-xl bg-[#C5A059] hover:bg-[#D4AF37] disabled:opacity-50 text-black font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-lg cursor-pointer shrink-0"
                  id="journal-chat-send-btn"
                >
                  {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-white/40 space-y-3">
              <BookOpen className="w-12 h-12 text-white/20" />
              <h4 className="text-sm font-semibold text-white/70">No Brainstorm Thread Selected</h4>
              <p className="text-xs max-w-sm">
                Select an existing thread from the left or create a new topic to begin chatting with Gemini as {userRole}.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
