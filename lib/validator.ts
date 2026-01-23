import { LifeDestinyResult, KLinePoint, SupportPressureLevel, TenGod, ActionAdvice } from '@/types';

/**
 * 验证支撑/压力位数据
 */
function validateSupportPressureLevels(
  levels: SupportPressureLevel[] | undefined
): { valid: boolean; error?: string } {
  if (!levels) return { valid: true }; // 可选字段

  if (!Array.isArray(levels)) {
    return { valid: false, error: 'supportPressureLevels 必须是数组' };
  }

  for (let i = 0; i < levels.length; i++) {
    const level = levels[i];
    const errorPrefix = `supportPressureLevels[${i}]`;

    // 验证 value 范围（0-10）
    if (typeof level.value !== 'number' || level.value < 0 || level.value > 10) {
      return {
        valid: false,
        error: `${errorPrefix}.value 必须在 0-10 范围内（当前: ${level.value}）`,
      };
    }

    // 验证 age 范围（1-30）
    if (typeof level.age !== 'number' || level.age < 1 || level.age > 30) {
      return {
        valid: false,
        error: `${errorPrefix}.age 必须在 1-30 范围内（当前: ${level.age}）`,
      };
    }

    // 验证 type
    if (level.type !== 'support' && level.type !== 'pressure') {
      return {
        valid: false,
        error: `${errorPrefix}.type 必须是 'support' 或 'pressure'（当前: ${level.type}）`,
      };
    }

    // 验证 strength
    if (level.strength !== 'weak' && level.strength !== 'medium' && level.strength !== 'strong') {
      return {
        valid: false,
        error: `${errorPrefix}.strength 必须是 'weak', 'medium', 或 'strong'（当前: ${level.strength}）`,
      };
    }

    // 验证 reason
    if (!level.reason || typeof level.reason !== 'string') {
      return { valid: false, error: `${errorPrefix}.reason 必须是非空字符串` };
    }
  }

  return { valid: true };
}

/**
 * 验证十神类型
 */
function validateTenGod(tenGod: TenGod | undefined): boolean {
  if (!tenGod) return true; // 可选字段

  const validTenGods: TenGod[] = [
    '比肩', '劫财', '食神', '伤官', '偏财', '正财', '七杀', '正官', '偏印', '正印'
  ];
  return validTenGods.includes(tenGod);
}

/**
 * 验证能量分数
 */
function validateEnergyScore(
  energyScore: any,
  errorPrefix: string
): { valid: boolean; error?: string } {
  if (!energyScore) return { valid: true }; // 可选字段

  if (typeof energyScore !== 'object') {
    return { valid: false, error: `${errorPrefix}.energyScore 必须是对象` };
  }

  // 验证 total（0-10）
  if (typeof energyScore.total !== 'number' || energyScore.total < 0 || energyScore.total > 10) {
    return {
      valid: false,
      error: `${errorPrefix}.energyScore.total 必须在 0-10 范围内（当前: ${energyScore.total}）`,
    };
  }

  // 验证 monthCoefficient（0-10）
  if (typeof energyScore.monthCoefficient !== 'number' || energyScore.monthCoefficient < 0 || energyScore.monthCoefficient > 10) {
    return {
      valid: false,
      error: `${errorPrefix}.energyScore.monthCoefficient 必须在 0-10 范围内`,
    };
  }

  // 验证 dayRelation（0-10）
  if (typeof energyScore.dayRelation !== 'number' || energyScore.dayRelation < 0 || energyScore.dayRelation > 10) {
    return {
      valid: false,
      error: `${errorPrefix}.energyScore.dayRelation 必须在 0-10 范围内`,
    };
  }

  // 验证 hourFluctuation（0-10）
  if (typeof energyScore.hourFluctuation !== 'number' || energyScore.hourFluctuation < 0 || energyScore.hourFluctuation > 10) {
    return {
      valid: false,
      error: `${errorPrefix}.energyScore.hourFluctuation 必须在 0-10 范围内`,
    };
  }

  // 验证 isBelowSupport（boolean）
  if (typeof energyScore.isBelowSupport !== 'boolean') {
    return {
      valid: false,
      error: `${errorPrefix}.energyScore.isBelowSupport 必须是布尔值`,
    };
  }

  return { valid: true };
}

