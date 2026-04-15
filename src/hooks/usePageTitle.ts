'use client';

import { useEffect } from 'react';

const BASE_TITLE = 'Digital Calligrapher';

export function usePageTitle(page: string) {
  useEffect(() => {
    document.title = `${page} | ${BASE_TITLE}`;
    return () => { document.title = BASE_TITLE; };
  }, [page]);
}
