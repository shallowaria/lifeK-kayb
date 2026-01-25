'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { KLinePoint, InterpolatedKLinePoint } from '@/types';

interface RiskWarningBannerProps {
  data: (KLinePoint | InterpolatedKLinePoint)[];
  viewMode: 'year' | 'mouth' | 'day';
}

const RiskWarningBanner: React.FC<RiskWarningBannerProps> = ({ data, viewMode }) => {
  const [isDismissed, setIsDismissed] = useState(false);

  // 检查是否有数据点跌破支撑位
  const warningPoints = data.filter(point =>
    point.energyScore?.isBelowSupport === true
  );

  const showWarning = warningPoints.length > 0 && !isDismissed;

  // 找到能量最低的点
  const lowestEnergyPoint = warningPoints.length > 0
    ? warningPoints.reduce((lowest, current) =>
        (current.energyScore?.total || 10) < (lowest.energyScore?.total || 10)
          ? current
          : lowest
      )
    : null;

  // 当视图模式或数据变化时，重置 dismiss 状态
  useEffect(() => {
    setIsDismissed(false);
  }, [viewMode, data]);

  if (!showWarning || !lowestEnergyPoint) return null;

  // 格式化显示文本
  const getDisplayText = (): string => {
    if (viewMode === 'year') {
      return `${lowestEnergyPoint.age}岁 (${lowestEnergyPoint.year}年)`;
    }
    const interpolatedPoint = lowestEnergyPoint as InterpolatedKLinePoint;
    if (interpolatedPoint.date) {
      return interpolatedPoint.date;
    }
    return `${lowestEnergyPoint.age}岁`;
  };

  return (
    <div className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-md mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-lg font-bold text-red-900 mb-1">
              ⚠️ {lowestEnergyPoint.age}岁能量失守警告
            </h3>
            <p className="text-sm text-red-800 mb-2">
              检测到这一岁运势能量极低，建议保持防守姿态，不宜做重大决策，注意情绪止损。
            </p>
            <div className="bg-white/80 rounded px-3 py-2 text-sm">
              <div className="flex items-center space-x-4 flex-wrap gap-2">
                <span className="text-gray-700">
                  {getDisplayText()}
                </span>
                <span className="font-bold text-red-700">
                  能量分数: {lowestEnergyPoint.energyScore?.total.toFixed(1)}
                </span>
                {lowestEnergyPoint.tenGod && (
                  <span className="text-purple-700">
                    十神: {lowestEnergyPoint.tenGod}
                  </span>
                )}
              </div>
              <p className="text-gray-600 mt-1 text-xs">
                {lowestEnergyPoint.reason}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          aria-label="关闭警告"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default RiskWarningBanner;
