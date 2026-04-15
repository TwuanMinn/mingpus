'use client';

import { useState } from 'react';
import { trpc } from '@/trpc/client';
import { keepPreviousData } from '@tanstack/react-query';
import { SpeakButton } from '@/components/SpeakButton';
import { usePageTitle } from '@/hooks/usePageTitle';

const discoverImages = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBfAAnTVhaVA94KzTS774NcIw3y9pZtkXZ1ErYRspQg8zKYAD8WlJ5mPLdYwzWQk4He7Ecrisy07rDeUjyv4QNMhKKsEFaLlKAr-92EbnkO2xt_7w2jcT1BrQ2YfCwRPHZRbhrZOEEiOMd2uMAMy3ag6TvKdMvfoiSlPm0HYjI6--wiSLWQzEmnCxxcZVk9K3Jl7iLLMPfm6jKWeMBiryxobUS9xNxaTHryc1YP1y89heZXvOwQTHKEIpxGMrLnbMnP3WnoKE45Pbis",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBD365zRNxPvlGBb-hJtWWlvAkCm_rJg8qYIejm1kE-VXwLKSEVIKxegYR4fxgmSMlTnUbpu_fi-PBjjEw9ggAUeLjxp7sDqIEY6LEgjO_Pe4eSW4iQ0E2z-Z9UrCn0EG4BExezBSNU9oZjRLCGjFh6jXnQvnWKvpG8KnSAxhiwii_7T_13dV2CrvX27iRBBlVieHO84yDXveaYb8xaE7vxdKiHyMzRQkf6egnkTfK0Xy3lhZOmtCr0r0HPncII1VLRucuJjM3OJljR",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC0darUyl5324ECsLLjcKBPsRQwbKPCWPqmJXlzwOQEzatHba30gxyswcCgkGHz9Qd81TRqCZkn_HX_DNIJ0VYZi2FxuUEXJDv5nQFfeYMgYl9axkd1ZqwMc_yQv9_DSgviHv50EnWsOGxr2p7scDfNajcRjGByJVOfJHkeQgS5CK0-ecDsR04QcAcy-4aBXzbnWXY_X19sJzuuyC4CVc1PREMguLsybdymFyGUgAgxqPydrIxllMf0e0NZVYk-j0MjlX0CdnzEqS76",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCjk9EDAC8Jge6Ef0TVxRgQGk7o1ofpHIccIg8j8wa9Stlm-q0eLF_QvX5q7CkPIJTsc1kqu2IlaY6TMww7yP3_DvKMueGIqPwVvL-8LMoUONkOiUiGZgxTrqFt2i5wRnotrkdcZZ11ZjBhnBpr-H7Ak1qBFfnCYGnE93q1BjhVZl86ZJLy8YxdTWiy_flZ7wy-JdjsxALGvXJiiYhSL9nS2GDGn5LuyupTlX894Hc0FdDRC7tg5h4spY4Fcu-aRi0EUSlvUbSevrte",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDwk27SmFAH0Gjv5UapLFUr3SIWadnrshGQ5oqHHyT_ySsveVZlensLiyi-j21JcdU45S7x6RMLl5oTDY3lTByTCYtB4V0JmbKOof0BbeqsQD9zStUjSZ81MpLiy50YIR5VmOfHPS4A5RCfFyIdHDs-bQYZ4Mc0h92YkaVSWBEr_lYn2htUF0EdliEvzf88aHZ7X9Y2X1Am1gKTwAcLPo1LiYLlApCQQ2Ja-MaaQghW0CQ_xC-SCE1axjEQmj-DQoIeZqVFJSWOXFuc",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCdy59UFpbNrvlnBFzdMF4FWPWHQEivFu6B9ZJPEN457lVnxKl6N0_XUxajIFp_WnUgS62FlZjWQxAPznk-c5EsQmR2at5ISSowjWjmeTMxkAeZpM65pppFONotv3teK5rvP5IeYjaAJbWKd7INd2MGqrjt-WG4WeMVeGAEPP0Faxj0Z-4bdxQnCYyGbKrDLGlq2pYXyUCPcCoRC1p1XmQ0L6CieleXYy08ftRGkk28sMi61Zqp52jMvq7uZwNmoPURElmVLtpLn_oR",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD0CoPn8tVbPyJ_DSF0C3InPnwD8HmakzygwTAPXIe59sTtncKTZqudLe7ORFpSlutpipnJ_VV-dkjxqJimwlrnJPt8O6gYEXPVl5riqmjL2_BKVj2bUDZNk2pM0XSEFB-BYsVXIIFvvzQpbtkiJSgmAVWgP2HOJNEwDK1BSCgz3fWc4LU3MjTG2HA6VmkGEb2ECesgKelQb3voFUnxtMNo5khiRNcTm2Qk1-SDIE-v9Y0WWTZ5693_n2OcO1O6vJnSMmkcCf8tJ8UK",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBpy1Xcafrzc4YZCDFDDuR94owqDt_6YE6DMjx5k_1FCSD7KAPDu_qUSjkn1EOfJtm-aRHJPhHDDjspdWZwhVgOcK326gzlJrHAEJ-j8p21nYg3sTyq4sVhMPbc_FXMJiby0-H353vzOUX8AILCVdXeK54oKkPFJEAGpwLOSt468fcc_BtKqg_dGokg4Fx4MftC79UeI8l6uGLTQMnpdlV8kgOcJPi2BhKqmimhgpBRT8jiQEjuZbCzz9J5LMa0Ic4K6idErVBpWIBF",
];

const PAGE_SIZE = 8;

