export default function FlashcardsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-12 flex flex-col items-center pb-24 md:pb-8">
      {/* Progress Header */}
      <div className="w-full max-w-2xl mb-8 sm:mb-12 flex flex-col gap-3 sm:gap-4">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-[0.625rem] sm:text-[0.6875rem] font-bold tracking-[0.1em] text-primary uppercase">HSK Level 5 • Unit 4</span>
            <h1 className="text-xl sm:text-2xl font-[family-name:var(--font-jakarta)] font-extrabold text-on-surface">Daily Review Session</h1>
          </div>
          <div className="text-right">
            <span className="text-xs sm:text-sm font-medium text-on-surface-variant">Card 14 of 40</span>
          </div>
        </div>
        <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-secondary w-[35%] rounded-full"></div>
        </div>
      </div>

      {/* Flashcard Container */}
      <div className="w-full max-w-2xl aspect-[3/4] sm:aspect-[4/3] perspective-1000 relative group cursor-pointer">
        <div className="absolute inset-0 translate-y-3 sm:translate-y-4 scale-95 bg-surface-container-low rounded-2xl sm:rounded-[1.5rem] -z-10"></div>
        <div className="absolute inset-0 translate-y-1.5 sm:translate-y-2 scale-[0.97] bg-surface-container rounded-2xl sm:rounded-[1.5rem] -z-10"></div>

        <div className="w-full h-full relative preserve-3d transition-transform duration-700 ease-in-out shadow-[0_32px_64px_-4px_rgba(27,27,35,0.06)] rounded-2xl sm:rounded-[1.5rem]">
          {/* Front Side */}
          <div className="absolute inset-0 backface-hidden bg-surface-container-lowest rounded-2xl sm:rounded-[1.5rem] flex flex-col items-center justify-center p-6 sm:p-8 md:p-12 text-center">
            <div className="absolute top-4 sm:top-8 right-4 sm:right-8">
              <span className="px-2.5 sm:px-3 py-1 bg-primary-fixed text-primary text-[0.55rem] sm:text-[0.625rem] font-bold tracking-wider rounded-full uppercase">New Card</span>
            </div>
            <div className="font-[family-name:var(--font-noto-sc)] text-[5rem] sm:text-[8rem] md:text-[10rem] font-bold text-on-surface leading-none tracking-widest mb-4">
              慧
            </div>
            <div className="text-surface-variant text-xs sm:text-sm mt-4 sm:mt-8 flex items-center gap-2">
              <span className="material-symbols-outlined text-xs sm:text-sm">touch_app</span>
              Tap to reveal meaning
            </div>
          </div>

          {/* Back Side */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-surface-container-lowest rounded-2xl sm:rounded-[1.5rem] p-6 sm:p-8 md:p-12 flex flex-col">
            <div className="flex justify-between items-start mb-4 sm:mb-8">
              <div>
                <span className="text-primary font-bold text-lg sm:text-xl tracking-wide">huì</span>
                <h2 className="text-2xl sm:text-3xl font-[family-name:var(--font-jakarta)] font-bold text-on-surface">Wisdom / Intelligence</h2>
              </div>
              <button className="p-2 sm:p-3 bg-surface-container-low rounded-full text-primary flex-shrink-0">
                <span className="material-symbols-outlined text-[20px] sm:text-[24px]">volume_up</span>
              </button>
            </div>
            <div className="space-y-4 sm:space-y-6">
              <div className="p-3 sm:p-4 bg-surface-container-low rounded-xl">
                <h3 className="text-[0.6rem] sm:text-[0.6875rem] font-bold tracking-widest text-on-surface-variant uppercase mb-1 sm:mb-2">Example Sentence</h3>
                <p className="chinese-char text-base sm:text-lg text-on-surface mb-1">智慧是命运的一部分。</p>
                <p className="text-xs sm:text-sm text-on-surface-variant italic">Wisdom is a part of destiny.</p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 bg-surface-container-low rounded-xl">
                  <h3 className="text-[0.6rem] sm:text-[0.6875rem] font-bold tracking-widest text-on-surface-variant uppercase mb-1">Radical</h3>
                  <div className="flex items-center gap-2">
                    <span className="chinese-char text-lg sm:text-xl text-primary">心</span>
                    <span className="text-[10px] sm:text-xs text-on-surface-variant">(Heart)</span>
                  </div>
                </div>
                <div className="p-3 sm:p-4 bg-surface-container-low rounded-xl">
                  <h3 className="text-[0.6rem] sm:text-[0.6875rem] font-bold tracking-widest text-on-surface-variant uppercase mb-1">Strokes</h3>
                  <span className="text-lg sm:text-xl font-bold text-on-surface">15</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="w-full max-w-2xl mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <button className="sm:col-span-1 flex items-center justify-between p-4 sm:p-6 bg-surface-container-low rounded-xl hover:bg-primary-fixed transition-colors group">
          <div className="flex flex-col items-start">
            <span className="text-[0.6rem] sm:text-[0.6875rem] font-bold tracking-widest text-on-surface-variant uppercase">Status</span>
            <span className="font-bold text-on-surface group-hover:text-primary transition-colors text-sm sm:text-base">Mark Mastered</span>
          </div>
          <div className="w-10 sm:w-12 h-5 sm:h-6 bg-outline-variant rounded-full p-1 transition-colors group-hover:bg-primary/20">
            <div className="w-3 sm:w-4 h-3 sm:h-4 bg-white rounded-full shadow-sm"></div>
          </div>
        </button>
        <div className="sm:col-span-2 flex gap-3 sm:gap-4">
          <button className="flex-1 flex items-center justify-center gap-2 sm:gap-3 p-4 sm:p-6 bg-surface-container-low text-on-surface-variant rounded-xl hover:bg-surface-container-high transition-all active:scale-95 text-sm sm:text-base">
            <span className="material-symbols-outlined text-[20px] sm:text-[24px]">chevron_left</span>
            <span className="font-bold">Previous</span>
          </button>
          <button className="flex-[1.5] flex items-center justify-center gap-2 sm:gap-3 p-4 sm:p-6 bg-gradient-to-r from-primary to-secondary text-on-primary rounded-full shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95 text-sm sm:text-base">
            <span className="font-bold">Next</span>
            <span className="material-symbols-outlined text-[20px] sm:text-[24px]">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Secondary Actions */}
      <div className="flex flex-wrap gap-4 sm:gap-8 mt-8 sm:mt-12 justify-center">
        {[
          { icon: "edit", label: "Add Note" },
          { icon: "flag", label: "Report Error" },
          { icon: "draw", label: "Practice Strokes" },
        ].map((a) => (
          <button key={a.icon} className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-xs sm:text-sm font-medium">
            <span className="material-symbols-outlined text-base sm:text-lg">{a.icon}</span>
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}
