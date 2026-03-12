import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

interface SavedItinerary {
  id: string;
  title: string;
  date: string;
  child_age: string;
  places: Array<{
    name: string;
    address: string;
  }>;
  summary: {
    total_places: number;
    total_duration: number;
  };
  created_at: string;
}

export function SavedPage() {
  const navigate = useNavigate();
  const [savedList, setSavedList] = useState<SavedItinerary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 从 localStorage 读取
    const saved = JSON.parse(localStorage.getItem('weekend-planner-saved') || '[]');
    setSavedList(saved);
    setLoading(false);
  }, []);

  const handleDelete = (id: string) => {
    const newList = savedList.filter((item) => item.id !== id);
    setSavedList(newList);
    localStorage.setItem('weekend-planner-saved', JSON.stringify(newList));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF8F5] flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F5]">
      {/* Header */}
      <header className="p-4 flex items-center justify-between border-b bg-white">
        <button onClick={() => navigate('/')} className="text-gray-600">
          ← 返回
        </button>
        <span className="font-semibold">💾 我的收藏</span>
        <div className="w-10"></div>
      </header>

      {/* Content */}
      <div className="p-4">
        {savedList.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <div className="text-xl font-semibold text-gray-800 mb-2">
              还没有收藏的行程
            </div>
            <div className="text-gray-500 mb-6">
              生成行程后可以保存到这里
            </div>
            <Button onClick={() => navigate('/generate')}>
              开始生成行程
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {savedList.map((item) => (
              <Card key={item.id} className="relative">
                <button
                  onClick={() => handleDelete(item.id)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                >
                  ✕
                </button>
                <div 
                  onClick={() => navigate(`/shared/${item.id}`)}
                  className="cursor-pointer"
                >
                  <h3 className="font-semibold text-gray-800 pr-8">
                    {item.title}
                  </h3>
                  <div className="text-sm text-gray-500 mt-1">
                    {item.child_age}岁 · {item.places?.length || item.summary?.total_places}个地点 · {Math.round((item.summary?.total_duration || 0) / 60)}小时
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    {new Date(item.created_at).toLocaleDateString('zh-CN')}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Generate New */}
        <div className="mt-6">
          <Button 
            className="w-full" 
            variant="outline"
            onClick={() => navigate('/generate')}
          >
            ✨ 生成新行程
          </Button>
        </div>
      </div>
    </div>
  );
}
