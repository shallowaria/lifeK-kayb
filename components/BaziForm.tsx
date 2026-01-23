'use client';

import React, { useState, useEffect } from 'react';
import { UserInput, Gender, ShiChenName } from '@/types';
import { calculateBazi, validateBaziCalculationInput } from '@/lib/bazi-calculator';
import { SHI_CHEN_LIST } from '@/lib/constants/shi-chen';
import Button from './shared/Button';

interface BaziFormProps {
  onSubmit: (data: UserInput, autoGenerate?: boolean) => void | Promise<void>;
  initialData?: Partial<UserInput>;
}

export default function BaziForm({ onSubmit, initialData }: BaziFormProps) {
  // 用户输入的原始数据
  const [name, setName] = useState(initialData?.name || '');
  const [gender, setGender] = useState<Gender>(initialData?.gender || 'Male');
  const [birthDate, setBirthDate] = useState(''); // YYYY-MM-DD 格式
  const [shiChen, setShiChen] = useState<ShiChenName>('子时');

  // 计算结果（自动填充）
  const [calculatedData, setCalculatedData] = useState<UserInput | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState<string>('');


  // 当日期、时辰或性别变化时，自动计算八字
  useEffect(() => {
    if (birthDate && shiChen && gender) {
      handleCalculate();
    }
  }, [birthDate, shiChen, gender]);

  const handleCalculate = () => {
    setError('');
    setCalculating(true);

    try {
      // 解析日期字符串
      const dateObj = new Date(birthDate);

      // 验证输入
      const validation = validateBaziCalculationInput({
        birthDate: dateObj,
        shiChen,
        gender,
      });

      if (!validation.valid) {
        setError(validation.error || '输入信息无效');
        setCalculatedData(null);
        return;
      }

      // 计算八字
      const result = calculateBazi({
        birthDate: dateObj,
        shiChen,
        gender,
      });

      // 填充到 UserInput 格式
      const userData: UserInput = {
        name,
        gender,
        birthYear: result.birthYear,
        birthDate: birthDate,  // 保存完整日期 (YYYY-MM-DD)
        yearPillar: result.yearPillar,
        monthPillar: result.monthPillar,
        dayPillar: result.dayPillar,
        hourPillar: result.hourPillar,
        startAge: result.startAge,
      };

      setCalculatedData(userData);
    } catch (err: unknown) {
      setError('计算失败，请检查输入信息');
      setCalculatedData(null);
    } finally {
      setCalculating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!calculatedData) {
      setError('请先填写出生日期和时辰');
      return;
    }

    // 自动生成模式
    onSubmit(calculatedData, true);
  };

  const handleManualMode = () => {
    if (!calculatedData) {
      setError('请先填写出生日期和时辰');
      return;
    }

    // 手动模式
    onSubmit(calculatedData, false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          第一步：输入出生信息
        </h2>
        <p className="text-gray-600">
          填写您的出生日期和时辰，系统将自动计算八字
        </p>
      </div>

      {/* 姓名（可选） */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          姓名（可选）
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="凯布"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
      </div>

      {/* 性别 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          性别 <span className="text-red-600">*</span>
        </label>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setGender('Male')}
            className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${gender === 'Male'
              ? 'border-red-600 bg-red-50 text-red-600 font-semibold'
              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
          >
            乾造（男）
          </button>
          <button
            type="button"
            onClick={() => setGender('Female')}
            className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${gender === 'Female'
              ? 'border-red-600 bg-red-50 text-red-600 font-semibold'
              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
          >
            坤造（女）
          </button>
        </div>
      </div>

      {/* 出生日期 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor='birthDate'>
          出生日期（公历） <span className="text-red-600">*</span>
        </label>
        <input
          id='birthDate'
          title="出生日期"
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          min="1900-01-01"
          max="2100-12-31"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">请选择公历（阳历）日期</p>
      </div>

      {/* 出生时辰 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          出生时辰 <span className="text-red-600">*</span>
        </label>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {SHI_CHEN_LIST.map((sc) => (
            <button
              key={sc.name}
              type="button"
              onClick={() => setShiChen(sc.name as ShiChenName)}
              className={`py-2 px-3 rounded-lg border-2 transition-colors text-sm ${shiChen === sc.name
                ? 'border-red-600 bg-red-50 text-red-600 font-semibold'
                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
            >
              <div className="font-medium">{sc.name}</div>
              <div className="text-xs opacity-70">{sc.range}</div>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          不确定时辰？询问家人或查看出生证明
        </p>
      </div>

      {/* 计算结果展示 */}
      {calculating && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-700 text-center">计算中...</p>
        </div>
      )}

      {calculatedData && !calculating && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 space-y-4">
          <h3 className="font-semibold text-green-900 text-center mb-4">
            八字计算结果
          </h3>

          {/* 四柱展示 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              四柱干支
            </label>
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center">
                <div className="text-xs text-gray-600 mb-1">年柱</div>
                <div className="text-2xl font-bold text-gray-900 bg-white rounded-lg py-2">
                  {calculatedData.yearPillar}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-600 mb-1">月柱</div>
                <div className="text-2xl font-bold text-gray-900 bg-white rounded-lg py-2">
                  {calculatedData.monthPillar}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-600 mb-1">日柱</div>
                <div className="text-2xl font-bold text-gray-900 bg-white rounded-lg py-2">
                  {calculatedData.dayPillar}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-600 mb-1">时柱</div>
                <div className="text-2xl font-bold text-gray-900 bg-white rounded-lg py-2">
                  {calculatedData.hourPillar}
                </div>
              </div>
            </div>
          </div>

          {/* 起运信息 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              起运年龄
            </label>
            <div className="text-lg font-semibold text-gray-900 bg-white rounded-lg py-2 px-3">
              {calculatedData.startAge} 岁
            </div>
          </div>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* 提交按钮 */}
      <div className="space-y-4 pt-4">
        {/* 主按钮：AI 自动生成 */}
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={!calculatedData || calculating}
        >
          {calculatedData ? '🤖 AI 自动生成（推荐）' : '请先填写完整信息'}
        </Button>

        {/* 备用按钮：手动导入模式 */}
        {calculatedData && (
          <button
            type="button"
            onClick={handleManualMode}
            className="w-full px-4 py-3 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg border border-gray-300 transition-colors"
          >
            或使用手动导入模式（生成提示词）
          </button>
        )}
      </div>

      {/* 说明 */}
      <div className="text-center text-xs text-gray-500 space-y-1 pt-2">
        <p>• AI 自动生成：一键完成，约 30-60 秒</p>
        <p>• 手动模式：复制提示词到 ChatGPT/Claude 等 AI 工具</p>
        <p className="pt-2 border-t border-gray-200 mt-3">
          系统使用 lunar-javascript 库自动计算八字
        </p>
        <p>计算基于标准时间（东八区），不考虑真太阳时调整</p>
      </div>
    </form>
  );
}
