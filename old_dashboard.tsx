import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 pb-24 md:pb-8">
      {/* Hero Header Section */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-6 pb-2 sm:pb-4">
        <div className="space-y-1">
          <span className="text-[0.6875rem] font-bold tracking-[0.15em] text-primary uppercase">Welcome back, Scholar</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface font-[family-name:var(--font-jakarta)] leading-tight">Your Daily Focus</h2>
        </div>
        <div className="flex gap-3 sm:gap-4 w-full sm:w-auto">
          <div className="flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-surface-container-low rounded-xl text-center">
            <p className="text-[10px] sm:text-xs font-bold text-outline uppercase tracking-wider">HSK Progress</p>
            <p className="text-lg sm:text-xl font-black text-secondary">74%</p>
          </div>
          <div className="flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-surface-container-low rounded-xl text-center">
            <p className="text-[10px] sm:text-xs font-bold text-outline uppercase tracking-wider">Known Words</p>
            <p className="text-lg sm:text-xl font-black text-primary">1,284</p>
          </div>
        </div>
      </section>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Main Study Card */}
        <div className="sm:col-span-2 lg:col-span-8 bg-surface-container-lowest rounded-xl p-6 sm:p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-40 sm:w-64 h-40 sm:h-64 bg-primary-fixed/20 rounded-full blur-3xl -mr-10 sm:-mr-20 -mt-10 sm:-mt-20 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10 flex flex-col h-full justify-between gap-6 sm:gap-12">
            <div className="flex justify-between items-start">
              <div className="space-y-3 sm:space-y-4 max-w-md">
                <span className="px-3 py-1 bg-primary-fixed text-primary text-[0.6rem] sm:text-[0.65rem] font-bold rounded-full uppercase tracking-widest">Active Review</span>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-[family-name:var(--font-jakarta)] font-black text-on-surface">Experience the Flow of Memory.</h3>
                <p className="text-on-surface-variant leading-relaxed text-sm sm:text-base">You have <span className="font-bold text-primary">42 critical characters</span> due for spaced repetition today.</p>
              </div>
              <div className="hidden lg:block">
                <span className="chinese-char text-[8rem] font-bold text-primary/10 select-none">记忆</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link href="/practice" className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-full font-bold text-sm sm:text-base shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-center">
                Resume Session
              </Link>
              <button className="px-6 sm:px-8 py-3 sm:py-4 bg-surface-container-high text-on-surface rounded-full font-bold text-sm sm:text-base hover:bg-primary-fixed transition-colors text-center">
                Browse Deck
              </button>
            </div>
          </div>
        </div>

        {/* Daily Goal Tracker */}
        <div className="sm:col-span-2 lg:col-span-4 glass-effect rounded-xl p-6 sm:p-8 flex flex-col justify-between border border-white/40">
          <div className="space-y-5 sm:space-y-6">
            <div className="flex justify-between items-center">
              <h4 className="font-[family-name:var(--font-jakarta)] font-extrabold text-on-surface uppercase tracking-tight text-sm sm:text-base">Daily Goal</h4>
              <span className="material-symbols-outlined text-primary">target</span>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant font-medium">Character Recognition</span>
                <span className="font-bold text-on-surface">18 / 25</span>
              </div>
              <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-secondary w-[72%] rounded-full"></div>
              </div>
            </div>
            <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant font-medium">Strokes Practiced</span>
                <span className="font-bold text-on-surface">5 / 10</span>
              </div>
              <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-primary/40 w-[50%] rounded-full"></div>
              </div>
            </div>
          </div>
          <div className="mt-6 sm:mt-8 p-4 bg-white/50 rounded-xl">
            <p className="text-xs text-on-surface-variant font-medium">&quot;Learning is a treasure that will follow its owner everywhere.&quot;</p>
          </div>
        </div>

        {/* Words to Review */}
        <div className="sm:col-span-2 lg:col-span-5 bg-surface-container-low rounded-xl p-6 sm:p-8 space-y-6 sm:space-y-8">
          <div className="flex justify-between items-center">
            <h4 className="font-[family-name:var(--font-jakarta)] font-extrabold text-on-surface uppercase tracking-tight text-sm sm:text-base">Critical Review</h4>
            <button className="text-primary text-xs font-bold hover:underline">View All</button>
          </div>
          <div className="space-y-4 sm:space-y-6">
            {[
              { char: "夢", pinyin: "mèng", meaning: "Dream, Vision", status: "Urgent", statusColor: "text-error" },
              { char: "愛", pinyin: "ài", meaning: "Love, Affection", status: "Mastering", statusColor: "text-outline" },
              { char: "靜", pinyin: "jìng", meaning: "Quiet, Calm, Still", status: "New", statusColor: "text-outline" },
            ].map((word) => (
              <div key={word.char} className="flex items-center gap-4 sm:gap-6 group cursor-pointer">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-surface-container-lowest rounded-xl flex items-center justify-center transition-colors group-hover:bg-primary-fixed flex-shrink-0">
                  <span className="chinese-char text-2xl sm:text-3xl font-bold text-on-surface">{word.char}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h5 className="font-bold text-on-surface">{word.pinyin}</h5>
                    <span className={`text-[0.6rem] sm:text-[0.65rem] font-bold ${word.statusColor} uppercase`}>{word.status}</span>
                  </div>
                  <p className="text-sm text-on-surface-variant truncate">{word.meaning}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Session Quick Start */}
        <div className="sm:col-span-2 lg:col-span-7 grid grid-cols-2 gap-3 sm:gap-6">
          {[
            { icon: "bolt", title: "Rapid Fire", desc: "5-minute sprint to reinforce high-frequency words.", hoverBg: "hover:bg-primary-fixed", iconColor: "text-primary" },
            { icon: "edit_note", title: "Stroke Master", desc: "Focus exclusively on handwriting and radical order.", hoverBg: "hover:bg-secondary-fixed", iconColor: "text-secondary" },
            { icon: "hearing", title: "Pure Tones", desc: "Aural recognition for challenging HSK vocabulary.", hoverBg: "hover:bg-surface-container-high", iconColor: "text-tertiary" },
            { icon: "explore", title: "Expansion", desc: "Discover 20 new characters based on your level.", hoverBg: "hover:bg-surface-container-high", iconColor: "text-on-surface-variant" },
          ].map((card) => (
            <div key={card.title} className={`bg-surface-container-lowest rounded-xl p-4 sm:p-6 lg:p-8 ${card.hoverBg} transition-colors cursor-pointer flex flex-col justify-between gap-3 sm:gap-4`}>
              <span className={`material-symbols-outlined text-2xl sm:text-3xl lg:text-4xl ${card.iconColor}`}>{card.icon}</span>
              <div>
                <h4 className="font-[family-name:var(--font-jakarta)] font-bold text-base sm:text-lg lg:text-xl text-on-surface mb-1 sm:mb-2">{card.title}</h4>
                <p className="text-xs sm:text-sm text-on-surface-variant line-clamp-2">{card.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievement Banner */}
      <section className="relative w-full min-h-[120px] sm:h-48 rounded-xl overflow-hidden flex items-center p-6 sm:p-8 lg:p-12">
        <div className="absolute inset-0 bg-gradient-to-r from-secondary to-primary mix-blend-multiply opacity-20"></div>
        <div className="absolute inset-0 bg-cover bg-center -z-10" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDkJ5UfCE7Wn5iAEVA-Wslcp-oFwFfcngs4ETYJo7DYH8rsb6XKaRBaRpS4FnwCUguDKtbL5M0ZmmwonO89aIaLKrKq3Oa3M5aEf3eriqlI8a7zWAE0hk8Ddy2Biao6VQzgrE7jxDI_6FrHjGmqG5I-TewSPOHGD8mUYn-5GrcxqcAn-q5KbfdMVZJE_H_dp4fQRfxgJH-e-u1eYE6nV7CAa-SxhPDPLifbEWX5RPeJ0Jfu9LX-vAGTR3KGSBr8EfWjEp3kk1rhbfE7')" }}></div>
        <div className="relative z-10 w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-on-surface">
          <div className="space-y-1 sm:space-y-2">
            <h4 className="text-xl sm:text-2xl font-black font-[family-name:var(--font-jakarta)]">Weekly Milestone Reached</h4>
            <p className="text-on-surface-variant font-medium text-sm sm:text-base">You&apos;ve studied for 7 consecutive days. Retention up 12%.</p>
          </div>
          <button className="bg-white text-primary px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-bold hover:bg-primary-fixed transition-colors text-sm sm:text-base whitespace-nowrap">
            Claim Reward
          </button>
        </div>
      </section>
    </div>
  );
}
