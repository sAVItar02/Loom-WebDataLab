import { Check, Copy, Loader2, MousePointerClick } from 'lucide-react';
import React, { useCallback, useState } from 'react'
import { materialDark, materialLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { Button } from './Button';
import { removeExtraWhitespace } from '../../utils/helpers';

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }, [text]);

    return (
        <button
            onClick={handleCopy}
            className="shrink-0 p-1 rounded hover:bg-bg-tertiary text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
            title="Copy to clipboard"
        >
            {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
        </button>
    );
}

export function DetailRow({ label, icon, value, mono = false, theme }: { label: string; icon: React.ReactNode; value: string; mono?: boolean; theme: string }) {
    if (!value) return null;
    return (
        <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-text-muted uppercase tracking-wider">
                {icon}
                {label}
            </div>
            <div className="flex items-start gap-2 group">
                <SyntaxHighlighter language="html" style={theme === 'dark' ? materialDark : materialLight} className={`flex-1 min-w-0 rounded-lg bg-bg-secondary border border-border-default px-3 text-xs break-all ${mono ? 'font-mono' : ''} text-text-secondary leading-relaxed`}>
                    {value}
                </SyntaxHighlighter>
                <CopyButton text={value} />
            </div>
        </div>
    );
}

export function TextContentRow({ label, icon, value, allowScrape = false, onClickScrape = () => {}, isCreatingPage = false }: { label: string; icon: React.ReactNode; value: string; allowScrape?: boolean; onClickScrape?: () => void; isCreatingPage?: boolean }) {
    if (!value) return null;
    return (
        <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-text-muted uppercase tracking-wider">
                {icon}
                {label}
            </div>
            <div className="flex items-start gap-2 group">
                <div className="relative flex-1 min-w-0 rounded-lg bg-bg-secondary border border-border-default px-3 text-xs break-all font-mono text-text-secondary leading-relaxed whitespace-pre-wrap py-2 group">
                    {removeExtraWhitespace(value)}
                    {allowScrape && <Button variant="primary" size="sm" className="hidden group-hover:flex absolute top-0.5 right-0.5 text-xs items-center gap-1 cursor-pointer" onClick={onClickScrape} disabled={isCreatingPage}>
                        {isCreatingPage ? <Loader2 className="h-3 w-3 animate-spin" /> : <MousePointerClick className="h-3 w-3" />}
                        {isCreatingPage ? 'Loading...' : 'Scrape'}
                    </Button>}
                </div>
                <CopyButton text={value} />
            </div>
        </div>
    );
}

export function AttributeRow({ label, icon, value, theme }: { label: string; icon: React.ReactNode; value: string; theme: string }) {
    if (!value) return null;
    return (
        <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-text-muted uppercase tracking-wider">
                {icon}
                {label}
            </div>
            <div className="flex items-start gap-2 group">
                <SyntaxHighlighter language="json" style={theme === 'dark' ? materialDark : materialLight} className={`flex-1 min-w-0 rounded-lg bg-bg-secondary border border-border-default px-3 text-xs break-all font-mono text-text-secondary leading-relaxed`}>
                    {JSON.stringify(value, null, 2)}
                </SyntaxHighlighter>
                <CopyButton text={JSON.stringify(value, null, 2)} />
            </div>
        </div>
    );
}