import React, { useState } from 'react';
import { Share2, Copy, Check, X, ExternalLink } from './Icons';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  lat: number;
  lng: number;
  zoom: number;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, lat, lng, zoom }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}${window.location.pathname}#lat=${lat.toFixed(5)}&lng=${lng.toFixed(5)}&z=${zoom}`;
  const embedCode = `<iframe src="${shareUrl}" width="100%" height="500" style="border:0;border-radius:12px;" allowfullscreen loading="lazy"></iframe>`;

  const copyToClipboard = (text: string, type: 'link' | 'embed') => {
    navigator.clipboard.writeText(text);
    if (type === 'link') {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } else {
      setCopiedEmbed(true);
      setTimeout(() => setCopiedEmbed(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-md flex items-center justify-center z-[500] p-4">
      <div
        className="glass border border-white/[0.08] rounded-3xl shadow-2xl shadow-black/60 max-w-md w-full overflow-hidden"
        style={{ animation: 'fadeInUp 0.25s ease-out forwards' }}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/[0.05] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
              <Share2 className="w-4.5 h-4.5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Share Map View</h2>
              <p className="text-[10px] text-slate-500 font-mono">{lat.toFixed(4)}, {lng.toFixed(4)} · zoom {zoom}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-500 hover:text-white hover:bg-white/[0.06] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Direct Link */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
              Direct Permalink
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3 py-2.5 rounded-xl input-premium text-[11px] font-mono"
              />
              <button
                onClick={() => copyToClipboard(shareUrl, 'link')}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  copiedLink
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'btn-primary text-white'
                }`}
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedLink ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Open in new tab */}
          <a
            href={shareUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open in new tab
          </a>

          {/* Embed */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
              HTML Embed
            </label>
            <div className="space-y-2">
              <textarea
                readOnly
                rows={3}
                value={embedCode}
                className="w-full px-3 py-2.5 rounded-xl input-premium text-[10px] font-mono resize-none leading-relaxed"
              />
              <button
                onClick={() => copyToClipboard(embedCode, 'embed')}
                className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 border ${
                  copiedEmbed
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25'
                    : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.07] border-white/[0.07] hover:border-white/[0.12]'
                }`}
              >
                {copiedEmbed ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedEmbed ? 'Embed Code Copied!' : 'Copy HTML Embed Snippet'}
              </button>
            </div>
          </div>

          {/* Info badge */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 text-[10px] text-slate-500">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            No API key required — links work on any browser, forever.
          </div>
        </div>
      </div>
    </div>
  );
};
