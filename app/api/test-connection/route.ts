import { NextRequest, NextResponse } from 'next/server';

const ANTHROPIC_BASE_URL = process.env.ANTHROPIC_BASE_URL;
const ANTHROPIC_AUTH_TOKEN = process.env.ANTHROPIC_AUTH_TOKEN;
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL;

export async function GET(request: NextRequest) {
  if (!ANTHROPIC_AUTH_TOKEN) {
    return NextResponse.json(
      { error: '缺少 ANTHROPIC_AUTH_TOKEN' },
      { status: 500 }
    );
  }

  const apiUrl = `${ANTHROPIC_BASE_URL}/v1/messages`;

  try {
    console.log('测试请求 URL:', apiUrl);
    console.log('使用模型:', ANTHROPIC_MODEL);

    // 发送一个简单的测试请求
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_AUTH_TOKEN,
        'Authorization': `Bearer ${ANTHROPIC_AUTH_TOKEN}`,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 100,
        messages: [
          {
            role: 'user',
            content: '请回复"连接成功"',
          },
        ],
      }),
    });

    console.log('响应状态:', response.status, response.statusText);

    const responseText = await response.text();
    console.log('响应内容（前 500 字符）:', responseText.substring(0, 500));

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        status: response.status,
        statusText: response.statusText,
        responseBody: responseText.substring(0, 1000),
        testUrl: apiUrl,
      });
    }

    return NextResponse.json({
      success: true,
      status: response.status,
      message: 'API 连接成功',
      responseBody: responseText,
    });

  } catch (error) {
    console.error('测试请求失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      testUrl: apiUrl,
    }, { status: 500 });
  }
}
