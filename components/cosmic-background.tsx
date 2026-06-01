export function CosmicBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.20),transparent_34%),radial-gradient(circle_at_78%_14%,rgba(139,92,246,0.16),transparent_30%),linear-gradient(135deg,rgba(2,6,23,1),rgba(15,23,42,0.95)_45%,rgba(30,27,75,0.72))]" />
      <div className="absolute inset-0 opacity-45 [background-image:radial-gradient(rgba(226,232,240,0.58)_1px,transparent_1px)] [background-size:42px_42px]" />
      <div className="absolute inset-0 animate-drift opacity-25 [background-image:radial-gradient(rgba(103,232,249,0.5)_1px,transparent_1px)] [background-size:96px_96px]" />
      <div className="absolute left-0 right-0 top-28 h-px animate-pulseLine bg-gradient-to-r from-transparent via-cyan-200/40 to-transparent" />
    </div>
  );
}
