import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function StepIndicator({
  currentStep,
  totalSteps,
}: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <React.Fragment key={step}>
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-colors ${
              step === currentStep
                ? 'bg-red-600 text-white'
                : step < currentStep
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            {step}
          </div>
          {step < totalSteps && (
            <div
              className={`w-12 h-1 transition-colors ${
                step < currentStep ? 'bg-green-600' : 'bg-gray-200'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
