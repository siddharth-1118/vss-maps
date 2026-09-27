import React, { useState, useEffect } from 'react';
import { CloudRain, Wind, Sun } from './Icons';
import { fetchWeatherForLocation, type WeatherData } from '../services/weather';

interface WeatherWidgetProps {
  lat: number;
  lng: number;
}

const WEATHER_ICONS: Record<number, string> = {
  0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
  45: '🌫️', 48: '🌫️', 51: '🌦️', 53: '🌦️',
  55: '🌧️', 61: '🌧️', 63: '🌧️', 65: '🌧️',
  71: '❄️', 73: '❄️', 75: '❄️', 80: '🌦️',
  81: '🌧️', 82: '⛈️', 95: '⛈️',
};

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ lat, lng }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const load = async () => {
      setVisible(false);
      const data = await fetchWeatherForLocation(lat, lng);
      setWeather(data);
      setTimeout(() => setVisible(true), 100);
    };
    load();
  }, [lat, lng]);

  if (!weather) return null;

  const emoji = WEATHER_ICONS[0] || (weather.isDay ? '☀️' : '🌙');
  const tempF = Math.round((weather.temperatureC * 9) / 5 + 32);

  return (
    <div
      className={`transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
    >
      <div className="glass rounded-2xl px-4 py-3 flex items-center gap-3 shadow-2xl shadow-black/40 hover:shadow-blue-500/10 transition-shadow group cursor-default">
        {/* Weather emoji */}
        <div className="text-2xl leading-none select-none">{emoji}</div>

        {/* Temp */}
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-white">{weather.temperatureC}°C</span>
            <span className="text-[10px] text-slate-500 font-mono">{tempF}°F</span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">{weather.description}</p>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-white/[0.06]" />

        {/* Wind */}
        <div className="flex items-center gap-1.5 text-slate-500">
          <Wind className="w-3 h-3 text-blue-400/70" />
          <span className="text-[10px] font-mono text-slate-400">{weather.windSpeedKmH} km/h</span>
        </div>

        {/* Live dot */}
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" title="Live weather data" />
      </div>
    </div>
  );
};