/**
 * 验证行动建议数据（可选字段）
 */
function validateActionAdvice(
  actionAdvice: ActionAdvice | undefined,
  errorPrefix: string
): { valid: boolean; error?: string } {
  if (!actionAdvice) return { valid: true }; // 可选字段

  // 验证 suggestions（必须3条）
  if (!Array.isArray(actionAdvice.suggestions) || actionAdvice.suggestions.length !== 3) {
    return {
      valid: false,
      error: `${errorPrefix}.actionAdvice.suggestions 必须包含3条建议（当前: ${actionAdvice.suggestions?.length || 0}）`,
    };
  }

  // 验证每条建议为非空字符串
  for (let i = 0; i < actionAdvice.suggestions.length; i++) {
    const suggestion = actionAdvice.suggestions[i];
    if (!suggestion || typeof suggestion !== 'string' || suggestion.trim().length === 0) {
      return {
        valid: false,
        error: `${errorPrefix}.actionAdvice.suggestions[${i}] 必须是非空字符串`,
      };
    }
  }

  // 验证 warnings（必须2条）
  if (!Array.isArray(actionAdvice.warnings) || actionAdvice.warnings.length !== 2) {
    return {
      valid: false,
      error: `${errorPrefix}.actionAdvice.warnings 必须包含2条规避提醒（当前: ${actionAdvice.warnings?.length || 0}）`,
    };
  }

  // 验证每条警告为非空字符串
  for (let i = 0; i < actionAdvice.warnings.length; i++) {
    const warning = actionAdvice.warnings[i];
    if (!warning || typeof warning !== 'string' || warning.trim().length === 0) {
      return {
        valid: false,
        error: `${errorPrefix}.actionAdvice.warnings[${i}] 必须是非空字符串`,
      };
    }
  }

  // 验证 basis（可选，但若有则必须是字符串）
  if (actionAdvice.basis !== undefined && typeof actionAdvice.basis !== 'string') {
    return {
      valid: false,
      error: `${errorPrefix}.actionAdvice.basis 必须是字符串`,
    };
  }

  // 验证 scenario（可选，但若有则必须是字符串）
  if (actionAdvice.scenario !== undefined && typeof actionAdvice.scenario !== 'string') {
    return {
      valid: false,
      error: `${errorPrefix}.actionAdvice.scenario 必须是字符串`,
    };
  }

  return { valid: true };
}

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

  if (result.chartData.length !== 30) {
    return {
      valid: false,
      error: `chartData 必须包含 30 个数据点（当前: ${result.chartData.length}）`,
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

    if (point.age < 1 || point.age > 30) {
      return {
        valid: false,
        error: `${errorPrefix}.age 必须在 1-30 范围内（当前: ${point.age}）`,
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

    // 验证十神（可选字段）
    if (point.tenGod && !validateTenGod(point.tenGod)) {
      return {
        valid: false,
        error: `${errorPrefix}.tenGod 必须是有效的十神类型（当前: ${point.tenGod}）`,
      };
    }

    // 验证能量分数（可选字段）
    const energyValidation = validateEnergyScore(point.energyScore, errorPrefix);
    if (!energyValidation.valid) {
      return energyValidation;
    }

    // 验证行动建议（可选字段）
    const actionAdviceValidation = validateActionAdvice(point.actionAdvice, errorPrefix);
    if (!actionAdviceValidation.valid) {
      return actionAdviceValidation;
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

  // 验证支撑/压力位（可选字段）
  const spValidation = validateSupportPressureLevels(analysis.supportPressureLevels);
  if (!spValidation.valid) {
    return spValidation;
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
