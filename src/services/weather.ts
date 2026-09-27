export interface WeatherData {
  temperatureC: number;
  windSpeedKmH: number;
  weatherCode: number;
  description: string;
  isDay: boolean;
}

const WEATHER_CODE_MAP: Record<number, string> = {
  0: 'Clear Sky ☀️',
  1: 'Mainly Clear 🌤️',
  2: 'Partly Cloudy ⛅',
  3: 'Overcast ☁️',
  45: 'Foggy 🌫️',
  51: 'Light Drizzle 🌧️',
  61: 'Rain 🌧️',
  71: 'Snow ❄️',
  80: 'Rain Showers 🌦️',
  95: 'Thunderstorm 🌩️',
};

export async function fetchWeatherForLocation(
  lat: number,
  lng: number
): Promise<WeatherData | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    const curr = data?.current_weather;
    if (!curr) return null;

    const code = curr.weathercode;
    const description = WEATHER_CODE_MAP[code] || 'Cloudy ⛅';

    return {
      temperatureC: Math.round(curr.temperature),
      windSpeedKmH: Math.round(curr.windspeed),
      weatherCode: code,
      description,
      isDay: curr.is_day === 1,
    };
  } catch (err) {
    console.error('Weather fetch error:', err);
    return null;
  }
}
