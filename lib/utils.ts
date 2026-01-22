import { Gender, UserInput, LifeDestinyResult } from '@/types';
import { BAZI_SYSTEM_INSTRUCTION } from './constants';

/**
 * 判断大运方向（顺行/逆行）
 * 规则：阳男/阴女顺行，阴男/阳女逆行
 */
export function getDaYunDirection(yearPillar: string, gender: Gender): {
  isForward: boolean;
  text: string;
} {
  const firstChar = yearPillar.trim().charAt(0);
  const yangStems = ['甲', '丙', '戊', '庚', '壬']; // 阳天干
  const isYangYear = yangStems.includes(firstChar);

  // 阳男/阴女顺行，阴男/阳女逆行
  const isForward = gender === 'Male' ? isYangYear : !isYangYear;

  return {
    isForward,
    text: isForward ? '顺行' : '逆行',
  };
}

/**
 * 清理 Markdown 标记（去除 ```json 等标记）
 */
export function cleanMarkdown(text: string): string {
  return text
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .trim();
}

/**
 * 生成用户提示词
 */
export function generateUserPrompt(userInput: UserInput): string {
  const { isForward, text: direction } = getDaYunDirection(
    userInput.yearPillar,
    userInput.gender
  );

  const genderText = userInput.gender === 'Male' ? '乾造（男）' : '坤造（女）';

  return `${BAZI_SYSTEM_INSTRUCTION}

---

**用户八字信息:**
- 性别: ${genderText}
- 出生年份: ${userInput.birthYear}
- 四柱: ${userInput.yearPillar}年 ${userInput.monthPillar}月 ${userInput.dayPillar}日 ${userInput.hourPillar}时
- 起运年龄: ${userInput.startAge}岁（虚岁）
- 大运方向: ${direction}

请严格按照JSON格式输出，不要添加任何额外的文字说明。`;
}

/**
 * 格式化分数（0-10分 转换为百分制显示）
 */
export function formatScore(score: number): string {
  return `${Math.round(score * 10)}分`;
}

/**
 * 保存数据到 localStorage
 */
export function saveToLocalStorage(key: string, data: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

/**
 * 从 localStorage 读取数据
 */
export function loadFromLocalStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return null;
  }
}

/**
 * 导出为 JSON 文件
 */
export function exportToJson(data: LifeDestinyResult, fileName: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * 导出为 HTML 文件
 */
export function exportToHtml(htmlContent: string, fileName: string): void {
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * 标准化评分（0-100 转换为 0-10）
 */
function normalizeScore(score: number): number {
  if (score > 10) {
    return Math.round(score / 10);
  }
  return score;
}

/**
 * 转换扁平 JSON 为嵌套结构
 * 兼容 AI 返回的扁平格式（chartPoints）和标准嵌套格式（chartData + analysis）
 */
export function transformToLifeDestinyResult(data: any): LifeDestinyResult {
  // 如果已经是正确的嵌套格式，检查并转换 score
  if (data.chartData && data.analysis) {
    // 转换 chartData 中的 score
    const normalizedChartData = data.chartData.map((point: any) => ({
      ...point,
      score: normalizeScore(point.score || 0),
    }));

    // 转换 analysis 中的所有评分
    const normalizedAnalysis = {
      ...data.analysis,
      summaryScore: normalizeScore(data.analysis.summaryScore || 0),
      personalityScore: normalizeScore(data.analysis.personalityScore || 0),
      industryScore: normalizeScore(data.analysis.industryScore || 0),
      fengShuiScore: normalizeScore(data.analysis.fengShuiScore || 0),
      wealthScore: normalizeScore(data.analysis.wealthScore || 0),
      marriageScore: normalizeScore(data.analysis.marriageScore || 0),
      healthScore: normalizeScore(data.analysis.healthScore || 0),
      familyScore: normalizeScore(data.analysis.familyScore || 0),
      cryptoScore: normalizeScore(data.analysis.cryptoScore || 0),
    };

    return {
      chartData: normalizedChartData,
      analysis: normalizedAnalysis,
    };
  }

  // 处理扁平格式（AI 直接返回的格式）
  // chartPoints -> chartData，并标准化 score
  const rawChartData = data.chartPoints || data.chartData || [];
  const chartData = rawChartData.map((point: any) => ({
    ...point,
    score: normalizeScore(point.score || 0),
  }));

  // 提取所有分析字段到 analysis 对象，并标准化评分
  const analysis = {
    bazi: data.bazi || [],
    summary: data.summary || '',
    summaryScore: normalizeScore(data.summaryScore || 0),
    personality: data.personality || '',
    personalityScore: normalizeScore(data.personalityScore || 0),
    industry: data.industry || '',
    industryScore: normalizeScore(data.industryScore || 0),
    fengShui: data.fengShui || '',
    fengShuiScore: normalizeScore(data.fengShuiScore || 0),
    wealth: data.wealth || '',
    wealthScore: normalizeScore(data.wealthScore || 0),
    marriage: data.marriage || '',
    marriageScore: normalizeScore(data.marriageScore || 0),
    health: data.health || '',
    healthScore: normalizeScore(data.healthScore || 0),
    family: data.family || '',
    familyScore: normalizeScore(data.familyScore || 0),
    crypto: data.crypto || '',
    cryptoScore: normalizeScore(data.cryptoScore || 0),
    cryptoYear: data.cryptoYear || '',
    cryptoStyle: data.cryptoStyle || '',
  };

  return {
    chartData,
    analysis,
  };
}
