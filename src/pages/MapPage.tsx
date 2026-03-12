import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useItineraryStore } from '../store/itinerary';
import { useAMap, reverseGeocode, drivingRoute } from '../lib/amap';
import { useState, useEffect } from 'react';

export function MapPage() {
  const navigate = useNavigate();
  const { currentItinerary } = useItineraryStore();
  const { ready, error: mapError } = useAMap();
  
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);

  // 初始化地图
  useEffect(() => {
    if (!ready || !currentItinerary) return;

    const map = new (window as any).AMap.Map('map-container', {
      zoom: 12,
      center: [116.4074, 39.9042], // 默认北京
    });

    setMapInstance(map);

    return () => {
      map?.destroy();
    };
  }, [ready, currentItinerary]);

  // 添加标记和路线
  useEffect(() => {
    if (!mapInstance || !currentItinerary?.places) return;

    // 清除旧标记
    markers.forEach(m => m.remove());
    routes.forEach(r => r.remove());

    const newMarkers: any[] = [];
    const newRoutes: any[] = [];
    const places = currentItinerary.places;

    // 添加标记
    places.forEach((place: any, idx: number) => {
      const marker = new (window as any).AMap.Marker({
        position: [place.location.lng, place.location.lat],
        title: place.name,
        label: {
          content: `${idx + 1}`,
          offset: new (window as any).AMap.Pixel(-6, -6),
        },
      });
      
      marker.setMap(mapInstance);
      newMarkers.push(marker);
    });

    setMarkers(newMarkers);

    // 调整视野
    if (places.length > 0) {
      mapInstance.setFitView();
    }
  }, [mapInstance, currentItinerary]);

  if (!currentItinerary) {
    return (
      <div className="min-h-screen bg-[#FFF8F5] flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 mb-4">还没有行程</div>
          <Button onClick={() => navigate('/generate')}>开始生成</Button>
        </div>
      </div>
    );
  }

  const hasMapKey = !!import.meta.env.VITE_AMAP_KEY;

  return (
    <div className="min-h-screen bg-[#FFF8F5] flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center justify-between border-b bg-white">
        <button onClick={() => navigate('/result')} className="text-gray-600">
          ← 返回
        </button>
        <span className="font-semibold">🗺️ 行程地图</span>
        <div className="w-10"></div>
      </header>

      {/* Map */}
      <div className="flex-1 relative">
        {mapError || !hasMapKey ? (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <div className="text-center p-4">
              <div className="text-4xl mb-2">🗺️</div>
              <div className="text-gray-600 mb-2">
                {mapError || '地图功能未配置'}
              </div>
              <div className="text-sm text-gray-400">
                配置 VITE_AMAP_KEY 后可显示真实地图
              </div>
            </div>
          </div>
        ) : (
          <div id="map-container" className="w-full h-full" />
        )}
      </div>

      {/* Places List */}
      <div className="bg-white p-4 max-h-40 overflow-y-auto border-t">
        <div className="font-semibold mb-2">📍 途经地点</div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {currentItinerary.places.map((place: any, idx: number) => (
            <div
              key={place.place_id}
              className="flex-shrink-0 bg-gray-50 rounded-lg p-2 text-sm"
            >
              <span className="text-[#FF6B35] font-bold">{idx + 1}.</span> {place.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
