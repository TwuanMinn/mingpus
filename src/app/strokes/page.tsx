export default function StrokesPage() {
  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 max-w-6xl mx-auto w-full pb-24 md:pb-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 items-start">
        {/* Character Info & Controls */}
        <div className="lg:col-span-4 space-y-4 sm:space-y-6 order-2 lg:order-1">
          <div className="bg-surface-container-low rounded-xl p-5 sm:p-8">
            <div className="mb-4 sm:mb-6">
              <span className="text-[10px] font-bold tracking-[0.2em] text-primary uppercase">Current Character</span>
              <h3 className="text-3xl sm:text-4xl font-black mt-2">永 (yǒng)</h3>
              <p className="text-on-surface-variant mt-2 text-xs sm:text-sm leading-relaxed">
                Meaning: Eternity. Contains all 8 basic brush strokes — the prime example for Chinese calligraphy.
              </p>
            </div>
            <div className="space-y-3 sm:space-y-4">
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

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <button className="flex flex-col items-center justify-center p-3 sm:p-4 bg-surface-container-highest/50 rounded-xl hover:bg-surface-container-high transition-colors group">
              <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-[20px] sm:text-[24px]">undo</span>
              <span className="text-[10px] sm:text-xs font-bold mt-1 sm:mt-2">Undo</span>
            </button>
            <button className="flex flex-col items-center justify-center p-3 sm:p-4 bg-surface-container-highest/50 rounded-xl hover:bg-surface-container-high transition-colors group">
              <span className="material-symbols-outlined text-outline group-hover:text-error transition-colors text-[20px] sm:text-[24px]">delete</span>
              <span className="text-[10px] sm:text-xs font-bold mt-1 sm:mt-2">Clear</span>
            </button>
          </div>

          <button className="w-full py-4 sm:py-5 bg-gradient-to-br from-primary to-secondary text-white rounded-full font-bold shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm sm:text-base">
            Check Accuracy
          </button>

          <div className="bg-surface-container-high/30 p-4 sm:p-6 rounded-xl border border-white/20 backdrop-blur-sm">
            <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-outline mb-3 sm:mb-4">Practice Tips</h4>
            <ul className="space-y-2 sm:space-y-3 text-[10px] sm:text-xs text-on-surface-variant">
              <li className="flex gap-2">
                <span className="text-primary font-bold flex-shrink-0">•</span>
                Keep your digital pen perpendicular to the screen.
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold flex-shrink-0">•</span>
                Control the pressure for the &quot;Nà&quot; stroke.
              </li>
            </ul>
          </div>
        </div>

        {/* Interactive Drawing Canvas */}
        <div className="lg:col-span-8 relative group order-1 lg:order-2">
          <div className="bg-surface-container-lowest rounded-2xl sm:rounded-3xl aspect-square w-full shadow-2xl shadow-on-surface/5 relative overflow-hidden flex items-center justify-center border border-surface-variant/30">
            <div className="absolute inset-0 canvas-grid opacity-30"></div>

            <div className="absolute inset-0 flex items-center justify-center">
              <span className="chinese-char text-[12rem] sm:text-[18rem] lg:text-[24rem] text-surface-container-high/60 select-none">永</span>
            </div>

            <div className="absolute inset-0 pointer-events-none hidden sm:block">
              <div className="stroke-number bg-primary text-white" style={{ top: "18%", left: "49%" }}>1</div>
              <div className="stroke-number bg-primary text-white" style={{ top: "35%", left: "35%" }}>2</div>
              <div className="stroke-number bg-primary text-white" style={{ top: "45%", left: "52%" }}>3</div>
              <div className="stroke-number bg-primary text-white" style={{ top: "60%", left: "25%" }}>4</div>
              <div className="stroke-number bg-primary text-white" style={{ top: "65%", left: "75%" }}>5</div>
            </div>

            <div className="absolute inset-0 cursor-crosshair z-10 flex flex-col items-center justify-center">
              <div className="text-primary/20 text-xs sm:text-sm font-medium uppercase tracking-widest pointer-events-none">
                Start Drawing Here
              </div>
            </div>

            <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 p-1 sm:p-1.5 bg-surface-container-lowest/80 backdrop-blur-md rounded-full shadow-lg border border-white/50 z-20">
              <button className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-primary text-white">
                <span className="material-symbols-outlined text-[18px] sm:text-[24px]">brush</span>
              </button>
              <button className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-outline hover:bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined text-[18px] sm:text-[24px]">ink_eraser</span>
              </button>
              <div className="w-px h-4 sm:h-6 bg-surface-variant my-auto mx-0.5 sm:mx-1"></div>
              <button className="px-2 sm:px-4 text-[10px] sm:text-xs font-bold text-on-surface-variant">
                0.5px
              </button>
            </div>
          </div>

          {/* Character Breakdown */}
          <div className="grid grid-cols-4 gap-2 sm:gap-4 mt-4 sm:mt-8">
            {[
              { char: "丶", name: "Diǎn" },
              { char: "一", name: "Héng" },
              { char: "丨", name: "Shù" },
              { char: "亅", name: "Gōu" },
            ].map((stroke) => (
              <div key={stroke.name} className="bg-surface-container-low rounded-lg sm:rounded-xl p-3 sm:p-4 flex flex-col items-center justify-center border border-transparent hover:border-primary/20 transition-all cursor-pointer">
                <span className="chinese-char text-lg sm:text-2xl text-primary">{stroke.char}</span>
                <span className="text-[9px] sm:text-[10px] font-bold mt-1 text-outline">{stroke.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
