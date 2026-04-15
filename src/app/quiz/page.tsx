export default function QuizPage() {
  return (
    <div className="flex-1 p-6 md:p-12 max-w-6xl mx-auto w-full">
      {/* Quiz Progress Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-1">
          <span className="text-[0.6875rem] font-bold text-primary uppercase tracking-[0.2em]">Current Session: Vocabulary HSK 5</span>
          <h2 className="text-3xl md:text-4xl font-[family-name:var(--font-jakarta)] font-extrabold text-on-surface tracking-tight">Focus Mastery</h2>
        </div>
        <div className="flex items-center gap-8 bg-surface-container-low px-8 py-4 rounded-xl">
          <div className="text-center">
            <p className="text-[0.6875rem] font-bold text-slate-400 uppercase tracking-widest mb-1">Score</p>
            <p className="text-2xl font-[family-name:var(--font-jakarta)] font-black text-primary">1,420</p>
          </div>
          <div className="h-10 w-[1px] bg-outline-variant/30"></div>
          <div className="text-center">
            <p className="text-[0.6875rem] font-bold text-slate-400 uppercase tracking-widest mb-1">Streak</p>
            <p className="text-2xl font-[family-name:var(--font-jakarta)] font-black text-secondary">12 🔥</p>
          </div>
          <div className="h-10 w-[1px] bg-outline-variant/30"></div>
          <div className="text-center">
            <p className="text-[0.6875rem] font-bold text-slate-400 uppercase tracking-widest mb-1">Progress</p>
            <p className="text-2xl font-[family-name:var(--font-jakarta)] font-black text-on-surface">08<span className="text-slate-300">/20</span></p>
          </div>
        </div>
      </div>

      {/* Quiz Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Hero Character Card */}
        <div className="lg:col-span-7 aspect-square md:aspect-video lg:aspect-auto lg:h-[500px] flex flex-col justify-center items-center bg-surface-container-lowest rounded-xl p-12 transition-colors hover:bg-primary-fixed group relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
            <p className="text-[20rem] chinese-char font-bold leading-none">夢</p>
          </div>
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-[10rem] md:text-[14rem] chinese-char font-bold text-on-surface tracking-[0.05em] leading-none mb-4">夢</span>
            <div className="flex gap-4">
              <button className="w-12 h-12 flex items-center justify-center rounded-full bg-surface-container-high hover:bg-primary hover:text-white transition-all">
                <span className="material-symbols-outlined">volume_up</span>
              </button>
              <button className="w-12 h-12 flex items-center justify-center rounded-full bg-surface-container-high hover:bg-primary hover:text-white transition-all">
                <span className="material-symbols-outlined">brush</span>
              </button>
            </div>
          </div>
          <div className="absolute bottom-8 left-8 right-8 flex justify-between items-center">
            <span className="px-4 py-1 rounded-full border border-primary/20 text-[0.6875rem] font-bold text-primary uppercase tracking-widest">Identify Meaning</span>
            <div className="flex items-center gap-2">
              <div className="w-32 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                <div className="w-[40%] h-full bg-primary"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Multiple Choice Options */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {[
            { letter: "A", title: "Nightmare", sub: "Èmèng (噩梦)", correct: false, selected: false },
            { letter: "B", title: "Reality", sub: "Xiànshí (现实)", correct: false, selected: false },
            { letter: "C", title: "Dream", sub: "Mèng (梦)", correct: true, selected: true },
            { letter: "D", title: "Sleep", sub: "Shuìjiào (睡觉)", correct: false, selected: false },
          ].map((opt) => (
            <button
              key={opt.letter}
              className={`w-full p-6 text-left rounded-xl transition-all flex items-center justify-between group ${
                opt.selected && opt.correct
                  ? "bg-primary-fixed border-l-4 border-primary ring-2 ring-primary/20"
                  : "bg-surface-container-lowest hover:bg-surface-container-high border-l-4 border-transparent"
              }`}
            >
              <div className="flex items-center gap-6">
                <span className={`w-10 h-10 flex items-center justify-center rounded-lg font-[family-name:var(--font-jakarta)] font-bold text-sm transition-colors ${
                  opt.selected && opt.correct
                    ? "bg-primary text-white"
                    : "bg-surface-container text-slate-400 group-hover:bg-primary group-hover:text-white"
                }`}>{opt.letter}</span>
                <div>
                  <h4 className={`text-xl font-[family-name:var(--font-jakarta)] font-bold ${opt.selected && opt.correct ? "text-primary" : "text-on-surface"}`}>{opt.title}</h4>
                  <p className={`text-sm font-medium ${opt.selected && opt.correct ? "text-primary/70" : "text-slate-500"}`}>{opt.sub}</p>
                </div>
              </div>
              {opt.selected && opt.correct ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-primary uppercase tracking-widest">+50 XP</span>
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
              ) : (
                <span className="material-symbols-outlined text-slate-300 opacity-0 group-hover:opacity-100">arrow_forward</span>
              )}
            </button>
          ))}

          {/* Session Controls */}
          <div className="mt-6 flex gap-4">
            <button className="flex-1 py-4 bg-surface-container text-on-surface font-[family-name:var(--font-jakarta)] font-bold rounded-full hover:bg-surface-container-high transition-colors flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[20px]">flag</span>
              Report
            </button>
            <button className="flex-[2] py-4 bg-gradient-to-r from-primary to-secondary text-white font-[family-name:var(--font-jakarta)] font-bold rounded-full hover:opacity-90 transition-all flex items-center justify-center gap-2 group">
              Next Question
              <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward_ios</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contextual Information */}
      <section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-low p-6 rounded-xl space-y-3">
          <div className="flex items-center gap-3 text-primary">
            <span className="material-symbols-outlined">lightbulb</span>
            <h5 className="font-bold text-sm uppercase tracking-widest">Etymology Hint</h5>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">The character represents eyebrows and eyes over a bed, suggesting the visions seen while sleeping.</p>
        </div>
        <div className="bg-surface-container-low p-6 rounded-xl space-y-3">
          <div className="flex items-center gap-3 text-secondary">
            <span className="material-symbols-outlined">auto_awesome</span>
            <h5 className="font-bold text-sm uppercase tracking-widest">Common Usage</h5>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">Often used in <span className="font-bold">梦想 (mèngxiǎng)</span> which means a cherished ambition or ideal.</p>
        </div>
        <div className="bg-surface-container-low p-6 rounded-xl space-y-3 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 text-primary">
              <span className="material-symbols-outlined">trending_up</span>
              <h5 className="font-bold text-sm uppercase tracking-widest">Performance</h5>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed mt-3">You get this character right 92% of the time. You are approaching mastery!</p>
          </div>
        </div>
      </section>
    </div>
  );
}
