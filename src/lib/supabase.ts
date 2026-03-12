import { createClient } from '@supabase/supabase-js';

// 环境变量
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// 创建客户端（如果没有配置则返回 null）
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConfigured = !!supabase;

// 类型定义
export interface DbPlace {
  id: string;
  city_id: number;
  name: string;
  address: string;
  location: { lat: number; lng: number };
  place_type: 'indoor' | 'outdoor' | 'museum' | 'restaurant';
  age_min: number;
  age_max: number;
  rating: number;
  price_level: number;
  suggested_duration: number;
  description?: string;
  image_url?: string;
}

export interface DbItinerary {
  id: string;
  user_id?: string;
  city_id: number;
  title: string;
  child_age: string;
  max_distance: number;
  preference: string;
  itinerary_data: any;
  is_shared: boolean;
  share_token?: string;
  created_at: string;
}

// API 函数

/**
 * 获取附近地点
 */
export async function fetchNearbyPlaces(params: {
  lat: number;
  lng: number;
  distance?: number;
  age?: string;
  type?: string;
}): Promise<DbPlace[]> {
  if (!supabase) {
    console.warn('Supabase 未配置');
    return [];
  }

  const { lat, lng, distance = 10, age, type } = params;

  // 简化的距离计算（实际应该用 PostGIS）
  const radius = distance * 1000; // 米

  let query = supabase
    .from('places')
    .select('*')
    .eq('city_id', 1) // 北京
    .eq('is_active', true);

  if (type && type !== 'any') {
    query = query.eq('place_type', type);
  }

  const { data, error } = await query.limit(50);

  if (error) {
    console.error('获取地点失败:', error);
    return [];
  }

  // 客户端过滤距离（简化版）
  return (data || []).filter((place: any) => {
    if (!place.location) return true;
    const placeLat = place.location.lat || place.location.y;
    const placeLng = place.location.lng || place.location.x;
    const dist = getDistance(lat, lng, placeLat, placeLng);
    return dist <= distance;
  });
}

/**
 * 保存行程
 */
export async function saveItinerary(itinerary: {
  title: string;
  child_age: string;
  max_distance: number;
  preference: string;
  itinerary_data: any;
}): Promise<DbItinerary | null> {
  if (!supabase) {
    console.warn('Supabase 未配置');
    return null;
  }

  const { data, error } = await supabase
    .from('itineraries')
    .insert({
      title: itinerary.title,
      child_age: itinerary.child_age,
      max_distance: itinerary.max_distance,
      preference: itinerary.preference,
      itinerary_data: itinerary.itinerary_data,
    })
    .select()
    .single();

  if (error) {
    console.error('保存行程失败:', error);
    return null;
  }

  return data;
}

/**
 * 获取用户行程列表
 */
export async function getUserItineraries(userId: string): Promise<DbItinerary[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('itineraries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('获取行程失败:', error);
    return [];
  }

  return data || [];
}

/**
 * 通过分享码获取行程
 */
export async function getSharedItinerary(token: string): Promise<DbItinerary | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('itineraries')
    .select('*')
    .eq('share_token', token)
    .single();

  if (error) {
    console.error('获取分享行程失败:', error);
    return null;
  }

  return data;
}

// 工具函数：计算两点距离（km）
function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // 地球半径 km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// 模拟数据（当 Supabase 未配置时使用）
export const MOCK_PLACES: DbPlace[] = [
  {
    id: 'place-1',
    city_id: 1,
    name: '朝阳公园',
    address: '北京市朝阳区朝阳公园南路',
    location: { lat: 39.9288, lng: 116.4912 },
    place_type: 'outdoor',
    age_min: 12,
    age_max: 72,
    rating: 4.5,
    price_level: 1,
    suggested_duration: 120,
    description: '大型户外公园，适合孩子奔跑玩耍',
  },
  {
    id: 'place-2',
    city_id: 1,
    name: 'mini mars',
    address: '北京市朝阳区建国路93号',
    location: { lat: 39.9149, lng: 116.4601 },
    place_type: 'indoor',
    age_min: 12,
    age_max: 72,
    rating: 4.8,
    price_level: 3,
    suggested_duration: 120,
    description: '高端室内游乐场，设施完善',
  },
  {
    id: 'place-3',
    city_id: 1,
    name: '中国科学技术馆',
    address: '北京市朝阳区北辰东路5号',
    location: { lat: 39.9926, lng: 116.9704 },
    place_type: 'museum',
    age_min: 36,
    age_max: 72,
    rating: 4.7,
    price_level: 2,
    suggested_duration: 180,
    description: '儿童科学乐园，寓教于乐',
  },
  {
    id: 'place-4',
    city_id: 1,
    name: '亲子餐厅',
    address: '北京市朝阳区三里屯太古里',
    location: { lat: 39.9357, lng: 116.4472 },
    place_type: 'restaurant',
    age_min: 0,
    age_max: 72,
    rating: 4.3,
    price_level: 3,
    suggested_duration: 75,
    description: '儿童餐丰富，适合家庭用餐',
  },
  {
    id: 'place-5',
    city_id: 1,
    name: '绘本王国',
    address: '北京市海淀区中关村大街',
    location: { lat: 39.9857, lng: 116.3117 },
    place_type: 'indoor',
    age_min: 0,
    age_max: 72,
    rating: 4.6,
    price_level: 2,
    suggested_duration: 90,
    description: '海量绘本，亲子阅读空间',
  },
];
