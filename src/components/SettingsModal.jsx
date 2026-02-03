import { useState, useEffect } from 'react';
import { X, Key } from 'lucide-react';

export function SettingsModal({ isOpen, onClose, onSave }) {
    const [apiKey, setApiKey] = useState('');

    useEffect(() => {
        if (isOpen) {
            setApiKey(localStorage.getItem('gemini_api_key') || '');
        }
    }, [isOpen]);

    const handleSave = () => {
        onSave(apiKey);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[var(--bg-2)] border border-border-1 rounded-xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Key className="w-5 h-5 text-accent" />
                        <h2 className="text-lg font-semibold text-text-1">API Configuration</h2>
                    </div>
                    <button onClick={onClose} className="text-text-2 hover:text-text-1">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-2">Gemini API Key</label>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="AIza..."
                            className="w-full px-4 py-2 rounded-lg bg-[var(--bg-1)] border border-border-1 text-text-1 focus:outline-none focus:border-accent"
                        />
                        <p className="text-xs text-text-3">
                            Your key is stored locally in your browser. Get one from Google AI Studio.
                        </p>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <button onClick={onClose} className="px-4 py-2 rounded-lg text-text-2 hover:bg-[var(--bg-3)] transition-colors">
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 rounded-lg bg-accent text-white hover:brightness-110 transition-all font-medium"
                        >
                            Save Key
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
