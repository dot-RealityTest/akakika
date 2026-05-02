import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';

type LoggedRepo = {
  name: string;
  url: string;
  stars: number;
  language: string;
  logged_at: string;
};

const LOG_KEY = 'undrdr-log';
const AUTH_KEY = 'undrdr-log-auth';

function extractRepoInfo(input: string): { owner: string; repo: string } | null {
  const trimmed = input.trim();
  // full URL: https://github.com/owner/repo or github.com/owner/repo
  const urlMatch = trimmed.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)/);
  if (urlMatch) return { owner: urlMatch[1], repo: urlMatch[2].replace(/\.git$/, '') };
  // owner/repo
  const simpleMatch = trimmed.match(/^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/);
  if (simpleMatch) return { owner: simpleMatch[1], repo: simpleMatch[2] };
  return null;
}

function loadLog(): LoggedRepo[] {
  try { return JSON.parse(localStorage.getItem(LOG_KEY) || '[]'); }
  catch { return []; }
}

export default function UndrdrLogPage({ theme, onToggleTheme }: { theme: string; onToggleTheme: () => void }) {
  const [authorized, setAuthorized] = useState(localStorage.getItem(AUTH_KEY) === 'true');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(false);

  const [input, setInput] = useState('');
  const [status, setStatus] = useState<{ type: 'idle' | 'checking' | 'success' | 'error'; msg: string }>({ type: 'idle', msg: '' });
  const [log, setLog] = useState<LoggedRepo[]>(loadLog);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const info = extractRepoInfo(input);
    if (!info) {
      setStatus({ type: 'error', msg: 'invalid format — use github.com/owner/repo or owner/repo' });
      return;
    }

    // check duplicate
    const url = `https://github.com/${info.owner}/${info.repo}`;
    if (log.some((r) => r.url === url)) {
      setStatus({ type: 'error', msg: 'already logged' });
      return;
    }

    setStatus({ type: 'checking', msg: `checking ${info.owner}/${info.repo}...` });

    try {
      const resp = await fetch(`https://api.github.com/repos/${info.owner}/${info.repo}`);
      if (!resp.ok) {
        setStatus({ type: 'error', msg: resp.status === 404 ? 'repo not found' : `github error (${resp.status})` });
        return;
      }
      const data = await resp.json();
      const stars = data.stargazers_count;
      if (stars >= 1000) {
        setStatus({ type: 'error', msg: `✗ ${stars.toLocaleString()} stars — over 1000 limit` });
        return;
      }

      const entry: LoggedRepo = {
        name: `${info.owner}/${info.repo}`,
        url: data.html_url,
        stars,
        language: data.language || 'Unknown',
        logged_at: new Date().toISOString().split('T')[0],
      };
      const next = [entry, ...log];
      setLog(next);
      localStorage.setItem(LOG_KEY, JSON.stringify(next));
      setStatus({ type: 'success', msg: `✓ ${entry.name} — ${stars} stars` });
      setInput('');
    } catch {
      setStatus({ type: 'error', msg: 'network error — try again' });
    }
  };

  const handleDelete = (url: string) => {
    const next = log.filter((r) => r.url !== url);
    setLog(next);
    localStorage.setItem(LOG_KEY, JSON.stringify(next));
  };

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
          <a href="/blog" className="cursor-pointer transition-colors hover:text-gray-100">BLOG</a>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-6 py-10 md:px-12">
        <p className="accent-text-soft mb-1 font-mono text-xs">kika@portfolio:~$ log repo</p>
        <h1 className="font-display text-3xl tracking-tighter text-white md:text-5xl">LOG.</h1>
        <p className="mt-2 mb-8 font-mono text-xs tracking-[0.2em] text-gray-500">
          paste a link · check stars · log it
        </p>

        {/* Input */}
        <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="github.com/owner/repo"
            className="min-w-0 flex-1 rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 font-mono text-sm text-gray-300 placeholder-gray-600 outline-none transition-colors focus:border-[#7dd3fc]/30"
          />
          <button
            type="submit"
            disabled={status.type === 'checking'}
            className="shrink-0 rounded-lg border border-[#7dd3fc]/20 bg-[#7dd3fc]/10 px-4 py-2.5 font-mono text-xs text-[#7dd3fc] transition-colors hover:bg-[#7dd3fc]/20 disabled:opacity-50"
          >
            {status.type === 'checking' ? '...' : 'log'}
          </button>
        </form>

        {/* Status */}
        {status.type !== 'idle' && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 font-mono text-xs ${
              status.type === 'success' ? 'text-emerald-400/80' : status.type === 'error' ? 'text-red-400/70' : 'text-gray-500'
            }`}
          >
            {status.msg}
          </motion.p>
        )}

        {/* Log */}
        {log.length > 0 && (
          <>
            <p className="mb-3 font-mono text-[10px] uppercase tracking-wider text-gray-600">{log.length} logged</p>
            <div className="flex flex-col gap-1.5">
              {log.map((repo) => (
                <motion.div
                  key={repo.url}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 rounded-lg border border-white/[0.04] bg-white/[0.02] px-4 py-3 transition-colors hover:bg-white/[0.04]"
                >
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-w-0 flex-1 truncate font-mono text-sm text-[#7dd3fc] hover:text-white"
                  >
                    {repo.name}
                  </a>
                  <span className="shrink-0 font-mono text-[11px] text-gray-500">★ {repo.stars}</span>
                  <span className="shrink-0 font-mono text-[10px] text-gray-600">{repo.language}</span>
                  <span className="hidden shrink-0 font-mono text-[10px] text-gray-700 sm:block">{repo.logged_at}</span>
                  <button
                    onClick={() => handleDelete(repo.url)}
                    className="shrink-0 font-mono text-[10px] text-gray-700 transition-colors hover:text-red-400"
                    title="remove"
                  >
                    ×
                  </button>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
