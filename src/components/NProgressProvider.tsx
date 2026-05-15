'use client';
import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

NProgress.configure({ showSpinner: false, trickleSpeed: 200 });

function NProgressHandler() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.done();
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (
        target &&
        target.href &&
        target.href.startsWith(window.location.origin) &&
        !target.target
      ) {
        NProgress.start();
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return null;
}

export default function NProgressProvider() {
  return (
    <>
      <style>{`
        #nprogress .bar {
          background: #4edea3 !important;
          height: 2px !important;
        }
        #nprogress .peg {
          box-shadow: 0 0 10px #4edea3, 0 0 5px #4edea3 !important;
        }
      `}</style>
      <Suspense fallback={null}>
        <NProgressHandler />
      </Suspense>
    </>
  );
}
