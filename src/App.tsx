import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useMotionValueEvent } from 'motion/react';

const Typewriter: React.FC<{ text: string; delay?: number; onComplete?: () => void; cursor?: boolean; cursorClass?: string }> = ({ text, delay = 0, onComplete, cursor = false, cursorClass = "bg-indigo-500" }) => {
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
      const pause = (char === '.' || char === ',') ? 150 : (char === ' ' ? 40 : 0);
      
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + char);
        setCurrentIndex(prev => prev + 1);
      }, randomDelay + pause);
      
      return () => clearTimeout(timer);
    } else {
      if (onCompleteRef.current) {
        onCompleteRef.current();
      }
    }
  }, [currentIndex, text, started]);

  return (
    <span>
      {displayedText}
      {cursor && <span className={`blink w-2 h-4 inline-block ml-1 align-middle ${cursorClass}`} />}
    </span>
  );
};

const TerminalBlock: React.FC<{ lines: string[]; delay?: number; prefix?: string; showCursor?: boolean; cursorClass?: string }> = ({ lines, delay = 0, prefix = "kika@portfolio:~$ ", showCursor = false, cursorClass = "bg-indigo-500" }) => {
  const [currentLine, setCurrentLine] = useState(0);

  return (
    <>
      {lines.map((line, index) => (
        index <= currentLine ? (
          <p key={index}>
            {prefix}
            <Typewriter 
              text={line} 
              delay={index === 0 ? delay : 0} 
              onComplete={() => {
                if (index < lines.length - 1) {
                  setCurrentLine(prev => Math.max(prev, index + 1));
                }
              }} 
              cursor={showCursor && index === currentLine}
              cursorClass={cursorClass}
            />
          </p>
        ) : null
      ))}
    </>
  );
};

const Phase0: React.FC<{ onRunScript: () => void; isScriptRunning: boolean; scrollProgress: number; isStarting: boolean; mousePos: { x: number, y: number } }> = ({ onRunScript, isScriptRunning, scrollProgress, isStarting, mousePos }) => (
  <motion.div
    className="absolute inset-0 bg-[#0a0a0a] dotted-bg flex flex-col items-center justify-center font-mono"
    initial={{ opacity: 0, scale: 0.95 }} 
    animate={{ 
      opacity: 1 - scrollProgress * 0.2, 
      scale: 1 + scrollProgress * 0.05, 
      filter: isStarting ? 'brightness(1.5) contrast(1.5) hue-rotate(20deg)' : `brightness(${1 + scrollProgress * 0.5}) contrast(${1 + scrollProgress}) hue-rotate(${scrollProgress * 45 * mousePos.x}deg)`,
      skewX: scrollProgress * 10 * mousePos.x,
      skewY: scrollProgress * 5 * mousePos.y,
      y: scrollProgress * -50
    }} 
    exit={{ y: "-100vh", opacity: 1, filter: `brightness(2) contrast(2) hue-rotate(${90 * mousePos.x}deg)` }}
    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
  >
    <AnimatePresence>
      {isScriptRunning && (
        <motion.div initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 0.3, scale: 1 }} transition={{ duration: 1, ease: "easeOut" }} className="vaporwave-grid-container absolute inset-0 pointer-events-none">
          <div className="vaporwave-grid" />
        </motion.div>
      )}
    </AnimatePresence>
    <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10 text-sm font-bold text-gray-100">
      <div className="flex items-center gap-2">
        <span className="bg-gray-200 text-black px-2 py-1">AKA</span>
        <span className="tracking-widest">KIKA</span>
        <div className="w-3 h-5 bg-indigo-500 blink" />
      </div>
      <div className="flex gap-6 tracking-widest">
        <span>WORK</span><span>ABOUT</span>
      </div>
    </div>
    <div className="absolute top-24 left-6 text-[10px] md:text-sm opacity-80 flex flex-col gap-1 text-indigo-300 z-10">
      {isScriptRunning ? (
        <TerminalBlock 
          lines={["starts root_manage", "und", "line_format", "welcome", ""]} 
          delay={200} 
          showCursor={true} 
        />
      ) : (
        <p>kika@portfolio:~$ <span className="blink bg-indigo-500 w-2 h-4 inline-block align-middle" /></p>
      )}
    </div>
    <div className="z-10 flex flex-col items-center">
      <h1 className="text-[15vw] leading-none font-display tracking-tighter glitch-wrapper glitch-p1" data-text="KIKA">KIKA</h1>
      <p className="mt-4 text-xs md:text-base text-gray-200 tracking-widest">Navigating the digital unknown, pixel by pixel.</p>
      {isScriptRunning && (
        <div className="mt-8 text-indigo-300 text-xs md:text-base">
          kika@portfolio:~$ <Typewriter text="initializing sequence..." cursor={true} cursorClass="bg-gray-300" delay={800} />
        </div>
      )}
    </div>
    <div className="absolute bottom-8 left-6 text-[10px] md:text-sm opacity-80 flex flex-col gap-1 text-indigo-300 z-10">
      {isScriptRunning && (
        <TerminalBlock 
          lines={[
            "runm: script",
            "a108 initializing sequence...",
            "a110 initializing sequence...",
            "a162 initializing sequence...",
            "a163 initializing sequence...",
            "a106 initializing sequence...",
            "a127 initializing sequence...",
            "a234 initializing sequence...",
            "a130 initializing sequence...",
            "",
            "> "
          ]} 
          delay={1500} 
          showCursor={true} 
        />
      )}
    </div>
    {!isScriptRunning ? (
      <button onClick={onRunScript} className="absolute bottom-8 right-8 z-20 border-2 border-indigo-300 bg-indigo-900/20 text-indigo-100 px-4 py-2 flex flex-col items-end hover:bg-indigo-300 hover:text-black transition-colors cursor-pointer">
        <div className="flex gap-1 mb-1 opacity-70 text-[10px]"><span className="border border-indigo-300 px-1">X</span><span className="border border-indigo-300 px-1">K</span></div>
        <span className="text-lg tracking-widest">run script</span>
      </button>
    ) : (
      <div className="absolute bottom-8 right-8 text-xs text-gray-500 animate-pulse z-10" style={{ opacity: Math.min(1, 0.5 + scrollProgress), color: scrollProgress > 0.8 ? '#818cf8' : '' }}>
        [ {scrollProgress > 0.8 ? 'INITIATING...' : 'SCROLL TO CONTINUE'} ]
      </div>
    )}
  </motion.div>
);

