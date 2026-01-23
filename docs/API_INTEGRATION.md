# API 自动生成功能使用说明

## 配置步骤

1. **配置环境变量**

   复制 `.env.example` 为 `.env.local`（已自动创建）：
   ```bash
   cp .env.example .env.local
   ```

   编辑 `.env.local` 填入您的 Anthropic API 配置：
   ```env
   # 自定义代理地址
   ANTHROPIC_BASE_URL=https://your-api-proxy.com

   # API 认证令牌
   ANTHROPIC_AUTH_TOKEN=your_auth_token_here

   # 使用的模型（可选）
   ANTHROPIC_MODEL=claude-3-7-sonnet-20250219
   ```

2. **重启开发服务器**

   配置环境变量后，需要重启 Next.js 服务器：
   ```bash
   # 停止当前服务器（Ctrl+C）
   pnpm dev
   ```

## 使用方法

### 方式一：AI 自动生成（推荐）

1. 在首页填写出生信息（姓名、性别、出生日期、时辰）
2. 系统自动计算八字
3. 点击 **"🤖 AI 自动生成（推荐）"** 按钮
4. 等待 30-60 秒，AI 自动生成完整的人生 K 线图
5. 自动跳转到结果页面

### 方式二：手动导入模式（备用）

如果自动生成失败，或您想使用其他 AI 工具：

1. 在首页填写出生信息
2. 点击 **"或使用手动导入模式（生成提示词）"**
3. 复制生成的提示词
4. 粘贴到任意 AI 工具（ChatGPT, Claude, Gemini 等）
5. 复制 AI 返回的 JSON 数据
6. 在导入页面粘贴 JSON 并提交

## 工作流程

```
用户输入八字信息
    ↓
[自动生成模式]              [手动模式]
    ↓                         ↓
调用后端 API              生成提示词
    ↓                         ↓
API 调用 Anthropic        用户复制到外部 AI
    ↓                         ↓
返回 LifeDestinyResult    用户导入 JSON
    ↓                         ↓
    ↓─────────────────────────↓
              ↓
      显示结果页面
```

## API 路由说明

**Endpoint:** `POST /api/generate-destiny`

**请求体 (JSON):**
```json
{
  "name": "凯布",
  "gender": "Male",
  "birthYear": 2003,
  "birthDate": "2003-06-15",
  "yearPillar": "癸未",
  "monthPillar": "戊午",
  "dayPillar": "丙寅",
  "hourPillar": "庚寅",
  "startAge": 3
}
```

**响应 (JSON):**
```json
{
  "success": true,
  "data": {
    "chartData": [...],
    "analysis": {...}
  },
  "usage": {
    "inputTokens": 1234,
    "outputTokens": 5678
  }
}
```

**错误响应:**
```json
{
  "error": "错误描述",
  "details": "详细信息（可选）"
}
```

## 功能特性

✅ **自动生成** - 一键完成，无需手动复制粘贴
✅ **智能降级** - API 失败时自动切换到手动模式
✅ **实时反馈** - 显示加载状态和错误提示
✅ **数据验证** - 自动验证 AI 返回的数据格式
✅ **评分标准化** - 自动转换 0-100 评分到 0-10 区间
✅ **保留备用方案** - 手动模式仍然可用

## 常见问题

**Q: 自动生成失败怎么办？**
A: 系统会自动切换到手动模式，您可以继续使用提示词生成功能。

**Q: 如何查看 API 调用日志？**
A: 打开浏览器开发者工具（F12），查看 Console 和 Network 标签页。

**Q: 可以使用官方 Anthropic API 吗？**
A: 可以，将 `ANTHROPIC_BASE_URL` 设置为 `https://api.anthropic.com`，并使用官方 API Key。

**Q: API 调用需要多长时间？**
A: 通常 30-60 秒，取决于 API 响应速度和网络状况。

## 技术细节

- **框架:** Next.js 16.1.4 App Router
- **API 路由:** `app/api/generate-destiny/route.ts`
- **前端集成:** `app/input/page.tsx`, `components/BaziForm.tsx`
- **数据转换:** `lib/utils.ts:transformToLifeDestinyResult()`
- **数据验证:** `lib/validator.ts:validateLifeDestinyResult()`

## 安全注意事项

⚠️ **重要：** `.env.local` 文件已添加到 `.gitignore`，不会被提交到 Git。请妥善保管您的 API 密钥。

⚠️ **生产环境：** 部署到 Vercel 或其他平台时，需要在平台的环境变量设置中配置这些变量。
