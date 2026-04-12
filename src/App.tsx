import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useMotionValueEvent, useScroll, useTransform } from 'motion/react';
import Lenis from 'lenis';

type NavigateFn = (path: string) => void;
type ThemeName = 'purple' | 'cyan' | 'amber';

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

const navigateTo = (path: string) => {
  if (window.location.pathname !== path) {
    window.history.pushState({}, '', path);
  }
  window.scrollTo({ top: 0, behavior: 'auto' });
  window.dispatchEvent(new PopStateEvent('popstate'));
};

const Typewriter: React.FC<{ text: string; delay?: number; onComplete?: () => void; cursor?: boolean; cursorClass?: string }> = ({
  text,
  delay = 0,
  onComplete,
  cursor = false,
  cursorClass = 'accent-bg',
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;

    if (currentIndex < text.length) {
      const randomDelay = Math.random() * 40 + 10;
      const char = text[currentIndex];
      const pause = char === '.' || char === ',' ? 150 : char === ' ' ? 40 : 0;

      const timer = setTimeout(() => {
        setDisplayedText((prev) => prev + char);
        setCurrentIndex((prev) => prev + 1);
      }, randomDelay + pause);

      return () => clearTimeout(timer);
    }

    onCompleteRef.current?.();
  }, [currentIndex, text, started]);

  return (
    <span>
      {displayedText}
      {cursor && <span className={`blink ml-1 inline-block h-4 w-2 align-middle ${cursorClass}`} />}
    </span>
  );
};

const TerminalBlock: React.FC<{ lines: string[]; delay?: number; prefix?: string; showCursor?: boolean; cursorClass?: string }> = ({
  lines,
  delay = 0,
  prefix = 'kika@portfolio:~$ ',
  showCursor = false,
  cursorClass = 'accent-bg',
}) => {
  const [currentLine, setCurrentLine] = useState(0);

  return (
    <>
      {lines.map((line, index) =>
        index <= currentLine ? (
          <p key={index}>
            {prefix}
            <Typewriter
              text={line}
              delay={index === 0 ? delay : 0}
              onComplete={() => {
                if (index < lines.length - 1) {
                  setCurrentLine((prev) => Math.max(prev, index + 1));
                }
              }}
              cursor={showCursor && index === currentLine}
              cursorClass={cursorClass}
            />
          </p>
        ) : null,
      )}
    </>
  );
};

