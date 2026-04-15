export function Header() {
  return (
    <header className="flex justify-between items-center w-full px-4 sm:px-6 md:px-8 py-3 md:py-4 sticky top-0 z-40 bg-[#fcf8ff]/80 backdrop-blur-xl">
      <div className="md:hidden text-base sm:text-lg font-black text-[#4648d4] font-[family-name:var(--font-jakarta)]">Digital Calligrapher</div>
      <div className="hidden md:flex items-center gap-2">
        <span className="text-lg font-black text-[#4648d4] font-[family-name:var(--font-jakarta)] tracking-tight uppercase">Digital Calligrapher</span>
      </div>
      <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
        <div className="relative hidden sm:block">
          <input
            className="w-40 md:w-64 pl-4 pr-10 py-2 bg-surface-container-low border-none rounded-full text-sm focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline outline-none"
            placeholder="Search characters..."
            type="text"
          />
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline text-lg">search</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 text-[#4648d4]">
          <button className="hover:opacity-80 transition-opacity p-1">
            <span className="material-symbols-outlined text-[20px] sm:text-[24px]">notifications</span>
          </button>
          <button className="hover:opacity-80 transition-opacity p-1">
            <span className="material-symbols-outlined text-[20px] sm:text-[24px]">settings</span>
          </button>
        </div>
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-surface-container-high overflow-hidden border-2 border-primary-fixed flex-shrink-0">
          <img
            alt="Learner Profile"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuChCrfP1p54bxB9ZY2d6rsmgHjo_gYIjRDi-Mf8-fHJprq93QxYAP5SrBUr2x12fshjGbjUXHQECAvZgjhCWmjqH7Le2iJHeovQ50Fr8jvaMBUcwGfgWhsnIkAv33J0gcSJO7NclchIZmN6UqONuSgRdZRvXuBJQhXyeXC1u2HLK0wiwAkx6g_ts7JqxCvygPLeWH0j4B6xg8VhbSn9Pr3GT8vjIvNHPEf1xwcMiqrssw7FziaDZFqZ0_8rrHVQwspd6bW5YlCchdW2"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </header>
  );
}
