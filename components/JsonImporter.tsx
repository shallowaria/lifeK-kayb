'use client';

import React, { useState } from 'react';
import { LifeDestinyResult } from '@/types';
import { cleanMarkdown, transformToLifeDestinyResult } from '@/lib/utils';
import { validateChartData } from '@/lib/validator';
import Button from './shared/Button';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface JsonImporterProps {
  onImport: (data: LifeDestinyResult) => void;
  onBack: () => void;
}

export default function JsonImporter({ onImport, onBack }: JsonImporterProps) {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState<string>('');
  const [isValid, setIsValid] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setJsonText(text);
    setError('');
    setIsValid(false);

    if (!text.trim()) {
      return;
    }

    // 自动清理 markdown 标记
    const cleaned = cleanMarkdown(text);

    try {
      const parsed = JSON.parse(cleaned);

      // 转换为标准格式（兼容扁平和嵌套格式）
      const transformed = transformToLifeDestinyResult(parsed);

      const validation = validateChartData(transformed);

      if (!validation.valid) {
        setError(validation.error || '数据验证失败');
      } else {
        setIsValid(true);
      }
    } catch (err) {
      setError('JSON 格式错误，请检查是否完整复制了 AI 返回的数据');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!jsonText.trim()) {
      setError('请粘贴 AI 返回的 JSON 数据');
      return;
    }

    const cleaned = cleanMarkdown(jsonText);

    try {
      const parsed = JSON.parse(cleaned);

      // 转换为标准格式（兼容扁平和嵌套格式）
      const transformed = transformToLifeDestinyResult(parsed);

      const validation = validateChartData(transformed);

      if (!validation.valid) {
        setError(validation.error || '数据验证失败');
        return;
      }

      // 导入成功
      onImport(transformed);
    } catch (err) {
      setError('JSON 解析失败，请确保粘贴了完整的数据');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          第三步：粘贴 AI 返回的 JSON
        </h2>
        <p className="text-gray-600">
          将 AI 工具生成的完整 JSON 数据粘贴到下方文本框
        </p>
      </div>

      {/* JSON 输入框 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          JSON 数据 <span className="text-red-600">*</span>
        </label>
        <textarea
          value={jsonText}
          onChange={handleChange}
          placeholder='粘贴 AI 返回的 JSON 数据（可以包含 ```json 标记，会自动清理）'
          rows={16}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono text-sm"
        />
        <p className="text-xs text-gray-500 mt-2">
          提示：支持包含 <code className="bg-gray-100 px-1 rounded">```json</code> 标记的文本，系统会自动清理
        </p>
      </div>

      {/* 验证状态 */}
      {isValid && !error && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          <CheckCircle className="w-5 h-5" />
          <span>数据验证通过，包含 100 个年龄数据点</span>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">验证失败</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* 使用提示 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-900 mb-2">常见问题：</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
          <li>确保复制了完整的 JSON 数据（从 &#123; 到 &#125;）</li>
          <li>如果包含 ```json 标记，无需手动删除</li>
          <li>数据必须包含 100 个年龄点（1-100岁）</li>
          <li>如果验证失败，请检查 AI 返回的数据是否完整</li>
        </ul>
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
          type="submit"
          variant="primary"
          disabled={!isValid}
          className="flex-1"
        >
          查看结果
        </Button>
      </div>
    </form>
  );
}