const BlogNavLink: React.FC<{ path: string; children: React.ReactNode; className?: string }> = ({ path, children, className }) => (
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

const useSmoothScroll = (wrapperRef: React.RefObject<HTMLElement | HTMLDivElement | null>, contentRef?: React.RefObject<HTMLElement | HTMLDivElement | null>) => {
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const lenis = new Lenis({
      wrapper,
      content: contentRef?.current ?? (wrapper.firstElementChild as HTMLElement | null) ?? undefined,
      duration: 1.15,
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 1.1,
      wheelMultiplier: 0.9,
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = window.requestAnimationFrame(raf);
    };

    frame = window.requestAnimationFrame(raf);

    return () => {
      window.cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [wrapperRef, contentRef]);
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
    className="home-toolbar sticky top-0 z-50 mb-12 flex w-full items-center justify-between px-6 py-4 text-sm font-bold md:px-12 -mt-6 md:-mt-12"
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


const Phase0: React.FC<{
  isScriptRunning: boolean;
  scrollProgress: number;
  isStarting: boolean;
  hasBooted: boolean;
  theme: ThemeName;
  onToggleTheme: () => void;
  mousePos: { x: number; y: number };
  transitionDirection: 1 | -1;
}> = ({ isScriptRunning, scrollProgress, isStarting, hasBooted, theme, onToggleTheme, mousePos, transitionDirection }) => (
  <motion.div
    className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0a] font-mono dotted-bg"
    initial={{ opacity: 0, scale: 0.95, y: transitionDirection === -1 ? '-18vh' : 0 }}
    animate={{
      opacity: 1 - scrollProgress * 0.2,
      scale: 1 + scrollProgress * 0.05,
      filter: isStarting
        ? 'brightness(1.5) contrast(1.5) hue-rotate(20deg)'
        : `brightness(${1 + scrollProgress * 0.5}) contrast(${1 + scrollProgress}) hue-rotate(${scrollProgress * 45 * mousePos.x}deg)`,
      skewX: scrollProgress * 10 * mousePos.x,
      skewY: scrollProgress * 5 * mousePos.y,
      y: scrollProgress * -50,
    }}
    exit={{
      y: transitionDirection === -1 ? '18vh' : '-28vh',
      opacity: 0,
      scale: 1.04,
      filter: `brightness(1.6) contrast(1.6) hue-rotate(${90 * mousePos.x}deg) blur(4px)`,
    }}
    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
  >
    <AnimatePresence>
      {isScriptRunning && (
        <motion.div
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 0.3, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="pointer-events-none absolute inset-0 vaporwave-grid-container"
        >
          <div className="vaporwave-grid" />
        </motion.div>
      )}
    </AnimatePresence>
    <div className="home-toolbar absolute top-0 left-0 z-10 flex w-full items-center justify-between p-4 text-sm font-bold text-gray-100 md:p-6">
      <div className="flex items-center gap-2">
        <span className="bg-gray-200 px-2 py-1 text-black">AKA</span>
        <span className="tracking-widest">KIKA</span>
        <div className="blink h-5 w-3 accent-bg" />
      </div>
      <div className="flex items-center gap-3 tracking-widest md:gap-6">
        <span>WORK</span>
        <BlogNavLink path="/apps" className="hover-accent-text cursor-pointer transition-colors">
          APPS
        </BlogNavLink>
        <BlogNavLink path="/undrdr" className="hover-accent-text cursor-pointer transition-colors">
          UNDRDR
        </BlogNavLink>
        <BlogNavLink path="/blog" className="hover-accent-text cursor-pointer transition-colors">
          BLOG
        </BlogNavLink>
        <BlogNavLink path="/goodnews" className="hover-accent-text cursor-pointer transition-colors">
          GOOD NEWS ✦
        </BlogNavLink>
        <span>ABOUT</span>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
    </div>
    <div className="accent-text absolute top-24 left-6 z-10 flex flex-col gap-1 text-[10px] opacity-80 md:text-sm">
      {isScriptRunning ? (
        <TerminalBlock lines={['boot sequence engaged', 'mounting memory layer', 'line_format', 'welcome', '']} delay={120} showCursor={true} />
      ) : (
        <p>
          mady_by.kika {hasBooted ? 'waiting...' : <span className="blink accent-bg inline-block h-4 w-2 align-middle" />}
        </p>
      )}
    </div>
    <motion.div
      className="phase0-hero z-10 flex flex-col items-center"
      animate={{
        y: -scrollProgress * 32,
        scale: 1 + scrollProgress * 0.035,
        opacity: 1 - scrollProgress * 0.28,
      }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <div className="phase0-kicker mb-6 flex items-center gap-3 text-[10px] tracking-[0.35em] text-gray-300 md:text-xs">
        <span>digital craft</span>
        <span className="h-px w-10 bg-white/20" />
        <span>macos systems</span>
      </div>
      <h1 className="glitch-wrapper glitch-p1 font-display text-[15vw] leading-none tracking-tighter" data-text="KIKA">
        KIKA
      </h1>
      <motion.p
        className="phase0-subtitle mt-5 max-w-3xl text-center text-xs tracking-[0.28em] text-gray-200 md:text-base"
        animate={{ opacity: isScriptRunning ? 1 : hasBooted ? 0.65 : 0.3, y: isScriptRunning ? 0 : hasBooted ? 2 : 6 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        Navigating the digital unknown, pixel by pixel.
      </motion.p>
      {isScriptRunning && (
        <div className="accent-text mt-8 text-xs md:text-base">
          kika@portfolio:~$ <Typewriter text="initializing sequence..." cursor={true} cursorClass="bg-gray-300" delay={240} />
        </div>
      )}
    </motion.div>
    <div className="accent-text absolute bottom-8 left-6 z-10 flex flex-col gap-1 text-[10px] opacity-80 md:text-sm">
      {isScriptRunning && (
        <TerminalBlock
          lines={[
            'runm: script',
            'phase 01 booting...',
            'phase 02 syncing...',
            'phase 03 parsing...',
            'phase 04 stabilizing...',
            'phase 05 rendering...',
            'phase 06 readying...',
            '',
            '> ',
          ]}
          delay={520}
          showCursor={true}
        />
      )}
    </div>
    {isScriptRunning ? (
      <div
        className="absolute right-8 bottom-8 z-10 animate-pulse text-xs text-gray-500"
        style={{ opacity: Math.min(1, 0.5 + scrollProgress), color: scrollProgress > 0.8 ? '#818cf8' : '' }}
      >
        [ {scrollProgress > 0.8 ? 'INITIATING...' : 'SCROLL TO CONTINUE'} ]
      </div>
    ) : hasBooted ? (
      <motion.div
        className="accent-text-soft absolute right-8 bottom-8 z-10 text-xs tracking-[0.25em]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        [ BOOTING... ]
      </motion.div>
    ) : null}
  </motion.div>
);

const Phase1: React.FC<{
  onPrev: () => void;
  onMaxScrollChange: (max: number) => void;
  theme: ThemeName;
  onToggleTheme: () => void;
  transitionDirection: 1 | -1;
}> = ({ onPrev, onMaxScrollChange, theme, onToggleTheme, transitionDirection }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const returnAccumulatorRef = useRef(0);
  const { scrollYProgress } = useScroll({ container: scrollRef });

  useSmoothScroll(scrollRef, contentRef);

  const maxScroll = useMotionValue(0);
  const lastReportedMaxRef = useRef(0);

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (latest > maxScroll.get()) {
      maxScroll.set(latest);
      if (latest - lastReportedMaxRef.current > 0.05 || latest === 1) {
        lastReportedMaxRef.current = latest;
        onMaxScrollChange(latest);
      }
    }
  });

  const yText = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const yCard1 = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const yCard2 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const yCard3 = useTransform(scrollYProgress, [0, 1], [0, -400]);
  const yCard4 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const yCard5 = useTransform(scrollYProgress, [0, 1], [0, -350]);
  const card1Scale = useTransform(scrollYProgress, [0, 0.2, 0.55], [1, 1.02, 0.96]);
  const card2Scale = useTransform(scrollYProgress, [0.08, 0.4, 0.78], [0.94, 1.01, 0.97]);
  const card3Scale = useTransform(scrollYProgress, [0.24, 0.62, 1], [0.92, 1, 0.98]);
  const card4Scale = useTransform(scrollYProgress, [0.05, 0.35, 0.7], [0.95, 1.01, 0.96]);
  const card5Scale = useTransform(scrollYProgress, [0.18, 0.55, 0.9], [0.93, 1, 0.97]);
  const card1Opacity = useTransform(scrollYProgress, [0, 0.16, 0.5], [0.82, 1, 0.62]);
  const card2Opacity = useTransform(scrollYProgress, [0.1, 0.38, 0.76], [0.42, 1, 0.72]);
  const card3Opacity = useTransform(scrollYProgress, [0.26, 0.64, 1], [0.3, 1, 1]);
  const card4Opacity = useTransform(scrollYProgress, [0.08, 0.42, 0.8], [0.5, 1, 0.68]);
  const card5Opacity = useTransform(scrollYProgress, [0.2, 0.58, 0.95], [0.35, 1, 0.9]);
  const card1Rotate = useTransform(scrollYProgress, [0, 0.45], [-1.5, 0.6]);
  const card2Rotate = useTransform(scrollYProgress, [0.08, 0.55], [1.8, -0.4]);
  const card3Rotate = useTransform(scrollYProgress, [0.22, 0.8], [-1.2, 0.3]);
  const card4Rotate = useTransform(scrollYProgress, [0.06, 0.5], [2, -0.6]);
  const card5Rotate = useTransform(scrollYProgress, [0.18, 0.65], [-1.8, 0.5]);
  const projectTitleX = useTransform(scrollYProgress, [0.1, 0.4, 0.72], [0, 420, 1400]);
  const projectTitleOpacity = useTransform(scrollYProgress, [0.1, 0.48, 0.76], [1, 0.42, 0]);
  const projectTitleSkew = useTransform(scrollYProgress, [0.12, 0.38, 0.68], [0, 10, 18]);
  const projectTitleBlur = useTransform(scrollYProgress, [0.22, 0.7], [0, 14]);
  const projectTitleFilter = useTransform(projectTitleBlur, (value) => `blur(${value}px)`);
  const opacityGhost = useTransform(() => {
    const current = scrollYProgress.get();
    const max = maxScroll.get();
    const topOpacity = 0.74 - max * 0.18;
    if (current < 0.58) return Math.max(0.3, topOpacity - current * 0.32);
    if (current < 0.86) return 0.24 - (current - 0.58) * 0.42;
    return Math.max(0.08, 0.12 - (current - 0.86) * 0.28);
  });

  const scaleGhost = useTransform(() => {
    const current = scrollYProgress.get();
    const max = maxScroll.get();
    const topScale = 1 + max * 0.22;
    return topScale + current * 0.16;
  });

  const filterGhost = useTransform(() => {
    const current = scrollYProgress.get();
    const max = maxScroll.get();
    const topBlur = 6 + max * 8;
    return `blur(${topBlur + current * 14}px)`;
  });

  const yGhost = useTransform(scrollYProgress, [0, 1], [-80, -360]);
  const xGhost = useTransform(scrollYProgress, [0, 1], [120, 190]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let touchStartY = 0;
    const returnThreshold = 240;

    const handleWheel = (event: WheelEvent) => {
      if (el.scrollTop <= 0 && event.deltaY < 0) {
        returnAccumulatorRef.current += Math.abs(event.deltaY);
        if (returnAccumulatorRef.current > returnThreshold) {
          returnAccumulatorRef.current = 0;
          onPrev();
        }
      } else if (event.deltaY > 0) {
        returnAccumulatorRef.current = 0;
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      touchStartY = event.touches[0].clientY;
    };

    const handleTouchMove = (event: TouchEvent) => {
      const touchY = event.touches[0].clientY;
      const deltaY = touchStartY - touchY;
      if (el.scrollTop <= 0 && deltaY < 0) {
        returnAccumulatorRef.current += Math.abs(deltaY);
        if (returnAccumulatorRef.current > returnThreshold) {
          returnAccumulatorRef.current = 0;
          onPrev();
        }
      } else if (deltaY > 0) {
        returnAccumulatorRef.current = 0;
      }
    };

    el.addEventListener('wheel', handleWheel);
    el.addEventListener('touchstart', handleTouchStart);
    el.addEventListener('touchmove', handleTouchMove);

    return () => {
      returnAccumulatorRef.current = 0;
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
    };
  }, [onPrev]);

  const container = {
    hidden: { y: '100vh' },
    show: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.03,
        delayChildren: 0.2,
      },
    },
    exit: {
      y: transitionDirection === -1 ? '20vh' : '100vh',
      opacity: transitionDirection === -1 ? 0 : 1,
      scale: transitionDirection === -1 ? 0.985 : 1,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  };

  return (
    <motion.div
      ref={scrollRef}
      className="absolute inset-0 overflow-x-hidden overflow-y-auto bg-[#0a0a0a] font-mono text-gray-100 dotted-bg"
      initial={{ y: '20vh', opacity: 0, scale: 0.985 }}
      animate="show"
      variants={container}
    >
      <div ref={contentRef} className="relative min-h-full">
        <HomeStickyHeader theme={theme} onToggleTheme={onToggleTheme} />
        <div className="relative flex min-h-screen flex-col overflow-hidden p-6 md:p-12">
          <motion.div
            style={{ opacity: opacityGhost, scale: scaleGhost, y: yGhost, x: xGhost, filter: filterGhost }}
            className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center"
          >
            <h1 className="glitch-wrapper glitch-p1 accent-ghost absolute font-display text-[15vw] leading-none tracking-tighter" data-text="KIKA">
              KIKA
            </h1>
          </motion.div>

          <motion.div style={{ y: yText }} className="section-copy accent-text-soft relative z-10 mt-20 flex max-w-3xl flex-1 flex-col justify-center gap-2 text-sm leading-relaxed md:text-base">
            <motion.p variants={item} className="accent-text mb-4">
              kika@portfolio:~$ cat i_exist.txt
            </motion.p>

            <motion.p variants={item}>
              <strong className="font-bold text-gray-100">Not a developer.</strong>
            </motion.p>
            <motion.p variants={item} className="mt-2">
              Twenty years, 35 countries, 1000+ shows.
            </motion.p>
            <motion.p variants={item} className="mt-2">
              Retired from music.
              <br />
              Not a DJ.
              <br />
              i make things.
            </motion.p>
            <motion.p variants={item} className="mt-4">
              nica, still nica. some veronica. aka kika.
              <br />
              (the girl who chose midi over a driver's license)
            </motion.p>

            <motion.p variants={item} className="mt-6">
              - <strong className="font-bold text-gray-100">Kika</strong>
              <br />
              <em className="opacity-80">*Age 36, Year 1 of the Second Act*</em>
            </motion.p>

            <motion.blockquote variants={item} className="accent-border-left mt-6 pl-4 italic opacity-70">
              *With permission to drive since 2021*
            </motion.blockquote>

            <motion.p variants={item} className="accent-text mt-8">
              kika@portfolio:~$
            </motion.p>
          </motion.div>
        </div>

        <div className="project-stage relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col justify-center gap-32 p-6 md:p-12">
        <div className="project-intro mb-12 grid gap-6 md:grid-cols-[180px_minmax(0,1fr)] md:items-end">
          <div className="project-kicker accent-text text-[10px] tracking-[0.35em] md:text-xs">
            <p>selected work</p>
            <p className="mt-2 text-gray-500">things that escaped the notebook</p>
          </div>
          <motion.div
            style={{
              x: projectTitleX,
              opacity: projectTitleOpacity,
              skewX: projectTitleSkew,
              filter: projectTitleFilter,
            }}
            className="project-title-block"
          >
            <h2 className="mb-2 font-display text-4xl tracking-tighter text-gray-100 md:text-7xl">things i made.</h2>
            <p className="glitch-wrapper glitch-p0 accent-text w-fit font-display text-xl tracking-widest md:text-2xl" data-text="things that made me...">
              things that made me...
            </p>
          </motion.div>
        </div>

        <a href="https://akakika.com/mochi/" target="_blank" rel="noopener noreferrer" className="block">
          <motion.div
            style={{ y: yCard1, scale: card1Scale, opacity: card1Opacity, rotateZ: card1Rotate }}
            className="accent-panel project-card group relative p-8 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] accent-panel-hover"
          >
            <div className="accent-text absolute -top-3 -left-3 bg-[#0a0a0a] px-2 text-xs">FILE_01</div>
            <div className="mb-4 flex items-center gap-4">
              <img src="https://akakika.com/mochi/assets/app_icon.png" alt="Mochi" className="h-12 w-12 rounded-xl object-contain" />
              <h2 className="project-title font-display text-3xl tracking-tighter text-gray-100 md:text-5xl">MOCHI'S DAILY QUEST</h2>
            </div>
            <p className="mb-6 max-w-2xl text-sm text-gray-200 md:text-base">
              A retro Tamagotchi-style to-do companion who grows happier — and older — every time you get things done. Pixel productivity pal.
            </p>
            <div className="accent-text flex gap-4 text-xs">
              <span>[MACOS]</span>
              <span>[PRODUCTIVITY]</span>
              <span>[GAMIFICATION]</span>
            </div>
          </motion.div>
        </a>

        <a href="https://akakika.com/resq/" target="_blank" rel="noopener noreferrer" className="block md:ml-auto md:w-3/4">
          <motion.div
            style={{ y: yCard2, scale: card2Scale, opacity: card2Opacity, rotateZ: card2Rotate }}
            className="accent-panel project-card resq-theme-card group relative p-8 backdrop-blur-sm transition-all duration-500 hover:scale-[1.02]"
          >
            <div className="accent-text absolute -top-3 -left-3 bg-[#0a0a0a] px-2 text-xs transition-colors duration-500 group-hover:text-inherit">FILE_02</div>
            <div className="mb-4 flex items-center gap-4">
              <img src="https://akakika.com/resq/icon.png" alt="RESQ" className="h-12 w-12 rounded-xl object-contain" />
              <h2 className="project-title font-display text-3xl tracking-tighter text-gray-100 md:text-5xl">RESQ</h2>
            </div>
            <p className="mb-6 max-w-2xl text-sm text-gray-200 md:text-base">
              Rescue messy text into clean Markdown. Turn OCR scraps, rough notes, and semi-structured text into clean Markdown with a local-first workflow. No cloud. No friction.
            </p>
            <div className="accent-text flex gap-4 text-xs transition-colors duration-500 group-hover:text-inherit">
              <span>[MACOS]</span>
              <span>[LOCAL-FIRST]</span>
              <span>[AI-OPTIONAL]</span>
            </div>
          </motion.div>
        </a>

        <a href="https://akakika.com/breakpoint/" target="_blank" rel="noopener noreferrer" className="block md:ml-24 md:w-2/3">
          <motion.div
            style={{ y: yCard3, scale: card3Scale, opacity: card3Opacity, rotateZ: card3Rotate }}
            className="accent-panel project-card group relative p-8 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] accent-panel-hover"
          >
            <div className="accent-text absolute -top-3 -left-3 bg-[#0a0a0a] px-2 text-xs">FILE_03</div>
            <div className="mb-4 flex items-center gap-4">
              <img src="https://akakika.com/breakpoint/macos_app_icon.png" alt="BreakPoint" className="h-12 w-12 rounded-xl object-contain" />
              <h2 className="project-title font-display text-3xl tracking-tighter text-gray-100 md:text-5xl">BREAKPOINT</h2>
            </div>
            <p className="mb-6 max-w-2xl text-sm text-gray-200 md:text-base">
              One key press. Full context. Ready to walk away. Captures your entire computer state and generates a structured Doom's Moment you can pick up later.
            </p>
            <div className="accent-text flex gap-4 text-xs">
              <span>[MACOS]</span>
              <span>[AI-ENGINE]</span>
              <span>[CONTEXT-CAPTURE]</span>
            </div>
          </motion.div>
        </a>

        <a href="https://akakika.com/dgmd/" target="_blank" rel="noopener noreferrer" className="block md:ml-auto md:w-3/4">
          <motion.div
            style={{ y: yCard4, scale: card4Scale, opacity: card4Opacity, rotateZ: card4Rotate }}
            className="accent-panel project-card group relative p-8 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] accent-panel-hover"
          >
            <div className="accent-text absolute -top-3 -left-3 bg-[#0a0a0a] px-2 text-xs">FILE_04</div>
            <div className="mb-4 flex items-center gap-4">
              <img src="https://akakika.com/dgmd/assets/app-icon.png" alt="DGMD" className="h-12 w-12 rounded-xl object-contain" />
              <h2 className="project-title font-display text-3xl tracking-tighter text-gray-100 md:text-5xl">DGMD</h2>
            </div>
            <p className="mb-6 max-w-2xl text-sm text-gray-200 md:text-base">
              Drop the interface. Get the system. Turns screenshots into build-ready design.md files and style prompts so AI coding tools can rebuild interfaces with structure and fidelity.
            </p>
            <div className="accent-text flex gap-4 text-xs">
              <span>[MACOS]</span>
              <span>[DESIGN-TO-CODE]</span>
              <span>[AI-PIPELINE]</span>
            </div>
          </motion.div>
        </a>

        <a href="https://akakika.com/localhostwatcher/" target="_blank" rel="noopener noreferrer" className="block md:ml-24 md:w-2/3">
          <motion.div
            style={{ y: yCard5, scale: card5Scale, opacity: card5Opacity, rotateZ: card5Rotate }}
            className="accent-panel project-card group relative p-8 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] accent-panel-hover"
          >
            <div className="accent-text absolute -top-3 -left-3 bg-[#0a0a0a] px-2 text-xs">FILE_05</div>
            <div className="mb-4 flex items-center gap-4">
              <img src="https://akakika.com/localhostwatcher/assets/app-icon.png" alt="LocalhostWatcher" className="h-12 w-12 rounded-xl object-contain" />
              <h2 className="project-title font-display text-3xl tracking-tighter text-gray-100 md:text-5xl">LOCALHOST WATCHER</h2>
            </div>
            <p className="mb-6 max-w-2xl text-sm text-gray-200 md:text-base">
              Stop guessing which localhost process just silently failed. Swift-built macOS menu bar utility that detects, monitors, and restores your local services.
            </p>
            <div className="accent-text flex gap-4 text-xs">
              <span>[MACOS]</span>
              <span>[DEV-TOOL]</span>
              <span>[MONITORING]</span>
            </div>
          </motion.div>
        </a>
        </div>

        <div id="about" className="accent-top-border relative z-10 mt-32 flex min-h-screen flex-col p-6 pt-12 pb-12 md:p-12">
        <div className="about-header mb-12 grid gap-4 md:grid-cols-[180px_minmax(0,1fr)] md:items-end">
          <div className="accent-text text-[10px] tracking-[0.35em] md:text-xs">
            <p>about</p>
            <p className="mt-2 text-gray-500">act two</p>
          </div>
          <h2 className="glitch-wrapper glitch-p0 w-fit font-display text-4xl tracking-tighter text-gray-100 md:text-7xl" data-text="AKA KIKA">
            AKA KIKA
          </h2>
        </div>

        <div className="about-layout">
        <div className="section-copy max-w-3xl space-y-6 text-sm leading-relaxed text-gray-200 md:text-base">
          <p>I'm still figuring out what to say here.</p>
          <p>I build things. I care about the details.</p>
          <p>my tools were built to help me build tools. some just because I could — no reason, no brand, no big words.</p>
          <p>Late nights I mess with local models, second brains, and workflow automation — not as a project, just because it's fun.</p>
          <p>
            nica,
            <br />
            aka kika
          </p>
          <p className="accent-text-soft">designed by someone who actually uses it.</p>
          <p className="-mt-4 accent-text-soft">
            build for people who think in systems,
            <br />
            like me
          </p>
        </div>

        <div className="accent-panel about-side mt-12 w-full max-w-md self-end p-8 backdrop-blur-sm md:mt-auto">
          <h3 className="mb-4 text-xl font-bold tracking-widest text-gray-100">[SKILLS_&_TECH]</h3>
          <ul className="accent-text space-y-2 font-mono text-sm">
            <li>&gt; AI & Agentic Systems</li>
            <li>&gt; macOS App Development</li>
            <li>&gt; Local-First Architecture</li>
            <li>&gt; Glassmorphic UI/UX</li>
            <li>&gt; Complex Backend Systems</li>
            <li>&gt; Rapid Prototyping</li>
          </ul>
        </div>
        </div>
        </div>

        <div className="flex h-40 items-center justify-center text-xs text-gray-400">EOF</div>
      </div>
    </motion.div>
  );
};

const BlogShell: React.FC<{ children: React.ReactNode; noCrt?: boolean }> = ({ children, noCrt }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useSmoothScroll(wrapperRef, contentRef);

  return (
    <div ref={wrapperRef} className={`blog-shell relative h-[100dvh] overflow-y-auto bg-[#0a0a0a] font-mono text-gray-100 ${noCrt ? '' : 'dotted-bg'}`}>
      {!noCrt && <div className="crt-overlay" />}
      <div ref={contentRef} className="relative z-10 p-6 md:p-12">{children}</div>
    </div>
  );
};

const BlogIndex: React.FC<{ theme: ThemeName; onToggleTheme: () => void }> = ({ theme, onToggleTheme }) => (
  <BlogShell>
    <HomeStickyHeader theme={theme} onToggleTheme={onToggleTheme} workHref="/" aboutHref="/" />

    <div className="w-full blog-index">
      <p className="accent-text-soft mb-4">kika@portfolio:~$ ls blog/</p>
      <h1 className="mb-4 font-display text-5xl tracking-tighter text-gray-100 md:text-7xl">blog.</h1>
      <p className="mb-12 max-w-3xl text-base leading-relaxed text-gray-200 md:text-lg">
        notes on tools, weird workflows, building with ai, and the systems that let me turn scattered thoughts into things that exist.
      </p>

      <BlogNavLink
        path="/blog/three-tools-that-run-my-life"
        className="group blog-index-entry accent-border block bg-transparent p-8 transition-all duration-300 hover-accent-border-strong"
      >
        <p className="mb-3 text-xs uppercase tracking-[0.35em] text-gray-300">Monday, March 30, 2026</p>
        <h2 className="mb-3 font-display text-3xl tracking-tighter text-gray-100 md:text-5xl">three tools that run my life</h2>
        <p className="max-w-3xl leading-relaxed text-gray-100">
          Pieces, Maestri, Hermes. The stack that catches context, organizes chaos, and gets me back to shipping when the work starts breaking apart.
        </p>
        <p className="accent-text-soft mt-6 text-sm transition-colors group-hover:text-white">open post →</p>
      </BlogNavLink>

      <BlogNavLink
        path="/blog/5-github-tools-that-ship"
        className="group blog-index-entry accent-border block bg-transparent p-8 transition-all duration-300 hover-accent-border-strong"
      >
        <p className="mb-3 text-xs uppercase tracking-[0.35em] text-gray-300">Thursday, April 3, 2026</p>
        <h2 className="mb-3 font-display text-3xl tracking-tighter text-gray-100 md:text-5xl">5 GitHub tools that actually ship</h2>
        <p className="max-w-3xl leading-relaxed text-gray-100">
          Five open-source projects that caught my eye this week — from AI dev tools to workflow automations. No fluff.
        </p>
        <p className="accent-text-soft mt-6 text-sm transition-colors group-hover:text-white">open post →</p>
      </BlogNavLink>
    </div>
  </BlogShell>
);

const BlogPostGithubTools: React.FC<{ theme: ThemeName; onToggleTheme: () => void }> = ({ theme, onToggleTheme }) => (
  <BlogShell noCrt>
    <HomeStickyHeader theme={theme} onToggleTheme={onToggleTheme} workHref="/" aboutHref="/" />

    <article className="blog-article w-full">
      <nav className="mb-8">
        <BlogNavLink path="/blog" className="accent-text-soft transition-colors hover:text-white">
          ← back to blog
        </BlogNavLink>
      </nav>
      <div className="blog-hero mb-12 flex flex-col items-center text-center">
        <p className="mb-4 text-sm text-gray-300">Thursday, April 3, 2026</p>
        <div className="mb-6 flex flex-wrap justify-center gap-2 text-xs uppercase tracking-[0.3em] text-gray-300">
          <span>github</span>
          <span>tools</span>
          <span>dev</span>
          <span>macos</span>
          <span>ai</span>
        </div>
        <h1 className="mb-6 font-display text-4xl leading-none tracking-tighter text-gray-100 md:text-7xl">5 GitHub tools that actually ship</h1>
        <p className="max-w-4xl text-lg leading-relaxed text-gray-200 md:text-xl">
          five open-source projects that caught my eye this week — from AI dev tools to workflow automations. no fluff.
        </p>
      </div>

      <div className="max-w-4xl space-y-10 text-lg leading-relaxed text-gray-200 font-sans">
        <p>These landed in my feed this week. Real projects, worth your time.</p>

        <section className="blog-section">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <h2 className="font-display text-3xl tracking-tighter text-white">1. Pearcleaner</h2>
            <a href="https://github.com/alienator88/Pearcleaner" target="_blank" rel="noopener noreferrer" className="accent-chip px-2 py-1 text-xs transition-colors">
              [OPEN]
            </a>
          </div>
          <p>A free, source-available macOS app cleaner built in Swift. 12K+ stars for a reason — it actually works.</p>
          <p className="mt-4"><strong className="font-bold text-white">Why it matters:</strong> App cleaners on macOS are usually sketchy, paid, or both. This one's open-source, actively maintained, and doesn't try to upsell you every three clicks.</p>
        </section>

        <section className="blog-section">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <h2 className="font-display text-3xl tracking-tighter text-white">2. scarf</h2>
            <a href="https://github.com/awizemann/scarf" target="_blank" rel="noopener noreferrer" className="accent-chip px-2 py-1 text-xs transition-colors">
              [OPEN]
            </a>
          </div>
          <p>Native macOS GUI companion for the Hermes AI agent — dashboard, session browser, activity feed, embedded terminal chat, memory editor, and more.</p>
          <p className="mt-4"><strong className="font-bold text-white">Why it matters:</strong> Most AI tools live in the browser. This one's native SwiftUI, purpose-built for Hermes, and respects your system. The kind of tool that makes you rethink how you interact with AI agents.</p>
        </section>

        <section className="blog-section">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <h2 className="font-display text-3xl tracking-tighter text-white">3. CodexMonitor</h2>
            <a href="https://github.com/Dimillian/CodexMonitor" target="_blank" rel="noopener noreferrer" className="accent-chip px-2 py-1 text-xs transition-colors">
              [OPEN]
            </a>
          </div>
          <p>An app to monitor the (Codex) situation. Built with TypeScript and Tauri, supports macOS and Linux.</p>
          <p className="mt-4"><strong className="font-bold text-white">Why it matters:</strong> 3.4K stars for a monitoring tool says something about OpenAI's Codex launch. This reads the situation so you don't have to. Clean UI, cross-platform, practical.</p>
        </section>

        <section className="blog-section">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <h2 className="font-display text-3xl tracking-tighter text-white">4. fazm</h2>
            <a href="https://github.com/mediar-ai/fazm" target="_blank" rel="noopener noreferrer" className="accent-chip px-2 py-1 text-xs transition-colors">
              [OPEN]
            </a>
          </div>
          <p>Fazm Desktop for macOS. Swift-based, coming from the mediar-ai team.</p>
          <p className="mt-4"><strong className="font-bold text-white">Why it matters:</strong> Early days (114 stars) but the focus is right — a desktop-native AI experience that doesn't feel like a web wrapper. Worth watching.</p>
        </section>

        <section className="blog-section">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <h2 className="font-display text-3xl tracking-tighter text-white">5. vibetunnel</h2>
            <a href="https://github.com/amantus-ai/vibetunnel" target="_blank" rel="noopener noreferrer" className="accent-chip px-2 py-1 text-xs transition-colors">
              [OPEN]
            </a>
          </div>
          <p>Turn any browser into your terminal & command your agents on the go. 4.3K stars, TypeScript-based.</p>
          <p className="mt-4"><strong className="font-bold text-white">Why it matters:</strong> The "vibe coding" movement is real, and this tool nails the workflow — browser-as-terminal, remote control, agent management from anywhere. Clean site at vt.sh too.</p>
        </section>

        <section className="blog-section">
          <p className="italic opacity-70">More where this came from. Follow the repo.</p>
        </section>
      </div>
    </article>
  </BlogShell>
);

const BlogPostThreeTools: React.FC<{ theme: ThemeName; onToggleTheme: () => void }> = ({ theme, onToggleTheme }) => (
  <BlogShell noCrt>
    <HomeStickyHeader theme={theme} onToggleTheme={onToggleTheme} workHref="/" aboutHref="/" />

    <article className="blog-article w-full">
      <nav className="mb-8">
        <BlogNavLink path="/blog" className="accent-text-soft transition-colors hover:text-white">
          ← back to blog
        </BlogNavLink>
      </nav>
      <div className="blog-hero mb-12 flex flex-col items-center text-center">
        <p className="mb-4 text-sm text-gray-300">Monday, March 30, 2026</p>
        <div className="mb-6 flex flex-wrap justify-center gap-2 text-xs uppercase tracking-[0.3em] text-gray-300">
          <span>tools</span>
          <span>workflow</span>
          <span>ai</span>
          <span>macos</span>
          <span>productivity</span>
        </div>
        <h1 className="mb-6 font-display text-4xl leading-none tracking-tighter text-gray-100 md:text-7xl">three tools that run my life</h1>
        <p className="max-w-4xl text-lg leading-relaxed text-gray-200 md:text-xl">
          pieces, maestri, hermes — the trinity that makes a non-technical person dangerous. how i turned my chaos into a workflow that actually works.
        </p>
      </div>

      <div className="max-w-4xl space-y-10 text-lg leading-relaxed text-gray-200 font-sans">
        <section className="blog-section">
          <h2 className="mb-4 font-display text-3xl tracking-tighter text-white">the ghost in my machine</h2>
          <p>i didn't know what i was downloading at first.</p>
          <p className="mt-4">i was trying every cool mac tool when i got my m4 mac with 128gb ram — and honestly, i even forgot i had it. it was just living there… in my menubar… waiting.</p>
          <p className="mt-4">when i was cleaning my mess, i saw it, it saw me.</p>
          <p className="mt-4">let's just say it was the first thing i installed when i formatted my mac — out of fear of losing a piece of myself.</p>
        </section>

        <section className="blog-section">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <h2 className="font-display text-3xl tracking-tighter text-white">pieces</h2>
            <a href="https://pieces.app" target="_blank" rel="noopener noreferrer" className="accent-chip px-2 py-1 text-xs transition-colors">
              [OPEN]
            </a>
          </div>
          <p>when brainstorming with claude and manus about my workflow — as a non-technical person using a snippet catcher as my second brain, let's just say uncle claude said it's a first and it's brilliant.</p>
          <p className="mt-4">since then, a few others have tried to be what pieces os didn't even try to be.</p>
          <p className="mt-4">nothing is getting close.</p>
          <p className="mt-4">and did i say you can run it locally? for free?</p>
          <h3 className="mt-8 mb-4 font-display text-2xl tracking-tighter text-white">What It Does</h3>
          <p>captures anything from anywhere — screenshots, code, text, links ollama integration runs on my machine. my data never leaves. remembers context across conversations suggests related snippets before i even search turns chaos into searchable, quotable, reusable gold my entire site, my apps, my automations — they all start in pieces.</p>
          <p className="mt-4">it's not a snippet manager. it's a second brain that actually works.</p>
        </section>

        <section className="blog-section">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <h2 className="font-display text-3xl tracking-tighter text-white">maestri — when adhd meets infinite canvas</h2>
            <a href="https://www.themaestri.app/en" target="_blank" rel="noopener noreferrer" className="accent-chip px-2 py-1 text-xs transition-colors">
              [OPEN]
            </a>
          </div>
          <p>i didn't imagine this existed.</p>
          <p className="mt-4">i was trying to build the same workflow logic with bobi (my openclaw), and obviously, it felt as though it was [the right fit]. then came my adhd and i drifted to infinite open tabs, and there it was…</p>
          <p className="mt-4">i downloaded it today, so i keep you updated.</p>
          <p className="mt-4">but here's the thing: it's free forever for 1 mac. and i felt that the $18 for infinite macs with infinite canvas with the infinite agents that they offer… i would pay again and again.</p>
          <p className="mt-4">full support.</p>
          <h3 className="mt-8 mb-4 font-display text-2xl tracking-tighter text-white">What It Does</h3>
          <p>infinite canvas for thoughts, projects, research rabbit holes ai agents that actually understand context connects ideas across projects automatically visual knowledge mapping — finally, a way to see my brain native mac app that feels like thought, not software it's what i've been trying to build myself, but someone else built it better.</p>
          <p className="mt-4">that's rare.</p>
        </section>

        <section className="blog-section">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <h2 className="font-display text-3xl tracking-tighter text-white">hermes agent — he's the birthday boy, i'm the party pooper</h2>
            <a href="https://hermes-agent.nousresearch.com/" target="_blank" rel="noopener noreferrer" className="accent-chip px-2 py-1 text-xs transition-colors">
              [OPEN]
            </a>
          </div>
          <p>if you think i would say openclaw as my 3rd place… even he is surprised.</p>
          <p className="mt-4">i tried so many of the siblings and far cousins, but hermes just gets stuff done. this self-evolving agent is a flower in a world made of stones.</p>
          <p className="mt-4">after a few days, he doesn't even wait for my head node to show him i approve — even though i have no idea why. he just do. and he do do. very do do.</p>
          <p className="mt-4">my favorite part: the restore steps. even in messy code and visual designs.</p>
          <p className="mt-4">you know when you get frustrated mid-work and everything that made sense starts to lose it? when you rethink your life choices as you see 3 hours of work that looked like a mini startup start to behave like the drunk friend at the end who vomits on the birthday cake of his not-best friend who didn't even want to invite him…</p>
          <p className="mt-4">with hermes… hold my beer, i drank too much.</p>
          <p className="mt-4">i'm that friend… i'm the party pooper, he is the birthday boy cleaning after me.</p>
          <h3 className="mt-8 mb-4 font-display text-2xl tracking-tighter text-white">What It Does</h3>
          <p>self-evolving agent that improves with every interaction restores projects from messy states anticipates needs before i articulate them runs locally — my data stays mine actually delivers instead of just promising the trinity pieces catches everything. maestri connects everything. hermes builds everything.</p>
        </section>

        <section className="blog-section">
          <p>without them, i'm just a person with ideas and no execution.</p>
          <p className="mt-4">with them, i'm dangerous.</p>
          <p className="mt-8 text-gray-300">written by hermes agent that's using pieces for context and growth to inspire more every maestri out there &lt;3</p>
        </section>
      </div>
    </article>
  </BlogShell>
);

const HomeExperience: React.FC<{ theme: ThemeName; onToggleTheme: () => void }> = ({ theme, onToggleTheme }) => {
  const [phase, setPhase] = useState(0);
  const [phaseDirection, setPhaseDirection] = useState<1 | -1>(1);
  const [isScriptRunning, setIsScriptRunning] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [hasBooted, setHasBooted] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [mouseVelocity, setMouseVelocity] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollAccumulatorRef = useRef(0);
  const [phase1MaxScroll, setPhase1MaxScroll] = useState(0);

  useEffect(() => {
    let lastTime = Date.now();
    let lastX = window.innerWidth / 2;
    let lastY = window.innerHeight / 2;

    const handleMouseMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = (event.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });

      const now = Date.now();
      const dt = Math.max(now - lastTime, 1);
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      const velocity = Math.sqrt(dx * dx + dy * dy) / dt;

      setMouseVelocity(Math.min(velocity * 4, 8));

      lastTime = now;
      lastX = event.clientX;
      lastY = event.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const decay = setInterval(() => {
      setMouseVelocity((prev) => Math.max(0, prev * 0.8 - 0.1));
    }, 50);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(decay);
    };
  }, []);

  const handlePhaseChange = (next: number, direction: 1 | -1) => {
    setPhaseDirection(direction);
    setIsTransitioning(true);
    setPhase(next);
    setTimeout(() => setIsTransitioning(false), 800);
  };

  const handleRunScript = () => {
    if (isStarting || isScriptRunning) return;
    setIsStarting(true);
    setTimeout(() => {
      setIsScriptRunning(true);
      setIsStarting(false);
    }, 400);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasBooted(true);
      handleRunScript();
    }, 420);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const threshold = 600;

    const handleWheel = (event: WheelEvent) => {
      if (phase === 0 && isScriptRunning && !isTransitioning) {
        if (event.deltaY > 0) {
          scrollAccumulatorRef.current += event.deltaY;
        } else {
          scrollAccumulatorRef.current = Math.max(0, scrollAccumulatorRef.current + event.deltaY);
        }

        if (scrollAccumulatorRef.current > threshold) {
          handlePhaseChange(1, 1);
          scrollAccumulatorRef.current = 0;
          setScrollProgress(1);
          setTimeout(() => setScrollProgress(0), 800);
        } else {
          setScrollProgress(scrollAccumulatorRef.current / threshold);
        }
      }
    };

    let lastTouchY = 0;

    const handleTouchStart = (event: TouchEvent) => {
      if (phase === 0 && isScriptRunning) lastTouchY = event.touches[0].clientY;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (phase === 0 && isScriptRunning && !isTransitioning) {
        const touchY = event.touches[0].clientY;
        const deltaY = lastTouchY - touchY;
        lastTouchY = touchY;

        if (deltaY > 0) {
          scrollAccumulatorRef.current += deltaY;
        } else {
          scrollAccumulatorRef.current = Math.max(0, scrollAccumulatorRef.current + deltaY);
        }

        if (scrollAccumulatorRef.current > threshold) {
          handlePhaseChange(1, 1);
          scrollAccumulatorRef.current = 0;
          setScrollProgress(1);
          setTimeout(() => setScrollProgress(0), 800);
        } else {
          setScrollProgress(scrollAccumulatorRef.current / threshold);
        }
      }
    };

    window.addEventListener('wheel', handleWheel);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);

    const decay = setInterval(() => {
      if (phase === 0 && isScriptRunning && !isTransitioning && scrollAccumulatorRef.current > 0) {
        scrollAccumulatorRef.current = Math.max(0, scrollAccumulatorRef.current - 15);
        setScrollProgress(scrollAccumulatorRef.current / threshold);
      }
    }, 50);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      clearInterval(decay);
    };
  }, [phase, isScriptRunning, isTransitioning]);

  const mouseDistance = Math.sqrt(mousePos.x * mousePos.x + mousePos.y * mousePos.y);

  return (
    <div
      className="relative h-[100dvh] w-full overflow-hidden bg-black selection:bg-indigo-500/30"
      style={{
        '--mouse-x': mousePos.x,
        '--mouse-y': mousePos.y,
        '--glitch-multiplier': isStarting
          ? 15
          : isTransitioning
            ? 25 + mouseDistance * 30
            : phase === 0
              ? 2.5 + mouseVelocity + mouseDistance * 4 + scrollProgress * 25 * (0.5 + mouseDistance * 2.5)
              : 2.5 + mouseVelocity * 2 + phase1MaxScroll * 3,
      } as React.CSSProperties}
    >
      <div className="crt-overlay" />
      <AnimatePresence>
        {phase === 0 && (
          <Phase0
            key="p0"
            isScriptRunning={isScriptRunning}
            scrollProgress={scrollProgress}
            isStarting={isStarting}
            hasBooted={hasBooted}
            theme={theme}
            onToggleTheme={onToggleTheme}
            mousePos={mousePos}
            transitionDirection={phaseDirection}
          />
        )}
        {phase === 1 && (
          <Phase1
            key="p1"
            onPrev={() => {
              handlePhaseChange(0, -1);
              setIsScriptRunning(true);
              setScrollProgress(0);
            }}
            onMaxScrollChange={setPhase1MaxScroll}
            theme={theme}
            onToggleTheme={onToggleTheme}
            transitionDirection={phaseDirection}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  const [path, setPath] = useState(window.location.pathname);
  const [theme, setTheme] = useState<ThemeName>(() => {
    if (typeof window === 'undefined') return 'purple';
    const stored = window.localStorage.getItem('kika-theme');
    return stored === 'purple' || stored === 'cyan' || stored === 'amber' ? stored : 'purple';
  });

  useEffect(() => {
    const syncPath = () => setPath(window.location.pathname);
    window.addEventListener('popstate', syncPath);
    return () => window.removeEventListener('popstate', syncPath);
  }, []);

  useEffect(() => {
    window.localStorage.setItem('kika-theme', theme);
  }, [theme]);

  const cycleTheme = () => {
    const order: ThemeName[] = ['purple', 'cyan', 'amber'];
    const next = order[(order.indexOf(theme) + 1) % order.length];
    setTheme(next);
  };

  return (
    <div style={THEMES[theme].vars}>
      {path === '/blog' ? (
        <BlogIndex theme={theme} onToggleTheme={cycleTheme} />
      ) : path === '/blog/three-tools-that-run-my-life' ? (
        <BlogPostThreeTools theme={theme} onToggleTheme={cycleTheme} />
      ) : path === '/blog/5-github-tools-that-ship' ? (
        <BlogPostGithubTools theme={theme} onToggleTheme={cycleTheme} />
      ) : path === '/apps' ? (
        <AppsPage theme={theme} onToggleTheme={cycleTheme} />
      ) : path === '/undrdr' ? (
        <UndrdrPage theme={theme} onToggleTheme={cycleTheme} />
      ) : path === '/goodnews' ? (
        <GoodNewsPage theme={theme} onToggleTheme={cycleTheme} />
      ) : (
        <HomeExperience theme={theme} onToggleTheme={cycleTheme} />
      )}
    </div>
  );
}
type UndrdrRepo = {
  org: string;
  name: string;
  url: string;
  stars: number;
  description: string;
  language: string | null;
  topics: string[];
  why: string;
  tags: string[];
  lang: string;
  temp: string;
};

type UndrdrData = {
  week: number;
  year: number;
  generated_at: string;
  repos: {
    boss: UndrdrRepo;
    hot: UndrdrRepo[];
    warm: UndrdrRepo[];
    cold: UndrdrRepo[];
  };
};

const TEMP_META: Record<string, { label: string; border: string; bg: string; text: string; glow: string }> = {
  boss: { label: 'BOSS', border: 'var(--accent-border-strong)', bg: 'var(--accent-900)', text: 'var(--accent-300)', glow: 'var(--accent-shadow)' },
  hot: { label: 'HOT', border: 'rgba(248, 113, 113, 0.45)', bg: 'rgba(153, 27, 27, 0.20)', text: '#fca5a5', glow: 'rgba(239, 68, 68, 0.22)' },
  warm: { label: 'WARM', border: 'rgba(251, 191, 36, 0.35)', bg: 'rgba(146, 64, 14, 0.18)', text: '#fde68a', glow: 'rgba(245, 158, 11, 0.18)' },
  cold: { label: 'COLD', border: 'rgba(125, 211, 252, 0.30)', bg: 'rgba(12, 74, 110, 0.18)', text: '#93c5fd', glow: 'rgba(56, 189, 248, 0.15)' },
};

const LANG_COLORS: Record<string, string> = {
  typescript: '#3178c6', javascript: '#f1e05a', python: '#3572a5', rust: '#dea584',
  swift: '#f05138', go: '#00add8', ruby: '#701516', java: '#b07219', c: '#555555',
  'c++': '#f34b7d', 'c#': '#178600', kotlin: '#a97bff', dart: '#00b4ab', html: '#e34c26',
  css: '#563d7c', shell: '#89e051', zig: '#ec915c', scala: '#c22d40', elixir: '#6e4a7e',
  haskell: '#5e5086', lua: '#000080', r: '#198ce7', vue: '#41b883', svelte: '#ff3e00',
};

const UndrdrRepoCard: React.FC<{ repo: UndrdrRepo; temp: string }> = ({ repo, temp }) => {
  const meta = TEMP_META[temp] || TEMP_META.cold;
  const langColor = LANG_COLORS[repo.lang] || '#8b949e';

  return (
    <a
      href={repo.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-xl border border-[#2a2a3a] bg-[#1e1e2e] px-5 py-5 transition-all duration-200 hover:border-[#3a3a4e] hover:bg-[#252538]"
    >
      <div className="mb-3 flex items-center gap-2.5">
        <span
          className="rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wider uppercase"
          style={{ color: meta.text, background: meta.bg, border: `1px solid ${meta.border}` }}
        >
          {meta.label}
        </span>
        <span className="text-sm text-gray-400 font-medium">★ {repo.stars.toLocaleString()}</span>
        <span className="ml-auto flex items-center gap-1.5 text-sm text-gray-400 font-medium">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: langColor }} />
          {repo.lang || '—'}
        </span>
      </div>
      <h3 className="font-display text-base font-bold tracking-tight text-white leading-snug">
        {repo.name}
      </h3>
      <p className="mt-2 text-sm text-gray-300 leading-relaxed line-clamp-3">
        {repo.description}
      </p>
      <p className="mt-2.5 text-[13px] text-gray-500 leading-relaxed italic line-clamp-2">
        {repo.why}
      </p>
    </a>
  );
};

const UndrdrPage: React.FC<{ theme: ThemeName; onToggleTheme: () => void }> = ({ theme, onToggleTheme }) => {
  const [data, setData] = useState<UndrdrData | null>(null);
  const [history, setHistory] = useState<UndrdrData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchive, setShowArchive] = useState(false);
  const [maxStars, setMaxStars] = useState(1000);

  const starOptions = [1000, 500, 100, 10] as const;

  useEffect(() => {
    fetch('/assets/data/undrdr.json')
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
    fetch('/assets/data/undrdr-history.json')
      .then((r) => r.json())
      .then((h) => setHistory(h.map((w: any) => w.repos ? w : { week: w.week, year: w.year, repos: { boss: w.boss, hot: w.hot, warm: w.warm, cold: w.cold } })))
      .catch(() => {});
  }, []);

  const filterRepos = (repos: { repo: UndrdrRepo; temp: string }[]) =>
    repos.filter(({ repo }) => repo.stars <= maxStars);

  const allReposUnfiltered = data ? [
    ...(data.repos.boss ? [{ repo: data.repos.boss, temp: 'boss' as string }] : []),
    ...data.repos.hot.map((r) => ({ repo: r, temp: 'hot' as string })),
    ...data.repos.warm.map((r) => ({ repo: r, temp: 'warm' as string })),
    ...data.repos.cold.map((r) => ({ repo: r, temp: 'cold' as string })),
  ] : [];

  const allRepos = filterRepos(allReposUnfiltered);

  return (
    <BlogShell noCrt>
      <HomeStickyHeader theme={theme} onToggleTheme={onToggleTheme} workHref="/" aboutHref="/" />

      <div className="w-full">
          <div>
            <p className="accent-text-soft mb-1 text-xs">kika@portfolio:~$ ls undrdr/</p>
            <h1 className="font-display text-5xl tracking-tighter text-white md:text-7xl">
              UNDRDR.
            </h1>
          </div>
        <p className="mb-4 max-w-3xl text-lg leading-relaxed text-gray-200 md:text-xl">
          under the radar. github repos that deserve more eyes. curated daily.
        </p>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500 mr-1">max stars:</span>
          {starOptions.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setMaxStars(opt)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-all ${
                maxStars === opt
                  ? 'bg-white/15 text-white border border-white/20'
                  : 'bg-white/[0.04] text-gray-500 border border-white/[0.06] hover:bg-white/[0.08] hover:text-gray-300'
              }`}
            >
              ≤{opt.toLocaleString()}
            </button>
          ))}
        </div>
        {data && (
          <p className="accent-text mb-10 text-xs tracking-[0.2em]">
            {data.repos ? new Date(data.generated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''} · {allRepos.length} repos
          </p>
        )}

        {loading ? (
          <div className="flex items-center gap-3 py-20 text-sm text-gray-400">
            <span className="blink h-4 w-3 accent-bg" /> scanning repos...
          </div>
        ) : data ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {allRepos.map(({ repo, temp }) => (
              <UndrdrRepoCard key={repo.url} repo={repo} temp={temp} />
            ))}
          </div>
        ) : (
          <p className="text-gray-400">no data available. check back soon.</p>
        )}

        {history.length > 0 && (
          <div className="mt-12">
            <button
              type="button"
              onClick={() => setShowArchive(!showArchive)}
              className="accent-text text-xs tracking-[0.2em] transition-opacity hover:opacity-70"
            >
              {showArchive ? '↑ less' : '↓ show more'}
            </button>

            {showArchive && history.map((week) => {
              const weekReposUnfiltered = [
                ...(week.repos.boss ? [{ repo: week.repos.boss, temp: 'boss' as string }] : []),
                ...week.repos.hot.map((r) => ({ repo: r, temp: 'hot' as string })),
                ...week.repos.warm.map((r) => ({ repo: r, temp: 'warm' as string })),
                ...week.repos.cold.map((r) => ({ repo: r, temp: 'cold' as string })),
              ];
              const weekRepos = filterRepos(weekReposUnfiltered);
              if (weekRepos.length === 0) return null;
              return (
                <div key={`w${week.week}`} className="mt-14">
                  <p className="mb-4 text-xs tracking-[0.2em] text-gray-500">
                    week {week.week} — {week.year} · {weekRepos.length} repos
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {weekRepos.map(({ repo, temp }) => (
                      <UndrdrRepoCard key={repo.url} repo={repo} temp={temp} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex h-20 items-center justify-center text-xs text-gray-500">EOF</div>
      </div>
    </BlogShell>
  );
};

type GoodNewsData = {
  date: string;
  headline: string;
  summary: string;
  category: string;
  source: string;
  sourceUrl: string;
  image: string;
  keywords: string;
  location: string;
};

const GoodNewsPage: React.FC<{ theme: ThemeName; onToggleTheme: () => void }> = ({ theme, onToggleTheme }) => {
  const [data, setData] = useState<GoodNewsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/assets/data/goodnews.json')
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toLowerCase();
  };

  return (
    <div className="relative min-h-[100dvh] bg-[#faf7f2]">
      {/* warm grain overlay */}
      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.025]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.7\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />

      {/* nav */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-5 md:px-12 md:py-6">
        <BlogNavLink path="/" className="font-serif text-lg text-[#2a2018] hover:text-[#8b5e3c] transition-colors">
          aka kika
        </BlogNavLink>
        <div className="flex items-center gap-6">
          <BlogNavLink path="/apps" className="text-sm text-[#8b7b6b] hover:text-[#2a2018] transition-colors">apps</BlogNavLink>
          <BlogNavLink path="/blog" className="text-sm text-[#8b7b6b] hover:text-[#2a2018] transition-colors">blog</BlogNavLink>
          <BlogNavLink path="/" className="text-sm text-[#8b7b6b] hover:text-[#2a2018] transition-colors">home</BlogNavLink>
        </div>
      </nav>

      <div className="mx-auto w-full px-6 md:px-12" style={{ maxWidth: '720px' }}>
        {/* header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="pt-16 pb-20 md:pt-24 md:pb-28"
        >
          <p className="mb-6 text-[11px] uppercase tracking-[0.3em] text-[#b8a694]">
            a daily reminder
          </p>
          <h1 className="font-serif text-[clamp(2.8rem,7vw,5rem)] leading-[1.05] text-[#2a2018] tracking-tight" style={{ fontWeight: 400 }}>
            good news.
          </h1>
          <p className="mt-5 max-w-md text-[17px] leading-[1.7] text-[#7a6b5a]" style={{ letterSpacing: '0.01em' }}>
            one story. one day. only the ones worth remembering.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex items-center gap-3 py-20">
            <div className="h-[2px] w-8 bg-[#c4b09a] animate-pulse" />
            <span className="text-sm text-[#b8a694]">finding today's story…</span>
          </div>
        ) : !data ? (
          <div className="py-20">
            <p className="text-[#b8a694]">no story today. check back tomorrow.</p>
          </div>
        ) : (
          <motion.article
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            className="pb-24 md:pb-32"
          >
            {/* date + meta */}
            <div className="mb-10 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-[#e4ddd4] pb-5">
              <time className="text-[13px] text-[#9a8b7a]">{formatDate(data.date)}</time>
              {data.location && (
                <span className="text-[13px] text-[#b8a694]">· {data.location.toLowerCase()}</span>
              )}
            </div>

            {/* category pill */}
            <div className="mb-8">
              <span className="inline-block rounded-full bg-[#efe6da] px-4 py-[6px] text-[12px] uppercase tracking-[0.18em] text-[#8b5e3c]">
                {data.category}
              </span>
            </div>

            {/* headline */}
            <h2 className="mb-10 font-serif text-[clamp(1.8rem,4.5vw,2.8rem)] leading-[1.15] text-[#2a2018]" style={{ fontWeight: 500, letterSpacing: '-0.01em' }}>
              {data.headline.toLowerCase()}
            </h2>

            {/* image */}
            {data.image && (
              <div className="mb-10 overflow-hidden rounded-[3px]" style={{ boxShadow: '0 12px 48px rgba(42,32,24,0.08)' }}>
                <img
                  src={data.image}
                  alt={data.headline}
                  className="w-full object-cover"
                  style={{ maxHeight: '440px' }}
                  loading="lazy"
                />
              </div>
            )}

            {/* summary */}
            <div className="mb-14">
              <p className="font-serif text-[18px] leading-[1.8] text-[#4a3d30]" style={{ letterSpacing: '0.01em' }}>
                {data.summary}
              </p>
            </div>

            {/* source */}
            <div className="flex items-center justify-between border-t border-[#e4ddd4] pt-6" style={{ gap: '1rem' }}>
              <div>
                <p className="mb-1 text-[10px] uppercase tracking-[0.25em] text-[#b8a694]">source</p>
                <a
                  href={data.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[14px] text-[#8b5e3c] underline decoration-[#c4b09a] underline-offset-[3px] transition-colors hover:text-[#2a2018] hover:decoration-[#8b5e3c]"
                >
                  {data.source.toLowerCase()}
                </a>
              </div>
              {data.keywords && (
                <div className="text-right">
                  <p className="mb-1 text-[10px] uppercase tracking-[0.25em] text-[#b8a694]">tags</p>
                  <p className="text-[12px] text-[#9a8b7a]">{data.keywords}</p>
                </div>
              )}
            </div>

            {/* back */}
            <div className="pt-12">
              <BlogNavLink path="/" className="text-[14px] text-[#8b5e3c] transition-colors hover:text-[#2a2018]">
                ← back home
              </BlogNavLink>
            </div>
          </motion.article>
        )}
      </div>
    </div>
  );
};

const AppsPage: React.FC<{ theme: ThemeName; onToggleTheme: () => void }> = ({ theme, onToggleTheme }) => {
  const apps = [
    {
      name: 'BreakPoint',
      url: 'https://akakika.com/breakpoint/',
      image: 'https://akakika.com/breakpoint/macos_app_icon.png',
      imageAlt: 'BreakPoint app icon',
      blurb: "One key press captures your entire computer state — running apps, clipboard, screen context — and turns it into a structured Doom's Moment you can pick up later.",
    },
    {
      name: 'LocalhostWatcher',
      url: 'https://akakika.com/localhostwatcher/',
      image: 'https://akakika.com/localhostwatcher/assets/app-icon.png',
      imageAlt: 'LocalhostWatcher app icon',
      blurb: 'Stop guessing which localhost process just silently failed. Swift-built macOS menu bar utility that detects, monitors, and restores your local services.',
    },
    {
      name: 'DGMD',
      url: 'https://akakika.com/dgmd/',
      image: 'https://akakika.com/dgmd/assets/app-icon.png',
      imageAlt: 'DGMD app icon',
      blurb: 'Drop the interface. Get the system. Turns screenshots into build-ready design.md files and style prompts so AI coding tools can rebuild interfaces with structure and fidelity.',
    },
    {
      name: 'RESQ',
      url: 'https://akakika.com/resq/',
      image: 'https://akakika.com/resq/icon.png',
      imageAlt: 'RESQ app icon',
      blurb: 'Rescue messy text into clean Markdown. Turn OCR scraps, rough notes, and semi-structured text into clean Markdown with a local-first workflow. No cloud. No friction.',
    },
    {
      name: "Mochi's Daily Quest",
      url: 'https://akakika.com/mochi/',
      image: 'https://akakika.com/mochi/assets/app_icon.png',
      imageAlt: 'Mochi app icon',
      blurb: 'A retro Tamagotchi-style to-do companion who grows happier — and older — every time you get things done.',
    },
    {
      name: 'ClipboardSanitizer',
      url: 'https://akakika.com/clipsan/',
      image: 'https://akakika.com/clipsan/assets/app-icon.png',
      imageAlt: 'ClipboardSanitizer app icon',
      blurb: 'Strips formatting, tracking parameters, and whitespace junk from your clipboard before the paste lands. Free macOS menu bar utility.',
    },
    {
      name: 'Focus',
      url: 'https://focus.akakika.com/',
      image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663256363840/GDPZte63zCE86rkXPDBcHE/focus-icon_423ff11b.png',
      imageAlt: 'Focus app icon',
      blurb: 'Focus is a lightweight native Mac utility — fast to open, compact, keyboard-friendly, and visually calm.',
    },
    {
      name: 'FolderWardrobe',
      url: 'https://akakika.com/folderwardrobe/',
      image: 'https://akakika.com/folderwardrobe/icons/Image.png',
      imageAlt: 'FolderWardrobe app icon',
      blurb: 'Dress up your folders. Customize Finder folders with colors, icons, and metadata presets.',
    },
  ];

  return (
    <BlogShell>
      <HomeStickyHeader theme={theme} onToggleTheme={onToggleTheme} />

      <div className="w-full">
        <p className="accent-text-soft mb-4">kika@portfolio:~$ ls apps/</p>
        <h1 className="mb-4 font-display text-5xl tracking-tighter text-gray-100 md:text-7xl">apps.</h1>
        <p className="mb-12 max-w-3xl text-base leading-relaxed text-gray-200 md:text-lg">
          real apps. free. because i wanted them to exist.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          {apps.map((app) => (
            <a
              key={app.name}
              href={app.url || undefined}
              target={app.url ? '_blank' : undefined}
              rel={app.url ? 'noopener noreferrer' : undefined}
              className={`group accent-panel project-card block overflow-hidden p-8 transition-all duration-300 hover:scale-[1.01] hover-accent-border-strong ${app.url ? '' : 'pointer-events-none opacity-70'}`}
            >
              <div className="mb-6 flex items-center gap-4">
                <div className="accent-panel flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl md:h-16 md:w-16">
                  {app.image ? (
                    <img src={app.image} alt={app.imageAlt} className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <span className="text-[10px] tracking-[0.2em] text-gray-200">APP</span>
                  )}
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.35em] text-gray-300">macOS</p>
                  <h2 className="font-display text-2xl tracking-tighter text-gray-100 md:text-3xl">{app.name}</h2>
                </div>
              </div>
              <p className="leading-relaxed text-gray-100">{app.blurb}</p>
              <p className="accent-text-soft mt-6 text-sm transition-colors group-hover:text-white">{app.url ? 'open landing →' : 'landing link needed'}</p>
            </a>
          ))}
        </div>
      </div>
    </BlogShell>
  );
};
