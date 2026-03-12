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
  const { childAge, maxDistance, preference, date } = params;

  const ageText = childAge === '0-1' ? '0-1岁' : childAge === '1-3' ? '1-3岁' : '3-6岁';
  const dateText = date === 'saturday' ? '周六' : date === 'sunday' ? '周日' : '周末两天';

  const query = '我住在北京市区，孩子' + ageText + '，周末想去遛娃。' +
    '请帮我推荐' + maxDistance + '公里内最好的亲子场所。' +
    '请严格按照以下JSON格式输出，不要其他文字：' +
    '{"title":"周末亲子游","places":[{"name":"名称","address":"地址","reason":"理由","arrive_time":"09:30","leave_time":"10:30","duration":60,"tips":"提示"}],"summary":{"total_places":4,"total_duration":240}}';

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
    throw new Error('API 错误 (' + response.status + '): ' + errorText);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';

  console.log('API 返回:', content.substring(0, 100));

  if (!content) {
    throw new Error('API 返回内容为空');
  }

  // 解析 JSON
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('无法解析返回内容: ' + content.substring(0, 50));
  }

  const result = JSON.parse(jsonMatch[0]) as GeneratedItinerary;

  return {
    title: result.title || '周末亲子游',
    places: result.places || [],
    summary: result.summary || {
      total_places: result.places?.length || 0,
      total_duration: result.places?.reduce((sum: number, p: any) => sum + (p.duration || 0), 0) || 0,
    },
  };
}
