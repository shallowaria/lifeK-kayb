import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    env_loaded: {
      ANTHROPIC_BASE_URL: process.env.ANTHROPIC_BASE_URL || 'NOT SET',
      ANTHROPIC_AUTH_TOKEN_EXISTS: !!process.env.ANTHROPIC_AUTH_TOKEN,
      ANTHROPIC_AUTH_TOKEN_PREFIX: process.env.ANTHROPIC_AUTH_TOKEN?.substring(0, 10) || 'NOT SET',
      ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL || 'NOT SET',
    },
    nodeEnv: process.env.NODE_ENV,
  });
}
