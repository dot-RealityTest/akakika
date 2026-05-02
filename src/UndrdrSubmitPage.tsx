import React, { useState } from 'react';
import { motion } from 'motion/react';

export default function UndrdrSubmitPage({ theme, onToggleTheme }: { theme: string; onToggleTheme: () => void }) {
  const [repoUrl, setRepoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!repoUrl.trim()) return;
    const subject = encodeURIComponent(`[UNDRDR] Submit: ${repoUrl.split('github.com/')[1] || repoUrl}`);
    const body = encodeURIComponent(
      `Hey Kika,\n\nI'd like to submit this repo for UNDRDR:\n\n🔗 ${repoUrl}\n\n📝 ${description || '(no description)'}\n\n—`
    );
    window.location.href = `mailto:info@akakika.com?subject=${subject}&body=${body}`;
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  // meta handled by useMeta in App.tsx

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

      <div className="mx-auto max-w-lg px-6 py-16 md:px-12">
        <p className="accent-text-soft mb-1 font-mono text-xs">kika@portfolio:~$ ./submit</p>
        <h1 className="font-display text-4xl tracking-tighter text-white md:text-5xl">SUBMIT A REPO.</h1>
        <p className="mt-3 mb-10 font-sans text-base leading-relaxed text-gray-400">
          know a repo flying under the radar? send it over. if it fits, it goes in.
        </p>

        <div className="flex flex-col gap-5">
          {/* Repo URL */}
          <div>
            <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-gray-600">
              repo url *
            </label>
            <input
              type="url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/owner/repo"
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-3 font-mono text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-white/[0.2]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-gray-600">
              why should we feature it?
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="optional — what makes this repo special?"
              rows={4}
              className="w-full resize-none rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-3 font-mono text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-white/[0.2]"
            />
          </div>

          {/* Submit */}
          <motion.button
            onClick={handleSubmit}
            disabled={!repoUrl.trim()}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={`mt-2 rounded-lg px-6 py-3 font-mono text-sm font-bold tracking-wider uppercase transition-all ${
              repoUrl.trim()
                ? 'bg-white text-black hover:bg-gray-200'
                : 'bg-white/[0.06] text-gray-600 cursor-not-allowed'
            }`}
          >
            {submitted ? '✓ email opened' : 'send to kika'}
          </motion.button>

          {submitted && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-mono text-xs text-gray-500"
            >
              your email client should have opened. hit send there.
            </motion.p>
          )}
        </div>

        <div className="mt-16 border-t border-white/[0.06] pt-6">
          <p className="font-mono text-[11px] text-gray-600">
            goes to <span className="text-gray-400">info@akakika.com</span> · reviewed manually · no guarantees but we look at everything
          </p>
        </div>

        <div className="flex h-20 items-center justify-center font-mono text-xs text-gray-600">EOF</div>
      </div>
    </div>
  );
}
