import { Solar, Lunar } from 'lunar-javascript';
import { KLinePoint, TimeRange } from '@/types';

/**
 * 计算虚岁
 * 规则：出生即1岁，每过一个农历新年+1岁
 * @param birthDate 出生日期
 * @param currentDate 当前日期
 * @returns 虚岁年龄
 */
export function calculateVirtualAge(birthDate: Date, currentDate: Date): number {
  const birthSolar = Solar.fromYmdHms(
    birthDate.getFullYear(),
    birthDate.getMonth() + 1,
    birthDate.getDate(),
    0, 0, 0
  );
  const birthLunar = birthSolar.getLunar();
  const birthLunarYear = birthLunar.getYear();

  const currentSolar = Solar.fromYmdHms(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    currentDate.getDate(),
    0, 0, 0
  );
  const currentLunar = currentSolar.getLunar();
  const currentLunarYear = currentLunar.getYear();

  // 虚岁 = 农历年数差 + 1
  return currentLunarYear - birthLunarYear + 1;
}

/**
 * 获取日视图日期范围（当前日期 ± 7天）
 * @param currentDate 基准日期（默认为今天）
 * @returns 时间范围对象
 */
export function getDailyViewRange(currentDate: Date = new Date()): TimeRange {
  const start = new Date(currentDate);
  start.setDate(start.getDate() - 7);

  const end = new Date(currentDate);
  end.setDate(end.getDate() + 7);

  return { start, end, granularity: 'day' };
}

/**
 * 获取周视图日期范围（当前日期 ± 1个月）
 * @param currentDate 基准日期（默认为今天）
 * @returns 时间范围对象
 */
export function getWeeklyViewRange(currentDate: Date = new Date()): TimeRange {
  const start = new Date(currentDate);
  start.setMonth(start.getMonth() - 1);

  const end = new Date(currentDate);
  end.setMonth(end.getMonth() + 1);

  return { start, end, granularity: 'week' };
}

/**
 * 获取某个农历年的春节日期（正月初一）
 * @param lunarYear 农历年份
 * @returns 春节公历日期
 */
export function getChineseNewYearDate(lunarYear: number): Date {
  // 创建指定农历年的正月初一
  const lunar = Lunar.fromYmd(lunarYear, 1, 1);
  const solar = lunar.getSolar();

  return new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay());
}

/**
 * 将特定日期映射到对应的年度数据点
 * @param date 查询日期
 * @param birthDate 出生日期
 * @param chartData 年度K线数据
 * @returns 对应的年度数据点，如果找不到则返回null
 */
export function getYearDataForDate(
  date: Date,
  birthDate: Date,
  chartData: KLinePoint[]
): KLinePoint | null {
  const age = calculateVirtualAge(birthDate, date);
  return chartData.find(point => point.age === age) || null;
}
