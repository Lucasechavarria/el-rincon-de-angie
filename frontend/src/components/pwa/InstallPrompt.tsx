import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPrompt: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        // Listen for beforeinstallprompt event
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);

            // Show prompt after 30 seconds
            setTimeout(() => {
                const dismissed = localStorage.getItem('pwa-install-dismissed');
                if (!dismissed) {
                    setShowPrompt(true);
                }
            }, 30000);
        };

        // Listen for app installed event
        const handleAppInstalled = () => {
            setIsInstalled(true);
            setShowPrompt(false);
            setDeferredPrompt(null);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user's response
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }

        // Clear the prompt
        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('pwa-install-dismissed', 'true');
    };

    if (isInstalled || !showPrompt) {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-slide-up">
            <div className="bg-white rounded-lg shadow-2xl border-2 border-[#D4AF37] p-6 relative">
                <button
                    onClick={handleDismiss}
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Cerrar"
                >
                    <X size={20} />
                </button>

                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 p-3 bg-[#1B4D3E]/10 rounded-full">
                        <Download className="text-[#1B4D3E]" size={24} />
                    </div>

                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-[#1B4D3E] mb-2">
                            Instalar El Rincón de Angie
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Instala nuestra app para acceder más rápido y leer offline.
                        </p>

                        <div className="flex gap-2">
                            <button
                                onClick={handleInstallClick}
                                className="flex-1 px-4 py-2 bg-[#1B4D3E] text-white rounded-lg hover:bg-[#1B4D3E]/90 transition-colors font-semibold text-sm"
                            >
                                Instalar
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold text-sm"
                            >
                                Ahora no
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InstallPrompt;
