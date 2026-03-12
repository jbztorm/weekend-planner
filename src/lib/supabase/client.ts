import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// 开发环境模拟数据（当没有 Supabase 配置时使用）
export const MOCK_MODE = !supabaseUrl || !supabaseAnonKey;

export const MOCK_PLACES = [
  {
    id: 'place-1',
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
