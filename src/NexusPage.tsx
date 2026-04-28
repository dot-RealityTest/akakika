import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lightbulb,
  Loader2,
  CheckCircle2,
  Flame,
  Archive,
  FolderOpen,
  Menu,
  X,
  MessageSquare,
  Send,
  ChevronRight,
  Bot,
  Server,
} from 'lucide-react';

type ThemeName = 'purple' | 'cyan' | 'amber';

/* ── shared helpers (duplicated from App.tsx to keep module self-contained) ── */
const navigateTo = (path: string) => {
  if (window.location.pathname !== path) {
    window.history.pushState({}, '', path);
  }
  window.scrollTo({ top: 0, behavior: 'auto' });
  window.dispatchEvent(new PopStateEvent('popstate'));
};

const BlogNavLink: React.FC<{ path: string; children: React.ReactNode; className?: string }> = ({
  path,
  children,
  className,
}) => (
  <a
    href={path}
    className={className}
    onClick={(event) => {
      event.preventDefault();
      navigateTo(path);
    }}
  >
    {children}
  </a>
);

const THEMES: Record<ThemeName, { label: string; vars: React.CSSProperties }> = {
  purple: {
    label: 'Purple',
    vars: {
      '--accent-200': '#c7d2fe',
      '--accent-300': '#a5b4fc',
      '--accent-400': '#818cf8',
      '--accent-500': '#6366f1',
      '--accent-900': 'rgba(49, 46, 129, 0.18)',
      '--accent-border': 'rgba(99, 102, 241, 0.30)',
      '--accent-border-strong': 'rgba(129, 140, 248, 0.50)',
      '--accent-shadow': 'rgba(99, 102, 241, 0.22)',
      '--accent-glow': 'rgba(139, 92, 246, 0.60)',
    } as React.CSSProperties,
  },
  cyan: {
    label: 'Cyan',
    vars: {
      '--accent-200': '#bae6fd',
      '--accent-300': '#7dd3fc',
      '--accent-400': '#38bdf8',
      '--accent-500': '#06b6d4',
      '--accent-900': 'rgba(8, 47, 73, 0.20)',
      '--accent-border': 'rgba(34, 211, 238, 0.30)',
      '--accent-border-strong': 'rgba(103, 232, 249, 0.55)',
      '--accent-shadow': 'rgba(34, 211, 238, 0.22)',
      '--accent-glow': 'rgba(56, 189, 248, 0.55)',
    } as React.CSSProperties,
  },
  amber: {
    label: 'Amber',
    vars: {
      '--accent-200': '#fde68a',
      '--accent-300': '#fcd34d',
      '--accent-400': '#f59e0b',
      '--accent-500': '#d97706',
      '--accent-900': 'rgba(120, 53, 15, 0.20)',
      '--accent-border': 'rgba(245, 158, 11, 0.30)',
      '--accent-border-strong': 'rgba(251, 191, 36, 0.55)',
      '--accent-shadow': 'rgba(245, 158, 11, 0.20)',
      '--accent-glow': 'rgba(251, 191, 36, 0.40)',
    } as React.CSSProperties,
  },
};