const Phase1: React.FC<{ onPrev: () => void; onMaxScrollChange: (max: number) => void }> = ({ onPrev, onMaxScrollChange }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: scrollRef });
  
  const maxScroll = useMotionValue(0);
  const lastReportedMaxRef = useRef(0);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
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
  const opacityFade = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  
  const opacityGhost = useTransform(() => {
    const current = scrollYProgress.get();
    const max = maxScroll.get();
    const topOpacity = 0.7 - (max * 0.5);
    return Math.max(0.05, topOpacity * (1 - current));
  });

  const scaleGhost = useTransform(() => {
    const current = scrollYProgress.get();
    const max = maxScroll.get();
    const topScale = 1 + (max * 0.3);
    return topScale + (current * 0.3);
  });

  const filterGhost = useTransform(() => {
    const current = scrollYProgress.get();
    const max = maxScroll.get();
    const topBlur = 8 + (max * 12);
    return `blur(${topBlur + (current * 30)}px)`;
  });

  const yGhost = useTransform(scrollYProgress, [0, 1], [-80, -480]);
  const xGhost = useTransform(scrollYProgress, [0, 1], [120, 250]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let touchStartY = 0;

    const handleWheel = (e: WheelEvent) => {
      if (el.scrollTop <= 0 && e.deltaY < -20) {
        onPrev();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY - touchY;
      if (el.scrollTop <= 0 && deltaY < -20) {
        onPrev();
      }
    };

    el.addEventListener('wheel', handleWheel);
    el.addEventListener('touchstart', handleTouchStart);
    el.addEventListener('touchmove', handleTouchMove);

    return () => {
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
    };
  }, [onPrev]);

  const container = {
    hidden: { y: "100vh" },
    show: {
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.03,
        delayChildren: 0.2,
      }
    },
    exit: {
      y: "100vh",
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <motion.div
      ref={scrollRef}
      className="absolute inset-0 bg-[#0a0a0a] dotted-bg font-mono text-gray-100 overflow-y-auto overflow-x-hidden"
      initial="hidden" animate="show" variants={container}
    >
      <motion.div style={{ opacity: opacityGhost, scale: scaleGhost, y: yGhost, x: xGhost, filter: filterGhost }} className="fixed inset-0 pointer-events-none flex items-center justify-center z-0">
        <h1 className="text-[15vw] leading-none font-display tracking-tighter glitch-wrapper glitch-p1 text-indigo-500/40 absolute" data-text="KIKA">KIKA</h1>
      </motion.div>
      <div className="min-h-screen p-6 md:p-12 flex flex-col relative z-10">
        <motion.div variants={item} style={{ opacity: opacityFade }} className="flex justify-between items-center w-full text-sm font-bold mb-12 sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-sm py-4">
          <div className="text-indigo-300">[kika@portfolio:~]$ <span className="blink bg-indigo-500 w-2 h-4 inline-block align-middle" /></div>
          <div className="flex gap-6 tracking-widest text-gray-100">
            <span>[WORK]</span>
            <a href="#about" className="hover:text-indigo-300 transition-colors cursor-pointer">
              [ABOUT]
            </a>
          </div>
        </motion.div>
        
        <motion.div style={{ y: yText }} className="flex-1 flex flex-col justify-center max-w-3xl text-sm md:text-base gap-2 leading-relaxed mt-20 text-indigo-200">
          <motion.p variants={item} className="text-indigo-400 mb-4">kika@portfolio:~$ cat message_to_future_self.md</motion.p>
          
          <motion.h1 variants={item} className="text-2xl md:text-4xl font-display text-gray-100 mt-4 mb-2"># Hey Future Me</motion.h1>
          <motion.p variants={item}>If you're reading this, you made it through. Right now, it's 7:23 AM. Saturday. Quiet. The kind of morning where the world hasn't decided what it wants to be yet. I'm sitting here with my MacBook, thinking about how much has changed and how much hasn't.</motion.p>
          
          <motion.h2 variants={item} className="text-xl md:text-2xl font-display text-gray-100 mt-6 mb-2">## Where I Am</motion.h2>
          <motion.p variants={item}>Retired from music. Twenty years, 35 countries, 1000+ shows. Tomorrowland, EDC Vegas, Dreamstate. Tracks played by Armin. Signed to Vini Vici's label.</motion.p>
          <motion.p variants={item} className="mt-2">And then — done. No drama, no big finale. Just... ready.</motion.p>
          <motion.p variants={item} className="mt-2">Now I build things. Not because I have to. Because I can't not.</motion.p>
          
          <motion.p variants={item} className="mt-4"><strong className="text-gray-100 font-bold">Not a DJ. Not a developer.</strong><br/>Just... someone who makes things because they should exist.</motion.p>
          
          <motion.p variants={item} className="mt-4">nica, still nica. some veronica. aka kika.<br/>the girl who chose midi over a driver's license.</motion.p>
          
          <motion.h2 variants={item} className="text-xl md:text-2xl font-display text-gray-100 mt-6 mb-2">## For You, Later</motion.h2>
          <motion.p variants={item}>Remember this feeling. The uncertainty. The excitement. The not-knowing-but-building-anyway.</motion.p>
          
          <motion.p variants={item} className="mt-6">— <strong className="text-gray-100 font-bold">Kika</strong><br/><em className="opacity-80">*Age 36, Year 1 of the Second Act*</em></motion.p>
          
          <motion.blockquote variants={item} className="border-l-2 border-indigo-500 pl-4 mt-6 italic opacity-70">
            *With permission to drive since 2021*
          </motion.blockquote>
          
          <motion.p variants={item} className="text-indigo-400 mt-8">kika@portfolio:~$ <span className="blink bg-indigo-500 w-2 h-4 inline-block align-middle" /></motion.p>
        </motion.div>
      </div>

      <div className="min-h-screen p-6 md:p-12 flex flex-col justify-center max-w-5xl mx-auto gap-32 relative z-10">
        
        <div className="mb-12">
          <h2 className="text-4xl md:text-6xl font-display tracking-tighter text-gray-100 mb-2">things i made.</h2>
          <p className="text-xl md:text-2xl text-indigo-400 font-display tracking-widest glitch-wrapper glitch-p0 w-fit" data-text="things that made me...">things that made me...</p>
        </div>

        <a href="https://akakika.com/mochi/" target="_blank" rel="noopener noreferrer" className="block">
          <motion.div style={{ y: yCard1 }} className="border border-indigo-500/30 p-8 bg-indigo-900/10 backdrop-blur-sm relative group hover:bg-indigo-900/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(99,102,241,0.2)] hover:border-indigo-400/50">
            <div className="absolute -top-3 -left-3 text-xs bg-[#0a0a0a] px-2 text-indigo-300">FILE_01</div>
            <h2 className="text-3xl md:text-5xl mb-4 font-display tracking-tighter text-gray-100">MOCHI'S DAILY QUEST</h2>
            <p className="text-gray-200 text-sm md:text-base max-w-2xl mb-6">A retro Tamagotchi-style to-do companion who grows happier — and older — every time you get things done. Pixel productivity pal.</p>
            <div className="flex gap-4 text-xs text-indigo-400">
              <span>[MACOS]</span><span>[PRODUCTIVITY]</span><span>[GAMIFICATION]</span>
            </div>
          </motion.div>
        </a>

        <a href="https://akakika.com/resq/" target="_blank" rel="noopener noreferrer" className="block ml-auto md:w-3/4">
          <motion.div style={{ y: yCard2 }} className="border border-indigo-500/30 p-8 bg-indigo-900/10 backdrop-blur-sm relative group transition-all duration-500 hover:scale-[1.02] resq-theme-card">
            <div className="absolute -top-3 -left-3 text-xs bg-[#0a0a0a] px-2 text-indigo-300 group-hover:text-inherit transition-colors duration-500">FILE_02</div>
            <h2 className="text-3xl md:text-5xl mb-4 font-display tracking-tighter text-gray-100">RESQ</h2>
            <p className="text-gray-200 text-sm md:text-base max-w-2xl mb-6">Rescue messy text into clean Markdown. Turn OCR scraps, rough notes, and semi-structured text into clean Markdown with a local-first workflow.</p>
            <div className="flex gap-4 text-xs text-indigo-400 group-hover:text-inherit transition-colors duration-500">
              <span>[MACOS]</span><span>[LOCAL-FIRST]</span><span>[AI-OPTIONAL]</span>
            </div>
          </motion.div>
        </a>

        <motion.div style={{ y: yCard3 }} className="border border-indigo-500/30 p-8 bg-indigo-900/10 backdrop-blur-sm relative group hover:bg-indigo-900/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(99,102,241,0.2)] hover:border-indigo-400/50 ml-auto md:w-2/3">
          <div className="absolute -top-3 -left-3 text-xs bg-[#0a0a0a] px-2 text-indigo-300">FILE_03</div>
          <h2 className="text-3xl md:text-5xl mb-4 font-display tracking-tighter text-gray-100">BREAKPOINT</h2>
          <p className="text-gray-200 text-sm md:text-base max-w-2xl mb-6">One trigger. Full context. Ready to walk away. Single-click context capture. Snapshots your entire computer state. AI-powered action plan instantly.</p>
          <div className="flex gap-4 text-xs text-indigo-400">
            <span>[MACOS]</span><span>[AI-ENGINE]</span><span>[CONTEXT-CAPTURE]</span>
          </div>
        </motion.div>
      </div>

      <div id="about" className="min-h-screen p-6 md:p-12 flex flex-col relative z-10 border-t border-indigo-500/30 mt-32 pt-12 pb-12">
        <h2 className="text-4xl md:text-6xl font-display tracking-tighter mb-12 text-gray-100 glitch-wrapper glitch-p0 w-fit" data-text="ABOUT_ME">ABOUT_ME</h2>
        
        <div className="max-w-3xl space-y-6 text-sm md:text-base text-gray-200 leading-relaxed">
          <p>
            with ai i learned to actually code — the "i ship macos apps and mean it" kind. i study things before there are tutorials on youtube. i figure it out.
          </p>
          <p>
            I never meant to build products. I built tools for myself because nothing on the market fit the way my brain works.
          </p>
          <p>
            i've built the ghost — the complex, agentic intelligence of the Echosystem. the backend that thinks, remembers, and acts. now i'm building the skin — the beautiful, glassmorphic, local-first macOS shell that lets me feel that intelligence. not just use it. feel it.
          </p>
        </div>

        <div className="mt-12 md:mt-auto self-end border border-indigo-500/30 p-8 bg-indigo-900/10 backdrop-blur-sm w-full max-w-md">
          <h3 className="text-xl mb-4 font-bold tracking-widest text-gray-100">[SKILLS_&_TECH]</h3>
          <ul className="space-y-2 text-sm text-indigo-300 font-mono">
            <li>&gt; AI & Agentic Systems</li>
            <li>&gt; macOS App Development</li>
            <li>&gt; Local-First Architecture</li>
            <li>&gt; Glassmorphic UI/UX</li>
            <li>&gt; Complex Backend Systems</li>
            <li>&gt; Rapid Prototyping</li>
          </ul>
        </div>
      </div>
      
      <div className="h-40 flex items-center justify-center text-xs text-gray-400">
        EOF
      </div>
    </motion.div>
  );
};

