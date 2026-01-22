/**
 * 时辰常量定义
 * 中国传统12时辰对应24小时制
 */

export interface ShiChen {
  name: string;
  displayName: string;
  range: string;
  startHour: number;
  endHour: number;
  midHour: number; // 用于计算的中间时刻
}

export const SHI_CHEN_LIST: ShiChen[] = [
  {
    name: '子时',
    displayName: '子时（夜半）',
    range: '23:00-01:00',
    startHour: 23,
    endHour: 1,
    midHour: 0,
  },
  {
    name: '丑时',
    displayName: '丑时（鸡鸣）',
    range: '01:00-03:00',
    startHour: 1,
    endHour: 3,
    midHour: 2,
  },
  {
    name: '寅时',
    displayName: '寅时（平旦）',
    range: '03:00-05:00',
    startHour: 3,
    endHour: 5,
    midHour: 4,
  },
  {
    name: '卯时',
    displayName: '卯时（日出）',
    range: '05:00-07:00',
    startHour: 5,
    endHour: 7,
    midHour: 6,
  },
  {
    name: '辰时',
    displayName: '辰时（食时）',
    range: '07:00-09:00',
    startHour: 7,
    endHour: 9,
    midHour: 8,
  },
  {
    name: '巳时',
    displayName: '巳时（隅中）',
    range: '09:00-11:00',
    startHour: 9,
    endHour: 11,
    midHour: 10,
  },
  {
    name: '午时',
    displayName: '午时（日中）',
    range: '11:00-13:00',
    startHour: 11,
    endHour: 13,
    midHour: 12,
  },
  {
    name: '未时',
    displayName: '未时（日昳）',
    range: '13:00-15:00',
    startHour: 13,
    endHour: 15,
    midHour: 14,
  },
  {
    name: '申时',
    displayName: '申时（哺时）',
    range: '15:00-17:00',
    startHour: 15,
    endHour: 17,
    midHour: 16,
  },
  {
    name: '酉时',
    displayName: '酉时（日入）',
    range: '17:00-19:00',
    startHour: 17,
    endHour: 19,
    midHour: 18,
  },
  {
    name: '戌时',
    displayName: '戌时（黄昏）',
    range: '19:00-21:00',
    startHour: 19,
    endHour: 21,
    midHour: 20,
  },
  {
    name: '亥时',
    displayName: '亥时（人定）',
    range: '21:00-23:00',
    startHour: 21,
    endHour: 23,
    midHour: 22,
  },
];

export type ShiChenName = typeof SHI_CHEN_LIST[number]['name'];

/**
 * 根据时辰名称获取对应的小时数（用于计算）
 */
export function getHourFromShiChen(shiChenName: ShiChenName): number {
  const shiChen = SHI_CHEN_LIST.find((sc) => sc.name === shiChenName);
  if (!shiChen) {
    throw new Error(`Invalid shi chen name: ${shiChenName}`);
  }
  return shiChen.midHour;
}

/**
 * 根据小时数获取对应的时辰名称
 */
export function getShiChenFromHour(hour: number): ShiChenName {
  // 处理子时的特殊情况（23:00-01:00跨日）
  if (hour === 23 || hour === 0) {
    return '子时';
  }

  const shiChen = SHI_CHEN_LIST.find((sc) => {
    if (sc.name === '子时') return false; // 已经处理过了
    return hour >= sc.startHour && hour < sc.endHour;
  });

  return shiChen ? shiChen.name : '子时';
}
