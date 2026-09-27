import React, { useState, useEffect } from 'react';
import { Sun, Compass, X } from './Icons';

interface SolarWidgetProps {
  lat: number;
  lng: number;
  isOpen: boolean;
  onClose: () => void;
}

export const SolarWidget: React.FC<SolarWidgetProps> = ({ lat, lng, isOpen, onClose }) => {
  const [solarData, setSolarData] = useState<{
    sunrise: string;
    sunset: string;
    solarNoon: string;
    dayLength: string;
    azimuthDeg: number;
    elevationDeg: number;
  } | null>(null);

  useEffect(() => {
    // Solar position & times calculation algorithm based on lat/lng and current UTC date
    const now = new Date();
    const dayOfYear = Math.floor(
      (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Declination of the sun
    const declination = 23.45 * Math.sin(((360 / 365) * (dayOfYear - 81) * Math.PI) / 180);

    // Hour angle at sunrise/sunset
    const latRad = (lat * Math.PI) / 180;
    const decRad = (declination * Math.PI) / 180;

    const cosH = -Math.tan(latRad) * Math.tan(decRad);

    let dayLengthHours = 12;
    if (cosH <= -1) dayLengthHours = 24; // polar day
    else if (cosH >= 1) dayLengthHours = 0; // polar night
    else {
      const H = (Math.acos(cosH) * 180) / Math.PI;
      dayLengthHours = (2 * H) / 15;
    }

    // Solar noon UTC approximation
    const solarNoonMinutes = 720 - 4 * lng;
    const solarNoonDate = new Date(now);
    solarNoonDate.setUTCHours(Math.floor(solarNoonMinutes / 60), Math.floor(solarNoonMinutes % 60), 0);

    const sunriseDate = new Date(solarNoonDate.getTime() - (dayLengthHours / 2) * 3600 * 1000);
    const sunsetDate = new Date(solarNoonDate.getTime() + (dayLengthHours / 2) * 3600 * 1000);

    const formatTime = (d: Date) =>
      d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Solar elevation approximation at current hour
    const hour = now.getUTCHours() + now.getUTCMinutes() / 60;
    const hourAngleRad = (((hour * 15 - 180 + lng) * Math.PI) / 180);
    const sinElevation =
      Math.sin(latRad) * Math.sin(decRad) +
      Math.cos(latRad) * Math.cos(decRad) * Math.cos(hourAngleRad);
    const elevationDeg = Math.round((Math.asin(Math.max(-1, Math.min(1, sinElevation))) * 180) / Math.PI);

    const azimuthDeg = Math.round((hour * 15 + 180) % 360);

    const hours = Math.floor(dayLengthHours);
    const mins = Math.round((dayLengthHours - hours) * 60);

    setSolarData({
      sunrise: formatTime(sunriseDate),
      sunset: formatTime(sunsetDate),
      solarNoon: formatTime(solarNoonDate),
      dayLength: `${hours}h ${mins}m`,
      azimuthDeg,
      elevationDeg,
    });
  }, [lat, lng]);

  if (!isOpen || !solarData) return null;

  return (
    <div className="fixed bottom-20 right-5 z-[500] glass border border-amber-500/20 rounded-3xl p-5 shadow-2xl shadow-black/70 max-w-sm w-full animate-fade-in-up">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
            <Sun className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              Solar & Daylight Tracker
              <span className="text-[9px] font-semibold tracking-widest uppercase bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">
                LIVE
              </span>
            </h3>
            <p className="text-[10px] text-slate-500 font-mono">{lat.toFixed(4)}, {lng.toFixed(4)}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-3">
        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] space-y-1">
          <p className="text-[10px] text-slate-500 font-medium">Sunrise</p>
          <p className="text-sm font-bold text-amber-300">🌅 {solarData.sunrise}</p>
        </div>

        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] space-y-1">
          <p className="text-[10px] text-slate-500 font-medium">Sunset</p>
          <p className="text-sm font-bold text-rose-300">🌇 {solarData.sunset}</p>
        </div>

        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] space-y-1">
          <p className="text-[10px] text-slate-500 font-medium">Daylight Duration</p>
          <p className="text-xs font-bold text-white font-mono">{solarData.dayLength}</p>
        </div>

        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] space-y-1">
          <p className="text-[10px] text-slate-500 font-medium">Solar Elevation</p>
          <p className="text-xs font-bold text-emerald-400 font-mono">{solarData.elevationDeg}° {solarData.elevationDeg > 0 ? 'above horizon' : 'below horizon'}</p>
        </div>
      </div>

      <div className="mt-3 p-3 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          Solar Azimuth Bearing:
        </span>
        <span className="font-mono text-amber-300 font-bold">{solarData.azimuthDeg}°</span>
      </div>
    </div>
  );
};
