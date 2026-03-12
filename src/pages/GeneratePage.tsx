import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useItineraryStore } from '../store/itinerary';
import { generateItinerary } from '../lib/perplexity';
import type { ChildAge, Preference, DateType } from '../lib/types';

const ageOptions = [
  { value: '0-1', label: '0-1 岁' },
  { value: '1-3', label: '1-3 岁' },
  { value: '3-6', label: '3-6 岁' },
];

const distanceOptions = [5, 10, 20, 30];

const preferenceOptions = [
  { value: 'indoor', label: '室内' },
  { value: 'outdoor', label: '室外' },
  { value: 'any', label: '不限' },
];

const dateOptions = [
  { value: 'saturday', label: '周六' },
  { value: 'sunday', label: '周日' },
  { value: 'weekend', label: '周末两天' },
];

export function GeneratePage() {
  const navigate = useNavigate();
  const { preferences, setPreferences, setLoading, setCurrentItinerary, setUserLocation } = useItineraryStore();
  
  const [childAge, setChildAge] = useState<ChildAge>(preferences.childAge);
  const [maxDistance, setMaxDistance] = useState<5 | 10 | 20 | 30>(preferences.maxDistance);
  const [preference, setPreference] = useState<Preference>(preferences.preference);
  const [date, setDate] = useState<DateType>(preferences.date);
  const [error, setError] = useState<string>('');

  const getUserLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          () => {
            // 默认北京
            resolve({ lat: 39.9042, lng: 116.4074 });
          }
        );
      } else {
        resolve({ lat: 39.9042, lng: 116.4074 });
      }
    });
  };

  const handleGenerate = async () => {
    // 更新偏好
    setPreferences({
      childAge,
      maxDistance: maxDistance as 5 | 10 | 20 | 30,
      preference,
      date,
    });

    // 获取用户位置
    const userLoc = await getUserLocation();
    setUserLocation(userLoc);

    setLoading(true);
    setError('');

    try {
      // 调用 Perplexity AI 生成行程
      const result = await generateItinerary({
        childAge,
        maxDistance: maxDistance as number,
        preference,
        date,
      });

      // 转换格式
      const itinerary = {
        id: 'itinerary-' + Date.now(),
        title: result.title,
        date: new Date().toISOString().split('T')[0],
        child_age: childAge,
        places: result.places.map((place, idx) => ({
          order: idx + 1,
          place_id: `place-${idx}`,
          name: place.name,
          type: 'outdoor', // Perplexity 返回的没有这个字段
          address: place.address,
          location: { lat: 39.9 + Math.random() * 0.1, lng: 116.4 + Math.random() * 0.1 }, // 模拟坐标
          arrive_time: place.arrive_time,
          leave_time: place.leave_time,
          duration: place.duration,
          reason: place.reason,
          tips: place.tips,
        })),
        route: result.places.slice(0, -1).map((place, idx) => ({
          from: place.name,
          to: result.places[idx + 1]?.name || '',
          duration: Math.floor(Math.random() * 30) + 15,
        })),
        summary: {
          total_places: result.summary.total_places,
          total_duration: result.summary.total_duration,
          total_distance: maxDistance as number,
        },
        created_at: new Date().toISOString(),
      };

      setCurrentItinerary(itinerary);
      navigate('/result');
    } catch (err: any) {
      console.error('生成失败:', err);
      setError(err.message || '行程生成失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F5] p-4">
      {/* Header */}
      <header className="flex items-center mb-6">
        <button onClick={() => navigate('/')} className="text-gray-600">
          ← 返回
        </button>
      </header>

      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        告诉我更多一点
      </h1>
      <p className="text-gray-500 mb-6">让我为你定制专属行程</p>

      {/* 年龄选择 */}
      <Card className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">👶</span>
          <span className="font-semibold">孩子年龄</span>
        </div>
        <div className="flex gap-2">
          {ageOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setChildAge(opt.value as ChildAge)}
              className={`flex-1 py-2 px-3 rounded-lg border-2 transition-colors ${
                childAge === opt.value
                  ? 'border-[#FF6B35] bg-[#FFF8F5] text-[#FF6B35]'
                  : 'border-gray-200 text-gray-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Card>

      {/* 距离选择 */}
      <Card className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">📍</span>
          <span className="font-semibold">活动范围</span>
        </div>
        <div className="flex gap-2">
          {distanceOptions.map((d) => (
            <button
              key={d}
              onClick={() => setMaxDistance(d as 5 | 10 | 20 | 30)}
              className={`flex-1 py-2 px-3 rounded-lg border-2 transition-colors ${
                maxDistance === d
                  ? 'border-[#FF6B35] bg-[#FFF8F5] text-[#FF6B35]'
                  : 'border-gray-200 text-gray-600'
              }`}
            >
              {d}km
            </button>
          ))}
        </div>
      </Card>

      {/* 室内外偏好 */}
      <Card className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">🏠</span>
          <span className="font-semibold">室内/室外偏好</span>
        </div>
        <div className="flex gap-2">
          {preferenceOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPreference(opt.value as Preference)}
              className={`flex-1 py-2 px-3 rounded-lg border-2 transition-colors ${
                preference === opt.value
                  ? 'border-[#FF6B35] bg-[#FFF8F5] text-[#FF6B35]'
                  : 'border-gray-200 text-gray-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Card>

      {/* 日期选择 */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">📅</span>
          <span className="font-semibold">出行日期</span>
        </div>
        <div className="flex gap-2">
          {dateOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDate(opt.value as DateType)}
              className={`flex-1 py-2 px-3 rounded-lg border-2 transition-colors ${
                date === opt.value
                  ? 'border-[#FF6B35] bg-[#FFF8F5] text-[#FF6B35]'
                  : 'border-gray-200 text-gray-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* 生成按钮 */}
      <Button size="lg" className="w-full py-4" onClick={handleGenerate}>
        ✨ Perplexity AI 生成行程
      </Button>
    </div>
  );
}
