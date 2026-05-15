'use client';
import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PwaInstallPrompt() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!prompt || dismissed) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-50 flex items-center justify-between gap-3 px-4 py-3 rounded-2xl shadow-2xl"
      style={{ background: '#12121a', border: '1px solid rgba(78,222,163,0.3)' }}
    >
      <div className="flex items-center gap-3">
        <Download className="h-5 w-5 shrink-0" style={{ color: '#4edea3' }} />
        <div>
          <p className="text-sm font-bold" style={{ color: '#dce1fb' }}>Install CrySer</p>
          <p className="text-xs" style={{ color: '#909097' }}>Add to home screen for the best experience</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => { prompt.prompt(); setPrompt(null); }}
          className="px-3 py-1.5 rounded-lg text-xs font-bold"
          style={{ background: '#4edea3', color: '#0a0a0f' }}
        >
          Install
        </button>
        <button onClick={() => setDismissed(true)} className="opacity-50 hover:opacity-80 transition-opacity">
          <X className="h-4 w-4" style={{ color: '#909097' }} />
        </button>
      </div>
    </div>
  );
}
