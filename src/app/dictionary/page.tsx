export default function DictionaryPage() {
  return (
    <div className="flex-1 pt-6 pb-24 md:pb-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Translation Hero Area */}
        <section className="mb-8 sm:mb-12">
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
              <div>
                <span className="text-[0.6875rem] font-bold tracking-[0.2em] text-primary uppercase block mb-1">Translation Studio</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-on-background font-[family-name:var(--font-jakarta)] tracking-tight">Refine Your Flow</h2>
              </div>
              <div className="flex gap-2 bg-surface-container-low p-1 rounded-full">
                <button className="px-4 py-1.5 bg-surface-container-lowest text-primary text-xs font-bold rounded-full shadow-sm">Text</button>
                <button className="px-4 py-1.5 text-on-surface-variant text-xs font-bold rounded-full hover:bg-surface-container-high transition-colors">Camera</button>
              </div>
            </div>

            {/* Main Translator Card */}
            <div className="bg-surface-container-lowest rounded-2xl sm:rounded-[1.5rem] shadow-[0_32px_64px_-4px_rgba(27,27,35,0.06)] overflow-hidden">
              {/* Language Toggle Bar */}
              <div className="flex items-center justify-center gap-4 sm:gap-8 py-3 sm:py-4 bg-surface-container-low">
                <span className="text-sm font-bold text-on-surface font-[family-name:var(--font-jakarta)]">English</span>
                <button className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 hover:rotate-180 transition-transform duration-500 active:scale-90">
                  <span className="material-symbols-outlined text-[20px] sm:text-[24px]">swap_horiz</span>
                </button>
                <span className="text-sm font-bold text-on-surface font-[family-name:var(--font-jakarta)]">Mandarin</span>
              </div>

              {/* Input/Output Grids */}
              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Input */}
                <div className="p-5 sm:p-8 border-b md:border-b-0 md:border-r border-outline-variant/15">
                  <textarea
                    className="w-full h-36 sm:h-48 bg-transparent border-none focus:ring-0 text-lg sm:text-xl font-medium text-on-background placeholder-outline/50 resize-none outline-none"
                    placeholder="Enter Chinese or English"
                  ></textarea>
                  <div className="flex justify-between items-center mt-3 sm:mt-4">
                    <span className="text-xs text-outline font-medium">0 / 500</span>
                    <button className="text-outline hover:text-primary transition-colors">
                      <span className="material-symbols-outlined">mic</span>
                    </button>
                  </div>
                </div>

                {/* Output */}
                <div className="p-5 sm:p-8 bg-surface-bright/30">
                  <div className="h-36 sm:h-48">
                    <p className="text-3xl sm:text-4xl chinese-char text-primary font-bold mb-2 tracking-wide leading-relaxed">心流</p>
                    <p className="text-base sm:text-lg text-secondary font-medium tracking-widest mb-3 sm:mb-4">xīn liú</p>
                    <p className="text-on-surface-variant leading-relaxed text-sm sm:text-base">State of complete immersion in an activity; flow state.</p>
                  </div>
                  <div className="flex justify-end gap-3 mt-3 sm:mt-4">
                    <button className="p-2 text-outline hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-[20px]">volume_up</span>
                    </button>
                    <button className="p-2 text-outline hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-[20px]">content_copy</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="px-5 sm:px-8 py-4 sm:py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-surface-container-low/50">
                <div className="flex gap-2">
                  <span className="bg-primary/10 text-primary text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">HSK 4</span>
                  <span className="bg-secondary/10 text-secondary text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">Noun</span>
                </div>
                <button className="flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-full font-bold text-sm shadow-xl shadow-primary/20 transition-transform active:scale-95 w-full sm:w-auto justify-center">
                  <span className="material-symbols-outlined text-sm">bookmark_add</span>
                  Add to Study List
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Sections Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Contextual Examples (2/3 width) */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <h3 className="text-base sm:text-lg font-bold font-[family-name:var(--font-jakarta)] flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
              Contextual Examples
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="p-4 sm:p-6 bg-surface-container-low rounded-xl sm:rounded-2xl border-l-4 border-primary/20">
                <p className="text-lg sm:text-xl chinese-char text-on-background mb-2">进入<span className="text-primary font-bold">心流</span>状态能提高效率。</p>
                <p className="text-xs sm:text-sm text-on-surface-variant italic mb-1">Jìnrù xīnliú zhuàngtài néng tígāo xiàolǜ.</p>
                <p className="text-xs sm:text-sm text-outline">Entering a <span className="text-primary font-medium">flow</span> state can improve efficiency.</p>
              </div>
              <div className="p-4 sm:p-6 bg-surface-container-low rounded-xl sm:rounded-2xl border-l-4 border-secondary/20">
                <p className="text-lg sm:text-xl chinese-char text-on-background mb-2">他在写书法时达到了一种<span className="text-secondary font-bold">心流</span>。</p>
                <p className="text-xs sm:text-sm text-on-surface-variant italic mb-1">Tā zài xiě shūfǎ shí dádàole yīzhǒng xīnliú.</p>
                <p className="text-xs sm:text-sm text-outline">He reached a <span className="text-secondary font-medium">flow</span> while doing calligraphy.</p>
              </div>
            </div>
          </div>

          {/* Recent History (1/3 width) */}
          <div className="space-y-4 sm:space-y-6">
            <h3 className="text-base sm:text-lg font-bold font-[family-name:var(--font-jakarta)] flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-secondary rounded-full"></span>
              Recent History
            </h3>
            <div className="bg-surface-container-lowest rounded-xl sm:rounded-2xl overflow-hidden shadow-sm">
              <div className="divide-y divide-outline-variant/10">
                {[
                  { en: "Tradition", cn: "传统 (Chuántǒng)", time: "2m ago" },
                  { en: "Brushwork", cn: "笔法 (Bǐfǎ)", time: "15m ago" },
                  { en: "Aesthetic", cn: "审美 (Shěnměi)", time: "1h ago" },
                ].map((item) => (
                  <div key={item.en} className="p-3 sm:p-4 hover:bg-surface-container-low transition-colors cursor-pointer">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-bold font-[family-name:var(--font-jakarta)]">{item.en}</span>
                      <span className="text-[10px] text-outline">{item.time}</span>
                    </div>
                    <p className="text-sm sm:text-base chinese-char text-primary">{item.cn}</p>
                  </div>
                ))}
                <div className="p-3 sm:p-4 text-center">
                  <button className="text-xs font-bold text-primary uppercase tracking-widest hover:underline">View All History</button>
                </div>
              </div>
            </div>

            {/* Decorative Card */}
            <div className="relative h-40 sm:h-48 rounded-xl sm:rounded-2xl overflow-hidden group">
              <img
                alt="Calligraphy inspiration"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpKJnS9oIytVDK5qm1wzhQJGI35IHDpmQYx2C3yruu7LMo9BaDNxnqPsuUz_5yLQdfgfu5svgPBOkpbMP7eoGEaXPu-Bt3YI1i1iEM9Yk5e7XxD1tdbBtr0MX8ZxQu8jnXjt0m6d8_NbAn603rcAodM81uFjTeggFMp8bxV2NBERt5VxEXIfqnCpfVPo4cbe689kmBsZN2d-QBx-3LuJi3eYIjL-inGL_tcSRXUiO88OlNX5LMOxICWclyobcKhrwqxvcdfZbaF6HZ"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/80 to-transparent flex flex-col justify-end p-4 sm:p-5">
                <p className="text-white text-xs font-bold uppercase tracking-widest mb-1">Daily Quote</p>
                <p className="text-white chinese-char text-lg">宁静致远</p>
                <p className="text-white/70 text-[10px] italic">Tranquility yields transcendence.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
