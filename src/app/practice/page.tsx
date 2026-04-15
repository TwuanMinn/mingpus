export default function PracticePage() {
  return (
    <div className="flex-1 flex flex-col px-4 sm:px-6 py-6 sm:py-8 max-w-5xl mx-auto w-full pb-24 md:pb-8">
      {/* Progress Section */}
      <div className="mb-8 sm:mb-12">
        <div className="flex justify-between items-end mb-3 sm:mb-4">
          <div>
            <span className="text-[0.625rem] sm:text-[0.6875rem] font-bold uppercase tracking-[0.15em] text-primary">Current Session</span>
            <h1 className="text-xl sm:text-2xl font-[family-name:var(--font-jakarta)] font-bold text-on-surface">Daily Review Flow</h1>
          </div>
          <div className="text-right">
            <span className="text-xs sm:text-sm font-medium text-on-surface-variant">14 / 20</span>
          </div>
        </div>
        <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-secondary w-[70%] rounded-full"></div>
        </div>
      </div>

      {/* Learning Canvas */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-2xl relative">
          <div className="absolute -top-8 sm:-top-12 -left-8 sm:-left-12 w-40 sm:w-64 h-40 sm:h-64 bg-primary-fixed/20 rounded-full blur-3xl -z-10"></div>
          <div className="absolute -bottom-8 sm:-bottom-12 -right-8 sm:-right-12 w-40 sm:w-64 h-40 sm:h-64 bg-secondary-fixed/20 rounded-full blur-3xl -z-10"></div>

          {/* The Card */}
          <div className="bg-surface-container-lowest rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-8 md:p-12 text-center shadow-[0_32px_64px_-4px_rgba(27,27,35,0.06)] relative overflow-hidden group">
            <div className="absolute top-4 sm:top-8 right-4 sm:right-8 bg-surface-container-low px-3 sm:px-4 py-1 rounded-full">
              <span className="text-[0.5rem] sm:text-[0.625rem] font-bold text-primary uppercase tracking-widest">HSK 4</span>
            </div>

            <div className="mb-4 sm:mb-6 mt-2 sm:mt-4">
              <span className="text-[5rem] sm:text-[8rem] md:text-[10rem] font-[family-name:var(--font-noto-sc)] text-on-surface leading-none block">学习</span>
            </div>

            <div className="mb-6 sm:mb-12">
              <span className="text-lg sm:text-2xl font-[family-name:var(--font-jakarta)] text-primary-container font-medium tracking-wide">xué xí</span>
            </div>

            <div className="relative">
              <button className="w-full py-5 sm:py-8 border-2 border-dashed border-outline-variant rounded-xl sm:rounded-2xl hover:bg-surface-container-low hover:border-primary/30 transition-all duration-300 active:scale-95">
                <div className="flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-2xl sm:text-3xl">visibility</span>
                  <span className="text-xs sm:text-sm font-medium text-on-surface-variant">Tap to reveal translation</span>
                </div>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 sm:gap-6 mt-6 sm:mt-12">
            <button className="flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-5 px-4 sm:px-8 rounded-full bg-surface-container-high text-on-surface font-bold hover:bg-surface-container-highest transition-all active:scale-95 text-sm sm:text-base">
              <span className="material-symbols-outlined text-[20px] sm:text-[24px]">history</span>
              <span>Review Later</span>
            </button>
            <button className="flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-5 px-4 sm:px-8 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-bold shadow-xl shadow-primary/20 hover:opacity-90 transition-all active:scale-95 text-sm sm:text-base">
              <span className="material-symbols-outlined text-[20px] sm:text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span>Mastered</span>
            </button>
          </div>
        </div>
      </div>

      {/* Auxiliary Information */}
      <div className="mt-10 sm:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-surface-container-low p-5 sm:p-6 rounded-2xl sm:rounded-3xl flex flex-col gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm">
              <span className="material-symbols-outlined text-[20px] sm:text-[24px]">lightbulb</span>
            </div>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-on-surface-variant">Mnemonic</span>
          </div>
          <p className="text-xs sm:text-sm text-on-surface leading-relaxed">The top part of <span className="chinese-char">学</span> represents a building with a roof, while the bottom <span className="chinese-char">子</span> means child.</p>
        </div>
        <div className="bg-surface-container-low p-5 sm:p-6 rounded-2xl sm:rounded-3xl flex flex-col gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white flex items-center justify-center text-secondary shadow-sm">
              <span className="material-symbols-outlined text-[20px] sm:text-[24px]">menu_book</span>
            </div>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-on-surface-variant">Examples</span>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-on-surface">
            <li className="flex justify-between items-center gap-2"><span className="chinese-char">去学校学习</span> <span className="text-[9px] sm:text-[10px] text-outline uppercase font-bold tracking-tighter whitespace-nowrap">Go to school</span></li>
            <li className="flex justify-between items-center gap-2"><span className="chinese-char">学习汉语</span> <span className="text-[9px] sm:text-[10px] text-outline uppercase font-bold tracking-tighter whitespace-nowrap">Study Chinese</span></li>
          </ul>
        </div>
        <div className="bg-surface-container-low p-5 sm:p-6 rounded-2xl sm:rounded-3xl flex flex-col gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white flex items-center justify-center text-tertiary shadow-sm">
              <span className="material-symbols-outlined text-[20px] sm:text-[24px]">insights</span>
            </div>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-on-surface-variant">Performance</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-bold text-on-surface">88%</span>
            <span className="text-[10px] text-on-surface-variant">Retention Rate</span>
          </div>
          <div className="flex gap-1 h-1">
            <div className="flex-1 bg-primary rounded-full"></div>
            <div className="flex-1 bg-primary rounded-full"></div>
            <div className="flex-1 bg-primary rounded-full"></div>
            <div className="flex-1 bg-surface-variant rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
