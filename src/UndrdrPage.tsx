import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';

type Repo = {
  name: string;
  url: string;
  tier: string;
  category: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  updated: string;
};

type ViewMode = 'grid' | 'list';
type SortBy = 'stars' | 'updated' | 'name';

const TIERS = ['All', 'RISEN', 'EDGE', 'GEM', 'LAB'] as const;

const TIER_COLORS: Record<string, { border: string; bg: string; text: string }> = {
  RISEN: { border: 'rgba(239, 68, 68, 0.35)', bg: 'rgba(127, 29, 29, 0.18)', text: '#fca5a5' },
  EDGE: { border: 'rgba(251, 191, 36, 0.35)', bg: 'rgba(146, 64, 14, 0.18)', text: '#fde68a' },
  GEM: { border: 'rgba(139, 92, 246, 0.45)', bg: 'rgba(49, 46, 129, 0.20)', text: '#c4b5fd' },
  LAB: { border: 'rgba(52, 211, 153, 0.35)', bg: 'rgba(6, 78, 59, 0.18)', text: '#6ee7b7' },
};

const LANG_COLORS: Record<string, string> = {
  Swift: '#f05138', Python: '#3572A5', TypeScript: '#3178c6', JavaScript: '#f1e05a',
  Rust: '#dea584', Go: '#00ADD8', Shell: '#89e051', 'C++': '#f34b7d',
  'C#': '#178600', Java: '#b07219', Kotlin: '#A97BFF', Dart: '#00B4AB',
  HTML: '#e34c26', PHP: '#4F5D95', Ruby: '#701516', Elixir: '#6e4a7e',
  Julia: '#a270ba', PowerShell: '#012456',
};

const CATEGORY_GROUPS: Record<string, string[]> = {
  'AI Agents': ['AI Agent', 'Multi-Agent', 'Agent Builder', 'Browser Agent', 'Planning Agent', 'Proactive Agent', 'Computer Use', 'Tool Use', 'Self-Evolving AI', 'Hermes Agent'],
  'Apple': ['Apple Intelligence', 'Apple ML', 'Apple NLP', 'MLX / Apple ML', 'App Intents', 'Mac Tool'],
  'Dev & Infra': ['Dev Tools', 'CLI Tool', 'TUI / Terminal', 'MCP Server', 'Self-Hosted', 'Privacy / Security', 'Productivity'],
  'Data & Models': ['Data AI', 'RAG / Memory', 'Local LLM', 'Gemma / Google', 'MoE / Mix', 'Reasoning', 'Prompt Tools', 'Security AI'],
  'Creative & Media': ['Creative Code', 'Generative Art', 'AI Music', 'AI Video', 'Design AI', 'Game Engine', 'AI + 3D', 'WebGL / 3D', 'AR / XR', 'Robotics', 'Simulation', 'Voice / Audio'],
  'Experimental': ['Experimental'],
};

const STORAGE_KEY = 'undrdr-fav';
const KIKAS_FAVS: string[] = []; // urls Kika starred — updated via "sync favs"

function loadFavs(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')); }
  catch { return new Set(); }
}

function FavButton({ url, favs, onToggle }: { url: string; favs: Set<string>; onToggle: (url: string) => void }) {
  const isFav = favs.has(url);
  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggle(url); }}
      className={`shrink-0 transition-colors ${isFav ? 'text-amber-400' : 'text-gray-700 hover:text-gray-500'}`}
      title={isFav ? 'remove from favorites' : 'add to favorites'}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
        <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    </button>
  );
}

