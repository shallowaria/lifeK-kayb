'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserInput, LifeDestinyResult } from '@/types';
import { saveToLocalStorage, loadFromLocalStorage } from '@/lib/utils';
import StepIndicator from '@/components/shared/StepIndicator';
import BaziForm from '@/components/BaziForm';
import PromptGenerator from '@/components/PromptGenerator';
import JsonImporter from '@/components/JsonImporter';

export default function InputPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [userInput, setUserInput] = useState<UserInput | null>(null);

  // 在客户端挂载后从 localStorage 加载数据
  useEffect(() => {
    const savedData = loadFromLocalStorage<UserInput>('userInput');
    if (savedData) {
      setUserInput(savedData);
    }
  }, []);

  const handleBaziFormSubmit = (data: UserInput) => {
    setUserInput(data);
    saveToLocalStorage('userInput', data);
    setCurrentStep(2);
  };

  const handlePromptNext = () => {
    setCurrentStep(3);
  };

  const handlePromptBack = () => {
    setCurrentStep(1);
  };

  const handleJsonImport = (data: LifeDestinyResult) => {
    // 保存结果数据
    saveToLocalStorage('lifeDestinyResult', data);
    saveToLocalStorage('userName', userInput?.name || '未命名');

    // 跳转到结果页面
    router.push('/result');
  };

  const handleJsonBack = () => {
    setCurrentStep(2);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 via-orange-50 to-yellow-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            人生K线图
          </h1>
          <p className="text-lg text-gray-600">
            用 AI 和八字命理绘制您的人生运势曲线
          </p>
        </div>

        {/* 步骤指示器 */}
        <StepIndicator currentStep={currentStep} totalSteps={3} />

        {/* 内容卡片 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {currentStep === 1 && (
            <BaziForm
              onSubmit={handleBaziFormSubmit}
              initialData={userInput || undefined}
            />
          )}

          {currentStep === 2 && userInput && (
            <PromptGenerator
              userInput={userInput}
              onNext={handlePromptNext}
              onBack={handlePromptBack}
            />
          )}

          {currentStep === 3 && (
            <JsonImporter onImport={handleJsonImport} onBack={handleJsonBack} />
          )}
        </div>

        {/* 免责声明 */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            本工具仅供娱乐参考，命理分析由 AI 生成，不构成任何投资建议。
          </p>
        </div>
      </div>
    </div>
  );
}
