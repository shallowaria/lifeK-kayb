import { Solar } from 'lunar-javascript';
import { KLinePoint, InterpolatedKLinePoint, TimeRange } from '@/types';
import { calculateVirtualAge, getChineseNewYearDate } from './date-utils';

/**
 * 线性插值辅助函数
 * @param start 起始值
 * @param end 结束值
 * @param t 进度 (0.0 到 1.0)
 * @returns 插值结果
 */
function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * 计算每日干支（日柱）
 * @param date 日期
 * @returns 日柱干支
 */
function calculateDayGanZhi(date: Date): string {
  const solar = Solar.fromYmdHms(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    0, 0, 0
  );
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();
  return eightChar.getDay(); // 返回日柱
}

/**
 * 插值生成单个K线数据点
 * 在两个年度数据点之间进行线性插值，并添加日间波动
 * @param yearData 当前年度数据
 * @param nextYearData 下一年度数据
 * @param progress 进度 (0.0 到 1.0)
 * @returns 插值后的K线数据（部分）
 */
function interpolateKLinePoint(
  yearData: KLinePoint,
  nextYearData: KLinePoint,
  progress: number
): Partial<InterpolatedKLinePoint> {
  // 基础值的线性插值
  const baseOpen = lerp(yearData.open, nextYearData.open, progress);
  const baseClose = lerp(yearData.close, nextYearData.close, progress);

  // 添加日间随机波动（±5%）
  const variation = 0.05;
  const openVariation = 1 + (Math.random() - 0.5) * variation;
  const closeVariation = 1 + (Math.random() - 0.5) * variation;

  const open = Math.round(baseOpen * openVariation * 10) / 10;
  const close = Math.round(baseClose * closeVariation * 10) / 10;

  // high 和 low 基于 open/close 计算
  const maxOC = Math.max(open, close);
  const minOC = Math.min(open, close);
  const high = Math.round((maxOC + Math.random() * 2) * 10) / 10;
  const low = Math.round(Math.max(0, minOC - Math.random() * 2) * 10) / 10;

  return {
    open,
    close,
    high,
    low,
    score: Math.round(lerp(yearData.score, nextYearData.score, progress) * 10) / 10,
  };
}

/**
 * 生成每日运势描述
 * @param date 日期
 * @param yearData 对应的年度数据
 * @returns 每日运势描述
 */
function generateDailyReason(date: Date, yearData: KLinePoint): string {
  // 提取年度描述的前半部分作为基础
  const baseReason = yearData.reason.substring(0, 12);

  // 获取农历日期信息
  const solar = Solar.fromYmdHms(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    0, 0, 0
  );
  const lunar = solar.getLunar();
  const dayInChinese = lunar.getDayInChinese();

  return `${baseReason}（${dayInChinese}）`;
}

/**
 * 核心插值函数：从年度数据生成日级/周级数据
 * @param range 时间范围
 * @param birthDate 出生日期
 * @param chartData 年度K线数据
 * @returns 插值后的每日K线数据
 */
export function interpolateDailyData(
  range: TimeRange,
  birthDate: Date,
  chartData: KLinePoint[]
): InterpolatedKLinePoint[] {
  const result: InterpolatedKLinePoint[] = [];
  const currentDate = new Date(range.start);

  while (currentDate <= range.end) {
    // 获取当前虚岁
    const age = calculateVirtualAge(birthDate, currentDate);

    // 找到当前年和下一年的数据点
    const currentYearData = chartData.find(p => p.age === age);
    const nextYearData = chartData.find(p => p.age === age + 1);

    if (!currentYearData) {
      // 如果找不到对应年份数据，跳过这一天
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }

    // 计算当前日期在该农历年内的进度（0.0 到 1.0）
    const birthSolar = Solar.fromYmdHms(
      birthDate.getFullYear(),
      birthDate.getMonth() + 1,
      birthDate.getDate(),
      0, 0, 0
    );
    const birthLunar = birthSolar.getLunar();
    const birthLunarYear = birthLunar.getYear();

    // 计算当前年对应的农历年
    const currentLunarYear = birthLunarYear + age - 1;

    const yearStart = getChineseNewYearDate(currentLunarYear);
    const yearEnd = getChineseNewYearDate(currentLunarYear + 1);
    const daysSinceYearStart =
      (currentDate.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24);
    const totalDaysInYear =
      (yearEnd.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24);
    const progress = Math.max(0, Math.min(1, daysSinceYearStart / totalDaysInYear));

    // 进行插值计算
    const interpolated = interpolateKLinePoint(
      currentYearData,
      nextYearData || currentYearData, // 如果没有下一年数据，使用当前年
      progress
    );

    // 构建完整的数据点
    result.push({
      age,
      year: currentDate.getFullYear(),
      ganZhi: calculateDayGanZhi(currentDate),
      daYun: currentYearData.daYun,
      open: interpolated.open!,
      close: interpolated.close!,
      high: interpolated.high!,
      low: interpolated.low!,
      score: interpolated.score!,
      reason: generateDailyReason(currentDate, currentYearData),
      date: currentDate.toISOString().split('T')[0], // YYYY-MM-DD
      isInterpolated: true,
    });

    // 移到下一天
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return result;
}