const ThemeToggle: React.FC<{ theme: ThemeName; onToggle: () => void }> = ({ theme, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className="theme-toggle flex items-center gap-2 rounded-full border px-3 py-2 text-[10px] tracking-[0.22em] text-gray-100 uppercase backdrop-blur-sm transition-transform hover:scale-[1.03] md:text-xs"
  >
    <span className="theme-toggle-swatch h-3 w-3 rounded-full" />
    <span>{THEMES[theme].label}</span>
  </button>
);

const HomeStickyHeader: React.FC<{
  theme: ThemeName;
  onToggleTheme: () => void;
  workHref?: string;
  aboutHref?: string;
}> = ({ theme, onToggleTheme, workHref, aboutHref }) => (
  <motion.div
    className="sticky top-0 z-50 flex w-full items-center justify-between border-b border-white/[0.06] bg-[#0a0a0a]/90 px-6 py-4 backdrop-blur-xl md:px-12 -mt-6 md:-mt-12"
    style={{
      paddingRight: 'max(1.5rem, env(safe-area-inset-right))',
      paddingLeft: 'max(1.5rem, env(safe-area-inset-left))',
    }}
  >
    <div className="flex items-center gap-2 text-gray-100">
      <span className="bg-gray-200 px-2 py-1 text-black">AKA</span>
      <span className="tracking-widest">KIKA</span>
      <span className="blink h-5 w-3 accent-bg" />
    </div>
    <div className="flex items-center gap-3 tracking-widest text-gray-100 md:gap-6">
      <BlogNavLink path="/" className="hover-accent-text cursor-pointer transition-colors">
        HOME
      </BlogNavLink>
      {workHref ? (
        <BlogNavLink path={workHref} className="hover-accent-text cursor-pointer transition-colors">
          WORK
        </BlogNavLink>
      ) : (
        <span>WORK</span>
      )}
      <BlogNavLink path="/apps" className="hover-accent-text cursor-pointer transition-colors">
        APPS
      </BlogNavLink>
      <BlogNavLink path="/undrdr" className="hover-accent-text cursor-pointer transition-colors">
        UNDRDR
      </BlogNavLink>
      <BlogNavLink path="/nexus" className="cursor-pointer transition-colors text-emerald-400">
        NEXUS
      </BlogNavLink>
      <BlogNavLink path="/blog" className="hover-accent-text cursor-pointer transition-colors">
        BLOG
      </BlogNavLink>
      <BlogNavLink path="/goodnews" className="hover-accent-text cursor-pointer transition-colors">
        GOOD NEWS ✦
      </BlogNavLink>
      {aboutHref ? (
        <BlogNavLink path={aboutHref} className="hover-accent-text cursor-pointer transition-colors">
          ABOUT
        </BlogNavLink>
      ) : (
        <a href="#about" className="hover-accent-text cursor-pointer transition-colors">
          ABOUT
        </a>
      )}
      <ThemeToggle theme={theme} onToggle={onToggleTheme} />
    </div>
  </motion.div>
);

const useSmoothScroll = (
  wrapperRef: React.RefObject<HTMLElement | HTMLDivElement | null>,
  contentRef?: React.RefObject<HTMLElement | HTMLDivElement | null>
) => {
  useEffect(() => {
    const Lenis = (window as any).__lenis_placeholder;
    // Lenis not available here — smooth scroll handled by BlogShell wrapper in App
  }, [wrapperRef, contentRef]);
};

const BlogShell: React.FC<{ children: React.ReactNode; noCrt?: boolean }> = ({ children, noCrt }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={wrapperRef}
      className={`blog-shell relative h-[100dvh] overflow-y-auto bg-[#0a0a0a] font-mono text-gray-100 ${noCrt ? '' : 'dotted-bg'}`}
    >
      {!noCrt && <div className="crt-overlay" />}
      <div ref={contentRef} className="relative z-10 p-6 md:p-12">
        {children}
      </div>
    </div>
  );
};

/* ── Data ── */

type ProjectCategory = 'all' | 'active' | 'archived' | 'ideas';

interface KanbanCard {
  id: string;
  name: string;
  description: string;
  status: 'ideas' | 'in-progress' | 'done';
  tags: string[];
}

