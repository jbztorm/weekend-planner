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
 * 直接用 fetch 调用，避免 CORS
 */
export async function generateItinerary(
  params: ItineraryParams
): Promise<GeneratedItinerary> {
  const { childAge, maxDistance, preference, date } = params;

  const prefText = {
    indoor: '室内游乐场、绘本馆、儿童餐厅',
    outdoor: '户外公园、动物园、亲子农场',
    any: '亲子乐园、公园、游乐场、博物馆',
  };

  const dateText = {
    saturday: '周六',
    sunday: '周日',
    weekend: '周末两天',
  };

  const query = `我住在北京市区，孩子${childAge === '0-1' ? '0-1岁' : childAge === '1-3' ? '1-3岁' : '3-6岁'}，想去遛娃。
请帮我推荐${maxDistance}公里内最好的${prefText[preference as keyof typeof prefText]}。
日期是${dateText[date as keyof typeof dateText]}。

请以严格的JSON格式输出：
{
  "title": "行程标题",
  "places": [{"name": "地点名称", "address": "详细地址", "reason": "推荐理由", "arrive_time": "09:30", "leave_time": "10:30", "duration": 60, "tips": "实用小贴士"}],
  "summary": {"total_places": 数量, "total_duration": 分钟数}
}
只输出JSON。`;

  const messages = [
    {
      role: 'system',
      content: '你是一位专业的北京亲子活动规划师。只输出JSON格式。',
    },
    {
      role: 'user',
      content: query,
    },
  ];

  // 调用后端 API 代理
  const response = await fetch('/api/perplexity', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, model: 'sonar-pro' }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API 错误 (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';

  if (!content) {
    throw new Error('API 返回内容为空');
  }

  // 解析 JSON
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('无法解析返回内容');
  }

  const result = JSON.parse(jsonMatch[0]) as GeneratedItinerary;

  return {
    title: result.title || '周末亲子游',
    places: result.places || [],
    summary: result.summary || {
      total_places: result.places?.length || 0,
      total_duration: result.places?.reduce((sum, p) => sum + (p.duration || 0), 0) || 0,
    },
  };
}
