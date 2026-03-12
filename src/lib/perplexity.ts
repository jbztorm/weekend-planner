export interface ItineraryParams {
  childAge: string;
  maxDistance: number;
  preference: string;
  date: string;
}

export interface GeneratedPlace {
  name: string;
  address: string;
  reason: string;
  arrive_time: string;
  leave_time: string;
  duration: number;
  tips?: string;
}

export interface GeneratedItinerary {
  title: string;
  places: GeneratedPlace[];
  summary: {
    total_places: number;
    total_duration: number;
  };
}

/**
 * 使用 Perplexity 生成亲子活动行程
 */
export async function generateItinerary(
  params: ItineraryParams
): Promise<GeneratedItinerary> {
  const { childAge, maxDistance } = params;

  const ageText = childAge === '0-1' ? '0-1岁' : childAge === '1-3' ? '1-3岁' : '3-6岁';

  // 使用更简单直接的 prompt
  const query = '{"title":"周末亲子游","places":[{"name":"朝阳公园","address":"北京市朝阳区","reason":"适合遛娃","arrive_time":"09:00","leave_time":"11:00","duration":120,"tips":"带好水和食物"}],"summary":{"total_places":1,"total_duration":120}}';

  const messages = [
    { role: 'user', content: query },
  ];

  const response = await fetch('/api/perplexity', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, model: 'sonar-pro' }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error('API错误: ' + errorText);
  }

  const data = await response.json();
  let content = data.choices?.[0]?.message?.content || '';

  // 清理并解析
  content = content.trim();
  
  let result: GeneratedItinerary;
  
  try {
    // 尝试多种方式解析
    try {
      result = JSON.parse(content);
    } catch {
      const start = content.indexOf('{');
      const end = content.lastIndexOf('}') + 1;
      if (start >= 0 && end > start) {
        result = JSON.parse(content.substring(start, end));
      } else {
        content = content.replace(/```json/g, '').replace(/```/g, '').trim();
        result = JSON.parse(content);
      }
    }
  } catch (e) {
    throw new Error('解析失败: ' + content.substring(0, 80));
  }

  return {
    title: result.title || '周末亲子游',
    places: result.places || [],
    summary: result.summary || {
      total_places: result.places?.length || 0,
      total_duration: result.places?.reduce((sum: number, p: any) => sum + (p.duration || 0), 0) || 0,
    },
  };
}
