/**
 * 八字计算核心模块
 * 封装 lunar-javascript 的调用逻辑
 */

import { Solar } from 'lunar-javascript';
import { Gender } from '@/types';
import { getHourFromShiChen, ShiChenName } from './constants/shi-chen';

export interface BaziCalculationInput {
  birthDate: Date; // 公历日期
  shiChen: ShiChenName; // 时辰名称
  gender: Gender; // 性别
}

export interface BaziCalculationResult {
  yearPillar: string; // 年柱
  monthPillar: string; // 月柱
  dayPillar: string; // 日柱
  hourPillar: string; // 时柱
  startAge: string; // 起运年龄（虚岁）
  birthYear: string; // 出生年份
}

/**
 * 计算八字信息
 */
export function calculateBazi(
  input: BaziCalculationInput
): BaziCalculationResult {
  try {
    const { birthDate, shiChen, gender } = input;

    // 获取时辰对应的小时数
    const hour = getHourFromShiChen(shiChen);

    // 创建 Solar 对象（公历日期）
    const solar = Solar.fromYmdHms(
      birthDate.getFullYear(),
      birthDate.getMonth() + 1, // lunar-javascript 月份从1开始
      birthDate.getDate(),
      hour,
      0, // 分钟
      0  // 秒
    );

    // 获取农历对象
    const lunar = solar.getLunar();

    // 获取八字对象
    const eightChar = lunar.getEightChar();

    // 获取四柱
    const yearPillar = eightChar.getYear(); // 年柱
    const monthPillar = eightChar.getMonth(); // 月柱
    const dayPillar = eightChar.getDay(); // 日柱
    const hourPillar = eightChar.getTime(); // 时柱

    // 获取运信息（起运年龄）
    const startAge = calculateStartAge(eightChar, gender);

    return {
      yearPillar,
      monthPillar,
      dayPillar,
      hourPillar,
      startAge: startAge.toString(),
      birthYear: birthDate.getFullYear().toString(),
    };
  } catch (error) {
    console.error('八字计算失败:', error);
    throw new Error('八字计算失败，请检查输入信息是否正确');
  }
}

/**
 * 计算起运年龄
 */
function calculateStartAge(
  eightChar: any,
  gender: Gender
): number {
  try {
    // lunar-javascript 使用 1 表示男性，0 表示女性
    const genderCode = gender === 'Male' ? 1 : 0;

    // 获取运对象
    const yun = eightChar.getYun(genderCode);

    // 获取起运年龄（lunar-javascript 返回周岁）
    const startYear = yun.getStartYear();
    const startMonth = yun.getStartMonth();

    // 转换为虚岁：周岁 + 1，如果月数>=6则再+1
    let startAge = startYear + 1; // 虚岁 = 周岁 + 1
    if (startMonth >= 6) {
      startAge += 1; // 如果超过半年，再加1岁
    }

    // 确保起运年龄在合理范围内（0-10岁）
    if (startAge < 0) startAge = 0;
    if (startAge > 10) startAge = 10;

    return startAge;
  } catch (error) {
    console.error('起运年龄计算失败:', error);
    // 返回默认值
    return 3;
  }
}

/**
 * 验证输入
 */
export function validateBaziCalculationInput(
  input: BaziCalculationInput
): { valid: boolean; error?: string } {
  const { birthDate, shiChen, gender } = input;

  // 验证日期
  if (!(birthDate instanceof Date) || isNaN(birthDate.getTime())) {
    return { valid: false, error: '出生日期无效' };
  }

  // 验证日期范围（1900-2100年）
  const year = birthDate.getFullYear();
  if (year < 1900 || year > 2100) {
    return { valid: false, error: '出生年份必须在 1900-2100 年之间' };
  }

  // 验证性别
  if (gender !== 'Male' && gender !== 'Female') {
    return { valid: false, error: '性别必须是 Male 或 Female' };
  }

  // 验证时辰
  const validShiChens = [
    '子时',
    '丑时',
    '寅时',
    '卯时',
    '辰时',
    '巳时',
    '午时',
    '未时',
    '申时',
    '酉时',
    '戌时',
    '亥时',
  ];
  if (!validShiChens.includes(shiChen)) {
    return { valid: false, error: '时辰选择无效' };
  }

  return { valid: true };
}
