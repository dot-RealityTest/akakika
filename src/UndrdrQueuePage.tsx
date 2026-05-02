import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

type QueuedRepo = {
  name: string;
  url: string;
  stars: number;
  language: string;
  description: string;
  topics: string[];
  queued_at: string;
};

type ExtractResult = {
  status: 'added' | 'skipped' | 'invalid';
  name: string;
  detail: string;
  stars?: number;
  language?: string;
};

const QUEUE_KEY = 'undrdr-queue';
const AUTH_KEY = 'undrdr-queue-auth';
const THRESHOLD = 100;

function extractGitHubPairs(text: string): [string, string][] {
  const found = new Map<string, [string, string]>();

  // Full URLs
  const urlRe = /(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)/g;
  let m;
  while ((m = urlRe.exec(text)) !== null) {
    const repo = m[2].replace(/\.git$/, '');
    const skip = ['issues', 'pulls', 'releases', 'tags', 'commits', 'actions', 'wiki', 'blob', 'tree', 'raw', 'archive', 'settings', 'notifications', 'stars', 'watchers', 'network', 'graphs', 'pulse', 'projects', 'security', 'discussions', 'contribute', 'compare', 'find'];
    if (!skip.includes(repo.toLowerCase())) {
      found.set(`${m[1]}/${repo}`, [m[1], repo]);
    }
  }

  return Array.from(found.values());
}

function loadQueue(): QueuedRepo[] {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'); }
  catch { return []; }
}

function saveQueue(repos: QueuedRepo[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(repos));
}

