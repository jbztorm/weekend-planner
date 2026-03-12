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

// 模拟数据
const mockPlaces = [
  {
    name: '朝阳公园',
    address: '北京市朝阳区朝阳公园南路',
    reason: '户外活动，适合孩子奔跑玩耍，有大片绿地和儿童游乐区',
    arrive_time: '09:30',
    leave_time: '10:30',
    duration: 60,
    tips: '带好防晒帽和饮用水，注意安全',
  },
  {
    name: '亲子餐厅',
    address: '北京市朝阳区建国路93号',
    reason: '午餐休息，有儿童餐和儿童座椅，适合家庭用餐',
    arrive_time: '10:45',
    leave_time: '12:00',
    duration: 75,
    tips: '建议提前预约',
  },
  {
    name: 'mini mars',
    address: '北京市朝阳区三里屯太古里',
    reason: '高端室内游乐场，设施完善，适合放电',
    arrive_time: '13:00',
    leave_time: '15:00',
    duration: 120,
    tips: '记得带防滑袜',
  },
  {
    name: '绘本王国',
    address: '北京市海淀区中关村大街',
    reason: '海量绘本，亲子阅读空间，培养阅读习惯',
    arrive_time: '15:30',
    leave_time: '17:00',
    duration: 90,
    tips: '保持安静，注意不要损坏绘本',
  },
];

export function GeneratePage() {
  const navigate = useNavigate();
  const { preferences, setPreferences, setLoading, setCurrentItinerary, setUserLocation } = useItineraryStore();
  
  const [childAge, setChildAge] = useState<ChildAge>(preferences.childAge);
  const [maxDistance, setMaxDistance] = useState<5 | 10 | 20 | 30>(preferences.maxDistance);
  const [preference, setPreference] = useState<Preference>(preferences.preference);
  const [date, setDate] = useState<DateType>(preferences.date);
  const [error, setError] = useState<string>('');
  const [useMock, setUseMock] = useState(false);

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
            resolve({ lat: 39.9042, lng: 116.4074 });
          }
        );
      } else {
        resolve({ lat: 39.9042, lng: 116.4074 });
      }
    });
  };

  const handleGenerate = async () => {
    setPreferences({
      childAge,
      maxDistance: maxDistance as 5 | 10 | 20 | 30,
      preference,
      date,
    });

    const userLoc = await getUserLocation();
    setUserLocation(userLoc);

    setLoading(true);
    setError('');

    try {
      let result;
      
      if (useMock) {
        // 使用模拟数据
        result = {
          title: date === 'weekend' ? '周末亲子欢乐游' : date === 'saturday' ? '周六亲子游' : '周日亲子游',
          places: mockPlaces,
          summary: {
            total_places: mockPlaces.length,
            total_duration: mockPlaces.reduce((sum, p) => sum + p.duration, 0),
          },
        };
      } else {
        // 检查 API Key
        const apiKey = import.meta.env.VITE_PERPLEXITY_API_KEY;
        console.log('API Key 状态:', apiKey ? '已配置' : '未配置');
        
        if (!apiKey) {
          setError('错误：Perplexity API Key 未配置');
          result = {
            title: date === 'weekend' ? '周末亲子欢乐游' : date === 'saturday' ? '周六亲子游' : '周日亲子游',
            places: mockPlaces,
            summary: {
              total_places: mockPlaces.length,
              total_duration: mockPlaces.reduce((sum, p) => sum + p.duration, 0),
            },
          };
        } else {
          // 尝试调用 API
          try {
            result = await generateItinerary({
              childAge,
              maxDistance: maxDistance as number,
              preference,
              date,
            });
          } catch (apiError: any) {
            console.error('API 调用失败:', apiError);
            setError(`API 调用失败: ${apiError?.message || '未知错误'}`);
            result = {
              title: date === 'weekend' ? '周末亲子欢乐游' : date === 'saturday' ? '周六亲子游' : '周日亲子游',
              places: mockPlaces,
              summary: {
                total_places: mockPlaces.length,
                total_duration: mockPlaces.reduce((sum, p) => sum + p.duration, 0),
              },
            };
          }
        }
      }

      const itinerary = {
        id: 'itinerary-' + Date.now(),
        title: result.title,
        date: new Date().toISOString().split('T')[0],
        child_age: childAge,
        places: result.places.map((place: any, idx: number) => ({
          order: idx + 1,
          place_id: `place-${idx}`,
          name: place.name,
          type: 'outdoor',
          address: place.address,
          location: { lat: 39.9 + Math.random() * 0.1, lng: 116.4 + Math.random() * 0.1 },
          arrive_time: place.arrive_time,
          leave_time: place.leave_time,
          duration: place.duration,
          reason: place.reason,
          tips: place.tips,
        })),
        route: result.places.slice(0, -1).map((place: any, idx: number) => ({
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

      {/* Demo 模式开关 */}
      <Card className="mb-4 bg-blue-50">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={useMock}
            onChange={(e) => setUseMock(e.target.checked)}
            className="w-5 h-5 accent-blue-500"
          />
          <div>
            <div className="font-medium text-gray-800">演示模式</div>
            <div className="text-xs text-gray-500">不调用 API，使用内置示例</div>
          </div>
        </label>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* 生成按钮 */}
      <Button size="lg" className="w-full py-4" onClick={handleGenerate}>
        ✨ {useMock ? '生成行程（演示）' : 'Perplexity AI 生成行程'}
      </Button>
    </div>
  );
}
