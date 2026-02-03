import { useState, useCallback } from 'react';
import { Upload, FileText, File, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { extractTextFromFile, generateFileId } from '../lib/fileProcessing';

export function UploadZone({ onSourcesAdded, className }) {
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const processFiles = async (files) => {
        if (files.length === 0) return;
        setIsProcessing(true);

        const newSources = [];

        try {
            for (const file of files) {
                // Basic validation
                if (!['application/pdf', 'text/plain', 'text/markdown'].includes(file.type) && !file.name.endsWith('.md')) {
                    console.warn(`Skipping unsupported file: ${file.name}`);
                    continue;
                }

                try {
                    const text = await extractTextFromFile(file);
                    newSources.push({
                        id: generateFileId(),
                        name: file.name,
                        type: file.type,
                        content: text,
                        timestamp: Date.now()
                    });
                } catch (err) {
                    console.error(`Failed to process ${file.name}:`, err);
                }
            }

            if (newSources.length > 0) {
                onSourcesAdded(newSources);
            }
        } finally {
            setIsProcessing(false);
            setIsDragging(false);
        }
    };

    const handleDrop = useCallback(async (e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        await processFiles(files);
    }, [onSourcesAdded]);

    const handleFileInput = async (e) => {
        const files = Array.from(e.target.files);
        await processFiles(files);
    };

    return (
        <div
            className={clsx(
                "relative group cursor-pointer transition-all duration-300",
                "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center",
                isDragging ? "border-accent bg-accent/5" : "border-border-2 hover:border-accent/50 hover:bg-accent/5",
                className
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload').click()}
        >
            <input
                id="file-upload"
                type="file"
                multiple
                accept=".pdf,.txt,.md"
                className="hidden"
                onChange={handleFileInput}
            />

            <div className={clsx(
                "p-4 rounded-full mb-4 transition-transform duration-300",
                isDragging ? "scale-110 bg-accent text-white" : "bg-bg-3 text-text-2 group-hover:text-accent group-hover:bg-bg-2"
            )}>
                {isProcessing ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                ) : (
                    <Upload className="w-8 h-8" />
                )}
            </div>

            <h3 className="text-lg font-medium text-text-1 mb-1">
                {isProcessing ? 'Processing files...' : 'Add Sources'}
            </h3>

            <p className="text-sm text-text-2 max-w-xs">
                Drag & drop PDF, TXT, or MD files here, or click to browse
            </p>
        </div>
    );
}
