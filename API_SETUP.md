# 周末去哪玩 - API 接入详细教程

本文档详细说明如何接入真实后端服务。

---

## 目录

1. [环境准备](#1-环境准备)
2. [Perplexity API 接入](#2-perplexity-api-接入)（推荐）
3. [Supabase 数据库接入](#3-supabase-数据库接入)
4. [天气 API 接入](#4-天气-api-接入)
5. [地图 API 接入](#5-地图-api-接入)
6. [本地开发配置](#6-本地开发配置)

---

## 1. 环境准备

### 获取必要的 API Keys

| 服务 | 用途 | 获取地址 |
|------|------|----------|
| **Perplexity AI** | AI 行程生成（推荐） | https://www.perplexity.ai/settings/api |
| **Supabase** | 数据库 + 认证 | https://supabase.com/dashboard |
| **OpenWeather** | 天气预报 | https://openweathermap.org/api |
| **高德地图** | 地图展示 | https://console.amap.com |

---

## 2. Perplexity API 接入

> ✅ **推荐**：Perplexity 集成了实时搜索能力，能自动获取最新的北京亲子场所信息

### 2.1 获取 API Key

1. 访问 https://www.perplexity.ai/settings/api
2. 注册/登录账号
3. 点击 "Create API Key"
4. 复制保存好密钥

### 2.2 安装 SDK

项目已预装，无需额外安装：

```bash
pnpm add @perplexity-ai/perplexity_ai
```

### 2.3 配置环境变量

在 `.env.local` 中添加：

```bash
VITE_PERPLEXITY_API_KEY=pplx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 2.4 代码已集成

项目已包含 Perplexity 服务：`src/lib/perplexity.ts`

核心功能：
- `generateItinerary()` - 生成行程
- `searchPlaces()` - 搜索地点

### 2.5 使用方式

```typescript
import { generateItinerary } from '../lib/perplexity';

const result = await generateItinerary({
  childAge: '1-3',
  maxDistance: 10,
  preference: 'any',
  date: 'weekend',
});

console.log(result.places); // 推荐地点列表
```

---

## 3. Supabase 数据库接入

### 3.1 创建 Supabase 项目

1. 访问 https://supabase.com/dashboard
2. 点击 "New project"
3. 填写：
   - Name: weekend-planner
   - Password: 设置密码（保存好）
   - Region: Asia Singapore

### 3.2 获取连接信息

Settings → API 中获取：
- Project URL
- `service_role` 密钥（仅显示一次）

### 3.3 创建数据库表

在 SQL Editor 中执行：

```sql
-- 城市表
CREATE TABLE cities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  code VARCHAR(20) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 地点表
CREATE TABLE places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id INTEGER NOT NULL REFERENCES cities(id),
  name VARCHAR(255) NOT NULL,
  address VARCHAR(500),
  location GEOGRAPHY(POINT, 4326),
  place_type VARCHAR(50) NOT NULL,
  age_min INTEGER DEFAULT 0,
  age_max INTEGER DEFAULT 72,
  rating DECIMAL(2,1) DEFAULT 0,
  price_level INTEGER DEFAULT 1,
  suggested_duration INTEGER DEFAULT 120,
  description TEXT,
  image_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX places_location_idx ON places USING GIST(location);
CREATE INDEX places_city_idx ON places(city_id);

-- 行程表
CREATE TABLE itineraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  city_id INTEGER NOT NULL REFERENCES cities(id),
  title VARCHAR(255),
  child_age VARCHAR(10) NOT NULL,
  max_distance INTEGER DEFAULT 10,
  preference VARCHAR(20) DEFAULT 'any',
  itinerary_data JSONB NOT NULL,
  is_shared BOOLEAN DEFAULT false,
  share_token VARCHAR(50) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 初始数据
INSERT INTO cities (name, code) VALUES ('北京', 'beijing');
```

### 3.4 修改客户端

```typescript
// src/lib/supabase/client.ts
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseAnonKey = 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

## 4. 天气 API 接入

### 4.1 获取 API Key

https://openweathermap.org/api 注册并获取免费 API Key

### 4.2 使用方式

```bash
VITE_OPENWEATHER_API_KEY=your-key
```

天气服务代码已集成在 `src/lib/weather.ts`

---

## 5. 地图 API 接入

### 5.1 获取高德 API Key

https://console.amap.com 创建应用获取 Web JS API Key

### 5.2 配置

```bash
VITE_AMAP_KEY=your-amap-key
```

地图组件 `src/components/map/MapView.tsx` 已准备好

---

## 6. 本地开发配置

### 6.1 创建 .env.local

```bash
# 必需
VITE_PERPLEXITY_API_KEY=pplx-xxx

# 可选
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
VITE_OPENWEATHER_API_KEY=xxx
VITE_AMAP_KEY=xxx
```

### 6.2 启动

```bash
pnpm dev
```

---

## 完整配置检查清单

| 服务 | 变量名 | 状态 |
|------|--------|------|
| Perplexity | VITE_PERPLEXITY_API_KEY | ⬜ |
| Supabase | VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY | ⬜ |
| 天气 | VITE_OPENWEATHER_API_KEY | ⬜ |
| 高德地图 | VITE_AMAP_KEY | ⬜ |

---

**当前项目已支持 Perplexity AI，配置好 API Key 即可使用真实 AI 生成！**
