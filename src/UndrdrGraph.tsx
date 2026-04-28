import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

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

type Node = {
  id: string;
  repo: Repo;
  x: number;
  y: number;
  radius: number;
  color: string;
  glow: string;
  vx: number;
  vy: number;
  group: string;
};

type Edge = {
  source: string;
  target: string;
};

const TIER_COLORS: Record<string, { color: string; glow: string }> = {
  RISEN: { color: '#ef4444', glow: 'rgba(239,68,68,0.5)' },
  EDGE: { color: '#fbbf24', glow: 'rgba(251,191,36,0.4)' },
  GEM: { color: '#a78bfa', glow: 'rgba(167,139,250,0.4)' },
  LAB: { color: '#34d399', glow: 'rgba(52,211,153,0.35)' },
};

const LANG_COLORS: Record<string, string> = {
  Swift: '#f05138', Python: '#3572A5', TypeScript: '#3178c6', JavaScript: '#f1e05a',
  Rust: '#dea584', Go: '#00ADD8', Shell: '#89e051', 'C++': '#f34b7d',
  'C#': '#178600', Java: '#b07219', Kotlin: '#A97BFF', Dart: '#00B4AB',
  HTML: '#e34c26', PHP: '#4F5D95', Ruby: '#701516', Elixir: '#6e4a7e',
};

const CATEGORY_GROUPS: Record<string, string[]> = {
  'AI Agents': ['AI Agent', 'Multi-Agent', 'Agent Builder', 'Browser Agent', 'Planning Agent', 'Proactive Agent', 'Computer Use', 'Tool Use', 'Self-Evolving AI', 'Hermes Agent'],
  'Apple': ['Apple Intelligence', 'Apple ML', 'Apple NLP', 'MLX / Apple ML', 'App Intents', 'Mac Tool'],
  'Dev & Infra': ['Dev Tools', 'CLI Tool', 'TUI / Terminal', 'MCP Server', 'Self-Hosted', 'Privacy / Security', 'Productivity'],
  'Data & Models': ['Data AI', 'RAG / Memory', 'Local LLM', 'Gemma / Google', 'MoE / Mix', 'Reasoning', 'Prompt Tools', 'Security AI'],
  'Creative & Media': ['Creative Code', 'Generative Art', 'AI Music', 'AI Video', 'Design AI', 'Game Engine', 'AI + 3D', 'WebGL / 3D', 'AR / XR', 'Robotics', 'Simulation', 'Voice / Audio'],
  'Experimental': ['Experimental'],
};

function getGroup(category: string): string {
  for (const [group, subs] of Object.entries(CATEGORY_GROUPS)) {
    if (subs.includes(category)) return group;
  }
  return 'Other';
}

