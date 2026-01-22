'use client';

import React, { useState } from 'react';
import { UserInput } from '@/types';
import { validateBaziInput } from '@/lib/validator';
import Button from './shared/Button';

interface BaziFormProps {
  onSubmit: (data: UserInput) => void;
  initialData?: Partial<UserInput>;
}

export default function BaziForm({ onSubmit, initialData }: BaziFormProps) {
  const [formData, setFormData] = useState<UserInput>({
    name: initialData?.name || '',
    gender: initialData?.gender || 'Male',
    birthYear: initialData?.birthYear || '',
    yearPillar: initialData?.yearPillar || '',
    monthPillar: initialData?.monthPillar || '',
    dayPillar: initialData?.dayPillar || '',
    hourPillar: initialData?.hourPillar || '',
    startAge: initialData?.startAge || '',
    firstDaYun: initialData?.firstDaYun || '',
  });

  const [error, setError] = useState<string>('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 验证必填字段
    if (
      !formData.birthYear ||
      !formData.yearPillar ||
      !formData.monthPillar ||
      !formData.dayPillar ||
      !formData.hourPillar ||
      !formData.startAge ||
      !formData.firstDaYun
    ) {
      setError('请填写所有必填字段');
      return;
    }

    // 验证八字格式
    const validation = validateBaziInput({
      yearPillar: formData.yearPillar,
      monthPillar: formData.monthPillar,
      dayPillar: formData.dayPillar,
      hourPillar: formData.hourPillar,
      startAge: formData.startAge,
      firstDaYun: formData.firstDaYun,
    });

    if (!validation.valid) {
      setError(validation.error || '输入格式错误');
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          第一步：输入八字信息
        </h2>
        <p className="text-gray-600">
          请填写您的出生信息和八字四柱
        </p>
      </div>

      {/* 姓名（可选） */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          姓名（可选）
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="张三"
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
            onClick={() =>
              setFormData((prev) => ({ ...prev, gender: 'Male' }))
            }
            className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${formData.gender === 'Male'
                ? 'border-red-600 bg-red-50 text-red-600 font-semibold'
                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
          >
            乾造（男）
          </button>
          <button
            type="button"
            onClick={() =>
              setFormData((prev) => ({ ...prev, gender: 'Female' }))
            }
            className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${formData.gender === 'Female'
                ? 'border-red-600 bg-red-50 text-red-600 font-semibold'
                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
          >
            坤造（女）
          </button>
        </div>
      </div>

      {/* 出生年份 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          出生年份（公历） <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          name="birthYear"
          value={formData.birthYear}
          onChange={handleChange}
          placeholder="2003"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
      </div>

      {/* 四柱 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          四柱干支 <span className="text-red-600">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">年柱</label>
            <input
              type="text"
              name="yearPillar"
              value={formData.yearPillar}
              onChange={handleChange}
              placeholder="癸未"
              maxLength={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-center"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">月柱</label>
            <input
              type="text"
              name="monthPillar"
              value={formData.monthPillar}
              onChange={handleChange}
              placeholder="壬戌"
              maxLength={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-center"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">日柱</label>
            <input
              type="text"
              name="dayPillar"
              value={formData.dayPillar}
              onChange={handleChange}
              placeholder="丙子"
              maxLength={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-center"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">时柱</label>
            <input
              type="text"
              name="hourPillar"
              value={formData.hourPillar}
              onChange={handleChange}
              placeholder="庚寅"
              maxLength={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-center"
            />
          </div>
        </div>
      </div>

      {/* 起运年龄 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          起运年龄（虚岁） <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          name="startAge"
          value={formData.startAge}
          onChange={handleChange}
          placeholder="3"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">通常在 0-10 岁之间</p>
      </div>

      {/* 第一步大运 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          第一步大运干支 <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          name="firstDaYun"
          value={formData.firstDaYun}
          onChange={handleChange}
          placeholder="辛酉"
          maxLength={2}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* 提交按钮 */}
      <div className="pt-4">
        <Button type="submit" variant="primary" className="w-full">
          下一步：生成提示词
        </Button>
      </div>
    </form>
  );
}
