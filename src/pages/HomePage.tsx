import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export function HomePage() {
  const navigate = useNavigate();
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    // 检查收藏数量
    const saved = JSON.parse(localStorage.getItem('weekend-planner-saved') || '[]');
    setSavedCount(saved.length);
  }, []);

  const features = [
    { icon: '👶', title: '年龄适配', desc: '根据宝宝年龄推荐合适场所' },
    { icon: '🗺️', title: '智能路线', desc: '自动规划最优出行路线' },
    { icon: '🌤️', title: '天气整合', desc: '实时天气预报提醒' },
  ];

  return (
    <div className="min-h-screen bg-[#FFF8F5]">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <div className="text-2xl font-bold text-[#FF6B35]">周末去哪玩</div>
        <button 
          onClick={() => navigate('/saved')}
          className="flex items-center gap-1 text-gray-600 hover:text-[#FF6B35]"
        >
          <span>💾</span>
          {savedCount > 0 && (
            <span className="bg-[#FF6B35] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {savedCount}
            </span>
          )}
        </button>
      </header>

      {/* Hero */}
      <main className="px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🎢 周末去哪玩？
          </h1>
          <p className="text-gray-600">
            帮助 0-6 岁宝宝家长的
            <br />
            周末亲子活动智能规划
          </p>
        </div>

        {/* CTA Button */}
        <div className="mb-10">
          <Button
            size="lg"
            className="w-full py-4 text-lg"
            onClick={() => navigate('/generate')}
          >
            开始生成行程 ➜
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {features.map((f) => (
            <Card key={f.title} className="text-center py-4">
              <div className="text-2xl mb-2">{f.icon}</div>
              <div className="font-semibold text-gray-800 text-sm">{f.title}</div>
              <div className="text-xs text-gray-500 mt-1">{f.desc}</div>
            </Card>
          ))}
        </div>

        {/* Cities */}
        <div className="text-center text-gray-500 text-sm">
          <span>北京 · 上海 · 深圳</span>
        </div>
      </main>
    </div>
  );
}
