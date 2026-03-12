import { useState, useEffect } from 'react';

const AMAP_KEY = import.meta.env.VITE_AMAP_KEY;

export interface Place {
  name: string;
  address: string;
  location: { lat: number; lng: number };
}

export function useAMap() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!AMAP_KEY) {
      setError('未配置高德地图 Key');
      return;
    }

    // 加载高德地图 JS API
    const script = document.createElement('script');
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_KEY}`;
    script.onload = () => setReady(true);
    script.onerror = () => setError('高德地图加载失败');
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return { ready, error };
}

// 逆地理编码：经纬度 -> 地址
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  if (!AMAP_KEY) return '';
  
  try {
    const res = await fetch(
      `https://restapi.amap.com/v3/geocode/regeo?location=${lng},${lat}&key=${AMAP_KEY}`
    );
    const data = await res.json();
    return data.regeocode?.formatted_address || '';
  } catch {
    return '';
  }
}

// 地理编码：地址 -> 经纬度
export async function geocode(address: string): Promise<{ lat: number; lng: number } | null> {
  if (!AMAP_KEY) return null;
  
  try {
    const res = await fetch(
      `https://restapi.amap.com/v3/geocode/geo?address=${encodeURIComponent(address)}&key=${AMAP_KEY}`
    );
    const data = await res.json();
    const location = data.geocodes?.[0]?.location;
    if (location) {
      const [lng, lat] = location.split(',');
      return { lat: parseFloat(lat), lng: parseFloat(lng) };
    }
    return null;
  } catch {
    return null;
  }
}

// 路径规划
export async function drivingRoute(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<{ distance: number; duration: number } | null> {
  if (!AMAP_KEY) return null;
  
  try {
    const res = await fetch(
      `https://restapi.amap.com/v3/direction/driving?origin=${origin.lng},${origin.lat}&destination=${destination.lng},${destination.lat}&key=${AMAP_KEY}`
    );
    const data = await res.json();
    const path = data.paths?.[0];
    if (path) {
      return {
        distance: parseInt(path.distance),
        duration: parseInt(path.duration),
      };
    }
    return null;
  } catch {
    return null;
  }
}
