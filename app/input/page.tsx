'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserInput } from '@/types';
import { saveToLocalStorage, loadFromLocalStorage } from '@/lib/utils';
import StepIndicator from '@/components/shared/StepIndicator';
import BaziForm from '@/components/BaziForm';

export default function InputPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [userInput, setUserInput] = useState<UserInput | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string>('');

  // 在客户端挂载后从 localStorage 加载数据
  useEffect(() => {
    const savedData = loadFromLocalStorage<UserInput>('userInput');
    if (savedData) {
      setUserInput(savedData);
    }
  }, []);

  const handleBaziFormSubmit = async (data: UserInput) => {
    setUserInput(data);
    saveToLocalStorage('userInput', data);

    // 直接开始 AI 生成
    await handleAutoGenerate(data);
  };

  const handleAutoGenerate = async (data: UserInput) => {
    setIsGenerating(true);
    setGenerationError('');
    setCurrentStep(2); // 进度条显示为步骤 2

    try {
      const response = await fetch('/api/generate-destiny', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '生成失败');
      }

      // 保存结果数据
      saveToLocalStorage('lifeDestinyResult', result.data);
      saveToLocalStorage('userName', data.name || '未命名');

      // 跳转到结果页面
      router.push('/result');
    } catch (error) {
      console.error('自动生成失败:', error);
      setGenerationError(
        error instanceof Error ? error.message : '生成失败，请重试'
      );
      setCurrentStep(1); // 失败后回到步骤 1
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRetry = () => {
    setGenerationError('');
    setCurrentStep(1);
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
        <StepIndicator currentStep={currentStep} totalSteps={2} />

        {/* 内容卡片 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {/* 自动生成加载状态 */}
          {isGenerating && (
            <div className="text-center space-y-6">
              <div className="inline-block w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  正在生成您的人生 K 线图...
                </h2>
                <p className="text-gray-600 mb-4">
                  AI 正在分析您的八字命理，预计需要 30-60 秒
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left max-w-md mx-auto">
                  <p className="text-sm text-blue-800">
                    💡 生成中包含：30年运势数据、支撑/压力位分析、个性化行动建议
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 错误提示 */}
          {generationError && !isGenerating && (
            <div className="max-w-md mx-auto space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 mb-2">生成失败</h3>
                <p className="text-sm text-red-700 mb-4">{generationError}</p>
              </div>
              <button
                onClick={handleRetry}
                className="w-full px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                返回重新填写
              </button>
            </div>
          )}

          {/* 步骤 1: 填写八字信息 */}
          {!isGenerating && currentStep === 1 && (
            <BaziForm
              onSubmit={handleBaziFormSubmit}
              initialData={userInput || undefined}
            />
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
