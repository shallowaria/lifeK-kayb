'use client';

import React from 'react';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Label,
  LabelList
} from 'recharts';
import { Target, Lightbulb, AlertTriangle } from 'lucide-react';
import { KLinePoint, InterpolatedKLinePoint, SupportPressureLevel } from '@/types';

interface LifeKLineChartProps {
  data: KLinePoint[] | InterpolatedKLinePoint[];
  viewMode?: 'year' | 'mouth' | 'day'; // 视图模式
  title?: string;                      // 自定义标题
  supportPressureLevels?: SupportPressureLevel[];  // 支撑/压力位列表
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as KLinePoint | InterpolatedKLinePoint;
    const isUp = data.close >= data.open;
    const isInterpolated = 'isInterpolated' in data && data.isInterpolated;

    return (
      <div className="bg-white/95 backdrop-blur-sm p-5 rounded-xl shadow-2xl border border-gray-200 z-50 w-[320px] md:w-[400px]">
        {/* Header */}
        <div className="flex justify-between items-start mb-3 border-b border-gray-100 pb-2">
          <div>
            <p className="text-xl font-bold text-gray-800">
              {isInterpolated && 'date' in data ? (
                <>
                  {data.date} <span className="text-base text-gray-500">({data.age}岁)</span>
                </>
              ) : (
                <>
                  {data.year} {data.ganZhi}年 <span className="text-base text-gray-500">({data.age}岁)</span>
                </>
              )}
            </p>
            <p className="text-sm text-indigo-600 font-medium mt-1">
              大运：{data.daYun || '未知'}
            </p>
            {/* 新增：显示十神 */}
            {data.tenGod && (
              <p className="text-sm text-purple-600 font-medium mt-1">
                十神：{data.tenGod}
              </p>
            )}
          </div>
          <div className={`text-base font-bold px-2 py-1 rounded ${isUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {isUp ? '吉 ▲' : '凶 ▼'}
          </div>
        </div>

        {/* Data Grid */}
        <div className="grid grid-cols-4 gap-2 text-xs text-gray-500 mb-4 bg-gray-50 p-2 rounded">
          <div className="text-center">
            <span className="block scale-90">开盘</span>
            <span className="font-mono text-gray-700 font-bold">{data.open}</span>
          </div>
          <div className="text-center">
            <span className="block scale-90">收盘</span>
            <span className="font-mono text-gray-700 font-bold">{data.close}</span>
          </div>
          <div className="text-center">
            <span className="block scale-90">最高</span>
            <span className="font-mono text-gray-700 font-bold">{data.high}</span>
          </div>
          <div className="text-center">
            <span className="block scale-90">最低</span>
            <span className="font-mono text-gray-700 font-bold">{data.low}</span>
          </div>
        </div>

        {/* 新增：能量分数显示 */}
        {data.energyScore && (
          <div className="mt-3 mb-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-blue-900">能量分数</span>
              <span className={`text-lg font-bold ${
                data.energyScore.isBelowSupport
                  ? 'text-red-600'
                  : data.energyScore.total >= 7
                    ? 'text-green-600'
                    : 'text-gray-700'
              }`}>
                {data.energyScore.total.toFixed(1)}
              </span>
            </div>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>月令系数:</span>
                <span className="font-mono">{data.energyScore.monthCoefficient}</span>
              </div>
              <div className="flex justify-between">
                <span>日支关系:</span>
                <span className="font-mono">{data.energyScore.dayRelation}</span>
              </div>
              <div className="flex justify-between">
                <span>时辰波动:</span>
                <span className="font-mono">{data.energyScore.hourFluctuation}</span>
              </div>
            </div>
            {data.energyScore.isBelowSupport && (
              <div className="mt-2 text-xs text-red-700 font-medium">
                ⚠️ 已跌破支撑位
              </div>
            )}
          </div>
        )}

        {/* Detailed Reason */}
        <div className="text-sm text-gray-700 leading-relaxed text-justify max-h-[200px] overflow-y-auto custom-scrollbar">
          {data.reason}
        </div>

        {/* 行动指南 */}
        {data.actionAdvice && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-indigo-900 flex items-center gap-1">
                <Target className="w-4 h-4" />
                行动指南
              </h4>
              {data.actionAdvice.scenario && (
                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">
                  {data.actionAdvice.scenario}
                </span>
              )}
            </div>

            {/* 建议行动 */}
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-green-800 mb-1 flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5" />
                建议行动
              </p>
              {data.actionAdvice.suggestions.map((suggestion, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-gray-700">
                  <span className="text-green-600 font-bold mt-0.5">{idx + 1}.</span>
                  <span className="flex-1">{suggestion}</span>
                </div>
              ))}
            </div>

            {/* 规避提醒 */}
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-red-800 mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                规避提醒
              </p>
              {data.actionAdvice.warnings.map((warning, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-gray-700">
                  <span className="text-red-600 font-bold mt-0.5">•</span>
                  <span className="flex-1">{warning}</span>
                </div>
              ))}
            </div>

            {/* 玄学依据 */}
            {data.actionAdvice.basis && (
              <div className="text-xs text-purple-700 bg-purple-50 p-2 rounded border border-purple-200">
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

// CandleShape with cleaner wicks
const CandleShape = (props: any) => {
  const { x, y, width, height, payload, yAxis } = props;

  const isUp = payload.close >= payload.open;
  const color = isUp ? '#22c55e' : '#ef4444'; // Green Up, Red Down
  const strokeColor = isUp ? '#15803d' : '#b91c1c'; // Darker stroke for better visibility

  let highY = y;
  let lowY = y + height;

  if (yAxis && typeof yAxis.scale === 'function') {
    try {
      highY = yAxis.scale(payload.high);
      lowY = yAxis.scale(payload.low);
    } catch (e) {
      highY = y;
      lowY = y + height;
    }
  }

  const center = x + width / 2;

  // Enforce minimum body height so flat doji candles are visible
  const renderHeight = height < 2 ? 2 : height;

  return (
    <g>
      {/* Wick - made slightly thicker for visibility */}
      <line x1={center} y1={highY} x2={center} y2={lowY} stroke={strokeColor} strokeWidth={2} />
      {/* Body */}
      <rect
        x={x}
        y={y}
        width={width}
        height={renderHeight}
        fill={color}
        stroke={strokeColor}
        strokeWidth={1}
        rx={1} // Slight border radius
      />
    </g>
  );
};

// Custom Label Component for the Peak Star
const PeakLabel = (props: any) => {
  const { x, y, width, value, maxHigh } = props;

  // Only render if this value equals the global max high
  if (value !== maxHigh) return null;

  return (
    <g>
      {/* Red Star Icon */}
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        transform={`translate(${x + width / 2 - 6}, ${y - 24}) scale(0.5)`}
        fill="#ef4444" // Red-500
        stroke="#b91c1c" // Red-700
        strokeWidth="1"
      />
      {/* Score Text */}
      <text
        x={x + width / 2}
        y={y - 28}
        fill="#b91c1c"
        fontSize={10}
        fontWeight="bold"
        textAnchor="middle"
      >
        {value}
      </text>
    </g>
  );
};

const LifeKLineChart: React.FC<LifeKLineChartProps> = ({ data, viewMode = 'year', title, supportPressureLevels = [] }) => {
  const transformedData = data.map(d => ({
    ...d,
    bodyRange: [Math.min(d.open, d.close), Math.max(d.open, d.close)],
    // Helper for labelling: we label the 'high' point
    labelPoint: d.high
  }));

  // Identify Da Yun change points to draw reference lines
  const daYunChanges = data.filter((d, i) => {
    if (i === 0) return true;
    return d.daYun !== data[i-1].daYun;
  });

  // Calculate Global Max High for the peak label
  const maxHigh = data.length > 0 ? Math.max(...data.map(d => d.high)) : 100;

  // 根据视图模式筛选适用的支撑压力位
  const visibleLevels = React.useMemo(() => {
    if (!supportPressureLevels || supportPressureLevels.length === 0) return [];

    // 在所有视图模式下都显示基于 age 的支撑压力位
    // 简化处理：直接显示所有支撑压力位
    return supportPressureLevels;
  }, [supportPressureLevels, viewMode]);

  // 分离支撑位和压力位
  const supportLevels = visibleLevels.filter(l => l.type === 'support');
  const pressureLevels = visibleLevels.filter(l => l.type === 'pressure');

  // 根据视图模式配置 X 轴
  const getXAxisConfig = () => {
    switch (viewMode) {
      case 'day':
        return {
          dataKey: 'date',
          interval: 0, // 显示所有日期
          tickFormatter: (date: string) => {
            const d = new Date(date);
            return `${d.getMonth() + 1}/${d.getDate()}`;
          },
          label: { value: '日期', position: 'insideBottomRight' as const, offset: -5, fontSize: 10, fill: '#9ca3af' }
        };
      case 'mouth':
        return {
          dataKey: 'date',
          interval: 6, // 每7天显示一次
          tickFormatter: (date: string) => {
            const d = new Date(date);
            return `${d.getMonth() + 1}/${d.getDate()}`;
          },
          label: { value: '日期', position: 'insideBottomRight' as const, offset: -5, fontSize: 10, fill: '#9ca3af' }
        };
      default: // year
        return {
          dataKey: 'age',
          interval: 9, // 每10岁显示一次
          tickFormatter: undefined,
          label: { value: '年龄', position: 'insideBottomRight' as const, offset: -5, fontSize: 10, fill: '#9ca3af' }
        };
    }
  };

  const xAxisConfig = getXAxisConfig();

  if (!data || data.length === 0) {
    return <div className="h-[500px] flex items-center justify-center text-gray-400">无数据</div>;
  }

  return (
    <div className="w-full h-[600px] bg-white p-2 md:p-6 rounded-xl border border-gray-200 shadow-sm relative">
      <div className="mb-6 flex justify-between items-center px-2">
        <h3 className="text-xl font-bold text-gray-800">{title || '人生流年大运K线图'}</h3>
        <div className="flex gap-4 text-xs font-medium">
           <span className="flex items-center text-green-700 bg-green-50 px-2 py-1 rounded"><div className="w-2 h-2 bg-green-500 mr-2 rounded-full"></div> 吉运 (涨)</span>
           <span className="flex items-center text-red-700 bg-red-50 px-2 py-1 rounded"><div className="w-2 h-2 bg-red-500 mr-2 rounded-full"></div> 凶运 (跌)</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="90%">
        <ComposedChart data={transformedData} margin={{ top: 30, right: 10, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />

          <XAxis
            dataKey={xAxisConfig.dataKey}
            tick={{fontSize: 10, fill: '#6b7280'}}
            interval={xAxisConfig.interval}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={false}
            label={xAxisConfig.label}
            tickFormatter={xAxisConfig.tickFormatter}
          />

          <YAxis
            domain={[0, 'auto']}
            tick={{fontSize: 10, fill: '#6b7280'}}
            axisLine={false}
            tickLine={false}
            label={{ value: '运势分', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#9ca3af' }}
          />

          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#9ca3af', strokeWidth: 1, strokeDasharray: '4 4' }} />

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
                 fontSize={10}
                 fontWeight="bold"
                 className="hidden md:block"
               />
             </ReferenceLine>
          ))}

          {/* 新增：支撑位参考线（绿色虚线）*/}
          {supportLevels.map((level, idx) => (
            <ReferenceLine
              key={`support-${idx}`}
              y={level.value * 10}
              stroke="#22c55e"
              strokeDasharray="5 5"
              strokeWidth={2}
              opacity={0.7}
              label={{
                value: `支撑 ${level.value}分: ${level.reason}`,
                position: 'insideTopLeft',
                fill: '#15803d',
                fontSize: 10,
                fontWeight: 'bold'
              }}
            />
          ))}

          {/* 新增：压力位参考线（红色虚线）*/}
          {pressureLevels.map((level, idx) => (
            <ReferenceLine
              key={`pressure-${idx}`}
              y={level.value * 10}
              stroke="#ef4444"
              strokeDasharray="5 5"
              strokeWidth={2}
              opacity={0.7}
              label={{
                value: `压力 ${level.value}分: ${level.reason}`,
                position: 'insideBottomLeft',
                fill: '#b91c1c',
                fontSize: 10,
                fontWeight: 'bold'
              }}
            />
          ))}

          <Bar
            dataKey="bodyRange"
            shape={<CandleShape />}
            isAnimationActive={true}
            animationDuration={1500}
          >
            {/*
              Only show label for the global Peak
              We pass the computed maxHigh to the custom label component
            */}
             <LabelList
              dataKey="high"
              position="top"
              content={<PeakLabel maxHigh={maxHigh} />}
            />
          </Bar>

        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LifeKLineChart;
