import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useItineraryStore } from '../store/itinerary';

export function MapPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentItinerary } = useItineraryStore();

  // 如果没有当前行程，尝试从 savedItineraries 找到
  const itinerary = currentItinerary;

  if (!itinerary) {
    return (
      <div className="min-h-screen bg-[#FFF8F5] flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 mb-4">没有找到行程</div>
          <Button onClick={() => navigate('/generate')}>开始生成</Button>
        </div>
      </div>
    );
  }

  const { title, places } = itinerary;

  return (
    <div className="min-h-screen bg-[#FFF8F5] flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center justify-between border-b bg-white">
        <button onClick={() => navigate('/result')} className="text-gray-600">
          ← 返回
        </button>
        <span className="font-semibold">🗺️ 路线地图</span>
        <div className="w-10"></div>
      </header>

      {/* Map Placeholder */}
      <div className="flex-1 bg-gray-100 relative">
        {/* 地图占位符 - 实际项目中会集成 Mapbox/高德 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🗺️</div>
            <div className="text-gray-600 mb-2">地图区域</div>
            <div className="text-sm text-gray-400">
              集成 Mapbox/高德地图 SDK 后显示
            </div>
          </div>
        </div>

        {/* 地点标记（模拟） */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            {places.slice(0, 3).map((place, idx) => (
              <div
                key={place.place_id}
                className="absolute bg-white rounded-full p-2 shadow-lg text-xl"
                style={{
                  transform: `translate(${(idx - 1) * 40}px, ${idx * 30}px)`,
                }}
              >
                {idx + 1}️⃣
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Place List */}
      <div className="bg-white p-4 max-h-1/3 overflow-y-auto">
        <h3 className="font-semibold mb-3">📍 途经地点</h3>
        <div className="space-y-2">
          {places.map((place, idx) => (
            <div
              key={place.place_id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
            >
              <div className="w-6 h-6 rounded-full bg-[#FF6B35] text-white flex items-center justify-center text-xs font-bold">
                {idx + 1}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-800">{place.name}</div>
                <div className="text-xs text-gray-500">{place.address}</div>
              </div>
              <div className="text-sm text-gray-500">{place.arrive_time}</div>
            </div>
          ))}
        </div>

        <Button
          className="w-full mt-4"
          onClick={() => {
            // 打开外部地图导航
            const firstPlace = places[0];
            if (firstPlace) {
              window.open(
                `https://www.amap.com/search?query=${encodeURIComponent(firstPlace.name)}`,
                '_blank'
              );
            }
          }}
        >
          📍 导航前往第一个地点
        </Button>
      </div>
    </div>
  );
}