export default function App() {
  const [phase, setPhase] = useState(0);
  const [isScriptRunning, setIsScriptRunning] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
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

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });

      const now = Date.now();
      const dt = Math.max(now - lastTime, 1);
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const velocity = Math.sqrt(dx * dx + dy * dy) / dt;
      
      setMouseVelocity(Math.min(velocity * 4, 8));
      
      lastTime = now;
      lastX = e.clientX;
      lastY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    const decay = setInterval(() => {
      setMouseVelocity(prev => Math.max(0, prev * 0.8 - 0.1));
    }, 50);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(decay);
    };
  }, []);

  const handleNextPhase = (next: number) => {
    setIsTransitioning(true);
    setPhase(next);
    setTimeout(() => setIsTransitioning(false), 800);
  };

  const handleRunScript = () => {
    setIsStarting(true);
    setTimeout(() => {
      setIsScriptRunning(true);
      setIsStarting(false);
    }, 400);
  };

  useEffect(() => {
    const threshold = 600; // pixels to scroll before transition
    
    const handleWheel = (e: WheelEvent) => {
      if (phase === 0 && isScriptRunning && !isTransitioning) {
        if (e.deltaY > 0) {
          scrollAccumulatorRef.current += e.deltaY;
        } else {
          scrollAccumulatorRef.current = Math.max(0, scrollAccumulatorRef.current + e.deltaY);
        }
        
        if (scrollAccumulatorRef.current > threshold) {
          handleNextPhase(1);
          scrollAccumulatorRef.current = 0;
          setScrollProgress(1);
          setTimeout(() => setScrollProgress(0), 800);
        } else {
          setScrollProgress(scrollAccumulatorRef.current / threshold);
        }
      }
    };
    
    let lastTouchY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      if (phase === 0 && isScriptRunning) lastTouchY = e.touches[0].clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (phase === 0 && isScriptRunning && !isTransitioning) {
        const touchY = e.touches[0].clientY;
        const deltaY = lastTouchY - touchY;
        lastTouchY = touchY;
        
        if (deltaY > 0) {
          scrollAccumulatorRef.current += deltaY;
        } else {
          scrollAccumulatorRef.current = Math.max(0, scrollAccumulatorRef.current + deltaY);
        }
        
        if (scrollAccumulatorRef.current > threshold) {
          handleNextPhase(1);
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
      className="relative w-full h-screen bg-black overflow-hidden selection:bg-indigo-500/30"
      style={{
        '--mouse-x': mousePos.x,
        '--mouse-y': mousePos.y,
        '--glitch-multiplier': isStarting ? 15 : isTransitioning ? 25 + (mouseDistance * 30) : (phase === 0 ? 2.5 + mouseVelocity + (mouseDistance * 4) + (scrollProgress * 25 * (0.5 + mouseDistance * 2.5)) : 2.5 + mouseVelocity * 2 + (phase1MaxScroll * 3)),
      } as React.CSSProperties}
    >
      <div className="crt-overlay" />
      <AnimatePresence>
        {phase === 0 && <Phase0 key="p0" onRunScript={handleRunScript} isScriptRunning={isScriptRunning} scrollProgress={scrollProgress} isStarting={isStarting} mousePos={mousePos} />}
        {phase === 1 && <Phase1 key="p1" onPrev={() => { setPhase(0); setIsScriptRunning(true); }} onMaxScrollChange={setPhase1MaxScroll} />}
      </AnimatePresence>
    </div>
  );
}
