'use client';

import React, { useState } from 'react';
import { KLinePoint, InterpolatedKLinePoint } from '@/types';
import { Target, AlertTriangle, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';

interface ActionAdvicePanelProps {
  data: (KLinePoint | InterpolatedKLinePoint)[];
  viewMode: 'year' | 'mouth' | 'day';
}

const ActionAdvicePanel: React.FC<ActionAdvicePanelProps> = ({ data, viewMode }) => {
  const [expandedAge, setExpandedAge] = useState<number | null>(null);

  // 过滤出有 actionAdvice 的点
  const pointsWithAdvice = data.filter(point => point.actionAdvice);

  // 按场景分组
  const groupedByScenario = pointsWithAdvice.reduce((acc, point) => {
    const scenario = point.actionAdvice?.scenario || '综合';
    if (!acc[scenario]) acc[scenario] = [];
    acc[scenario].push(point);
    return acc;
  }, {} as Record<string, typeof pointsWithAdvice>);

  if (pointsWithAdvice.length === 0) {
    return null; // 无行动建议时不显示
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Target className="w-6 h-6 text-indigo-600" />
        <h2 className="text-2xl font-bold text-gray-900">关键年份行动指南</h2>
        <span className="text-sm text-gray-500">（{pointsWithAdvice.length}个转折点）</span>
      </div>

      <div className="space-y-4">
        {Object.entries(groupedByScenario).map(([scenario, points]) => (
          <div key={scenario} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
              <h3 className="text-sm font-bold text-gray-700">
                {scenario} ({points.length}年)
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {points.map((point) => {
                const isExpanded = expandedAge === point.age;

                return (
                  <div key={point.age} className="bg-white">
                    {/* 可展开的标题行 */}
                    <button
                      onClick={() => setExpandedAge(isExpanded ? null : point.age)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-800">
                          {point.age}岁 ({point.year}年)
                        </span>
                        <span className="text-sm text-gray-500">{point.ganZhi}</span>
                        {point.tenGod && (
                          <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                            {point.tenGod}
                          </span>
                        )}
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </button>

                    {/* 展开后的详细内容 */}
                    {isExpanded && point.actionAdvice && (
                      <div className="px-4 pb-4 space-y-4 bg-gray-50">
                        {/* 建议行动 */}
                        <div>
                          <p className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-1">
                            <Lightbulb className="w-4 h-4" />
                            建议行动
                          </p>
                          <ul className="space-y-2">
                            {point.actionAdvice.suggestions.map((suggestion, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                <span className="text-green-600 font-bold">{idx + 1}.</span>
                                <span className="flex-1">{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* 规避提醒 */}
                        <div>
                          <p className="text-sm font-semibold text-red-800 mb-2 flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4" />
                            规避提醒
                          </p>
                          <ul className="space-y-2">
                            {point.actionAdvice.warnings.map((warning, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                <span className="text-red-600 font-bold">•</span>
                                <span className="flex-1">{warning}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* 玄学依据 */}
                        {point.actionAdvice.basis && (
                          <div className="text-sm text-purple-700 bg-purple-50 p-3 rounded border border-purple-200">
                            <span className="font-semibold">玄学依据：</span>
                            {point.actionAdvice.basis}
                          </div>
                        )}

                        {/* 流年描述 */}
                        <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                          {point.reason}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActionAdvicePanel;
