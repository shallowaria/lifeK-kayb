export type Gender = 'Male' | 'Female';

// 导出时辰类型（从 shi-chen.ts 重新导出）
export type { ShiChenName } from '@/lib/constants/shi-chen';

export interface UserInput {
  name?: string;
  gender: Gender;
  birthYear: string;   // 出生年份 (如 2003)
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
