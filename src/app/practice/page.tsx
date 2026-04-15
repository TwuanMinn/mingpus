export default function PracticePage() {
  return (
    <div className="flex-1 flex flex-col px-6 py-8 max-w-5xl mx-auto w-full">
      {/* Progress Section */}
      <div className="mb-12">
        <div className="flex justify-between items-end mb-4">
          <div>
            <span className="text-[0.6875rem] font-bold uppercase tracking-[0.15em] text-primary">Current Session</span>
            <h1 className="text-2xl font-[family-name:var(--font-jakarta)] font-bold text-on-surface">Daily Review Flow</h1>
          </div>
          <div className="text-right">
            <span className="text-sm font-medium text-on-surface-variant">14 / 20 characters</span>
          </div>
        </div>
        <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-secondary w-[70%] rounded-full"></div>
        </div>
      </div>

      {/* Learning Canvas */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-2xl relative">
          {/* Decorative background */}
          <div className="absolute -top-12 -left-12 w-64 h-64 bg-primary-fixed/20 rounded-full blur-3xl -z-10"></div>
          <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-secondary-fixed/20 rounded-full blur-3xl -z-10"></div>

          {/* The Card */}
          <div className="bg-surface-container-lowest rounded-[2.5rem] p-12 text-center shadow-[0_32px_64px_-4px_rgba(27,27,35,0.06)] relative overflow-hidden group">
            {/* HSK Badge */}
            <div className="absolute top-8 right-8 bg-surface-container-low px-4 py-1 rounded-full">
              <span className="text-[0.625rem] font-bold text-primary uppercase tracking-widest">HSK 4</span>
            </div>

            {/* Character Display */}
            <div className="mb-6 mt-4">
              <span className="text-[8rem] md:text-[10rem] font-[family-name:var(--font-noto-sc)] text-on-surface leading-none block">学习</span>
            </div>

            {/* Pinyin */}
            <div className="mb-12">
              <span className="text-2xl font-[family-name:var(--font-jakarta)] text-primary-container font-medium tracking-wide">xué xí</span>
            </div>

            {/* Interactive Reveal Area */}
            <div className="relative">
              <button className="w-full py-8 border-2 border-dashed border-outline-variant rounded-2xl hover:bg-surface-container-low hover:border-primary/30 transition-all duration-300 active:scale-95">
                <div className="flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-3xl">visibility</span>
                  <span className="text-sm font-medium text-on-surface-variant">Tap to reveal translation</span>
                </div>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-6 mt-12">
            <button className="flex items-center justify-center gap-3 py-5 px-8 rounded-full bg-surface-container-high text-on-surface font-bold hover:bg-surface-container-highest transition-all active:scale-95">
              <span className="material-symbols-outlined">history</span>
              <span>Review Later</span>
            </button>
            <button className="flex items-center justify-center gap-3 py-5 px-8 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-bold shadow-xl shadow-primary/20 hover:opacity-90 transition-all active:scale-95">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span>Mastered</span>
            </button>
          </div>
        </div>
      </div>

      {/* Auxiliary Information */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-low p-6 rounded-3xl flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm">
              <span className="material-symbols-outlined">lightbulb</span>
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Mnemonic</span>
          </div>
          <p className="text-sm text-on-surface leading-relaxed">The top part of <span className="chinese-char">学</span> represents a building with a roof, while the bottom <span className="chinese-char">子</span> means child.</p>
        </div>
        <div className="bg-surface-container-low p-6 rounded-3xl flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-secondary shadow-sm">
              <span className="material-symbols-outlined">menu_book</span>
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Examples</span>
          </div>
          <ul className="space-y-2 text-sm text-on-surface">
            <li className="flex justify-between items-center"><span className="chinese-char">去学校学习</span> <span className="text-[10px] text-outline uppercase font-bold tracking-tighter">Go to school to study</span></li>
            <li className="flex justify-between items-center"><span className="chinese-char">学习汉语</span> <span className="text-[10px] text-outline uppercase font-bold tracking-tighter">Study Chinese</span></li>
          </ul>
        </div>
        <div className="bg-surface-container-low p-6 rounded-3xl flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-tertiary shadow-sm">
              <span className="material-symbols-outlined">insights</span>
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Performance</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-on-surface">88%</span>
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