export default function UndrdrGraph() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hovered, setHovered] = useState<Node | null>(null);
  const [selected, setSelected] = useState<Node | null>(null);
  const [filter, setFilter] = useState('All');
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const [positions, setPositions] = useState<Map<string, { x: number; y: number }>>(new Map());
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const nodesRef = useRef<Node[]>([]);
  const edgesRef = useRef<Edge[]>([]);
  const animRef = useRef<number>(0);
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const isPanningRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const timeRef = useRef(0);

  // Build graph with cluster layout
  const buildGraph = useCallback((reposData: Repo[], filterGroup: string) => {
    const container = containerRef.current;
    if (!container) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    const filtered = filterGroup === 'All' ? reposData : reposData.filter(r => r.tier === filterGroup);

    const groups = Object.keys(CATEGORY_GROUPS);
    const groupAngles: Record<string, number> = {};
    groups.forEach((g, i) => { groupAngles[g] = (i / groups.length) * Math.PI * 2 - Math.PI / 2; });

    const nodes: Node[] = filtered.map((repo) => {
      const starScale = Math.min(1, Math.log10(repo.stars + 1) / 3);
      const tier = TIER_COLORS[repo.tier] || { color: '#666', glow: 'rgba(100,100,100,0.2)' };
      const group = getGroup(repo.category);
      const angle = groupAngles[group] || 0;
      const clusterR = Math.min(w, h) * 0.26;
      const jitter = 60 + Math.random() * 100;
      const cx = w / 2 + Math.cos(angle) * clusterR + (Math.random() - 0.5) * jitter;
      const cy = h / 2 + Math.sin(angle) * clusterR + (Math.random() - 0.5) * jitter;
      return {
        id: repo.url, repo,
        x: Math.max(20, Math.min(w - 20, cx)),
        y: Math.max(20, Math.min(h - 20, cy)),
        radius: 3 + starScale * 8,
        color: tier.color, glow: tier.glow,
        vx: (Math.random() - 0.5) * 0.1,
        vy: (Math.random() - 0.5) * 0.1,
        group,
      };
    });

    // Edges — language siblings + sparse category connections
    const edges: Edge[] = [];
    const langMap = new Map<string, Node[]>();
    const catMap = new Map<string, Node[]>();
    for (const node of nodes) {
      if (node.repo.language) {
        const ll = langMap.get(node.repo.language) || [];
        ll.push(node);
        langMap.set(node.repo.language, ll);
      }
      const g = getGroup(node.repo.category);
      const cl = catMap.get(g) || [];
      cl.push(node);
      catMap.set(g, cl);
    }
    // Language edges — every pair
    for (const [, list] of langMap) {
      if (list.length >= 2) {
        for (let i = 0; i < list.length - 1; i++) {
          edges.push({ source: list[i].id, target: list[i + 1].id });
        }
      }
    }
    // Category edges — every 2nd node
    for (const [, list] of catMap) {
      for (let i = 0; i < list.length - 1; i += 2) {
        edges.push({ source: list[i].id, target: list[Math.min(i + 1, list.length - 1)].id });
      }
    }
    // Force simulation
    const nodeMap = new Map<string, Node>();
    for (const n of nodes) nodeMap.set(n.id, n);
    for (let iter = 0; iter < 60; iter++) {
      const alpha = 1 - iter / 60;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const minDist = nodes[i].radius + nodes[j].radius + 4;
          if (dist < minDist * 3) {
            const force = (minDist * 3 - dist) / dist * alpha * 0.3;
            nodes[i].x -= dx * force; nodes[i].y -= dy * force;
            nodes[j].x += dx * force; nodes[j].y += dy * force;
          }
        }
      }
      for (const edge of edges) {
        const s = nodeMap.get(edge.source);
        const t = nodeMap.get(edge.target);
        if (!s || !t) continue;
        const dx = t.x - s.x;
        const dy = t.y - s.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const targetDist = 30 + (s.radius + t.radius);
        const force = (dist - targetDist) / dist * alpha * 0.01;
        s.x += dx * force; s.y += dy * force;
        t.x -= dx * force; t.y -= dy * force;
      }
      for (const node of nodes) {
        const group = getGroup(node.repo.category);
        const angle = groupAngles[group] || 0;
        const clusterR = Math.min(w, h) * 0.26;
        const tx = w / 2 + Math.cos(angle) * clusterR;
        const ty = h / 2 + Math.sin(angle) * clusterR;
        node.x += (tx - node.x) * alpha * 0.006;
        node.y += (ty - node.y) * alpha * 0.006;
        node.x += (w / 2 - node.x) * alpha * 0.001;
        node.y += (h / 2 - node.y) * alpha * 0.001;
      }
      for (const node of nodes) {
        node.x = Math.max(node.radius + 10, Math.min(w - node.radius - 10, node.x));
        node.y = Math.max(node.radius + 10, Math.min(h - node.radius - 10, node.y));
      }
    }

    nodesRef.current = nodes;
    edgesRef.current = edges;
    const posMap = new Map<string, { x: number; y: number }>();
    for (const n of nodes) posMap.set(n.id, { x: n.x, y: n.y });
    setPositions(posMap);
  }, []);

  // Fetch data
  useEffect(() => {
    fetch('/assets/data/undrdr.json')
      .then(r => { if (!r.ok) throw new Error(`${r.status}`); return r.json(); })
      .then(data => { setRepos(data); setLoading(false); buildGraph(data, filter); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  // Rebuild on filter
  useEffect(() => {
    if (repos.length > 0 && !loading) buildGraph(repos, filter);
  }, [filter, repos, loading, buildGraph]);

  // Ambient drift animation
  useEffect(() => {
    if (nodesRef.current.length === 0) return;
    let running = true;
    const tick = () => {
      if (!running) return;
      const nodes = nodesRef.current;
      const container = containerRef.current;
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      for (const node of nodes) {
        if (dragRef.current?.id === node.id) continue;
        const driftX = Math.sin(timeRef.current * 0.006 + node.x * 0.008) * 0.08;
        const driftY = Math.cos(timeRef.current * 0.005 + node.y * 0.008) * 0.08;
        node.x += node.vx + driftX;
        node.y += node.vy + driftY;
        if (node.x < 15) node.vx += 0.03;
        if (node.x > w - 15) node.vx -= 0.03;
        if (node.y < 15) node.vy += 0.03;
        if (node.y > h - 15) node.vy -= 0.03;
        node.vx *= 0.97;
        node.vy *= 0.97;
      }
      timeRef.current++;
      const posMap = new Map<string, { x: number; y: number }>();
      for (const n of nodes) posMap.set(n.id, { x: n.x, y: n.y });
      setPositions(posMap);
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => { running = false; cancelAnimationFrame(animRef.current); };
  }, [filter, repos, loading]);

  // Find node by screen position
  const findNode = (sx: number, sy: number): Node | null => {
    const gx = (sx - pan.x) / zoom;
    const gy = (sy - pan.y) / zoom;
    for (let i = nodesRef.current.length - 1; i >= 0; i--) {
      const node = nodesRef.current[i];
      const dx = node.x - gx;
      const dy = node.y - gy;
      if (Math.sqrt(dx * dx + dy * dy) < node.radius + 6) return node;
    }
    return null;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (dragRef.current) {
      const node = nodesRef.current.find(n => n.id === dragRef.current!.id);
      if (node) {
        node.x = (x - pan.x) / zoom - dragRef.current.offsetX;
        node.y = (y - pan.y) / zoom - dragRef.current.offsetY;
      }
      return;
    }
    if (isPanningRef.current) {
      setPan(p => ({ x: p.x + x - lastMouseRef.current.x, y: p.y + y - lastMouseRef.current.y }));
      lastMouseRef.current = { x, y };
      return;
    }
    const node = findNode(x, y);
    setHovered(node);
    setHoverPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    lastMouseRef.current = { x, y };
    const node = findNode(x, y);
    if (node) {
      const gx = (x - pan.x) / zoom;
      const gy = (y - pan.y) / zoom;
      dragRef.current = { id: node.id, offsetX: gx - node.x, offsetY: gy - node.y };
    } else {
      isPanningRef.current = true;
    }
  };

  const handleMouseUp = () => { dragRef.current = null; isPanningRef.current = false; };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.92 : 1.08;
    setZoom(z => Math.max(0.2, Math.min(5, z * delta)));
  };

  const handleClick = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const node = findNode(e.clientX - rect.left, e.clientY - rect.top);
    setSelected(node);
  };

  // Floating particles for atmosphere
  const particles = useMemo(() => {
    const p = [];
    for (let i = 0; i < 30; i++) {
      p.push({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: 1 + Math.random() * 2,
        duration: 15 + Math.random() * 20,
        delay: Math.random() * 10,
      });
    }
    return p;
  }, []);

  // Generate starfield dots (memoized)
  const starfield = useMemo(() => {
    const dots = [];
    for (let i = 0; i < 120; i++) {
      dots.push({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: 0.5 + Math.random() * 1.5,
        opacity: 0.1 + Math.random() * 0.2,
      });
    }
    return dots;
  }, []);

  // Cluster label positions
  const clusterLabels = useMemo(() => {
    if (nodesRef.current.length === 0) return [];
    const groups: Record<string, { x: number; y: number; count: number }> = {};
    for (const node of nodesRef.current) {
      const pos = positions.get(node.id);
      if (!pos) continue;
      if (!groups[node.group]) groups[node.group] = { x: 0, y: 0, count: 0 };
      groups[node.group].x += pos.x;
      groups[node.group].y += pos.y;
      groups[node.group].count++;
    }
    return Object.entries(groups).map(([name, g]) => ({
      name,
      x: g.x / g.count,
      y: g.y / g.count,
      count: g.count,
    }));
  }, [positions]);

  // Zoom controls
  const zoomIn = () => setZoom(z => Math.min(5, z * 1.3));
  const zoomOut = () => setZoom(z => Math.max(0.2, z / 1.3));
  const zoomReset = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  // Build edge lines for SVG — curved, subtle
  const edgeLines = useMemo(() => {
    const highlightId = hovered?.id || selected?.id;
    return edgesRef.current.map((edge, i) => {
      const s = positions.get(edge.source);
      const t = positions.get(edge.target);
      if (!s || !t) return null;
      const isHl = highlightId && (edge.source === highlightId || edge.target === highlightId);
      const isDim = highlightId && !isHl;

      // Curved path
      const mx = (s.x + t.x) / 2;
      const my = (s.y + t.y) / 2;
      const dx = t.x - s.x;
      const dy = t.y - s.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const curve = Math.min(dist * 0.15, 20);
      const cx = mx - dy * curve / dist;
      const cy = my + dx * curve / dist;

      const srcNode = nodesRef.current.find(n => n.id === edge.source);
      const edgeColor = isHl && srcNode ? srcNode.color : 'white';
      const opacity = isDim ? 0.015 : isHl ? 0.4 : 0.04;

      return (
        <path
          key={i}
          d={`M ${s.x} ${s.y} Q ${cx} ${cy} ${t.x} ${t.y}`}
          fill="none"
          stroke={edgeColor}
          strokeOpacity={opacity}
          strokeWidth={isHl ? 1.2 : 0.4}
        />
      );
    });
  }, [positions, hovered, selected]);

  const connectedIds = useMemo(() => {
    if (!selected) return new Set<string>();
    return new Set(
      edgesRef.current
        .filter(e => e.source === selected.id || e.target === selected.id)
        .map(e => e.source === selected.id ? e.target : e.source)
        .filter(id => id !== selected.id)
    );
  }, [selected]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <div className="mb-3 h-px w-16 bg-gradient-to-r from-transparent via-white/20 to-transparent mx-auto" />
          <div className="font-mono text-sm text-white/20">mapping connections...</div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <div className="font-mono text-sm text-red-400/60">failed to load</div>
          <div className="mt-2 font-mono text-[10px] text-white/20">{error}</div>
        </div>
      </div>
    );
  }

    const groups = ['All', 'RISEN', 'EDGE', 'GEM', 'LAB'];
  const highlightId = hovered?.id || selected?.id;

  return (
    <div className="relative w-screen bg-[#0a0a0a]" style={{ height: '100dvh' }}>
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between border-b border-white/[0.06] bg-[#0a0a0a]/90 px-6 py-4 backdrop-blur-xl">
        <div>
          <h1 className="font-mono text-sm font-bold text-white/80">
            UNDRDR <span className="text-[10px] uppercase tracking-[0.3em] text-white/20">graph</span>
          </h1>
          <p className="font-mono text-[10px] text-white/25">{nodesRef.current.length} nodes · {edgesRef.current.length} connections</p>
        </div>
        <div className="flex items-center gap-1">
          {groups.map(g => (
            <button key={g} onClick={() => setFilter(g)}
              className={`rounded-lg px-2 py-1 font-mono text-[10px] transition-colors ${filter === g ? 'bg-white/[0.08] text-white' : 'text-white/25 hover:text-white/40'}`}>
              {g}
            </button>
          ))}
        </div>
        <a href="/undrdr" className="rounded-lg border border-white/[0.08] px-3 py-1.5 font-mono text-[10px] text-white/40 hover:text-white/70">← list</a>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-20 rounded-lg border border-white/[0.06] bg-[#0a0a0a]/90 p-3 backdrop-blur-xl">
        <p className="mb-2 font-mono text-[9px] uppercase tracking-wider text-white/20">tiers</p>
        {Object.entries(TIER_COLORS).map(([name, { color }]) => (
          <div key={name} className="flex items-center gap-2 py-0.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }} />
            <span className="font-mono text-[10px] text-white/40">{name}</span>
          </div>
        ))}
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1">
        <button onClick={zoomIn} className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-[#0a0a0a]/90 font-mono text-sm text-white/40 backdrop-blur-xl transition-colors hover:text-white/70">+</button>
        <button onClick={zoomReset} className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-[#0a0a0a]/90 font-mono text-[9px] text-white/25 backdrop-blur-xl transition-colors hover:text-white/50">{Math.round(zoom * 100)}%</button>
        <button onClick={zoomOut} className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-[#0a0a0a]/90 font-mono text-sm text-white/40 backdrop-blur-xl transition-colors hover:text-white/70">−</button>
      </div>

      {/* Hover card */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className="pointer-events-none fixed z-30 w-72 rounded-xl border border-white/[0.1] bg-[#111]/95 p-4 shadow-2xl backdrop-blur-xl"
            style={{ left: Math.min(hoverPos.x + 16, window.innerWidth - 300), top: Math.min(hoverPos.y - 20, window.innerHeight - 180) }}
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-mono text-xs font-bold text-white">{hovered.repo.name.split('/').pop()}</h3>
                <p className="font-mono text-[10px] text-white/30">{hovered.repo.name.split('/')[0]}</p>
              </div>
              <span className="shrink-0 rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase"
                style={{ color: hovered.color, background: hovered.glow.replace(/[\d.]+\)$/, '0.12)'), border: `1px solid ${hovered.glow.replace(/[\d.]+\)$/, '0.25)')}` }}>
                {hovered.repo.tier}
              </span>
            </div>
            <p className="mb-3 line-clamp-2 font-sans text-[11px] leading-relaxed text-white/40">{hovered.repo.description || 'no description'}</p>
            <div className="flex items-center gap-3 font-mono text-[10px]">
              <span className="text-white/50">★ {hovered.repo.stars.toLocaleString()}</span>
              {hovered.repo.forks > 0 && <span className="text-white/25">⑂ {hovered.repo.forks}</span>}
              <span className="flex items-center gap-1 text-white/40">
                <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: LANG_COLORS[hovered.repo.language] || '#555' }} />
                {hovered.repo.language || '—'}
              </span>
              <span className="ml-auto text-white/20">{hovered.repo.category}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected panel */}
      <AnimatePresence>
        {selected ? (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            className="absolute right-4 top-20 z-20 w-80 rounded-xl border border-white/[0.08] bg-[#111]/95 p-5 backdrop-blur-xl">
            <div className="mb-3 flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <h2 className="font-mono text-sm font-bold text-white">{selected.repo.name.split('/').pop()}</h2>
                <p className="font-mono text-[10px] text-white/30">{selected.repo.name.split('/')[0]}</p>
              </div>
              <button onClick={() => setSelected(null)} className="font-mono text-lg text-white/20 hover:text-white/50">×</button>
            </div>
            <p className="mb-3 text-xs leading-relaxed text-white/50">{selected.repo.description}</p>
            <div className="mb-3 flex flex-wrap gap-2">
              <span className="rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase"
                style={{ color: selected.color, background: selected.glow.replace(/[\d.]+\)$/, '0.12)'), border: `1px solid ${selected.glow.replace(/[\d.]+\)$/, '0.25)')}` }}>
                {selected.repo.tier}
              </span>
              <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 font-mono text-[9px] text-white/30">{selected.repo.category}</span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[10px] text-white/30">
              <span>★ {selected.repo.stars.toLocaleString()}</span>
              {selected.repo.forks > 0 && <span>⑂ {selected.repo.forks}</span>}
              <span className="flex items-center gap-1">
                <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: LANG_COLORS[selected.repo.language] || '#555' }} />
                {selected.repo.language || '—'}
              </span>
            </div>
            <a href={selected.repo.url} target="_blank" rel="noopener noreferrer"
              className="mt-4 block rounded-lg cta-btn px-3 py-2 text-center font-mono text-[10px] font-semibold">
              open on github →
            </a>
            {/* Connected repos */}
            {(() => {
              const connected = edgesRef.current
                .filter(e => e.source === selected.id || e.target === selected.id)
                .map(e => e.source === selected.id ? e.target : e.source)
                .filter(id => id !== selected.id)
                .map(id => nodesRef.current.find(n => n.id === id))
                .filter(Boolean) as Node[];
              if (connected.length === 0) return null;
              return (
                <div className="mt-4 border-t border-white/[0.06] pt-3">
                  <p className="mb-2 font-mono text-[9px] uppercase tracking-wider text-white/20">{connected.length} connected</p>
                  <div className="max-h-64 space-y-1 overflow-y-auto">
                    {connected.slice(0, 20).map(cn => (
                      <button key={cn.id} onClick={(e) => { e.stopPropagation(); setSelected(cn); }}
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-white/[0.06]">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: cn.color }} />
                        <span className="min-w-0 flex-1 truncate font-mono text-[10px] text-white/50">{cn.repo.name.split('/').pop()}</span>
                        <span className="shrink-0 font-mono text-[9px] text-white/20">★ {cn.repo.stars.toLocaleString()}</span>
                      </button>
                    ))}
                    {connected.length > 20 && <p className="px-2 font-mono text-[9px] text-white/15">+{connected.length - 20} more</p>}
                  </div>
                </div>
              );
            })()}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="pointer-events-none absolute right-4 top-20 z-20 w-80 rounded-xl border border-white/[0.04] bg-[#0a0a0a]/60 p-5 backdrop-blur-sm">
            <p className="font-mono text-[10px] text-white/15">click a node to explore connections</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-white/10" />
              <span className="font-mono text-[9px] text-white/10">drag to pan · scroll to zoom</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Graph container — SVG edges + DOM nodes */}
      <div ref={containerRef} className="absolute inset-0 overflow-hidden cursor-crosshair touch-none"
        style={{ background: 'radial-gradient(ellipse at center, #12121a 0%, #0a0a0a 70%)' }}
        onMouseMove={handleMouseMove} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}
        onMouseLeave={() => { setHovered(null); dragRef.current = null; isPanningRef.current = false; }}
        onClick={handleClick} onWheel={handleWheel}>

        {/* Starfield */}
        {starfield.map((dot, i) => (
          <div key={`star-${i}`} className="pointer-events-none absolute rounded-full bg-white"
            style={{ left: dot.left, top: dot.top, width: dot.size, height: dot.size, opacity: dot.opacity }} />
        ))}

        {/* Floating particles */}
        {particles.map((p, i) => (
          <div key={`particle-${i}`} className="pointer-events-none absolute rounded-full bg-white/[0.06]"
            style={{
              left: p.left, top: p.top,
              width: p.size, height: p.size,
              animation: `float-particle ${p.duration}s ease-in-out ${p.delay}s infinite`,
            }} />
        ))}

        {/* SVG for edges — hidden by default, shown on hover/select */}
        {highlightId && (
          <svg className="absolute inset-0" width="100%" height="100%" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: '0 0' }}>
            {edgesRef.current
              .filter(e => e.source === highlightId || e.target === highlightId)
              .map((edge, i) => {
                const s = positions.get(edge.source);
                const t = positions.get(edge.target);
                if (!s || !t) return null;
                const node = nodesRef.current.find(n => n.id === edge.source);
                return (
                  <line key={i}
                    x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                    stroke={node?.color || 'white'}
                    strokeOpacity={0.2}
                    strokeWidth={0.6}
                  />
                );
              })}
          </svg>
        )}

        {/* Cluster labels */}
        {clusterLabels.map((cl) => (
          <div key={cl.name} className="pointer-events-none absolute font-mono text-[10px] uppercase tracking-[0.2em] text-white/[0.08]"
            style={{ left: cl.x * zoom + pan.x, top: cl.y * zoom + pan.y, transform: 'translate(-50%, -50%)' }}>
            {cl.name}
          </div>
        ))}

        {/* DOM nodes */}
        {nodesRef.current.map((node) => {
          const pos = positions.get(node.id);
          if (!pos) return null;
          const isHighlight = node.id === highlightId;
          const isConnected = highlightId && connectedIds.has(node.id);
          const dimmed = highlightId && !isHighlight && !isConnected;
          const d = node.radius * 2;
          return (
            <div key={node.id}
              className="absolute rounded-full"
              style={{
                left: (pos.x - node.radius) * zoom + pan.x,
                top: (pos.y - node.radius) * zoom + pan.y,
                width: d * zoom,
                height: d * zoom,
                backgroundColor: dimmed ? 'rgba(255,255,255,0.04)' : node.color,
                border: isHighlight ? `2px solid ${node.color}` : `${node.color}30` + ' solid 1px',
                opacity: dimmed ? 0.2 : 1,
                boxShadow: isHighlight
                  ? `0 0 ${14 * zoom}px ${node.glow}, 0 0 ${28 * zoom}px ${node.glow}`
                  : isConnected
                    ? `0 0 ${8 * zoom}px ${node.glow}`
                    : 'none',
                zIndex: isHighlight ? 10 : isConnected ? 5 : 1,
              }}
            />
          );
        })}

        {/* Label under highlighted node */}
        {highlightId && (() => {
          const node = nodesRef.current.find(n => n.id === highlightId);
          if (!node) return null;
          const pos = positions.get(node.id);
          if (!pos) return null;
          const label = node.repo.name.split('/').pop() || node.repo.name;
          return (
            <div className="pointer-events-none absolute z-20 rounded-md bg-black/70 px-2.5 py-1 font-mono text-[10px] text-white shadow-lg"
              style={{ left: pos.x * zoom + pan.x, top: (pos.y + node.radius + 6) * zoom + pan.y, transform: 'translateX(-50%)' }}>
              {label}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
