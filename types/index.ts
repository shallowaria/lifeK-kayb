export type Gender = 'Male' | 'Female';

// 导出时辰类型（从 shi-chen.ts 重新导出）
export type { ShiChenName } from '@/lib/constants/shi-chen';

export interface UserInput {
  name?: string;
  gender: Gender;
  birthYear: string;   // 出生年份 (如 2003) - 保留向后兼容
  birthDate?: string;  // 完整日期 (YYYY-MM-DD) - 用于日视图/周视图
  yearPillar: string;  // 年柱
  monthPillar: string; // 月柱
  dayPillar: string;   // 日柱
  hourPillar: string;  // 时柱
  startAge: string;    // 起运年龄 (虚岁)
}

export interface KLinePoint {
  age: number;
  year: number;
  ganZhi: string; // 当年的流年干支 (如：甲辰)
  daYun?: string; // 当前所在的大运（如：甲子大运），用于图表标记
  open: number;
  close: number;
  high: number;
  low: number;
  score: number;
  reason: string; // 详细的流年描述 (20-30字)
}

export interface AnalysisData {
  bazi: string[]; // [Year, Month, Day, Hour] pillars
  summary: string;
  summaryScore: number; // 0-10

  personality: string;      // 性格分析
  personalityScore: number; // 0-10

  industry: string;
  industryScore: number; // 0-10

  fengShui: string;       // 发展风水
  fengShuiScore: number;  // 0-10

  wealth: string;
  wealthScore: number; // 0-10

  marriage: string;
  marriageScore: number; // 0-10

  health: string;
  healthScore: number; // 0-10

  family: string;
  familyScore: number; // 0-10

  // Crypto / Web3 Specifics
  crypto: string;       // 币圈交易分析
  cryptoScore: number;  // 投机运势评分
  cryptoYear: string;   // 暴富流年 (e.g., 2025年 (乙巳))
  cryptoStyle: string;  // 适合流派 (现货定投/高倍合约/链上Alpha)
}

export interface LifeDestinyResult {
  chartData: KLinePoint[];
  analysis: AnalysisData;
}

// 时间粒度类型 (用于视图切换)
export type TimeGranularity = 'year' | 'week' | 'day';

// 时间范围 (用于日/周视图计算)
export interface TimeRange {
  start: Date;
  end: Date;
  granularity: TimeGranularity;
}

// 插值生成的K线点 (扩展自 KLinePoint，用于日/周视图)
export interface InterpolatedKLinePoint extends KLinePoint {
  date: string;           // ISO 日期字符串 (YYYY-MM-DD)
  isInterpolated: boolean; // 标记是否为插值数据
}

// AI 返回的原始 K 线点数据（score 可能是 0-100 范围）
export interface RawKLinePoint {
  age: number;
  year: number;
  ganZhi: string;
  daYun?: string;
  open: number;
  close: number;
  high: number;
  low: number;
  score: number; // 可能是 0-10 或 0-100
  reason: string;
}

// AI 返回的原始分析数据（所有 score 字段可能是 0-100 范围）
export interface RawAnalysisData {
  bazi: string[];
  summary: string;
  summaryScore: number;
  personality: string;
  personalityScore: number;
  industry: string;
  industryScore: number;
  fengShui: string;
  fengShuiScore: number;
  wealth: string;
  wealthScore: number;
  marriage: string;
  marriageScore: number;
  health: string;
  healthScore: number;
  family: string;
  familyScore: number;
  crypto: string;
  cryptoScore: number;
  cryptoYear: string;
  cryptoStyle: string;
}

// AI 返回的原始数据格式（可能是扁平或嵌套格式）
export type RawAIResponse =
  // 嵌套格式（标准格式）
  | {
      chartData: RawKLinePoint[];
      analysis: RawAnalysisData;
    }
  // 扁平格式（AI 直接返回的格式，使用 chartPoints）
  | ({
      chartPoints?: RawKLinePoint[];
      chartData?: RawKLinePoint[];
    } & RawAnalysisData);