const KANBAN_DATA: KanbanCard[] = [
  // Ideas
  { id: '1', name: 'ProjectHub', description: 'Bloom-style project manager', status: 'ideas', tags: ['planning', 'ui'] },
  { id: '2', name: 'AppAudit', description: 'Scans apps + Ollama analysis', status: 'ideas', tags: ['automation', 'ai'] },
  { id: '3', name: 'Chops Collections', description: 'Curated skill-based collections', status: 'ideas', tags: ['content'] },
  // In Progress
  { id: '4', name: 'BreakPoint', description: 'Debugger companion for local dev', status: 'in-progress', tags: ['dev-tool', 'active'] },
  { id: '5', name: 'LocalhostWatcher', description: 'Monitors local services in real-time', status: 'in-progress', tags: ['monitoring', 'active'] },
  // Done
  { id: '6', name: 'DGMD', description: 'Drag-and-drop grid layout maker', status: 'done', tags: ['shipped', 'ui'] },
  { id: '7', name: 'RESQ', description: 'Rapid emergency system query', status: 'done', tags: ['shipped', 'utility'] },
  { id: '8', name: 'Mochi', description: 'Soft UI component playground', status: 'done', tags: ['shipped', 'design'] },
  { id: '9', name: 'ClipboardSanitizer', description: 'Cleans clipboard formatting on paste', status: 'done', tags: ['shipped', 'utility'] },
  { id: '10', name: 'Focus', description: 'Minimal pomodoro + deep work timer', status: 'done', tags: ['shipped', 'productivity'] },
  { id: '11', name: 'FolderWardrobe', description: 'Organizes folder structures by template', status: 'done', tags: ['shipped', 'filesystem'] },
];

const COLUMNS: { key: KanbanCard['status']; label: string; icon: React.ReactNode; color: string }[] = [
  { key: 'ideas', label: 'Ideas', icon: <Lightbulb size={16} />, color: 'text-yellow-400' },
  { key: 'in-progress', label: 'In Progress', icon: <Loader2 size={16} />, color: 'text-emerald-400' },
  { key: 'done', label: 'Done', icon: <CheckCircle2 size={16} />, color: 'text-gray-400' },
];

const categoryFilter = (cat: ProjectCategory, card: KanbanCard): boolean => {
  if (cat === 'all') return true;
  if (cat === 'ideas') return card.status === 'ideas';
  if (cat === 'active') return card.status === 'in-progress';
  if (cat === 'archived') return card.status === 'done';
  return true;
};

/* ── Sidebar ── */

