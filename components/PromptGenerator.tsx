'use client';

import React, { useState } from 'react';
import { UserInput } from '@/types';
import { generateUserPrompt } from '@/lib/utils';
import Button from './shared/Button';
import { Copy, Check } from 'lucide-react';

interface PromptGeneratorProps {
  userInput: UserInput;
  onNext: () => void;
  onBack: () => void;
}

export default function PromptGenerator({
  userInput,
  onNext,
  onBack,
}: PromptGeneratorProps) {
  const [copied, setCopied] = useState(false);
  const prompt = generateUserPrompt(userInput);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // 降级方案：使用 execCommand
      const textArea = document.createElement('textarea');
      textArea.value = prompt;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        alert('复制失败，请手动选择并复制文本');
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          第二步：生成并复制提示词
        </h2>
        <p className="text-gray-600">
          将下方提示词复制到任意 AI 工具（如 ChatGPT, Claude, Gemini）中
        </p>
      </div>

      {/* 提示词显示区域 */}
      <div className="relative">
        <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4 max-h-96 overflow-y-auto">
          <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
            {prompt}
          </pre>
        </div>

        {/* 复制按钮 */}
        <button
          type="button"
          onClick={handleCopy}
          className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">
                已复制
              </span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-gray-700" />
              <span className="text-sm font-medium text-gray-700">复制</span>
            </>
          )}
        </button>
      </div>

      {/* 使用说明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">使用说明：</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
          <li>点击上方"复制"按钮</li>
          <li>
            打开任意 AI 工具（ChatGPT, Claude, Gemini, 通义千问, 豆包等）
          </li>
          <li>粘贴提示词并发送</li>
          <li>等待 AI 生成 JSON 数据（约 30 秒）</li>
          <li>复制 AI 返回的完整 JSON 数据</li>
          <li>点击下方"下一步"按钮，进入导入页面</li>
        </ol>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="flex-1"
        >
          上一步
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={onNext}
          className="flex-1"
        >
          下一步：导入 JSON
        </Button>
      </div>
    </div>
  );
}
