export default function LivingBackground() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-serana-cream">
      {/* Static grain texture */}
      <div className="absolute inset-0 opacity-[0.3] pointer-events-none mix-blend-multiply" 
           style={{ 
             backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'1\'/%3E%3C/svg%3E")',
             filter: 'contrast(120%) brightness(100%)'
           }}></div>

      {/* Static subtle orbs — no mouse/scroll tracking */}
      <div className="absolute -top-[10%] -left-[10%] w-[80vw] h-[80vw] bg-gradient-to-br from-serana-olive/8 to-transparent rounded-full blur-[120px]" />
      <div className="absolute top-[20%] -right-[20%] w-[70vw] h-[70vw] bg-gradient-to-bl from-serana-ochre/8 to-serana-terracotta/5 rounded-full blur-[140px]" />
      <div className="absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vw] bg-gradient-to-t from-serana-forest/5 to-transparent rounded-full blur-[130px]" />
    </div>
  );
}
