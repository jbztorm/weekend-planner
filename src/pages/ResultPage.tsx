import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useItineraryStore } from '../store/itinerary';

export function ResultPage() {
  const navigate = useNavigate();
  const { currentItinerary, isLoading, addSavedItinerary, savedItineraries } = useItineraryStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFF8F5] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">✨</div>
          <div className="text-xl font-semibold text-gray-800 mb-2">
            正在为你生成专属行程...
          </div>
          <div className="text-gray-500">AI 正在思考中</div>
        </div>
      </div>
    );
  }

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

  const { title, places, route, summary, weather, child_age } = currentItinerary;

  const handleSave = () => {
    // 保存到 store
    addSavedItinerary(currentItinerary);
    
    // 同时保存到 localStorage（持久化）
    const saved = JSON.parse(localStorage.getItem('weekend-planner-saved') || '[]');
    if (!saved.find((i: any) => i.id === currentItinerary.id)) {
      saved.unshift(currentItinerary);
      localStorage.setItem('weekend-planner-saved', JSON.stringify(saved));
    }
    
    alert('计划已保存！');
  };

  const handleShare = () => {
    // 生成分享链接
    const shareUrl = `${window.location.origin}/shared/${currentItinerary.id}`;
    navigator.clipboard.writeText(shareUrl);
    alert('分享链接已复制到剪贴板！');
  };

  return (
    <div className="min-h-screen bg-[#FFF8F5] pb-20">
      {/* Header */}
      <header className="p-4 flex items-center justify-between border-b bg-white">
        <button onClick={() => navigate('/generate')} className="text-gray-600">
          ← 返回
        </button>
        <span className="text-sm text-gray-500">行程详情</span>
        <div className="w-10"></div>
      </header>

      {/* Title & Weather */}
      <div className="p-4 bg-white">
        <h1 className="text-xl font-bold text-gray-800">{title}</h1>
        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
          <span>{child_age}岁</span>
          <span>·</span>
          <span>{summary.total_distance}km内</span>
          {weather && (
            <>
              <span>·</span>
              <span>🌤️ {weather.temp}</span>
            </>
          )}
        </div>
      </div>

      {/* Route */}
      <div className="p-4">
        <h2 className="font-semibold text-gray-800 mb-3">📍 推荐路线</h2>
        
        <div className="space-y-0">
          {places.map((place, index) => (
            <div key={place.place_id} className="relative">
              {/* 时间线 */}
              <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-[#FF6B35] text-white flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                {index < places.length - 1 && (
                  <div className="w-0.5 h-full bg-gray-200"></div>
                )}
              </div>

              {/* 内容 */}
              <div className="ml-10 mb-4">
                <Card>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold text-gray-800">{place.name}</div>
                      <div className="text-sm text-gray-500">{place.address}</div>
                    </div>
                    <div className="text-sm text-[#FF6B35] font-medium">
                      {place.arrive_time} - {place.leave_time}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">{place.reason}</div>
                  
                  {place.tips && (
                    <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                      💡 {place.tips}
                    </div>
                  )}
                </Card>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="p-4">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-[#FF6B35]">{summary.total_places}</div>
            <div className="text-xs text-gray-500">个地点</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-[#FF6B35]">{Math.round(summary.total_duration / 60)}h</div>
            <div className="text-xs text-gray-500">总时长</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-[#FF6B35]">{summary.total_distance}km</div>
            <div className="text-xs text-gray-500">总距离</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => navigate('/map')}>
            🗺️ 看地图
          </Button>
          <Button variant="secondary" className="flex-1" onClick={handleSave}>
            💾 保存
          </Button>
        </div>

        <Button className="w-full mt-3" onClick={handleShare}>
          🔗 分享行程
        </Button>
      </div>

      {/* Saved count */}
      {savedItineraries.length > 0 && (
        <div className="p-4 text-center text-sm text-gray-500">
          已保存 {savedItineraries.length} 个行程
        </div>
      )}
    </div>
  );
}
