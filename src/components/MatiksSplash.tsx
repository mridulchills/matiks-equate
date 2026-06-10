import { useEffect, useRef, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface MatiksSplashProps {
  onComplete: () => void;
}

const BRAND = '#AAFF45';
const BG = '#131313';

// Sizes in px — tuned for the 400×850 mobile container
const BIG_RING = 100;
const BIG_RING_BORDER = 12;
const DIAG = 55;               // diagonal offset for initial ring positions

const LOGO_O = 56;
const LOGO_O_BORDER = 9;
const LOGO_O_X = 37;

// Slash dimensions (final shape = rounded capsule)
const SLASH_W = 10;
const SLASH_H = 65;
const SLASH_R = 5;             // border-radius for capsule ends
const SLASH_ROTATE = 15;

export default function MatiksSplash({ onComplete }: MatiksSplashProps) {
  const [visible, setVisible] = useState(true);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const bigRing1 = useAnimation();
  const bigRing2 = useAnimation();
  const dotSlash = useAnimation();
  const logoLeft = useAnimation();
  const logoRight = useAnimation();
  const wordmarkCtrl = useAnimation();
  const taglineCtrl = useAnimation();
  const wrapperCtrl = useAnimation();

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const schedule = (fn: () => void, delay: number) => {
    const id = setTimeout(fn, delay);
    timeoutsRef.current.push(id);
    return id;
  };

  useEffect(() => {
    if (prefersReducedMotion) {
      dotSlash.set({ width: SLASH_W, height: SLASH_H, borderRadius: SLASH_R, rotate: SLASH_ROTATE, opacity: 1 });
      logoLeft.set({ x: -LOGO_O_X, opacity: 1 });
      logoRight.set({ x: LOGO_O_X, opacity: 1 });
      wordmarkCtrl.set({ opacity: 1, y: 0 });
      taglineCtrl.set({ opacity: 0.75, y: 0 });
      schedule(() => { setVisible(false); onComplete(); }, 1200);
      return;
    }

    // ─── Phase 1: Black screen (0–300ms) ───

    // ─── Phase 2: Rings + dot spring in DIAGONALLY (300ms) ───
    schedule(() => {
      bigRing1.start({
        scaleX: 1, scaleY: 1, opacity: 1,
        x: -DIAG, y: -DIAG,
        transition: { type: 'spring', stiffness: 200, damping: 20 },
      });
      dotSlash.start({
        width: 16, height: 16, borderRadius: 8, opacity: 1,
        transition: { type: 'spring', stiffness: 250, damping: 22, delay: 0.05 },
      });
      schedule(() => {
        bigRing2.start({
          scaleX: 1, scaleY: 1, opacity: 1,
          x: DIAG, y: DIAG,
          transition: { type: 'spring', stiffness: 200, damping: 20 },
        });
      }, 100);
    }, 300);

    // ─── Phase 3: Rings zoom to fill screen, dot squeezes into capsule slash (900ms) ───
    schedule(() => {
      bigRing1.start({
        x: -120, y: -150, scaleX: 5, scaleY: 5,
        transition: { duration: 0.5, ease: [0.42, 0, 0.58, 1] },
      });
      bigRing2.start({
        x: 120, y: 150, scaleX: 5, scaleY: 5,
        transition: { duration: 0.5, ease: [0.42, 0, 0.58, 1] },
      });
      // Dot morphs: circle → rounded capsule slash
      dotSlash.start({
        width: SLASH_W,
        height: SLASH_H,
        borderRadius: SLASH_R,
        rotate: SLASH_ROTATE,
        transition: { duration: 0.45, ease: [0.42, 0, 0.58, 1] },
      });
    }, 900);

    // ─── Phase 4: Rings exit frame (1400ms) ───
    schedule(() => {
      bigRing1.start({
        x: -500, opacity: 0,
        transition: { duration: 0.3, ease: [0.42, 0, 1, 1] },
      });
      bigRing2.start({
        x: 500, opacity: 0,
        transition: { duration: 0.3, ease: [0.42, 0, 1, 1] },
      });
    }, 1400);

    // ─── Phase 5: Logo o's slide in (1700ms) ───
    schedule(() => {
      logoLeft.start({
        x: -LOGO_O_X, opacity: 1,
        transition: { duration: 0.35, ease: [0, 0, 0.2, 1] },
      });
      logoRight.start({
        x: LOGO_O_X, opacity: 1,
        transition: { duration: 0.35, ease: [0, 0, 0.2, 1] },
      });
    }, 1700);

    // ─── Phase 6: Wordmark + tagline (2100ms) ───
    schedule(() => {
      wordmarkCtrl.start({
        opacity: 1, y: 0,
        transition: { duration: 0.35, ease: [0, 0, 0.2, 1] },
      });
      schedule(() => {
        taglineCtrl.start({
          opacity: 0.75, y: 0,
          transition: { duration: 0.35, ease: [0, 0, 0.2, 1] },
        });
      }, 200);
    }, 2100);

    // ─── Phase 7: Hold then fade (2900ms) ───
    schedule(() => {
      wrapperCtrl.start({
        opacity: 0,
        transition: { duration: 0.3, ease: [0.42, 0, 1, 1] },
      });
    }, 2900);

    schedule(() => { setVisible(false); onComplete(); }, 3200);

    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    };
  }, []);

  if (!visible) return null;

  const centered = (size: number): React.CSSProperties => ({
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: size,
    height: size,
    marginLeft: -size / 2,
    marginTop: -size / 2,
  });

  return (
    <motion.div
      animate={wrapperCtrl}
      initial={{ opacity: 1 }}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 9999,
        background: BG,
        overflow: 'hidden',
      }}
    >
      {/* ── Big Ring 1 (top-left diagonal) ── */}
      <motion.div
        animate={bigRing1}
        initial={{ scaleX: 0, scaleY: 0, opacity: 0, x: 0, y: 0 }}
        style={{
          ...centered(BIG_RING),
          borderRadius: '50%',
          border: `${BIG_RING_BORDER}px solid ${BRAND}`,
          backgroundColor: 'transparent',
        }}
      />

      {/* ── Big Ring 2 (bottom-right diagonal) ── */}
      <motion.div
        animate={bigRing2}
        initial={{ scaleX: 0, scaleY: 0, opacity: 0, x: 0, y: 0 }}
        style={{
          ...centered(BIG_RING),
          borderRadius: '50%',
          border: `${BIG_RING_BORDER}px solid ${BRAND}`,
          backgroundColor: 'transparent',
        }}
      />

      {/* ── Dot → Slash (capsule morph, persists all phases) ── */}
      {/* Wrapper stays centered; the motion div grows/shrinks within it */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 0,
          height: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'visible',
        }}
      >
        <motion.div
          animate={dotSlash}
          initial={{
            width: 0,
            height: 0,
            opacity: 0,
            borderRadius: 8,
            rotate: 0,
          }}
          style={{
            backgroundColor: BRAND,
            flexShrink: 0,
          }}
        />
      </div>

      {/* ── Logo Left "o" ── */}
      <motion.div
        animate={logoLeft}
        initial={{ x: -160, opacity: 0 }}
        style={{
          ...centered(LOGO_O),
          borderRadius: '50%',
          border: `${LOGO_O_BORDER}px solid ${BRAND}`,
          backgroundColor: 'transparent',
        }}
      />

      {/* ── Logo Right "o" ── */}
      <motion.div
        animate={logoRight}
        initial={{ x: 160, opacity: 0 }}
        style={{
          ...centered(LOGO_O),
          borderRadius: '50%',
          border: `${LOGO_O_BORDER}px solid ${BRAND}`,
          backgroundColor: 'transparent',
        }}
      />

      {/* ── "MATIKS" wordmark ── */}
      <motion.div
        animate={wordmarkCtrl}
        initial={{ opacity: 0, y: 12 }}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '50%',
          marginTop: 55,
          textAlign: 'center',
          color: BRAND,
          fontFamily: "'Inter', sans-serif",
          fontWeight: 900,
          fontSize: 36,
          letterSpacing: '0.08em',
          userSelect: 'none',
        }}
      >
        MATIKS
      </motion.div>

      {/* ── "play it smart" tagline ── */}
      <motion.div
        animate={taglineCtrl}
        initial={{ opacity: 0, y: 12 }}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '50%',
          marginTop: 100,
          textAlign: 'center',
          color: BRAND,
          fontFamily: "'Inter', sans-serif",
          fontWeight: 400,
          fontSize: 16,
          userSelect: 'none',
        }}
      >
        play it smart
      </motion.div>
    </motion.div>
  );
}
