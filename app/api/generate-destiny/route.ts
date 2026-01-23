import { NextRequest, NextResponse } from 'next/server';
import { UserInput, LifeDestinyResult } from '@/types';
import { generateUserPrompt, transformToLifeDestinyResult } from '@/lib/utils';
import { validateChartData } from '@/lib/validator';

// Anthropic API 配置
const ANTHROPIC_BASE_URL = process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com';
const ANTHROPIC_AUTH_TOKEN = process.env.ANTHROPIC_AUTH_TOKEN;
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';

interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AnthropicResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
  stop_reason: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    // 验证环境变量
    console.log('=== API 路由调试信息 ===');
    console.log('ANTHROPIC_BASE_URL:', ANTHROPIC_BASE_URL);
    console.log('ANTHROPIC_AUTH_TOKEN 已配置:', !!ANTHROPIC_AUTH_TOKEN);
    console.log('ANTHROPIC_MODEL:', ANTHROPIC_MODEL);

    if (!ANTHROPIC_AUTH_TOKEN) {
      return NextResponse.json(
        { error: '服务器配置错误：缺少 ANTHROPIC_AUTH_TOKEN 环境变量' },
        { status: 500 }
      );
    }

    // 解析请求体
    const userInput: UserInput = await request.json();

    // 验证输入
    if (!userInput.yearPillar || !userInput.monthPillar || !userInput.dayPillar || !userInput.hourPillar) {
      return NextResponse.json(
        { error: '八字信息不完整' },
        { status: 400 }
      );
    }

    // 生成提示词
    const prompt = generateUserPrompt(userInput);
    console.log('提示词长度:', prompt.length, '字符');

    // 调用 Anthropic API
    const apiUrl = `${ANTHROPIC_BASE_URL}/v1/messages`;
    console.log('请求 URL:', apiUrl);

    const messages: AnthropicMessage[] = [
      {
        role: 'user',
        content: prompt,
      },
    ];

    // 支持多种认证方式
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    };

    // 尝试使用 x-api-key（Anthropic 官方格式）
    headers['x-api-key'] = ANTHROPIC_AUTH_TOKEN;

    // 同时也添加 Authorization Bearer 格式（某些代理可能需要）
    headers['Authorization'] = `Bearer ${ANTHROPIC_AUTH_TOKEN}`;

    const requestBody = JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 16000, // 增加到 16000 以确保完整生成 50 个数据点
      temperature: 0.5, // 进一步降低温度加快生成
      messages,
    });

    console.log('请求体大小:', Math.round(requestBody.length / 1024), 'KB');

    console.log('请求头（已隐藏敏感信息）:', {
      'Content-Type': headers['Content-Type'],
      'anthropic-version': headers['anthropic-version'],
      'x-api-key': '***',
      'Authorization': 'Bearer ***',
    });

    let apiResponse;
    try {
      apiResponse = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: requestBody,
      });
    } catch (fetchError) {
      console.error('Fetch 请求失败:', fetchError);
      return NextResponse.json(
        {
          error: '网络请求失败',
          details: fetchError instanceof Error ? fetchError.message : '未知网络错误',
        },
        { status: 500 }
      );
    }

    console.log('API 响应状态:', apiResponse.status, apiResponse.statusText);

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('Anthropic API 错误详情:', errorText);

      // 尝试解析错误 JSON
      let errorDetails = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        errorDetails = errorJson.error?.message || errorText;
      } catch (e) {
        // 保持原始错误文本
      }

      return NextResponse.json(
        {
          error: `AI 服务调用失败: ${apiResponse.statusText}`,
          details: errorDetails,
          statusCode: apiResponse.status,
        },
        { status: apiResponse.status }
      );
    }

    const anthropicData: AnthropicResponse = await apiResponse.json();

    // 提取文本内容
    const contentBlock = anthropicData.content.find((block) => block.type === 'text');
    if (!contentBlock) {
      return NextResponse.json(
        { error: 'AI 返回格式错误：未找到文本内容' },
        { status: 500 }
      );
    }

    const aiText = contentBlock.text.trim();

    // 清理 Markdown 包装（如果有）
    const cleanedText = aiText
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();

    // 解析 JSON
    let rawData;
    try {
      rawData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('JSON 解析失败:', parseError);
      console.error('完整的 AI 返回文本（前 2000 字符）:');
      console.error(cleanedText.substring(0, 2000));
      console.error('=== 错误位置附近的内容 ===');
      // 尝试找到错误位置
      const match = parseError instanceof SyntaxError && parseError.message.match(/position (\d+)/);
      if (match) {
        const position = parseInt(match[1]);
        const start = Math.max(0, position - 100);
        const end = Math.min(cleanedText.length, position + 100);
        console.error(`位置 ${position} 附近:`, cleanedText.substring(start, end));
      }

      return NextResponse.json(
        {
          error: 'AI 返回的数据格式无效，无法解析为 JSON',
          details: parseError instanceof Error ? parseError.message : '未知解析错误',
          rawText: aiText.substring(0, 1000), // 返回前 1000 字符用于调试
        },
        { status: 500 }
      );
    }

    // 转换为标准格式并标准化评分
    const transformedData: LifeDestinyResult = transformToLifeDestinyResult(rawData);

    // 验证数据
    const validation = validateChartData(transformedData);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: '数据验证失败',
          details: validation.error,
          data: transformedData, // 返回数据用于调试
        },
        { status: 400 }
      );
    }

    // 返回成功结果
    return NextResponse.json({
      success: true,
      data: transformedData,
      usage: {
        inputTokens: anthropicData.usage.input_tokens,
        outputTokens: anthropicData.usage.output_tokens,
      },
    });

  } catch (error) {
    console.error('API 路由错误:', error);
    return NextResponse.json(
      {
        error: '服务器内部错误',
        message: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
