declare module 'lunar-javascript' {
  export class Solar {
    static fromYmdHms(
      year: number,
      month: number,
      day: number,
      hour: number,
      minute: number,
      second: number
    ): Solar;

    static fromYmd(year: number, month: number, day: number): Solar;

    getLunar(): Lunar;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    toDate(): Date;
  }

  export class Lunar {
    static fromYmd(year: number, month: number, day: number): Lunar;

    getEightChar(): EightChar;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getDayInChinese(): string;
    getSolar(): Solar;
    next(days: number): Lunar;
  }

  export class EightChar {
    getYear(): string;
    getMonth(): string;
    getDay(): string;
    getTime(): string;
    getYun(gender: number): Yun;
  }

  export class Yun {
    getStartYear(): number;
    getStartMonth(): number;
    getStartDay(): number;
    getDaYun(): DaYun[];
  }

  export class DaYun {
    getGanZhi(): string;
  }
}
