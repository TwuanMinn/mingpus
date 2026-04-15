export default function StrokesPage() {
  return (
    <div className="flex-1 p-8 max-w-6xl mx-auto w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Character Info & Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface-container-low rounded-xl p-8">
            <div className="mb-6">
              <span className="text-[10px] font-bold tracking-[0.2em] text-primary uppercase">Current Character</span>
              <h3 className="text-4xl font-black mt-2">永 (yǒng)</h3>
              <p className="text-on-surface-variant mt-2 text-sm leading-relaxed">
                Meaning: Eternity. Often used as the prime example for Chinese calligraphy because it contains all 8 basic brush strokes.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-outline">Stroke Count</span>
                <span className="font-bold">5 Strokes</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-outline">Complexity</span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <div className="w-2 h-2 rounded-full bg-surface-variant"></div>
                  <div className="w-2 h-2 rounded-full bg-surface-variant"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex flex-col items-center justify-center p-4 bg-surface-container-highest/50 rounded-xl hover:bg-surface-container-high transition-colors group">
              <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">undo</span>
              <span className="text-xs font-bold mt-2">Undo</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 bg-surface-container-highest/50 rounded-xl hover:bg-surface-container-high transition-colors group">
              <span className="material-symbols-outlined text-outline group-hover:text-error transition-colors">delete</span>
              <span className="text-xs font-bold mt-2">Clear</span>
            </button>
          </div>

          <button className="w-full py-5 bg-gradient-to-br from-primary to-secondary text-white rounded-full font-bold shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all">
            Check Accuracy
          </button>

          <div className="bg-surface-container-high/30 p-6 rounded-xl border border-white/20 backdrop-blur-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-outline mb-4">Practice Tips</h4>
            <ul className="space-y-3 text-xs text-on-surface-variant">
              <li className="flex gap-2">
                <span className="text-primary font-bold">•</span>
                Keep your digital pen perpendicular to the screen.
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">•</span>
                Control the pressure for the &quot;Nà&quot; (diagonal down) stroke.
              </li>
            </ul>
          </div>
        </div>

        {/* Interactive Drawing Canvas */}
        <div className="lg:col-span-8 relative group">
          <div className="bg-surface-container-lowest rounded-3xl aspect-square w-full shadow-2xl shadow-on-surface/5 relative overflow-hidden flex items-center justify-center border border-surface-variant/30">
            {/* Canvas Grid Layer */}
            <div className="absolute inset-0 canvas-grid opacity-30"></div>

            {/* Reference Character Layer */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="chinese-char text-[24rem] text-surface-container-high/60 select-none">永</span>
            </div>

            {/* Guide Numbers */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="stroke-number bg-primary text-white" style={{ top: "18%", left: "49%" }}>1</div>
              <div className="stroke-number bg-primary text-white" style={{ top: "35%", left: "35%" }}>2</div>
              <div className="stroke-number bg-primary text-white" style={{ top: "45%", left: "52%" }}>3</div>
              <div className="stroke-number bg-primary text-white" style={{ top: "60%", left: "25%" }}>4</div>
              <div className="stroke-number bg-primary text-white" style={{ top: "65%", left: "75%" }}>5</div>
            </div>

            {/* User Drawing Area */}
            <div className="absolute inset-0 cursor-crosshair z-10 flex flex-col items-center justify-center">
              <div className="text-primary/20 text-sm font-medium uppercase tracking-widest pointer-events-none">
                Start Drawing Here
              </div>
            </div>

            {/* Canvas Floating Actions */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 p-1.5 bg-surface-container-lowest/80 backdrop-blur-md rounded-full shadow-lg border border-white/50 z-20">
              <button className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-white">
                <span className="material-symbols-outlined">brush</span>
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-full text-outline hover:bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined">ink_eraser</span>
              </button>
              <div className="w-px h-6 bg-surface-variant my-auto mx-1"></div>
              <button className="px-4 text-xs font-bold text-on-surface-variant">
                0.5px
              </button>
            </div>
          </div>

          {/* Character Breakdown Bento */}
          <div className="grid grid-cols-4 gap-4 mt-8">
            {[
              { char: "丶", name: "Diǎn" },
              { char: "一", name: "Héng" },
              { char: "丨", name: "Shù" },
              { char: "亅", name: "Gōu" },
            ].map((stroke) => (
              <div key={stroke.name} className="bg-surface-container-low rounded-xl p-4 flex flex-col items-center justify-center border border-transparent hover:border-primary/20 transition-all cursor-pointer">
                <span className="chinese-char text-2xl text-primary">{stroke.char}</span>
                <span className="text-[10px] font-bold mt-1 text-outline">{stroke.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
