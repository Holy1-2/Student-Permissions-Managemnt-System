import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

/**
 * PWA install prompt banner.
 * Catches the beforeinstallprompt event and shows a premium install CTA.
 */
const PWAInstaller = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [visible, setVisible] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        const alreadyDismissed = localStorage.getItem('pwa_install_dismissed');
        if (alreadyDismissed) return;

        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setVisible(false);
        }
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setVisible(false);
        setDismissed(true);
        localStorage.setItem('pwa_install_dismissed', '1');
    };

    if (!visible || dismissed) return null;

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm safe-bottom">
            <div className="bg-zinc-950 text-white rounded-2xl shadow-2xl border border-zinc-800 p-4">
                <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-brand/20 flex items-center justify-center shrink-0">
                        <Smartphone size={18} className="text-brand" style={{ color: '#2563EB' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white mb-0.5">Install GateFlow</p>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                            Add to your home screen for instant access — works offline.
                        </p>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="text-zinc-500 hover:text-zinc-300 transition-colors shrink-0 mt-0.5"
                        aria-label="Dismiss install prompt"
                    >
                        <X size={16} />
                    </button>
                </div>
                <div className="flex gap-2 mt-3">
                    <button
                        onClick={handleInstall}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-white text-zinc-950 text-sm font-semibold rounded-xl py-2 hover:bg-zinc-100 transition-colors"
                    >
                        <Download size={14} />
                        Install App
                    </button>
                    <button
                        onClick={handleDismiss}
                        className="px-4 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
                    >
                        Not now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PWAInstaller;
