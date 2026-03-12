import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

interface SharedItinerary {
  id: string;
  title: string;
  child_age: string;
  itinerary_data: {
    places: Array<{
      name: string;
      address: string;
      arrive_time: string;
      leave_time: string;
      reason: string;
      tips?: string;
    }>;
    summary: {
      total_places: number;
      total_duration: number;
    };
  };
  created_at: string;
}

export function SharedPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [itinerary, setItinerary] = useState<SharedItinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // 从 localStorage 获取分享的行程（简化版）
    // 实际应该从 Supabase 获取
    const savedItineraries = JSON.parse(localStorage.getItem('weekend-planner-saved') || '[]');
    const found = savedItineraries.find((i: any) => i.id === token);
    
    if (found) {
      setItinerary(found);
    } else {
      setError('行程不存在或已过期');
    }
    setLoading(false);
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF8F5] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📤</div>
          <div className="text-xl font-semibold">加载中...</div>
        </div>
      </div>
    );
  }

  if (error || !itinerary) {
    return (
      <div className="min-h-screen bg-[#FFF8F5] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">😕</div>
          <div className="text-xl font-semibold text-gray-800 mb-2">{error || '行程不存在'}</div>
          <Button onClick={() => navigate('/')}>返回首页</Button>
        </div>
      </div>
    );
  }

  const { places, summary } = itinerary.itinerary_data;

  return (
    <div className="min-h-screen bg-[#FFF8F5]">
      {/* Header */}
      <header className="p-4 flex items-center justify-between border-b bg-white">
        <button onClick={() => navigate('/')} className="text-gray-600">
          ← 返回
        </button>
        <span className="font-semibold">🔗 分享行程</span>
        <div className="w-10"></div>
      </header>

      {/* Content */}
      <div className="p-4">
        <Card className="mb-4">
          <h1 className="text-xl font-bold text-gray-800">{itinerary.title}</h1>
          <div className="text-sm text-gray-500 mt-1">
            {itinerary.child_age}岁 · {summary.total_places}个地点 · {Math.round(summary.total_duration / 60)}小时
          </div>
        </Card>

        {/* Places */}
        <h2 className="font-semibold text-gray-800 mb-3">📍 行程详情</h2>
        
        <div className="space-y-3 mb-4">
          {places.map((place, index) => (
            <Card key={index}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FF6B35] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">{place.name}</div>
                  <div className="text-sm text-gray-500">{place.address}</div>
                  <div className="text-sm text-[#FF6B35] mt-1">
                    {place.arrive_time} - {place.leave_time}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{place.reason}</div>
                  {place.tips && (
                    <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded mt-2">
                      💡 {place.tips}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button 
            className="flex-1" 
            onClick={() => {
              // 保存到本地
              const saved = JSON.parse(localStorage.getItem('weekend-planner-saved') || '[]');
              if (!saved.find((i: any) => i.id === itinerary.id)) {
                saved.unshift(itinerary);
                localStorage.setItem('weekend-planner-saved', JSON.stringify(saved));
              }
              alert('已保存到我的收藏');
            }}
          >
            💾 保存到本地
          </Button>
        </div>

        <Button 
          className="w-full mt-3" 
          variant="outline"
          onClick={() => navigate('/generate')}
        >
          ✨ 生成新行程
        </Button>
      </div>
    </div>
  );
}