export default function DiscoverPage() {
  usePageTitle('Discover');
  const [hskFilter, setHskFilter] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(0);
  const [savedChars, setSavedChars] = useState<Set<number>>(new Set());

  const { data: stats } = trpc.getDashboardStats.useQuery();
  const { data: decksData } = trpc.getDecks.useQuery();
  const addCard = trpc.addCard.useMutation();
  const utils = trpc.useUtils();
  const { data: results, isLoading } = trpc.searchCharacters.useQuery(
    { query: '%', hskLevel: hskFilter },
    { placeholderData: keepPreviousData }
  );

  const allChars = results ?? [];
  const totalPages = Math.max(1, Math.ceil(allChars.length / PAGE_SIZE));
  const pagedChars = allChars.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <section className="p-4 sm:p-6 lg:p-8 xl:p-12 space-y-8 sm:space-y-12 pb-24 md:pb-8">
        {/* Filters & Categories */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3 bg-surface-container-low p-4 sm:p-6 rounded-2xl sm:rounded-[1.5rem] flex flex-wrap items-center gap-3 sm:gap-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant w-full md:w-auto mb-1 md:mb-0">HSK Level</span>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => { setHskFilter(undefined); setPage(0); }}
                className={`px-4 sm:px-5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors ${!hskFilter ? 'bg-primary text-white' : 'bg-surface-container-lowest text-on-surface-variant hover:bg-primary-fixed'}`}>
                All
              </button>
              {[1, 2, 3, 4, 5, 6].map((level) => (
                <button key={level} onClick={() => { setHskFilter(level); setPage(0); }}
                  className={`px-4 sm:px-5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors ${hskFilter === level ? 'bg-primary text-white' : 'bg-surface-container-lowest text-on-surface-variant hover:bg-primary-fixed'}`}>
                  HSK {level}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-primary-container text-on-primary-container p-4 sm:p-6 rounded-2xl sm:rounded-[1.5rem] flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Total Found</p>
              <p className="font-bold text-sm sm:text-base">{allChars.length} Characters</p>
            </div>
            <span className="material-symbols-outlined text-2xl sm:text-3xl">filter_list</span>
          </div>
        </div>

        {/* Visual Discovery Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {pagedChars.map((c, i) => (
              <div
                key={c.id}
                className={`group relative bg-surface-container-lowest rounded-2xl sm:rounded-[1.5rem] overflow-hidden transition-all duration-300 hover:translate-y-[-8px] hover:shadow-[0_24px_48px_-12px_rgba(70,72,212,0.12)] ${i === 0 ? "border-2 border-primary/20" : ""}`}
              >
                <div className="aspect-[4/5] p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center text-center relative z-10">
                  <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-2 sm:mb-4">HSK {c.hskLevel ?? '?'}</span>
                  <h2 className="chinese-char text-5xl sm:text-6xl lg:text-7xl font-light mb-2 sm:mb-4 text-on-surface leading-tight tracking-[0.05em]">{c.character}</h2>
                  <p className="text-on-surface-variant font-medium text-sm sm:text-lg italic">{c.pinyin}</p>
                  <p className="text-on-surface text-base sm:text-xl font-bold mt-1 sm:mt-2">{c.meaning}</p>
                  <div className="mt-4 sm:mt-8 flex gap-3 sm:gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <SpeakButton text={c.character} size="md" />
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (!decksData?.length || savedChars.has(c.id)) return;
                        try {
                          await addCard.mutateAsync({
                            deckId: decksData[0].id,
                            character: c.character,
                            pinyin: c.pinyin,
                            meaning: c.meaning,
                            hskLevel: c.hskLevel ?? undefined,
                          });
                          setSavedChars(prev => new Set(prev).add(c.id));
                          utils.getDecks.invalidate();
                          utils.getDashboardStats.invalidate();
                        } catch {}
                      }}
                      className={`p-1.5 rounded-full transition-colors ${
                        savedChars.has(c.id)
                          ? 'text-secondary'
                          : 'text-primary hover:bg-primary-fixed'
                      }`}
                      aria-label={savedChars.has(c.id) ? 'Saved to deck' : 'Save to deck'}
                    >
                      <span className="material-symbols-outlined text-[20px] sm:text-[24px]" style={savedChars.has(c.id) ? { fontVariationSettings: "'FILL' 1" } : {}}>
                        {savedChars.has(c.id) ? 'bookmark_added' : 'bookmark'}
                      </span>
                    </button>
                  </div>
                </div>
                {/* Background Image Layer */}
                <div className="absolute inset-0 z-0 opacity-10 grayscale group-hover:grayscale-0 group-hover:opacity-30 transition-all duration-500 scale-110 group-hover:scale-100">
                  <img className="w-full h-full object-cover" src={discoverImages[i % discoverImages.length]} alt={c.meaning} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Stats */}
        <div className="flex flex-col sm:flex-row justify-between items-center py-8 sm:py-12 border-t border-outline-variant/15 text-on-surface-variant gap-4">
          <div className="flex gap-6 sm:gap-8">
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-widest opacity-60">Total Characters</span>
              <span className="text-lg sm:text-xl font-bold text-on-surface">{stats?.totalCards ?? 0}</span>
            </div>
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-widest opacity-60">Showing</span>
              <span className="text-lg sm:text-xl font-bold text-on-surface">{allChars.length}</span>
            </div>
          </div>
          <div className="flex gap-3 sm:gap-4">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              className="p-3 sm:p-4 rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-colors disabled:opacity-30">
              <span className="material-symbols-outlined text-[20px] sm:text-[24px]">chevron_left</span>
            </button>
            <div className="flex items-center px-4 sm:px-6 font-bold text-sm sm:text-base">{page + 1} / {totalPages}</div>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
              className="p-3 sm:p-4 rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-colors disabled:opacity-30">
              <span className="material-symbols-outlined text-[20px] sm:text-[24px]">chevron_right</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
