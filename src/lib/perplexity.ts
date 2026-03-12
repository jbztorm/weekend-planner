import { Perplexity } from '@perplexity-ai/perplexity_ai';

const perplexity = new Perplexity({
  apiKey: import.meta.env.VITE_PERPLEXITY_API_KEY || '',
});

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

// 辅助函数：从 content 中提取文本
function getContentText(content: any): string {
  if (typeof content === 'string') {
    return content;
  }
  if (Array.isArray(content)) {
    return content
      .filter((c: any) => c.type === 'text')
      .map((c: any) => c.text)
      .join('');
  }
  if (content?.text) {
    return content.text;
  }
  return '';
}

/**
 * 使用 Perplexity 生成亲子活动行程
 * Perplexity 优势：自带实时搜索，能获取最新地点信息
 */
export async function generateItinerary(
  params: ItineraryParams
): Promise<GeneratedItinerary> {
  const { childAge, maxDistance, preference, date } = params;

  // 根据偏好设置搜索关键词
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

  // 构建查询
  const query = `我住在北京市区，孩子${childAge === '0-1' ? '0-1岁' : childAge === '1-3' ? '1-3岁' : '3-6岁'}，想去遛娃。
请帮我推荐${maxDistance}公里内最好的${prefText[preference as keyof typeof prefText]}。
日期是${dateText[date as keyof typeof dateText]}。

请以严格的JSON格式输出，包含以下字段：
{
  "title": "行程标题",
  "places": [
    {
      "name": "地点名称",
      "address": "详细地址",
      "reason": "推荐理由",
      "arrive_time": "到达时间，如09:30",
      "leave_time": "离开时间，如10:30",
      "duration": "停留分钟数",
      "tips": "实用小贴士"
    }
  ],
  "summary": {
    "total_places": "地点数量",
    "total_duration": "总时长分钟数"
  }
}

只输出JSON，不要其他文字。`;

  try {
    const response = await perplexity.chat.completions.create({
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [
        {
          role: 'system',
          content: '你是一位专业的北京亲子活动规划师。请根据用户需求推荐适合的亲子活动场所。只输出JSON格式，不要输出其他文字。',
        },
        {
          role: 'user',
          content: query,
        },
      ],
    });

    const rawContent = response.choices[0]?.message?.content;
    const content = getContentText(rawContent);

    if (!content) {
      throw new Error('API 返回内容为空');
    }

    // 尝试解析 JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('无法解析返回内容');
    }

    const result = JSON.parse(jsonMatch[0]) as GeneratedItinerary;

    // 确保数据完整
    return {
      title: result.title || '周末亲子游',
      places: result.places || [],
      summary: result.summary || {
        total_places: result.places?.length || 0,
        total_duration: result.places?.reduce((sum, p) => sum + (p.duration || 0), 0) || 0,
      },
    };
  } catch (error) {
    console.error('Perplexity API 错误:', error);
    throw error;
  }
}

/**
 * 搜索北京亲子场所
 */
export async function searchPlaces(
  keyword: string,
  location: string = '北京'
): Promise<string[]> {
  try {
    const response = await perplexity.chat.completions.create({
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [
        {
          role: 'user',
          content: `搜索${location}附近的${keyword}，列出前5个最受欢迎的，简要说明每个的特点。`,
        },
      ],
    });

    const rawContent = response.choices[0]?.message?.content;
    const content = getContentText(rawContent);

    return [content];
  } catch (error) {
    console.error('搜索失败:', error);
    return [];
  }
}
