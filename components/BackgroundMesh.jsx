"use client";

/**
 * Ambient, slow-drifting gradient mesh built from Electric Green + Rich Purple
 * blobs on the Deep Black canvas. Uses translate3d/scale keyframes (see
 * tailwind.config.js) so the animation runs on the GPU compositor for smooth
 * 60fps on mobile and tablet. Purely decorative, so it's aria-hidden and
 * pointer-events-none to avoid interfering with touch interactions.
 */
export default function BackgroundMesh() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-canvas"
    >
      {/* Electric Green blob */}
      <div className="gpu absolute -left-32 top-[-10%] h-[45vh] w-[45vh] rounded-full bg-accent/25 blur-[120px] animate-drift" />
      {/* Rich Purple blob */}
      <div className="gpu absolute right-[-15%] top-[20%] h-[55vh] w-[55vh] rounded-full bg-highlight/30 blur-[140px] animate-drift-slow" />
      {/* Secondary green glow low on the page */}
      <div className="gpu absolute bottom-[-20%] left-1/3 h-[50vh] w-[50vh] rounded-full bg-accent/15 blur-[130px] animate-drift-slow" />
      {/* Subtle vignette to keep foreground content legible */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
    </div>
  );
}