export default function UndrdrQueuePage({ theme, onToggleTheme }: { theme: string; onToggleTheme: () => void }) {
  const [authorized, setAuthorized] = useState(localStorage.getItem(AUTH_KEY) === 'true');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(false);

  const [pasteText, setPasteText] = useState('');
  const [queue, setQueue] = useState<QueuedRepo[]>(loadQueue);
  const [results, setResults] = useState<ExtractResult[]>([]);
  const [processing, setProcessing] = useState(false);
  const [filterLang, setFilterLang] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'stars' | 'name'>('newest');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // meta handled by useMeta in App.tsx
  }, []);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'kika2026') {
      localStorage.setItem(AUTH_KEY, 'true');
      setAuthorized(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  const handlePaste = useCallback(async () => {
    if (!pasteText.trim() || processing) return;
    setProcessing(true);
    setResults([]);

    const pairs = extractGitHubPairs(pasteText);
    if (pairs.length === 0) {
      setResults([{ status: 'invalid', name: '—', detail: 'no github links found' }]);
      setProcessing(false);
      return;
    }

    const existingUrls = new Set(queue.map(r => r.url));
    const batch: ExtractResult[] = [];
    const newRepos: QueuedRepo[] = [];

    // Process sequentially to avoid rate limits
    for (const [owner, repo] of pairs) {
      const url = `https://github.com/${owner}/${repo}`;

      if (existingUrls.has(url)) {
        batch.push({ status: 'skipped', name: `${owner}/${repo}`, detail: 'already queued' });
        continue;
      }

      try {
        const resp = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
        if (resp.status === 404) {
          batch.push({ status: 'invalid', name: `${owner}/${repo}`, detail: 'not found' });
          continue;
        }
        if (resp.status === 403) {
          batch.push({ status: 'invalid', name: `${owner}/${repo}`, detail: 'rate limited' });
          continue;
        }
        if (!resp.ok) {
          batch.push({ status: 'invalid', name: `${owner}/${repo}`, detail: `error ${resp.status}` });
          continue;
        }

        const data = await resp.json();
        const stars = data.stargazers_count || 0;

        if (data.fork || data.archived) {
          batch.push({ status: 'invalid', name: `${owner}/${repo}`, detail: 'fork/archived' });
          continue;
        }
        if (stars >= 1000) {
          batch.push({ status: 'invalid', name: `${owner}/${repo}`, detail: `${stars.toLocaleString()}★ over limit` });
          continue;
        }

        const entry: QueuedRepo = {
          name: `${owner}/${repo}`,
          url: data.html_url || url,
          stars,
          language: (data.language || 'various').toLowerCase(),
          description: (data.description || '').slice(0, 200),
          topics: data.topics || [],
          queued_at: new Date().toISOString().split('T')[0],
        };
        newRepos.push(entry);
        existingUrls.add(url);
        batch.push({ status: 'added', name: entry.name, detail: `★${stars}`, stars, language: entry.language });
      } catch {
        batch.push({ status: 'invalid', name: `${owner}/${repo}`, detail: 'network error' });
      }
    }

    setResults(batch);
    if (newRepos.length > 0) {
      const updated = [...newRepos, ...queue];
      setQueue(updated);
      saveQueue(updated);
    }
    setPasteText('');
    setProcessing(false);
  }, [pasteText, processing, queue]);

  const handleRemove = (url: string) => {
    const updated = queue.filter(r => r.url !== url);
    setQueue(updated);
    saveQueue(updated);
  };

  const handleClear = () => {
    setQueue([]);
    saveQueue([]);
  };

  // Stats
  const langs = React.useMemo(() => {
    const m: Record<string, number> = {};
    queue.forEach(r => { m[r.language] = (m[r.language] || 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [queue]);

  const avgStars = queue.length ? Math.round(queue.reduce((s, r) => s + r.stars, 0) / queue.length) : 0;
  const topStar = queue.length ? Math.max(...queue.map(r => r.stars)) : 0;

  const filtered = React.useMemo(() => {
    let list = filterLang === 'all' ? queue : queue.filter(r => r.language === filterLang);
    if (sortBy === 'stars') list = [...list].sort((a, b) => b.stars - a.stars);
    else if (sortBy === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    // 'newest' is default order
    return list;
  }, [queue, filterLang, sortBy]);

  const progress = Math.min(queue.length / THRESHOLD, 1);

  if (!authorized) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#0a0a0a] font-mono">
        <form onSubmit={handleAuth} className="flex flex-col gap-3">
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setAuthError(false); }}
            placeholder="password"
            autoFocus
            className={`rounded-lg border px-4 py-2 text-sm text-gray-300 placeholder-gray-600 outline-none transition-colors ${
              authError ? 'border-red-500/50 bg-red-500/5' : 'border-white/[0.06] bg-white/[0.03] focus:border-[#7dd3fc]/30'
            }`}
          />
          {authError && <p className="text-[10px] text-red-400/70">wrong password</p>}
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 flex w-full items-center justify-between border-b border-white/[0.06] bg-[#0a0a0a]/90 px-6 py-4 backdrop-blur-xl md:px-12">
        <div className="flex items-center gap-2 font-display text-sm font-bold text-gray-100">
          <span className="bg-gray-200 px-2 py-1 text-black">AKA</span>
          <span className="tracking-widest">KIKA</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-xs tracking-widest text-gray-400 md:gap-6">
          <a href="/" className="cursor-pointer transition-colors hover:text-gray-100">HOME</a>
          <a href="/undrdr" className="cursor-pointer transition-colors hover:text-gray-100">UNDRDR</a>
          <a href="/undrdr/log" className="cursor-pointer transition-colors hover:text-gray-100">LOG</a>
          <a href="/undrdr/queue" className="text-[#7dd3fc] cursor-pointer">QUEUE</a>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-10 md:px-12">
        <p className="accent-text-soft mb-1 font-mono text-xs">kika@portfolio:~$ ./queue</p>
        <h1 className="font-display text-3xl tracking-tighter text-white md:text-5xl">QUEUE.</h1>
        <p className="mt-2 mb-8 font-mono text-xs tracking-[0.2em] text-gray-500">
          paste text · extract links · validate · queue
        </p>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono text-xs text-gray-400">{queue.length} / {THRESHOLD}</span>
            <span className="font-mono text-[10px] text-gray-600">{Math.round(progress * 100)}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.04]">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#7dd3fc]/80 to-[#38bdf8]"
              initial={false}
              animate={{ width: `${progress * 100}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          </div>
          {queue.length >= THRESHOLD && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 font-mono text-xs text-[#7dd3fc]">
              ⚡ threshold reached — ready to merge
            </motion.p>
          )}
        </div>

        {/* Paste area */}
        <div className="mb-8">
          <textarea
            ref={textareaRef}
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder="paste text with github links...&#10;&#10;e.g. found these: github.com/owner/repo, github.com/another/one"
            rows={4}
            className="w-full resize-none rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-3 font-mono text-sm text-gray-300 placeholder-gray-600 outline-none transition-colors focus:border-[#7dd3fc]/30"
          />
          <div className="mt-2 flex items-center gap-3">
            <button
              onClick={handlePaste}
              disabled={!pasteText.trim() || processing}
              className="rounded-lg border border-[#7dd3fc]/20 bg-[#7dd3fc]/10 px-4 py-2 font-mono text-xs text-[#7dd3fc] transition-colors hover:bg-[#7dd3fc]/20 disabled:opacity-50"
            >
              {processing ? 'extracting...' : 'extract & validate'}
            </button>
            {queue.length > 0 && (
              <button
                onClick={handleClear}
                className="rounded-lg border border-white/[0.06] px-4 py-2 font-mono text-xs text-gray-500 transition-colors hover:border-red-500/30 hover:text-red-400"
              >
                clear all
              </button>
            )}
          </div>
        </div>

        {/* Extraction results */}
        <AnimatePresence>
          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-8 rounded-lg border border-white/[0.04] bg-white/[0.02] p-4"
            >
              {results.map((r, i) => (
                <div key={`${r.name}-${i}`} className="flex items-center gap-2 py-1 font-mono text-xs">
                  <span className={r.status === 'added' ? 'text-emerald-400' : r.status === 'skipped' ? 'text-yellow-400/60' : 'text-red-400/60'}>
                    {r.status === 'added' ? '+' : r.status === 'skipped' ? '~' : '×'}
                  </span>
                  <span className="text-gray-300">{r.name}</span>
                  <span className="text-gray-600">{r.detail}</span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats bar */}
        {queue.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-4 font-mono text-[11px] text-gray-500">
            <span>★ avg {avgStars}</span>
            <span>★ max {topStar}</span>
            {langs.slice(0, 6).map(([l, c]) => (
              <button
                key={l}
                onClick={() => setFilterLang(filterLang === l ? 'all' : l)}
                className={`transition-colors ${filterLang === l ? 'text-[#7dd3fc]' : 'hover:text-gray-300'}`}
              >
                {l}({c})
              </button>
            ))}
            {filterLang !== 'all' && (
              <button onClick={() => setFilterLang('all')} className="text-gray-600 hover:text-gray-400">✕ clear</button>
            )}
          </div>
        )}

        {/* Sort */}
        {queue.length > 1 && (
          <div className="mb-4 flex items-center gap-2 font-mono text-[10px] text-gray-600">
            sort:
            {(['newest', 'stars', 'name'] as const).map(s => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`transition-colors ${sortBy === s ? 'text-[#7dd3fc]' : 'hover:text-gray-400'}`}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Queue list */}
        {filtered.length > 0 && (
          <div className="flex flex-col gap-1.5">
            {filtered.map((repo) => (
              <motion.div
                key={repo.url}
                layout
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="group flex items-start gap-3 rounded-lg border border-white/[0.04] bg-white/[0.02] px-4 py-3 transition-colors hover:bg-white/[0.04]"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate font-mono text-sm text-[#7dd3fc] hover:text-white"
                    >
                      {repo.name}
                    </a>
                    <span className="shrink-0 font-mono text-[11px] text-gray-500">★ {repo.stars}</span>
                    <span className="shrink-0 font-mono text-[10px] text-gray-600">{repo.language}</span>
                  </div>
                  {repo.description && (
                    <p className="mt-1 truncate font-mono text-[11px] text-gray-500">{repo.description}</p>
                  )}
                  {repo.topics.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {repo.topics.slice(0, 4).map(t => (
                        <span key={t} className="rounded bg-white/[0.04] px-1.5 py-0.5 font-mono text-[9px] text-gray-600">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleRemove(repo.url)}
                  className="shrink-0 font-mono text-[10px] text-gray-700 transition-colors hover:text-red-400"
                  title="remove"
                >
                  ×
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {queue.length === 0 && (
          <div className="py-16 text-center font-mono text-xs text-gray-600">
            empty queue — paste some text above
          </div>
        )}
      </div>
    </div>
  );
}
