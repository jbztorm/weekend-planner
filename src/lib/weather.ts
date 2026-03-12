import { useState, useEffect } from 'react';

const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

export interface Weather {
  date: string;
  temp: string;
  condition: string;
  icon: string;
}

export function useWeather(lat?: number, lng?: number) {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!lat || !lng || !OPENWEATHER_API_KEY) {
      // 使用默认天气
      setWeather({
        date: new Date().toISOString().split('T')[0],
        temp: '18-25°C',
        condition: 'sunny',
        icon: '☀️',
      });
      return;
    }

    const fetchWeather = async () => {
      setLoading(true);
      setError('');

      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=zh_cn`
        );
        const data = await res.json();

        if (data.cod === 200) {
          const condition = data.weather[0]?.main?.toLowerCase() || 'clear';
          const iconMap: Record<string, string> = {
            clear: '☀️',
            clouds: '⛅',
            rain: '🌧️',
            drizzle: '🌦️',
            thunderstorm: '⛈️',
            snow: '❄️',
            mist: '🌫️',
            fog: '🌫️',
          };

          setWeather({
            date: new Date().toISOString().split('T')[0],
            temp: `${Math.round(data.main.temp_min || data.main.temp)}-${Math.round(data.main.temp_max || data.main.temp)}°C`,
            condition: condition,
            icon: iconMap[condition] || '☀️',
          });
        }
      } catch (err) {
        console.error('天气获取失败:', err);
        setError('天气获取失败');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [lat, lng]);

  return { weather, loading, error };
}

// 默认天气（无 API 时）
export function getDefaultWeather(): Weather {
  return {
    date: new Date().toISOString().split('T')[0],
    temp: '18-25°C',
    condition: 'sunny',
    icon: '☀️',
  };
}
