import React from 'react';
import { X, ExternalLink, Eye, Compass } from './Icons';

interface StreetViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  lat: number;
  lng: number;
}

export const StreetViewModal: React.FC<StreetViewModalProps> = ({ isOpen, onClose, lat, lng }) => {
  if (!isOpen) return null;

  const mapillaryUrl = `https://www.mapillary.com/app/?lat=${lat}&lng=${lng}&z=17`;
  const googleStreetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xl flex items-center justify-center z-[500] p-4">
      <div
        className="glass border border-white/[0.07] rounded-3xl shadow-2xl shadow-black/70 w-full max-w-5xl h-[82vh] flex flex-col overflow-hidden"
        style={{ animation: 'fadeInUp 0.3s ease-out forwards' }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/[0.05] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
              <Eye className="w-4.5 h-4.5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                360° Street View
                <span className="text-[9px] font-semibold tracking-widest uppercase bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">
                  MAPILLARY
                </span>
              </h2>
              <p className="text-[10px] text-slate-500 font-mono">{lat.toFixed(5)}, {lng.toFixed(5)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={googleStreetViewUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white btn-primary flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Google Street View
            </a>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:text-white hover:bg-white/[0.06] transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewer */}
        <div className="flex-1 relative bg-slate-950">
          <iframe
            src={mapillaryUrl}
            title="Street View Panorama"
            className="w-full h-full border-0"
            allowFullScreen
          />
          {/* Gradient overlay at top edge */}
          <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-slate-950/40 to-transparent pointer-events-none" />
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/[0.04] flex items-center justify-between text-[10px] text-slate-600 shrink-0">
          <span className="flex items-center gap-2">
            <Compass className="w-3 h-3 text-emerald-500/70" />
            Powered by Mapillary Open Street Imagery — Community contributed 360° photos
          </span>
          <span className="font-mono">Click and drag inside to look around 360°</span>
        </div>
      </div>
    </div>
  );
};