function RepoCard({ repo, index, favs, onToggleFav }: { repo: Repo; index: number; favs: Set<string>; onToggleFav: (url: string) => void }) {
  const langColor = LANG_COLORS[repo.language] || '#8b8b8b';
  const tierMeta = TIER_COLORS[repo.tier];
  const owner = repo.name.split('/')[0];
  const shortName = repo.name.split('/').pop() || repo.name;

  const isFav = favs.has(repo.url);

  return (
    <motion.a
      href={repo.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`neon-hover group block rounded-xl border border-[#334155] bg-[#1E293B] px-5 py-5 transition-all duration-200 hover:border-[#475569] hover:bg-[#263548] ${isFav ? 'opacity-50' : ''}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.4), duration: 0.35, ease: 'easeOut' }}
    >
      <div className="mb-3 flex items-center gap-2.5">
        <FavButton url={repo.url} favs={favs} onToggle={onToggleFav} />
        {tierMeta && (
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase"
            style={{ color: tierMeta.text, background: tierMeta.bg, border: `1px solid ${tierMeta.border}` }}
          >
            {repo.category}
          </span>
        )}
        <span className="ml-auto flex items-center gap-3">
          <span className="text-sm text-gray-400 font-medium">★ {repo.stars.toLocaleString()}</span>
          {repo.forks > 0 && <span className="text-xs text-gray-500">⑂ {repo.forks}</span>}
        </span>
      </div>
      <h3 className="font-display text-base font-bold tracking-tight text-white leading-snug">{shortName}</h3>
      <p className="mt-0.5 font-mono text-[11px] text-gray-500">{owner}</p>
      <p className="mt-2 text-sm text-gray-300 leading-relaxed line-clamp-2">{repo.description}</p>
      <div className="mt-3 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: langColor }} />
          {repo.language || '—'}
        </span>
        <span className="text-[10px] text-gray-600">{repo.updated}</span>
      </div>
    </motion.a>
  );
}

function RepoListItem({ repo, index, favs, onToggleFav }: { repo: Repo; index: number; favs: Set<string>; onToggleFav: (url: string) => void }) {
  const langColor = LANG_COLORS[repo.language] || '#8b8b8b';
  const owner = repo.name.split('/')[0];
  const shortName = repo.name.split('/').pop() || repo.name;
  const isFav = favs.has(repo.url);

  return (
    <motion.a
      href={repo.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`neon-hover group flex items-center gap-4 rounded-lg border border-[#334155] bg-[#1E293B] px-4 py-3 transition-all duration-150 hover:border-[#475569] hover:bg-[#263548] ${isFav ? 'opacity-50' : ''}`}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.01, 0.3), duration: 0.2 }}
    >
      <FavButton url={repo.url} favs={favs} onToggle={onToggleFav} />
      <span className="flex min-w-0 flex-1 items-center gap-3">
        <span className="shrink-0 font-display text-sm font-bold text-white">{shortName}</span>
        <span className="shrink-0 font-mono text-[10px] text-gray-600">{owner}</span>
        <span className="hidden truncate text-xs text-gray-500 sm:block">{repo.description}</span>
      </span>
      <span className="flex shrink-0 items-center gap-4 text-xs">
        <span className="flex items-center gap-1.5 text-gray-500">
          <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: langColor }} />
          {repo.language || '—'}
        </span>
        <span className="w-14 text-right text-gray-400">★ {repo.stars.toLocaleString()}</span>
        <span className="w-10 text-right text-gray-600">{repo.updated}</span>
      </span>
    </motion.a>
  );
}

