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

  // 简化 prompt，直接要求返回简单的 JSON
  const query = '北京亲子活动推荐：孩子' + ageText + '，' + maxDistance + '公里内。' +
    '请只返回以下格式的JSON，不要其他内容：' +
    '{"title":"标题","places":[{"name":"名称","address":"地址","reason":"理由","arrive_time":"09:30","leave_time":"10:30","duration":60,"tips":"提示"}],"summary":{"total_places":1,"total_duration":60}}';

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
  const content = data.choices?.[0]?.message?.content || '';

  // 直接解析整个响应为 JSON
  let result: GeneratedItinerary;
  try {
    // 尝试直接解析
    result = JSON.parse(content);
  } catch {
    // 如果失败，尝试提取 JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      result = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('无法解析返回内容');
    }
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
