"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { LifeDestinyResult, UserInput } from "@/types";
import {
  loadFromLocalStorage,
  exportToJson,
  exportToHtml,
  migrateLegacyUserInput,
} from "@/lib/utils";
import {
  getDailyViewRange,
  getWeeklyViewRange,
  calculateVirtualAge,
} from "@/lib/date-utils";
import { interpolateDailyData } from "@/lib/interpolation";
import LifeKLineChart from "@/components/LifeKLineChart";
import AnalysisResult from "@/components/AnalysisResult";
import ActionAdvicePanel from "@/components/ActionAdvicePanel";
import RiskWarningBanner from "@/components/RiskWarningBanner";
import ViewSwitcher, { ViewMode } from "@/components/ViewSwitcher";
import Button from "@/components/shared/Button";
import { Download, FileJson, Printer, RotateCcw } from "lucide-react";

export default function ResultPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("year");
  const [currentDate] = useState(new Date());

  const [result] = useState<LifeDestinyResult | null>(() => {
    if (typeof window === "undefined") return null;
    return loadFromLocalStorage<LifeDestinyResult>("lifeDestinyResult");
  });

  const [userInput] = useState<UserInput | null>(() => {
    if (typeof window === "undefined") return null;
    const input = loadFromLocalStorage<UserInput>("userInput");
    return input ? migrateLegacyUserInput(input) : null;
  });

  const [userName] = useState<string>(() => {
    if (typeof window === "undefined") return "未命名";
    return loadFromLocalStorage<string>("userName") || "未命名";
  });

  // 根据视图模式计算显示的数据
  const chartData = useMemo(() => {
    if (!result) return [];

    if (viewMode === "year") {
      return result.chartData;
    }

    // 日视图和周视图需要出生日期
    if (!userInput?.birthDate) {
      console.warn("Birth date not available, falling back to year view");
      return result.chartData;
    }

    const birthDate = new Date(userInput.birthDate);
    const range =
      viewMode === "day"
        ? getDailyViewRange(currentDate)
        : getWeeklyViewRange(currentDate);

    return interpolateDailyData(range, birthDate, result.chartData);
  }, [result, userInput, viewMode, currentDate]);

  // 计算当前虚岁
  const currentAge = useMemo(() => {
    if (!userInput?.birthDate) return null;
    return calculateVirtualAge(new Date(userInput.birthDate), currentDate);
  }, [userInput, currentDate]);

  // 格式化日期
  const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}/${m}/${d}`;
  };

  const formatRange = (start: Date, end: Date) =>
    `${formatDate(start)} - ${formatDate(end)}`;

  // 获取图表标题
  const getChartTitle = () => {
    switch (viewMode) {
      case "year":
        return "人生流年大运K线图(30年全景）";

      case "mouth": {
        const { start, end } = getWeeklyViewRange(currentDate);
        return `近期运势走势（${formatRange(start, end)}）`;
      }

      case "day": {
        const { start, end } = getDailyViewRange(currentDate);
        return `每日运势详情（${formatRange(start, end)}）`;
      }

      default:
        return "人生流年大运K线图";
    }
  };

  const handleExportJson = () => {
    if (!result) return;
    exportToJson(result, `${userName}_life_kline`);
  };

  const handleExportHtml = () => {
    if (!result) return;

    // 生成支撑压力位表格（如果有）
    const spLevelsTable =
      result.analysis.supportPressureLevels &&
      result.analysis.supportPressureLevels.length > 0
        ? `
  <div class="section">
    <h2>支撑位与压力位分析</h2>
    <table>
      <tr><th>年龄</th><th>类型</th><th>强度</th><th>数值</th><th>十神</th><th>原因</th></tr>
      ${result.analysis.supportPressureLevels
        .map(
          (level) => `
        <tr>
          <td>${level.age}</td>
          <td>${level.type === "support" ? "🟢 支撑位" : "🔴 压力位"}</td>
          <td>${level.strength === "strong" ? "强" : level.strength === "medium" ? "中" : "弱"}</td>
          <td>${level.value}</td>
          <td>${level.tenGod || "-"}</td>
          <td>${level.reason}</td>
        </tr>
      `,
        )
        .join("")}
    </table>
  </div>
      `
        : "";

    // 生成行动指南表格（如果有）
    const actionAdviceTable = result.chartData.some((p) => p.actionAdvice)
      ? `
  <div class="section">
    <h2>关键年份行动指南</h2>
    ${result.chartData
      .filter((p) => p.actionAdvice)
      .map(
        (point) => `
        <div style="margin-bottom: 20px; padding: 15px; border-left: 4px solid #4f46e5; background: #f9fafb;">
          <h3 style="margin: 0 0 10px 0; color: #1f2937;">
            ${point.age}岁 (${point.year}年) - ${point.ganZhi}
            ${point.tenGod ? `[${point.tenGod}]` : ""}
            ${point.actionAdvice?.scenario ? `<span style="font-size: 12px; background: #dbeafe; padding: 2px 8px; border-radius: 4px; margin-left: 8px;">${point.actionAdvice.scenario}</span>` : ""}
          </h3>

          <div style="margin-bottom: 10px;">
            <strong style="color: #059669;">✅ 建议行动：</strong>
            <ol style="margin: 5px 0; padding-left: 20px;">
              ${point.actionAdvice!.suggestions.map((s) => `<li>${s}</li>`).join("")}
            </ol>
          </div>

          <div style="margin-bottom: 10px;">
            <strong style="color: #dc2626;">⚠️ 规避提醒：</strong>
            <ul style="margin: 5px 0; padding-left: 20px;">
              ${point.actionAdvice!.warnings.map((w) => `<li>${w}</li>`).join("")}
            </ul>
          </div>

          ${
            point.actionAdvice!.basis
              ? `
            <div style="background: #faf5ff; padding: 10px; margin-top: 10px; border-radius: 4px; font-size: 14px; color: #7c3aed;">
              <strong>玄学依据：</strong>${point.actionAdvice!.basis}
            </div>
          `
              : ""
          }

          <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #e5e7eb; font-size: 13px; color: #6b7280;">
            ${point.reason}
          </div>
        </div>
      `,
      )
      .join("")}
  </div>
      `
      : "";

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

  ${spLevelsTable}

  ${actionAdviceTable}

  <div class="section">
    <h2>流年详批（1-30岁）</h2>
    <table>
      <tr><th>年龄</th><th>年份</th><th>干支</th><th>大运</th><th>评分</th><th>详批</th></tr>
      ${result.chartData
        .map(
          (point) => `
        <tr>
          <td>${point.age}</td>
          <td>${point.year}</td>
          <td>${point.ganZhi}</td>
          <td>${point.daYun || "-"}</td>
          <td>${point.score}/10</td>
          <td>${point.reason}</td>
        </tr>
      `,
        )
        .join("")}
    </table>
  </div>

  <footer style="text-align: center; color: #6b7280; margin-top: 40px; font-size: 14px;">
    <p>本工具仅供娱乐参考，命理分析由 AI 生成，不构成任何投资建议。</p>
    <p>生成时间：${new Date().toLocaleString("zh-CN")}</p>
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
    router.push("/input");
  };

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">暂无数据</h2>
          <p className="text-gray-600 mb-6">请先完成八字输入和 AI 分析流程</p>
          <Button onClick={handleReset} variant="primary">
            开始排盘
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen paper-texture py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 标题和操作栏 */}
        <div className="bg-xuanpaper rounded-2xl shadow-lg p-6 mb-8 no-print">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {userName} - 人生K线图
              </h1>
              <p className="text-gray-600">基于八字命理的运势可视化分析</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={handleExportJson}
                className="flex-1 flex items-center gap-2 min-w-24 whitespace-nowrap"
              >
                <FileJson className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">导出 JSON</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleExportHtml}
                className="flex-1 flex items-center gap-2 min-w-24 whitespace-nowrap"
              >
                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">存为 HTML</span>
              </Button>
              <Button
                variant="secondary"
                onClick={handlePrint}
                className="flex-1 flex items-center gap-2 min-w-24 whitespace-nowrap"
              >
                <Printer className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">打印/PDF</span>
              </Button>
              <Button
                variant="primary"
                onClick={handleReset}
                className="flex-1 flex items-center gap-2 min-w-24 whitespace-nowrap"
              >
                <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">重新排盘</span>
              </Button>
            </div>
          </div>
        </div>

        {/* 视图切换器 */}
        <div className="bg-xuanpaper rounded-2xl shadow-lg sm:p-6 sm:mb-8 p-3 mb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                运势时间轴
              </h2>
              {currentAge && (
                <p className="text-sm text-gray-600">
                  当前虚岁：{currentAge}岁 | 今日：
                  {currentDate.toLocaleDateString("zh-CN")}
                </p>
              )}
              {!userInput?.birthDate && (
                <p className="text-sm text-orange-600 mt-2">
                  提示：完整出生日期缺失，仅支持年视图。请重新输入八字以启用日/周视图。
                </p>
              )}
            </div>
            {userInput?.birthDate && (
              <ViewSwitcher currentView={viewMode} onViewChange={setViewMode} />
            )}
          </div>
        </div>

        {/* 风险警告横幅 */}
        {result && chartData.length > 0 && (
          <RiskWarningBanner data={chartData} viewMode={viewMode} />
        )}

        {/* K线图展示 */}
        <div className="mb-8">
          <LifeKLineChart
            data={chartData}
            viewMode={viewMode}
            title={getChartTitle()}
            supportPressureLevels={result?.analysis.supportPressureLevels}
          />
          {viewMode !== "year" && (
            <div className="mt-4 text-center text-sm text-gray-500">
              <p>📊 数据基于年度运势插值计算，仅供参考</p>
            </div>
          )}
        </div>

        {/* 命理分析面板（仅在年视图显示） */}
        {viewMode === "year" && (
          <>
            <AnalysisResult analysis={result.analysis} />

            {/* 行动指南面板 */}
            <div className="mt-8">
              <ActionAdvicePanel data={chartData} viewMode={viewMode} />
            </div>
          </>
        )}

        {/* 免责声明 */}
        <div className="mt-12 text-center text-sm text-gray-500 no-print">
          <p>本工具仅供娱乐参考，命理分析由 AI 生成，不构成任何投资建议。</p>
          <p className="mt-2">命运由多种因素共同决定，请理性看待分析结果。</p>
        </div>
      </div>
    </div>
  );
}