export default function UndrdrPage({ theme, onToggleTheme }: { theme: string; onToggleTheme: () => void }) {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTier, setActiveTier] = useState('All');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [maxStars, setMaxStars] = useState(Infinity);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('stars');
  const [favs, setFavs] = useState<Set<string>>(loadFavs);
  const [showFavsOnly, setShowFavsOnly] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [showAllCats, setShowAllCats] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [syncMsg, setSyncMsg] = useState('');

  const copyFavs = () => {
    const list = JSON.stringify([...favs]);
    navigator.clipboard.writeText(list).then(() => {
      setSyncMsg('copied!');
      setTimeout(() => setSyncMsg(''), 2000);
    });
  };

  const toggleFav = (url: string) => {
    setFavs((prev) => {
      const next = new Set(prev);
      next.has(url) ? next.delete(url) : next.add(url);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  };

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      next.has(group) ? next.delete(group) : next.add(group);
      return next;
    });
  };

  useEffect(() => {
    fetch('/assets/data/undrdr.json?v=' + Date.now())
      .then((r) => r.json())
      .then((data) => {
        setRepos(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Update meta tags for SEO
  useEffect(() => {
    document.title = 'UNDRDR — Hidden GitHub Repos That Deserve More Stars | AKAKIKA';
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', '683 hand-picked open source repositories flying under the radar. Discover hidden gems in AI agents, Apple tools, dev infrastructure, and creative code — curated by aka kika.');
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', 'UNDRDR — Hidden GitHub Repos That Deserve More Stars');
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', '683 hand-picked open source repositories flying under the radar. AI agents, Apple tools, dev infra, creative code — all under 1,000 stars.');
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', 'https://akakika.com/undrdr');

    // JSON-LD for crawlers
    const existing = document.getElementById('jsonld-undrdr');
    if (existing) existing.remove();
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'jsonld-undrdr';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'UNDRDR — Under the Radar',
      description: '683 hand-picked open source GitHub repositories that deserve more attention. Features repos in AI agents, Apple development, dev tools, creative code, data models, and experimental projects — all under 1,000 stars at time of curation.',
      url: 'https://akakika.com/undrdr',
      numberOfItems: repos.length,
      author: { '@type': 'Person', name: 'aka kika', url: 'https://akakika.com' },
      about: [
        { '@type': 'Thing', name: 'AI agents' },
        { '@type': 'Thing', name: 'Apple development tools' },
        { '@type': 'Thing', name: 'developer tools' },
        { '@type': 'Thing', name: 'creative code' },
      ],
      citation: [
        'https://github.com/dot-RealityTest/undrdr-vis',
        'https://github.com/dot-RealityTest/akakika',
      ],
      keywords: ['hidden github repos', 'open source discovery', 'under the radar repos', 'ai agent repos', 'apple dev tools', 'github curation', 'creative code github', 'developer tools 2026', 'open source gems', 'indie developer tools'],
    });
    document.head.appendChild(script);
    return () => {
      const s = document.getElementById('jsonld-undrdr');
      if (s) s.remove();
    };
  }, [repos]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of repos) {
      counts[r.category] = (counts[r.category] || 0) + 1;
    }
    return counts;
  }, [repos]);

  const sortedCategories = useMemo(
    () => Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]),
    [categoryCounts]
  );

  const topCategories = sortedCategories.slice(0, 10);

  const filtered = useMemo(() => {
    let result = repos;

    if (activeTier !== 'All') result = result.filter((r) => r.tier === activeTier);
    else result = result.filter((r) => r.tier !== 'RISEN');
    if (activeCategory) result = result.filter((r) => r.category === activeCategory);
    else if (activeGroup === "Kika's Fav") result = result.filter((r) => KIKAS_FAVS.includes(r.url));
    else if (activeGroup) result = result.filter((r) => CATEGORY_GROUPS[activeGroup]?.includes(r.category));
    if (maxStars < Infinity) result = result.filter((r) => r.stars <= maxStars);
    if (showFavsOnly) result = result.filter((r) => favs.has(r.url));

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          r.language.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case 'stars': return result.sort((a, b) => b.stars - a.stars);
      case 'updated': return result.sort((a, b) => a.updated.localeCompare(b.updated));
      case 'name': return result.sort((a, b) => a.name.localeCompare(b.name));
      default: return result;
    }
  }, [repos, activeTier, activeCategory, activeGroup, search, maxStars, sortBy, showFavsOnly, favs]);

  const tierCounts = useMemo(() => {
    const counts: Record<string, number> = { All: repos.filter((r) => r.tier !== 'RISEN').length };
    for (const r of repos) counts[r.tier] = (counts[r.tier] || 0) + 1;
    return counts;
  }, [repos]);

  const totalStars = useMemo(() => repos.reduce((s, r) => s + r.stars, 0), [repos]);
  const starOptions = [Infinity, 1000, 500, 100, 10] as const;

  return (
    <div className="min-h-[100dvh] bg-[#0a0a0a] text-white">
      {/* Sticky header */}
      <div className="sticky top-0 z-50 flex w-full items-center justify-between border-b border-white/[0.06] bg-[#0a0a0a]/90 px-6 py-4 backdrop-blur-xl md:px-12">
        <div className="flex items-center gap-2 font-display text-sm font-bold text-gray-100">
          <span className="bg-gray-200 px-2 py-1 text-black">AKA</span>
          <span className="tracking-widest">KIKA</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-xs tracking-widest text-gray-400 md:gap-6">
          <a href="/" className="cursor-pointer transition-colors hover:text-gray-100">HOME</a>
          <a href="/apps" className="cursor-pointer transition-colors hover:text-gray-100">APPS</a>
          <span className="text-gray-100">UNDRDR</span>
          <a href="/blog" className="cursor-pointer transition-colors hover:text-gray-100">BLOG</a>
          <a href="/goodnews" className="cursor-pointer transition-colors hover:text-gray-100">GOOD NEWS</a>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10 md:px-12">
        {/* Title */}
        <p className="accent-text-soft mb-1 font-mono text-xs">kika@portfolio:~$ ls undrdr/</p>
        <h1 className="font-display text-5xl tracking-tighter text-white md:text-7xl">UNDRDR.</h1>
        <p className="mt-2 mb-2 max-w-3xl font-sans text-lg leading-relaxed text-gray-200 md:text-xl">
          under the radar. github repos that deserve more eyes.
        </p>
        <p className="accent-text mb-8 font-mono text-xs tracking-[0.2em]">
          {repos.length} repos · {totalStars.toLocaleString()} stars ·{' '}
          <a href="/undrdr/graph" className="transition-colors hover:text-white">graph</a> ·{' '}
          <a href="/undrdr/submit" className="transition-colors hover:text-white">submit</a>
        </p>

        {/* GEO description for AI crawlers */}
        <div className="sr-only">
          <p>UNDRDR is a curated collection of 683 hand-picked open source GitHub repositories that deserve more attention. Each repo is under 1,000 stars at time of discovery. Categories include AI agents, Apple Intelligence tools, developer infrastructure, creative code, data models, and experimental projects. Updated weekly. Filter by tier (EDGE, GEM, LAB), category, programming language, or star count. Save favorites locally. See the interactive graph view at akakika.com/undrdr/graph where repos cluster by language and glow by heat tier.</p>
        </div>

        {/* Controls bar */}
        <div className="mb-5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
          {/* Row 1: Tiers + favs — scrollable on mobile */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setShowFavsOnly(!showFavsOnly)}
              className={`shrink-0 rounded-lg px-3 py-1.5 font-mono text-xs transition-colors ${
                showFavsOnly ? 'bg-amber-400/15 text-amber-400' : 'text-gray-500 hover:bg-white/[0.04] hover:text-gray-400'
              }`}
            >
              ★{favs.size > 0 && ` ${favs.size}`}
            </button>
            {TIERS.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTier(t)}
                className={`shrink-0 rounded-lg px-3 py-1.5 font-mono text-xs transition-colors ${
                  activeTier === t ? 'bg-white/[0.08] text-white' : 'text-gray-500 hover:bg-white/[0.04] hover:text-gray-400'
                }`}
              >
                {t}
              </button>
            ))}
            {/* Search — inline on desktop, full width on mobile */}
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="search..."
              className="hidden sm:ml-2 sm:block sm:w-48 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 font-mono text-xs text-gray-300 placeholder-gray-600 outline-none transition-colors focus:w-64 focus:border-white/[0.15]"
            />
            {/* Sort + view — right on desktop */}
            <div className="ml-auto hidden items-center gap-1 sm:flex">
              {(['stars', 'updated', 'name'] as SortBy[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  className={`rounded px-2 py-0.5 font-mono text-[11px] transition-colors ${
                    sortBy === s ? 'bg-white/[0.08] text-white' : 'text-gray-600 hover:text-gray-400'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="ml-auto hidden items-center gap-1 border-l border-white/[0.06] pl-4 sm:flex">
              <button
                onClick={() => setViewMode('grid')}
                className={`rounded p-1.5 transition-colors ${viewMode === 'grid' ? 'text-white' : 'text-gray-600 hover:text-gray-400'}`}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="1" y="1" width="5" height="5" rx="1" /><rect x="8" y="1" width="5" height="5" rx="1" />
                  <rect x="1" y="8" width="5" height="5" rx="1" /><rect x="8" y="8" width="5" height="5" rx="1" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`rounded p-1.5 transition-colors ${viewMode === 'list' ? 'text-white' : 'text-gray-600 hover:text-gray-400'}`}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="1" y1="3" x2="13" y2="3" /><line x1="1" y1="7" x2="13" y2="7" /><line x1="1" y1="11" x2="13" y2="11" />
                </svg>
              </button>
            </div>
          </div>
          {/* Row 2: Mobile search + sort + view */}
          <div className="mt-2 flex items-center gap-2 sm:hidden">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="search repos..."
              className="min-w-0 flex-1 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 font-mono text-sm text-gray-300 placeholder-gray-600 outline-none transition-colors focus:border-white/[0.15]"
            />
            <div className="flex items-center gap-1">
              {(['stars', 'updated', 'name'] as SortBy[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  className={`shrink-0 rounded px-2 py-1 font-mono text-[10px] transition-colors ${
                    sortBy === s ? 'bg-white/[0.08] text-white' : 'text-gray-600 hover:text-gray-400'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`rounded p-1 transition-colors ${viewMode === 'grid' ? 'text-white' : 'text-gray-600'}`}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="1" y="1" width="5" height="5" rx="1" /><rect x="8" y="1" width="5" height="5" rx="1" />
                  <rect x="1" y="8" width="5" height="5" rx="1" /><rect x="8" y="8" width="5" height="5" rx="1" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`rounded p-1 transition-colors ${viewMode === 'list' ? 'text-white' : 'text-gray-600'}`}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="1" y1="3" x2="13" y2="3" /><line x1="1" y1="7" x2="13" y2="7" /><line x1="1" y1="11" x2="13" y2="11" />
                </svg>
              </button>
            </div>
          </div>

          {/* Favorites count — subtle */}
          {favs.size > 0 && (
            <div className="mt-2 flex items-center justify-between border-t border-white/[0.04] pt-2">
              <span className="font-mono text-[10px] text-amber-400/50">
                ★ {favs.size} saved · click star on any repo to collect
              </span>
              <button
                onClick={copyFavs}
                className="rounded px-2 py-0.5 font-mono text-[10px] text-gray-600 transition-colors hover:text-amber-400"
                title="copy your fav list for sync"
              >
                {syncMsg || 'sync ↗'}
              </button>
            </div>
          )}
        </div>

        {/* Layout: sidebar + content */}
        <div className="mt-4 flex gap-6">
                    {/* Category sidebar — grouped */}
          <div className="hidden w-52 shrink-0 lg:block">
            <p className="mb-2 font-mono text-[9px] uppercase tracking-wider text-gray-600">categories</p>
            <div className="scrollbar-thin flex max-h-[calc(100vh-320px)] flex-col gap-1 overflow-y-auto">
              {/* Kika's Fav — always first */}
              <button
                onClick={() => {
                  setActiveGroup(activeGroup === "Kika's Fav" ? null : "Kika's Fav");
                  setActiveCategory(null);
                }}
                className={`flex w-full items-center justify-between rounded px-2 py-1.5 font-mono text-[11px] transition-colors ${
                  activeGroup === "Kika's Fav" ? 'bg-amber-400/10 text-amber-400' : 'text-amber-400/60 hover:text-amber-400'
                }`}
              >
                <span className="flex items-center gap-1.5">★ Kika's Fav</span>
                <span className="text-[10px]">{KIKAS_FAVS.length}</span>
              </button>
              <div className="mb-1 border-b border-white/[0.04]" />
              {Object.entries(CATEGORY_GROUPS).map(([group, subs]) => {
                const groupCount = subs.reduce((s, cat) => s + (categoryCounts[cat] || 0), 0);
                const isExpanded = expandedGroups.has(group);
                const hasActiveSub = activeCategory && subs.includes(activeCategory);
                return (
                  <div key={group}>
                    <button
                      onClick={() => {
                        setActiveGroup(activeGroup === group ? null : group);
                        setActiveCategory(null);
                        toggleGroup(group);
                      }}
                      className={`flex w-full items-center justify-between rounded px-2 py-1 font-mono text-[11px] transition-colors ${
                        activeGroup === group || hasActiveSub ? 'text-white' : 'text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span className={`text-[8px] transition-transform ${isExpanded ? 'rotate-90' : ''}`}>▶</span>
                        {group}
                      </span>
                      <span className="text-[10px] text-gray-600">{groupCount}</span>
                    </button>
                    {isExpanded && (
                      <div className="ml-4 flex flex-col gap-px">
                        {subs.filter(cat => categoryCounts[cat]).map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                            className={`flex w-full items-center justify-between rounded px-2 py-[3px] text-left font-mono text-[10px] transition-colors ${
                              activeCategory === cat
                                ? 'bg-white/[0.08] text-white'
                                : 'text-gray-500 hover:text-gray-300'
                            }`}
                          >
                            <span className="truncate">{cat}</span>
                            <span className="shrink-0 text-[9px] text-gray-600">{categoryCounts[cat]}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {(activeCategory || activeGroup) && (
              <button
                onClick={() => { setActiveCategory(null); setActiveGroup(null); }}
                className="mt-2 w-full rounded border border-white/[0.06] px-2 py-1 font-mono text-[10px] text-gray-600 transition-colors hover:text-gray-300"
              >
                {activeGroup === "Kika's Fav" ? "back to all ×" : "clear filter ×"}
              </button>
            )}
          </div>

{/* Content */}
          <div className="min-w-0 flex-1">
            {/* Result count */}
            <p className="mb-4 font-mono text-xs text-gray-600">
              {filtered.length} {filtered.length === 1 ? 'repo' : 'repos'}
              {activeCategory && <span className="text-gray-500"> in {activeCategory}</span>}
              {activeGroup === "Kika's Fav" && <span className="text-amber-400/60"> in ★ Kika's Fav</span>}
              {activeGroup && !activeCategory && activeGroup !== "Kika's Fav" && <span className="text-gray-500"> in {activeGroup}</span>}
              {search && <span className="text-gray-500"> matching "{search}"</span>}
            </p>

            {/* Results */}
            {loading ? (
              <div className="flex items-center gap-3 py-20 text-sm text-gray-400">
                <span className="blink h-4 w-3 accent-bg" /> scanning repos...
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((repo, i) => (
                  <RepoCard key={repo.url} repo={repo} index={i} favs={favs} onToggleFav={toggleFav} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {filtered.map((repo, i) => (
                  <RepoListItem key={repo.url} repo={repo} index={i} favs={favs} onToggleFav={toggleFav} />
                ))}
              </div>
            )}

            {filtered.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center py-20">
                <p className="font-mono text-sm text-gray-500">no repos found</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex h-20 items-center justify-center font-mono text-xs text-gray-600">EOF</div>
      </div>
    </div>
  );
}
