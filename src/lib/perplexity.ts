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

  // 构建用户查询，包含明确的 JSON 输出指令
  const userQuery = `请为${ageText}的孩子设计一个周末亲子活动行程，距离不超过${maxDistance}公里。

请严格按照以下JSON格式返回，不要有任何解释或额外文字：
{
  "title": "行程标题",
  "places": [
    {
      "name": "地点名称",
      "address": "地址",
      "reason": "为什么适合亲子",
      "arrive_time": "到达时间，格式HH:MM",
      "leave_time": "离开时间，格式HH:MM",
      "duration": "游玩时长（分钟）",
      "tips": "实用小贴士"
    }
  ],
  "summary": {
    "total_places": "地点总数",
    "total_duration": "总时长（分钟）"
  }
}`;

  const messages = [
    { 
      role: 'system', 
      content: '你是一个专业的亲子活动规划助手。请严格按照用户要求的JSON格式返回，不要包含任何解释、问候语或额外文字。只返回纯粹的JSON对象。' 
    },
    { role: 'user', content: userQuery },
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
