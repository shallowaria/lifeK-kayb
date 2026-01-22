'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LifeDestinyResult } from '@/types';
import { loadFromLocalStorage, exportToJson, exportToHtml } from '@/lib/utils';
import LifeKLineChart from '@/components/LifeKLineChart';
import AnalysisResult from '@/components/AnalysisResult';
import Button from '@/components/shared/Button';
import { Download, FileJson, Printer, RotateCcw } from 'lucide-react';

export default function ResultPage() {
  const router = useRouter();
  const [result] = useState<LifeDestinyResult | null>(() => {
    if (typeof window === 'undefined') return null;
    return loadFromLocalStorage<LifeDestinyResult>('lifeDestinyResult');
  });

  const [userName] = useState<string>(() => {
    if (typeof window === 'undefined') return '未命名';
    return loadFromLocalStorage<string>('userName') || '未命名';
  });

  const handleExportJson = () => {
    if (!result) return;
    exportToJson(result, `${userName}_life_kline`);
  };

  const handleExportHtml = () => {
    if (!result) return;

    // 生成简单的 HTML 内容
    const htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${userName} - 人生K线图</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: #f9fafb;
    }
    h1 { color: #1f2937; text-align: center; }
    .section { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .pillars { display: flex; justify-content: center; gap: 20px; background: #1f2937; color: #fef3c7; padding: 20px; border-radius: 8px; }
    .pillar { text-align: center; }
    .pillar-label { font-size: 12px; color: #9ca3af; }
    .pillar-value { font-size: 24px; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { padding: 8px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    th { background: #f3f4f6; font-weight: 600; }
  </style>
</head>
<body>
  <h1>${userName} - 人生K线图报告</h1>

  <div class="section">
    <h2>八字四柱</h2>
    <div class="pillars">
      <div class="pillar"><div class="pillar-label">年柱</div><div class="pillar-value">${result.analysis.bazi[0]}</div></div>
      <div class="pillar"><div class="pillar-label">月柱</div><div class="pillar-value">${result.analysis.bazi[1]}</div></div>
      <div class="pillar"><div class="pillar-label">日柱</div><div class="pillar-value">${result.analysis.bazi[2]}</div></div>
      <div class="pillar"><div class="pillar-label">时柱</div><div class="pillar-value">${result.analysis.bazi[3]}</div></div>
    </div>
  </div>

  <div class="section">
    <h2>命理总评（${result.analysis.summaryScore}/10）</h2>
    <p>${result.analysis.summary}</p>
  </div>

  <div class="section">
    <h2>详细分析</h2>
    <table>
      <tr><th>维度</th><th>评分</th><th>分析</th></tr>
      <tr><td>性格</td><td>${result.analysis.personalityScore}/10</td><td>${result.analysis.personality}</td></tr>
      <tr><td>事业</td><td>${result.analysis.industryScore}/10</td><td>${result.analysis.industry}</td></tr>
      <tr><td>风水</td><td>${result.analysis.fengShuiScore}/10</td><td>${result.analysis.fengShui}</td></tr>
      <tr><td>财富</td><td>${result.analysis.wealthScore}/10</td><td>${result.analysis.wealth}</td></tr>
      <tr><td>婚姻</td><td>${result.analysis.marriageScore}/10</td><td>${result.analysis.marriage}</td></tr>
      <tr><td>健康</td><td>${result.analysis.healthScore}/10</td><td>${result.analysis.health}</td></tr>
      <tr><td>六亲</td><td>${result.analysis.familyScore}/10</td><td>${result.analysis.family}</td></tr>
      <tr><td>币圈</td><td>${result.analysis.cryptoScore}/10</td><td>${result.analysis.crypto}<br/>暴富流年：${result.analysis.cryptoYear}<br/>推荐流派：${result.analysis.cryptoStyle}</td></tr>
    </table>
  </div>

  <div class="section">
    <h2>流年详批（1-100岁）</h2>
    <table>
      <tr><th>年龄</th><th>年份</th><th>干支</th><th>大运</th><th>评分</th><th>详批</th></tr>
      ${result.chartData.map(point => `
        <tr>
          <td>${point.age}</td>
          <td>${point.year}</td>
          <td>${point.ganZhi}</td>
          <td>${point.daYun || '-'}</td>
          <td>${point.score}/10</td>
          <td>${point.reason}</td>
        </tr>
      `).join('')}
    </table>
  </div>

  <footer style="text-align: center; color: #6b7280; margin-top: 40px; font-size: 14px;">
    <p>本工具仅供娱乐参考，命理分析由 AI 生成，不构成任何投资建议。</p>
    <p>生成时间：${new Date().toLocaleString('zh-CN')}</p>
  </footer>
</body>
</html>
    `.trim();

    exportToHtml(htmlContent, `${userName}_life_kline`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    router.push('/input');
  };

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            暂无数据
          </h2>
          <p className="text-gray-600 mb-6">
            请先完成八字输入和 AI 分析流程
          </p>
          <Button onClick={handleReset} variant="primary">
            开始排盘
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-red-50 to-orange-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 标题和操作栏 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 no-print">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {userName} - 人生K线图
              </h1>
              <p className="text-gray-600">
                基于八字命理的运势可视化分析
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={handleExportJson}
                className="flex items-center gap-2"
              >
                <FileJson className="w-4 h-4" />
                导出 JSON
              </Button>
              <Button
                variant="outline"
                onClick={handleExportHtml}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                保存为 HTML
              </Button>
              <Button
                variant="secondary"
                onClick={handlePrint}
                className="flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                打印/PDF
              </Button>
              <Button
                variant="primary"
                onClick={handleReset}
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                重新排盘
              </Button>
            </div>
          </div>
        </div>

        {/* K线图 */}
        <div className="mb-8">
          <LifeKLineChart data={result.chartData} />
        </div>

        {/* 命理分析 */}
        <AnalysisResult analysis={result.analysis} />

        {/* 免责声明 */}
        <div className="mt-12 text-center text-sm text-gray-500 no-print">
          <p>
            本工具仅供娱乐参考，命理分析由 AI 生成，不构成任何投资建议。
          </p>
          <p className="mt-2">
            命运由多种因素共同决定，请理性看待分析结果。
          </p>
        </div>
      </div>
    </div>
  );
}