const Sidebar: React.FC<{
  category: ProjectCategory;
  onSelect: (c: ProjectCategory) => void;
  collapsed: boolean;
  onToggle: () => void;
  chatOpen: boolean;
  onToggleChat: () => void;
}> = ({ category, onSelect, collapsed, onToggle, chatOpen, onToggleChat }) => {
  const items: { key: ProjectCategory; label: string; icon: React.ReactNode }[] = [
    { key: 'all', label: 'All', icon: <FolderOpen size={16} /> },
    { key: 'active', label: 'Active', icon: <Flame size={16} /> },
    { key: 'archived', label: 'Archived', icon: <Archive size={16} /> },
    { key: 'ideas', label: 'Ideas', icon: <Lightbulb size={16} /> },
  ];

  return (
    <>
      {/* Hamburger for mobile */}
      <button
        className="fixed top-4 left-4 z-[60] rounded-lg border border-white/10 bg-[#111] p-2 text-gray-100 md:hidden"
        onClick={onToggle}
        aria-label="Toggle sidebar"
      >
        {collapsed ? <Menu size={20} /> : <X size={20} />}
      </button>

      {/* Sidebar */}
      <motion.aside
        className={`fixed left-0 top-0 z-50 flex h-full w-56 flex-col border-r border-white/5 bg-[#0a0a0a] pt-16 md:pt-0 md:relative md:translate-x-0 ${
          collapsed ? '-translate-x-full' : 'translate-x-0'
        }`}
        initial={false}
        animate={{ x: collapsed ? '-100%' : '0%' }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        style={{ translateX: undefined }}
      >
        <div className="flex h-full flex-col p-4 pt-6">
          <h2 className="mb-6 text-xs font-bold uppercase tracking-[0.3em] text-emerald-400">
            Nexus
          </h2>

          <nav className="flex flex-col gap-1">
            {items.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  onSelect(item.key);
                  if (window.innerWidth < 768) onToggle();
                }}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  category === item.key
                    ? 'bg-emerald-500/10 text-emerald-400 font-semibold'
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto border-t border-white/5 pt-4">
            <button
              onClick={onToggleChat}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                chatOpen
                  ? 'bg-emerald-500/10 text-emerald-400 font-semibold'
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
              }`}
            >
              <MessageSquare size={16} />
              Ollama Chat
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Overlay for mobile */}
      {!collapsed && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
};

/* ── Kanban Card ── */

const KanbanCardComponent: React.FC<{ card: KanbanCard }> = ({ card }) => {
  const statusIcon =
    card.status === 'ideas' ? (
      <Lightbulb size={12} className="text-yellow-400" />
    ) : card.status === 'in-progress' ? (
      <Loader2 size={12} className="text-emerald-400" />
    ) : (
      <CheckCircle2 size={12} className="text-gray-400" />
    );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="group rounded-xl border border-white/5 bg-[#111] p-4 transition-all hover:border-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.08)]"
    >
      <div className="mb-2 flex items-center gap-2">
        {statusIcon}
        <h3 className="text-sm font-bold text-white">{card.name}</h3>
      </div>
      <p className="mb-3 text-xs leading-relaxed text-gray-400">{card.description}</p>
      <div className="flex flex-wrap gap-1.5">
        {card.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-emerald-400/80"
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
};

/* ── Kanban Board ── */

const KanbanBoard: React.FC<{ category: ProjectCategory }> = ({ category }) => {
  const filtered = KANBAN_DATA.filter((c) => categoryFilter(category, c));

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {COLUMNS.map((col) => {
        const cards = filtered.filter((c) => c.status === col.key);
        return (
          <div key={col.key} className="flex flex-col">
            <div className="mb-3 flex items-center gap-2 border-b border-white/5 pb-2">
              <span className={col.color}>{col.icon}</span>
              <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-gray-300">
                {col.label}
              </h2>
              <span className="ml-auto rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-gray-500">
                {cards.length}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              <AnimatePresence mode="popLayout">
                {cards.map((card) => (
                  <KanbanCardComponent key={card.id} card={card} />
                ))}
              </AnimatePresence>
              {cards.length === 0 && (
                <div className="rounded-lg border border-dashed border-white/5 py-8 text-center text-xs text-gray-600">
                  No projects
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ── Ollama Chat Panel ── */

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const OllamaChatPanel: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'system',
      content: 'Connect to Ollama on localhost:11434 to chat with a local model.',
    },
  ]);
  const [input, setInput] = useState('');
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchModels = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:11434/api/tags');
      const data = await res.json();
      const modelNames: string[] = (data.models || []).map((m: any) => m.name);
      setModels(modelNames);
      if (modelNames.length > 0 && !selectedModel) {
        setSelectedModel(modelNames[0]);
      }
      setError('');
    } catch {
      setError('Cannot connect to Ollama — is it running?');
      setModels([]);
    }
  }, [selectedModel]);

  useEffect(() => {
    if (open) fetchModels();
  }, [open, fetchModels]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: trimmed };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          messages: newMessages
            .filter((m) => m.role !== 'system')
            .map(({ role, content }) => ({ role, content })),
          stream: false,
        }),
      });

      if (!res.ok) {
        throw new Error(`Ollama returned ${res.status}`);
      }

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: data.message?.content || '(no response)',
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setError(err.message || 'Failed to get response');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="fixed right-0 top-0 z-50 flex h-full w-full flex-col border-l border-white/5 bg-[#0a0a0a] sm:w-96"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
              <Bot size={18} />
              <span>Ollama Chat</span>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* Model selector */}
          <div className="border-b border-white/5 px-4 py-3">
            <div className="flex items-center gap-2">
              <Server size={14} className="text-gray-500" />
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="flex-1 rounded-lg border border-white/10 bg-[#111] px-2 py-1.5 text-xs text-gray-200 outline-none focus:border-emerald-500/40"
              >
                {models.length === 0 && (
                  <option value="">No models found</option>
                )}
                {models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <button
                onClick={fetchModels}
                className="rounded-lg border border-white/10 px-2 py-1.5 text-[10px] uppercase tracking-wider text-gray-400 transition-colors hover:border-emerald-500/30 hover:text-emerald-400"
              >
                Refresh
              </button>
            </div>
            {error && (
              <p className="mt-2 text-[10px] text-red-400">{error}</p>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="flex flex-col gap-3">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`rounded-xl px-3 py-2 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'ml-8 bg-emerald-500/10 text-emerald-100'
                      : msg.role === 'system'
                        ? 'bg-white/5 text-gray-500 italic text-center'
                        : 'mr-8 bg-[#151515] text-gray-200'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="mb-1 flex items-center gap-1 text-[10px] text-emerald-400/60">
                      <Bot size={10} />
                      <span>{selectedModel}</span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              ))}
              {loading && (
                <div className="mr-8 flex items-center gap-2 rounded-xl bg-[#151515] px-3 py-2 text-xs text-gray-400">
                  <Loader2 size={12} className="animate-spin text-emerald-400" />
                  Thinking...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-white/5 p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={models.length ? `Message ${selectedModel}...` : 'Start Ollama first...'}
                disabled={loading || models.length === 0}
                className="flex-1 rounded-lg border border-white/10 bg-[#111] px-3 py-2 text-xs text-gray-200 outline-none transition-colors placeholder:text-gray-600 focus:border-emerald-500/40 disabled:opacity-40"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim() || models.length === 0}
                className="rounded-lg bg-emerald-500/20 px-3 py-2 text-emerald-400 transition-colors hover:bg-emerald-500/30 disabled:opacity-30 disabled:hover:bg-emerald-500/20"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ── NexusPage (main export) ── */

const NexusPage: React.FC<{ theme: ThemeName; onToggleTheme: () => void }> = ({
  theme,
  onToggleTheme,
}) => {
  const [category, setCategory] = useState<ProjectCategory>('all');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <BlogShell noCrt>
      <HomeStickyHeader theme={theme} onToggleTheme={onToggleTheme} workHref="/" aboutHref="/" />

      <div className="flex min-h-[calc(100dvh-6rem)]">
        {/* Sidebar */}
        <Sidebar
          category={category}
          onSelect={setCategory}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((p) => !p)}
          chatOpen={chatOpen}
          onToggleChat={() => setChatOpen((p) => !p)}
        />

        {/* Main content area */}
        <main className="flex-1 md:ml-0">
          <div className="mx-auto max-w-[700px] px-4 md:px-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <p className="accent-text-soft mb-4 text-xs">
                kika@nexus:~$ cat projects.log
              </p>
              <h1 className="mb-2 text-5xl font-bold tracking-tighter text-white md:text-7xl">
                nexus<span className="text-emerald-400">.</span>
              </h1>
              <p className="mb-8 max-w-xl text-sm leading-relaxed text-gray-200">
                project hub — ideas, work in progress, and shipped things. a bloom-style dashboard for tracking everything i build.
              </p>

              {/* Category chips for mobile (when sidebar hidden) */}
              <div className="mb-6 flex gap-2 md:hidden">
                {(['all', 'active', 'archived', 'ideas'] as ProjectCategory[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-wider transition-colors ${
                      category === cat
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
                <button
                  onClick={() => setChatOpen(true)}
                  className="ml-auto rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] uppercase tracking-wider text-emerald-400"
                >
                  Chat
                </button>
              </div>
            </motion.div>
          </div>

          {/* Kanban — full width */}
          <div className="mt-4 px-4 md:px-6">
            <KanbanBoard category={category} />
          </div>

          <div className="mt-12 mb-8 text-center text-[10px] uppercase tracking-[0.3em] text-gray-600">
            <ChevronRight size={10} className="mr-1 inline-block" />
            end of board
          </div>
        </main>
      </div>

      {/* Ollama Chat Panel */}
      <OllamaChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />
    </BlogShell>
  );
};

export default NexusPage;