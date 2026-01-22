import { LifeDestinyResult, KLinePoint } from '@/types';

/**
 * 验证 JSON 数据的完整性
 */
export function validateChartData(data: unknown): {
  valid: boolean;
  error?: string;
} {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: '数据格式错误：必须是有效的 JSON 对象' };
  }

  const result = data as Partial<LifeDestinyResult>;

  // 验证 analysis 对象
  if (!result.analysis) {
    return { valid: false, error: '缺少 analysis 字段' };
  }

  const { analysis } = result;

  // 验证 bazi 数组
  if (!analysis.bazi || !Array.isArray(analysis.bazi) || analysis.bazi.length !== 4) {
    return { valid: false, error: 'bazi 必须是包含4个元素的数组（年月日时）' };
  }

  // 验证 chartData 数组
  if (!result.chartData || !Array.isArray(result.chartData)) {
    return { valid: false, error: '缺少 chartData 字段或格式错误' };
  }

  if (result.chartData.length !== 100) {
    return {
      valid: false,
      error: `chartData 必须包含 100 个数据点（当前: ${result.chartData.length}）`,
    };
  }

  // 验证每个数据点
  for (let i = 0; i < result.chartData.length; i++) {
    const point = result.chartData[i];
    const errorPrefix = `chartData[${i}]`;

    if (!point || typeof point !== 'object') {
      return { valid: false, error: `${errorPrefix} 不是有效对象` };
    }

    // 验证必需字段
    if (typeof point.age !== 'number') {
      return { valid: false, error: `${errorPrefix}.age 必须是数字` };
    }

    if (point.age < 1 || point.age > 100) {
      return {
        valid: false,
        error: `${errorPrefix}.age 必须在 1-100 范围内（当前: ${point.age}）`,
      };
    }

    if (typeof point.year !== 'number') {
      return { valid: false, error: `${errorPrefix}.year 必须是数字` };
    }

    if (!point.ganZhi || typeof point.ganZhi !== 'string') {
      return { valid: false, error: `${errorPrefix}.ganZhi 必须是非空字符串` };
    }

    // 验证 K线数据范围
    if (
      typeof point.open !== 'number' ||
      point.open < 0 ||
      point.open > 100
    ) {
      return {
        valid: false,
        error: `${errorPrefix}.open 必须在 0-100 范围内（当前: ${point.open}）`,
      };
    }

    if (
      typeof point.close !== 'number' ||
      point.close < 0 ||
      point.close > 100
    ) {
      return {
        valid: false,
        error: `${errorPrefix}.close 必须在 0-100 范围内（当前: ${point.close}）`,
      };
    }

    if (
      typeof point.high !== 'number' ||
      point.high < 0 ||
      point.high > 100
    ) {
      return {
        valid: false,
        error: `${errorPrefix}.high 必须在 0-100 范围内（当前: ${point.high}）`,
      };
    }

    if (typeof point.low !== 'number' || point.low < 0 || point.low > 100) {
      return {
        valid: false,
        error: `${errorPrefix}.low 必须在 0-100 范围内（当前: ${point.low}）`,
      };
    }

    if (
      typeof point.score !== 'number' ||
      point.score < 0 ||
      point.score > 10
    ) {
      return {
        valid: false,
        error: `${errorPrefix}.score 必须在 0-10 范围内（当前: ${point.score}）`,
      };
    }

    if (!point.reason || typeof point.reason !== 'string') {
      return { valid: false, error: `${errorPrefix}.reason 必须是非空字符串` };
    }

    // 验证 K线逻辑：high >= max(open, close) && low <= min(open, close)
    const maxOC = Math.max(point.open, point.close);
    const minOC = Math.min(point.open, point.close);

    if (point.high < maxOC) {
      return {
        valid: false,
        error: `${errorPrefix}.high (${point.high}) 必须 >= max(open, close) (${maxOC})`,
      };
    }

    if (point.low > minOC) {
      return {
        valid: false,
        error: `${errorPrefix}.low (${point.low}) 必须 <= min(open, close) (${minOC})`,
      };
    }
  }

  // 验证分析字段的评分
  const scoreFields: Array<keyof typeof analysis> = [
    'summaryScore',
    'personalityScore',
    'industryScore',
    'fengShuiScore',
    'wealthScore',
    'marriageScore',
    'healthScore',
    'familyScore',
    'cryptoScore',
  ];

  for (const field of scoreFields) {
    const score = analysis[field];
    if (typeof score !== 'number' || score < 0 || score > 10) {
      return {
        valid: false,
        error: `analysis.${field} 必须在 0-10 范围内`,
      };
    }
  }

  return { valid: true };
}

/**
 * 验证八字输入的合法性
 */
export function validateBaziInput(input: {
  yearPillar: string;
  monthPillar: string;
  dayPillar: string;
  hourPillar: string;
  startAge: string;
  firstDaYun: string;
}): { valid: boolean; error?: string } {
  const { yearPillar, monthPillar, dayPillar, hourPillar, startAge, firstDaYun } = input;

  // 验证干支格式（应该是2个中文字符）
  const ganZhiPattern = /^[\u4e00-\u9fa5]{2}$/;

  if (!ganZhiPattern.test(yearPillar)) {
    return { valid: false, error: '年柱格式错误（应为2个汉字，如"癸未"）' };
  }

  if (!ganZhiPattern.test(monthPillar)) {
    return { valid: false, error: '月柱格式错误（应为2个汉字）' };
  }

  if (!ganZhiPattern.test(dayPillar)) {
    return { valid: false, error: '日柱格式错误（应为2个汉字）' };
  }

  if (!ganZhiPattern.test(hourPillar)) {
    return { valid: false, error: '时柱格式错误（应为2个汉字）' };
  }

  if (!ganZhiPattern.test(firstDaYun)) {
    return { valid: false, error: '第一步大运格式错误（应为2个汉字）' };
  }

  // 验证起运年龄
  const age = parseInt(startAge, 10);
  if (isNaN(age) || age < 0 || age > 10) {
    return { valid: false, error: '起运年龄必须在 0-10 之间' };
  }

  return { valid: true };
}
