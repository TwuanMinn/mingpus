export default function ImportPage() {
  return (
    <div className="flex-1 p-12 bg-surface">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <header className="space-y-2">
          <h2 className="text-[2.5rem] font-extrabold font-[family-name:var(--font-jakarta)] tracking-tight text-on-surface">Expand Your Lexicon</h2>
          <p className="text-on-surface-variant text-lg max-w-2xl">Import custom vocabulary sets from CSV, Excel, or plain text. Our system automatically maps characters to stroke order data.</p>
        </header>

        {/* Bento Grid */}
        <div className="grid grid-cols-12 gap-6 items-start">
          {/* Import Area */}
          <div className="col-span-12 lg:col-span-5 space-y-6">
            <div className="bg-surface-container-low rounded-[1.5rem] p-8 border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center text-center space-y-4 min-h-[320px] transition-all hover:bg-surface-container/50">
              <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
                <span className="material-symbols-outlined !text-3xl">upload_file</span>
              </div>
              <div>
                <h3 className="text-xl font-bold font-[family-name:var(--font-jakarta)]">Drop your word list here</h3>
                <p className="text-on-surface-variant text-sm mt-1 font-medium">Supports .csv, .txt, .xlsx</p>
              </div>
              <button className="px-6 py-2 border-2 border-primary text-primary font-bold rounded-full hover:bg-primary hover:text-white transition-all">
                Browse Files
              </button>
            </div>

            <div className="bg-surface-container-low rounded-[1.5rem] p-8 space-y-4">
              <h3 className="text-sm uppercase tracking-[0.1em] text-on-surface-variant font-medium">Quick Paste</h3>
              <textarea
                className="w-full bg-surface-container-lowest border-0 focus:ring-0 text-on-surface p-4 rounded-xl chinese-char text-lg min-h-[160px] outline-none"
                placeholder={"你好 nǐ hǎo Hello\n书 shū Book\n..."}
              ></textarea>
              <div className="flex justify-end">
                <button className="text-primary font-bold text-sm flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">auto_fix</span>
                  Auto-format content
                </button>
              </div>
            </div>
          </div>

          {/* Preview Table */}
          <div className="col-span-12 lg:col-span-7 space-y-6">
            <div className="bg-surface-container-lowest rounded-[1.5rem] p-0 shadow-2xl shadow-on-surface/5 overflow-hidden">
              <div className="px-8 py-6 border-b border-surface-container flex justify-between items-center bg-surface-bright">
                <h3 className="font-bold text-lg font-[family-name:var(--font-jakarta)]">Import Preview</h3>
                <span className="px-3 py-1 bg-primary-fixed text-primary text-xs font-bold rounded-full">12 Words Detected</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-surface-container-low/50">
                    <tr>
                      <th className="px-8 py-4 text-xs uppercase tracking-widest text-on-surface-variant">Character</th>
                      <th className="px-8 py-4 text-xs uppercase tracking-widest text-on-surface-variant">Pinyin</th>
                      <th className="px-8 py-4 text-xs uppercase tracking-widest text-on-surface-variant">Meaning</th>
                      <th className="px-8 py-4 text-xs uppercase tracking-widest text-on-surface-variant">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container">
                    {[
                      { char: "学习", pinyin: "xué xí", meaning: "To study; to learn" },
                      { char: "梦想", pinyin: "mèng xiǎng", meaning: "Dream; to dream" },
                      { char: "书法", pinyin: "shū fǎ", meaning: "Calligraphy" },
                      { char: "灵感", pinyin: "líng gǎn", meaning: "Inspiration" },
                      { char: "创造", pinyin: "chuàng zào", meaning: "To create" },
                    ].map((row) => (
                      <tr key={row.char} className="hover:bg-primary-fixed/20 transition-colors">
                        <td className="px-8 py-5 text-2xl chinese-char text-primary">{row.char}</td>
                        <td className="px-8 py-5 font-medium text-on-surface">{row.pinyin}</td>
                        <td className="px-8 py-5 text-on-surface-variant">{row.meaning}</td>
                        <td className="px-8 py-5">
                          <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-8 bg-surface-container-low/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant">info</span>
                    <p className="text-sm text-on-surface-variant">7 characters will be added with high-resolution stroke animations.</p>
                  </div>
                  <button className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-primary/30 active:scale-95 transition-all">
                    Start Learning
                  </button>
                </div>
              </div>
            </div>

            {/* Tips Card */}
            <div className="bg-surface-container-low/50 backdrop-blur-md rounded-[1.5rem] p-6 flex items-center gap-6 border border-white/40">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full bg-secondary-fixed border-2 border-surface-container-lowest flex items-center justify-center text-secondary font-bold text-xs">A1</div>
                <div className="w-10 h-10 rounded-full bg-primary-fixed border-2 border-surface-container-lowest flex items-center justify-center text-primary font-bold text-xs">B2</div>
                <div className="w-10 h-10 rounded-full bg-tertiary-fixed border-2 border-surface-container-lowest flex items-center justify-center text-tertiary font-bold text-xs">C1</div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Need inspiration? Browse our pre-made <a className="text-primary underline font-bold" href="#">HSK Curated Lists</a> for specific levels.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Background */}
      <div className="fixed top-0 right-0 -z-10 w-1/2 h-screen opacity-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] right-[10%] text-[40rem] chinese-char opacity-5 select-none leading-none">书</div>
      </div>
    </div>
  );
}
