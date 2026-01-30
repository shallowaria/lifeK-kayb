"use client";

import React from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Label,
  LabelList,
} from "recharts";
import { Target, Lightbulb, AlertTriangle } from "lucide-react";
import {
  KLinePoint,
  InterpolatedKLinePoint,
  SupportPressureLevel,
  CandleShapeProps,
  SealStampLabelProps,
} from "@/types";

interface LifeKLineChartProps {
  data: KLinePoint[] | InterpolatedKLinePoint[];
  viewMode?: "year" | "mouth" | "day"; // 视图模式
  title?: string; // 自定义标题
  supportPressureLevels?: SupportPressureLevel[]; // 支撑/压力位列表
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: KLinePoint | InterpolatedKLinePoint;
    [key: string]: unknown;
  }>;
  label?: string | number;
}

const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as KLinePoint | InterpolatedKLinePoint;
    const isUp = data.close >= data.open;
    const isInterpolated = "isInterpolated" in data && data.isInterpolated;

    return (
      <div className="bg-white/95 backdrop-blur-sm p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl shadow-2xl border border-gray-200 z-50 w-70 sm:w-[320px] md:w-100">
        {/* Header */}
        <div className="flex justify-between items-start mb-2 sm:mb-3 border-b border-gray-100 pb-1.5 sm:pb-2">
          <div>
            <p className="text-base sm:text-lg md:text-xl font-bold text-gray-800">
              {isInterpolated && "date" in data ? (
                <>
                  {data.date}{" "}
                  <span className="text-xs sm:text-sm md:text-base text-gray-500">
                    ({data.age}岁)
                  </span>
                </>
              ) : (
                <>
                  {data.year} {data.ganZhi}年{" "}
                  <span className="text-xs sm:text-sm md:text-base text-gray-500">
                    ({data.age}岁)
                  </span>
                </>
              )}
            </p>
            <p className="text-xs sm:text-sm text-indigo-600 font-medium mt-0.5 sm:mt-1">
              大运：{data.daYun || "未知"}
            </p>
            {/* 新增：显示十神 */}
            {data.tenGod && (
              <p className="text-xs sm:text-sm text-purple-600 font-medium mt-0.5 sm:mt-1">
                十神：{data.tenGod}
              </p>
            )}
          </div>
          <div
            className={`text-xs sm:text-sm md:text-base font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded ${isUp ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
          >
            {isUp ? "吉 ▲" : "凶 ▼"}
          </div>
        </div>

        {/* Data Grid */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-500 mb-3 sm:mb-4 bg-gray-50 p-1.5 sm:p-2 rounded">
          <div className="text-center">
            <span className="block scale-90">开盘</span>
            <span className="font-mono text-gray-700 font-bold text-xs sm:text-sm">
              {data.open}
            </span>
          </div>
          <div className="text-center">
            <span className="block scale-90">收盘</span>
            <span className="font-mono text-gray-700 font-bold text-xs sm:text-sm">
              {data.close}
            </span>
          </div>
          <div className="text-center">
            <span className="block scale-90">最高</span>
            <span className="font-mono text-gray-700 font-bold text-xs sm:text-sm">
              {data.high}
            </span>
          </div>
          <div className="text-center">
            <span className="block scale-90">最低</span>
            <span className="font-mono text-gray-700 font-bold text-xs sm:text-sm">
              {data.low}
            </span>
          </div>
        </div>

        {/* 新增：能量分数显示 */}
        {data.energyScore && (
          <div className="mt-2 sm:mt-3 mb-2 sm:mb-3 p-2 sm:p-3 bg-linear-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex justify-between items-center mb-1.5 sm:mb-2">
              <span className="text-[10px] sm:text-xs font-bold text-blue-900">
                能量分数
              </span>
              <span
                className={`text-base sm:text-lg font-bold ${
                  data.energyScore.isBelowSupport
                    ? "text-red-600"
                    : data.energyScore.total >= 7
                      ? "text-green-600"
                      : "text-gray-700"
                }`}
              >
                {data.energyScore.total.toFixed(1)}
              </span>
            </div>
            <div className="space-y-0.5 sm:space-y-1 text-[10px] sm:text-xs text-gray-600">
              <div className="flex justify-between">
                <span>月令系数:</span>
                <span className="font-mono">
                  {data.energyScore.monthCoefficient}
                </span>
              </div>
              <div className="flex justify-between">
                <span>日支关系:</span>
                <span className="font-mono">
                  {data.energyScore.dayRelation}
                </span>
              </div>
              <div className="flex justify-between">
                <span>时辰波动:</span>
                <span className="font-mono">
                  {data.energyScore.hourFluctuation}
                </span>
              </div>
            </div>
            {data.energyScore.isBelowSupport && (
              <div className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-red-700 font-medium">
                ⚠️ 已跌破支撑位
              </div>
            )}
          </div>
        )}

        {/* Detailed Reason */}
        <div className="text-xs sm:text-sm text-gray-700 leading-relaxed text-justify max-h-37.5 sm:max-h-50 overflow-y-auto custom-scrollbar">
          {data.reason}
        </div>

        {/* 行动指南 */}
        {data.actionAdvice && (
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <h4 className="text-xs sm:text-sm font-bold text-indigo-900 flex items-center gap-1">
                <Target className="w-3 h-3 sm:w-4 sm:h-4" />
                行动指南
              </h4>
              {data.actionAdvice.scenario && (
                <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">
                  {data.actionAdvice.scenario}
                </span>
              )}
            </div>

            {/* 建议行动 */}
            <div className="space-y-1 sm:space-y-1.5">
              <p className="text-[10px] sm:text-xs font-semibold text-green-800 mb-0.5 sm:mb-1 flex items-center gap-1">
                <Lightbulb className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                建议行动
              </p>
              {data.actionAdvice.suggestions.map((suggestion, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-700"
                >
                  <span className="text-green-600 font-bold mt-0.5">
                    {idx + 1}.
                  </span>
                  <span className="flex-1">{suggestion}</span>
                </div>
              ))}
            </div>

            {/* 规避提醒 */}
            <div className="space-y-1 sm:space-y-1.5">
              <p className="text-[10px] sm:text-xs font-semibold text-red-800 mb-0.5 sm:mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                规避提醒
              </p>
              {data.actionAdvice.warnings.map((warning, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-700"
                >
                  <span className="text-red-600 font-bold mt-0.5">•</span>
                  <span className="flex-1">{warning}</span>
                </div>
              ))}
            </div>

            {/* 玄学依据 */}
            {data.actionAdvice.basis && (
              <div className="text-[10px] sm:text-xs text-purple-700 bg-purple-50 p-1.5 sm:p-2 rounded border border-purple-200">
                <span className="font-semibold">玄学依据：</span>
                {data.actionAdvice.basis}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
  return null;
};

// CandleShape with Chinese painting colors - diamond shape
const CandleShape = (props: CandleShapeProps): React.ReactElement | null => {
  const { x, y, width, height, payload, yAxis } = props;

  if (!payload) return null;

  const isUp = payload.close >= payload.open;
  const color = isUp ? "#B22D1B" : "#2F4F4F"; // Cinnabar red / Indigo
  const strokeColor = isUp ? "#8B1810" : "#1F3A3A";

  let highY = y;
  let lowY = y + height;

  if (yAxis && typeof yAxis.scale === "function") {
    highY = yAxis.scale(payload.high);
    lowY = yAxis.scale(payload.low);
  }

  const center = x + width / 2;
  const renderHeight = height < 2 ? 2 : height;
  const middleY = y + renderHeight / 2;

  return (
    <g>
      {/* Wick with brush stroke effect */}
      <line
        x1={center}
        y1={highY}
        x2={center}
        y2={lowY}
        stroke={strokeColor}
        strokeWidth={1.5}
        opacity={0.8}
      />

      {/* Diamond body shape (four points: top, right, bottom, left) */}
      <polygon
        points={`
          ${center},${y}
          ${x + width},${middleY}
          ${center},${y + renderHeight}
          ${x},${middleY}
        `}
        fill={color}
        stroke={strokeColor}
        strokeWidth={1}
        opacity={0.85}
      />
    </g>
  );
};

// Custom Seal Stamp Label Component for the Peak
const SealStampLabel = (
  props: SealStampLabelProps,
): React.ReactElement | null => {
  const { x, y, width, value, maxHigh } = props;

  if (value !== maxHigh) return null;

  // 响应式尺寸：移动端20x20, tablet 25x25, desktop 30x30
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
  const isTablet =
    typeof window !== "undefined" &&
    window.innerWidth >= 640 &&
    window.innerWidth < 1024;
  const size = isMobile ? 20 : isTablet ? 25 : 30;
  const fontSize = isMobile ? 9 : isTablet ? 10 : 11;
  const offsetY = isMobile ? 28 : isTablet ? 32 : 35;

  return (
    <g>
      {/* Cinnabar seal stamp */}
      <rect
        x={x + width / 2 - size / 2}
        y={y - offsetY}
        width={size}
        height={size}
        fill="#B22D1B"
        stroke="#8B1810"
        strokeWidth={2}
        rx={3}
        ry={3}
        opacity={0.9}
      />

      {/* Inner white border */}
      <rect
        x={x + width / 2 - (size - 4) / 2}
        y={y - offsetY + 2}
        width={size - 4}
        height={size - 4}
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={1}
        rx={2}
        ry={2}
      />

      {/* White reversed score */}
      <text
        x={x + width / 2}
        y={y - offsetY + size / 2 + fontSize / 2 - 1}
        fill="#FFFFFF"
        fontSize={fontSize}
        fontWeight="bold"
        textAnchor="middle"
        fontFamily="KaiTi, serif"
      >
        {value}
      </text>
    </g>
  );
};

// Action Advice Stamp Label Component for Key Years
interface ActionAdviceStampProps {
  x?: number;
  y?: number;
  width?: number;
  index?: number;
  [key: string]: unknown;
}

// 创建一个返回组件的函数，通过闭包访问 transformedData
const createActionAdviceStampLabel = (
  dataPoints: (KLinePoint | InterpolatedKLinePoint)[],
) => {
  const ActionAdviceStamp = (
    props: ActionAdviceStampProps,
  ): React.ReactElement | null => {
    const { x, y, width, index } = props;

    if (
      index === undefined ||
      x === undefined ||
      y === undefined ||
      width === undefined
    )
      return null;

    const payload = dataPoints[index];
    if (!payload || !payload.actionAdvice) return null;

    const isUp = payload.close >= payload.open;
    const character = isUp ? "启" : "变"; // 吉年刻"启"，凶年刻"变"

    // 响应式尺寸：移动端12x12, desktop 16x16
    const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
    const size = isMobile ? 12 : 16;
    const fontSize = isMobile ? 8 : 10;
    const offsetY = isMobile ? 3 : 4;

    // 位置：在 K 线顶部上方约 4 像素处（避免与最高点印章重叠）
    const stampY = y - offsetY;

    return (
      <g>
        {/* 朱砂红印章 */}
        <rect
          x={x + width / 2 - size / 2}
          y={stampY - size}
          width={size}
          height={size}
          fill="#B22D1B"
          stroke="#8B1810"
          strokeWidth={1.5}
          rx={1.5}
          ry={1.5}
          opacity={0.95}
        />

        {/* 内部白色细边框 */}
        <rect
          x={x + width / 2 - (size - 2) / 2}
          y={stampY - size + 1}
          width={size - 2}
          height={size - 2}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={0.8}
          rx={1}
          ry={1}
        />

        {/* 白色反显篆刻汉字 */}
        <text
          x={x + width / 2}
          y={stampY - size / 2 + fontSize / 2 - 1}
          fill="#FFFFFF"
          fontSize={fontSize}
          fontWeight="bold"
          textAnchor="middle"
          fontFamily="KaiTi, serif"
        >
          {character}
        </text>
      </g>
    );
  };
  ActionAdviceStamp.displayName = "ActionAdviceStamp";
  return ActionAdviceStamp;
};

const LifeKLineChart: React.FC<LifeKLineChartProps> = ({
  data,
  viewMode = "year",
  title,
  supportPressureLevels = [],
}) => {
  // 计算MK10（10期移动平均线）
  const calculateMK10 = (
    data: (KLinePoint | InterpolatedKLinePoint)[],
  ): number[] => {
    return data.map((_, index) => {
      const start = Math.max(0, index - 9);
      const window = data.slice(start, index + 1);
      const avgClose =
        window.reduce((sum, d) => sum + d.close, 0) / window.length;
      return avgClose;
    });
  };

  const mk10Values = calculateMK10(data);

  const transformedData = data.map((d, index) => ({
    ...d,
    bodyRange: [Math.min(d.open, d.close), Math.max(d.open, d.close)],
    // Helper for labelling: we label the 'high' point
    labelPoint: d.high,
    mk10: mk10Values[index],
  }));

  // 创建关键年份印章组件（使用闭包访问数据）
  const ActionAdviceStampLabel = React.useMemo(
    () => createActionAdviceStampLabel(data),
    [data],
  );

  // Identify Da Yun change points to draw reference lines
  const daYunChanges = data.filter((d, i) => {
    if (i === 0) return true;
    return d.daYun !== data[i - 1].daYun;
  });

  // Calculate Global Max High for the peak label
  const maxHigh = data.length > 0 ? Math.max(...data.map((d) => d.high)) : 100;

  // Calculate Global Min Low for pressure line validation
  const minLow = data.length > 0 ? Math.min(...data.map((d) => d.low)) : 0;

  // 计算支撑线和压力线的位置（根据视图模式动态调整）
  const getSupportPressureLines = (): { support: number; pressure: number } => {
    const range = maxHigh - minLow;

    if (viewMode === "year") {
      // 年视图：使用固定比例
      return {
        support: Math.max(0, minLow + range * 0.08), // 最低点下方 5%
        pressure: maxHigh - range * 0.1, // 最高点上方 5%
      };
    }

    // 日视图和月视图：使用更小的间距，让线条更贴近数据
    return {
      support: Math.max(0, minLow + range * 0.15), // 最低点下方 15%
      pressure: maxHigh - range * 0.15, // 最高点上方 15%
    };
  };

  const { support: supportLineValue, pressure: pressureLineValue } =
    getSupportPressureLines();

  // 计算今年对应的位置（用于标注今年的竖线）
  const currentYear = new Date().getFullYear();
  const currentYearDataPoint = data.find((d) => d.year === currentYear);
  const currentYearPosition: string | number | null = currentYearDataPoint
    ? viewMode === "year"
      ? currentYearDataPoint.age
      : "date" in currentYearDataPoint
        ? (currentYearDataPoint as InterpolatedKLinePoint).date
        : currentYearDataPoint.age
    : null;

  // 根据视图模式筛选适用的支撑压力位（保留原有逻辑用于其他用途）
  const visibleLevels = React.useMemo(() => {
    if (!supportPressureLevels || supportPressureLevels.length === 0) return [];

    // 分离支撑位和压力位
    const support = supportPressureLevels.filter((l) => l.type === "support");
    const pressure = supportPressureLevels.filter((l) => l.type === "pressure");

    // 支撑线：显示最高的支撑位（K线下方，低于最低点）
    const validSupport = support.filter((l) => l.value * 10 <= minLow); // 支撑位应该在K线下方
    const maxSupport =
      validSupport.length > 0
        ? validSupport.reduce((max, l) => (l.value > max.value ? l : max))
        : null;

    // 压力线：显示最低的压力位，且必须高于所有K线的最高点
    // 从所有压力位中筛选出高于maxHigh的，然后选最高的那个
    const validPressure = pressure.filter((l) => l.value * 10 >= maxHigh); // 压力位应该在K线上方
    const minPressure =
      validPressure.length > 0
        ? validPressure.reduce((min, l) => (l.value < min.value ? l : min))
        : null;

    return [
      ...(maxSupport ? [maxSupport] : []),
      ...(minPressure ? [minPressure] : []),
    ];
  }, [supportPressureLevels, minLow, maxHigh]);

  // 分离支撑位和压力位
  const supportLevels = visibleLevels.filter((l) => l.type === "support");
  const pressureLevels = visibleLevels.filter((l) => l.type === "pressure");

  // 根据视图模式配置 X 轴
  const getXAxisConfig = () => {
    switch (viewMode) {
      case "day":
        return {
          dataKey: "date",
          interval: 0, // 显示所有日期
          tickFormatter: (date: string) => {
            const d = new Date(date);
            return `${d.getMonth() + 1}/${d.getDate()}`;
          },
          label: {
            value: "日期",
            position: "insideBottomRight" as const,
            offset: -5,
            fontSize: 10,
            fill: "#9ca3af",
          },
        };
      case "mouth":
        return {
          dataKey: "date",
          interval: 6, // 每7天显示一次
          tickFormatter: (date: string) => {
            const d = new Date(date);
            return `${d.getMonth() + 1}/${d.getDate()}`;
          },
          label: {
            value: "日期",
            position: "insideBottomRight" as const,
            offset: -5,
            fontSize: 10,
            fill: "#9ca3af",
          },
        };
      default: // year
        return {
          dataKey: "age",
          interval: 9, // 每10岁显示一次
          tickFormatter: undefined,
          label: {
            value: "年龄",
            position: "insideBottomRight" as const,
            offset: -5,
            fontSize: 10,
            fill: "#9ca3af",
          },
        };
    }
  };

  const xAxisConfig = getXAxisConfig();

  // 根据视图模式计算 Y 轴范围
  const getYAxisDomain = (): [number | "auto", number | "auto"] => {
    if (viewMode === "year") {
      // 年视图：保持从 0 开始，显示完整范围
      return [0, "auto"];
    }

    // 日视图和月视图：使用动态范围，让数据更好地伸展
    const allValues = data.flatMap((d) => [d.low, d.high]);
    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);

    // 添加 20% 的上下边距，让数据在中间区域展示
    const range = maxValue - minValue;
    const padding = range * 0.2;

    return [
      Math.max(0, Math.floor(minValue - padding)), // 确保不低于 0
      Math.ceil(maxValue + padding),
    ];
  };

  const yAxisDomain = getYAxisDomain();

  if (!data || data.length === 0) {
    return (
      <div className="h-125 flex items-center justify-center text-gray-400">
        无数据
      </div>
    );
  }

  return (
    <div className="w-full h-100 sm:h-125 md:h-150 paper-texture p-2 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border border-gray-200 shadow-sm relative">
      <div className="mb-3 sm:mb-4 md:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 px-1 sm:px-2">
        <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800">
          {title || "人生流年大运K线图"}
        </h3>
        <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 text-[10px] sm:text-xs font-medium">
          <span className="flex items-center text-red-900 bg-red-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-cinnabarred mr-1 sm:mr-2 rounded-full"></div>{" "}
            吉运
          </span>
          <span className="flex items-center text-indigo-900 bg-indigo-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-indigo mr-1 sm:mr-2 rounded-full"></div>{" "}
            凶运
          </span>
          <span className="flex items-center text-indigo-700 bg-indigo-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
            <div className="w-4 sm:w-5 h-0 border-t-2 border-amber-600 border-dashed mr-1 sm:mr-2"></div>{" "}
            支撑/压力
          </span>
          <span className="flex items-center text-indigo-700 bg-indigo-200 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 mr-1 sm:mr-2 rounded-full"></div>{" "}
            MK10
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="90%">
        <ComposedChart
          data={transformedData}
          margin={{ top: 20, right: 5, left: -10, bottom: 10 }}
        >
          {/* No CartesianGrid - removed for Chinese painting aesthetic */}
          <>
            <XAxis
              dataKey={xAxisConfig.dataKey}
              tick={{
                fontSize: 8,
                fill: "#6b7280",
                fontFamily: "KaiTi, serif",
              }}
              interval={xAxisConfig.interval}
              axisLine={{ stroke: "#D1CDC2", strokeWidth: 1 }}
              tickLine={false}
              height={25}
              tickFormatter={xAxisConfig.tickFormatter}
            />

            <YAxis
              domain={yAxisDomain}
              tick={{ fontSize: 8, fill: "#6b7280" }}
              axisLine={false}
              tickLine={false}
              label={{
                value: "运势分",
                angle: -90,
                position: "insideLeft",
                fontSize: 8,
                fill: "#9ca3af",
              }}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: "#9ca3af",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
            />

            {/* Da Yun Reference Lines */}
            {daYunChanges.map((point, index) => (
              <ReferenceLine
                key={`dayun-${index}`}
                x={point.age}
                stroke="#cbd5e1"
                strokeDasharray="3 3"
                strokeWidth={1}
              >
                <Label
                  value={point.daYun}
                  position="top"
                  fill="#6366f1"
                  fontSize={8}
                  fontWeight="bold"
                  className="hidden md:block"
                />
              </ReferenceLine>
            ))}

            {/* 全局支撑线 S - 穿过整个图表 */}
            <ReferenceLine
              y={supportLineValue}
              stroke="#2F4F4F"
              strokeWidth={2}
              strokeDasharray="5 5"
              opacity={0.6}
              label={{
                value: "S",
                position: "insideLeft",
                fill: "#2F4F4F",
                fontSize: 12,
                fontWeight: "bold",
                offset: -8,
              }}
            />

            {/* 全局压力线 R - 穿过整个图表 */}
            <ReferenceLine
              y={pressureLineValue}
              stroke="#B22D1B"
              strokeWidth={2}
              strokeDasharray="5 5"
              opacity={0.6}
              label={{
                value: "R",
                position: "insideRight",
                fill: "#B22D1B",
                fontSize: 12,
                fontWeight: "bold",
                offset: -8,
              }}
            />

            {/* Support lines - subtle solid gold */}
            {supportLevels.map((level, idx) => (
              <ReferenceLine
                key={`support-${idx}`}
                y={level.value * 10}
                stroke="#C5A367"
                strokeWidth={1.5}
                strokeDasharray="none"
                opacity={0.5}
                label={{
                  value: `财`,
                  position: "insideLeft",
                  fill: "#C5A367",
                  fontSize: 10,
                  fontWeight: "bold",
                  fontFamily: "KaiTi, serif",
                }}
              />
            ))}

            {/* Pressure lines - subtle solid gray */}
            {pressureLevels.map((level, idx) => (
              <ReferenceLine
                key={`pressure-${idx}`}
                y={level.value * 10}
                stroke="#8B8680"
                strokeWidth={1.5}
                strokeDasharray="none"
                opacity={0.5}
                label={{
                  value: `印`,
                  position: "insideRight",
                  fill: "#8B8680",
                  fontSize: 10,
                  fontWeight: "bold",
                  fontFamily: "KaiTi, serif",
                }}
              />
            ))}

            {/* 今年的竖线标注 */}
            {currentYearPosition && (
              <ReferenceLine
                x={currentYearPosition}
                stroke="#FFA500"
                strokeWidth={2}
                strokeDasharray="5 5"
                opacity={0.7}
                label={{
                  value: `今年 ${currentYear}`,
                  position: "top",
                  fill: "#FFA500",
                  fontSize: 10,
                  fontWeight: "bold",
                  offset: 10,
                }}
              />
            )}

            <Bar
              dataKey="bodyRange"
              shape={CandleShape}
              isAnimationActive={true}
              animationDuration={1500}
            >
              {/* 最高点标记 */}
              <LabelList
                dataKey="high"
                position="top"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                content={(props: any) => (
                  <SealStampLabel {...props} maxHigh={maxHigh} />
                )}
              />
              {/* 关键年份行动指南标记 */}
              <LabelList
                dataKey="high"
                position="top"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                content={(props: any) => <ActionAdviceStampLabel {...props} />}
              />
            </Bar>

            {/* MK10 移动平均线 */}
            <Line
              type="monotone"
              dataKey="mk10"
              stroke="#479977"
              strokeWidth={2}
              dot={false}
              isAnimationActive={true}
              animationDuration={1500}
            />
          </>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LifeKLineChart;
