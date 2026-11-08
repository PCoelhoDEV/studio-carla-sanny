import React from 'react';
import { Check, Sparkles, Calendar, User, HeartHandshake } from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Serviço', icon: Sparkles },
  { id: 2, label: 'Data & Hora', icon: Calendar },
  { id: 3, label: 'Seus Dados', icon: User },
  { id: 4, label: 'Confirmar', icon: HeartHandshake }
];

export default function StepProgressBar({ currentStep, onStepClick, largeTextMode }) {
  return (
    <div className="max-w-md mx-auto px-4 py-2">
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-2.5 border border-rose-100 shadow-xs">
        <div className="grid grid-cols-4 gap-1">
          {STEPS.map((step) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            const Icon = step.icon;

            return (
              <button
                key={step.id}
                onClick={() => {
                  if (step.id < currentStep) {
                    onStepClick(step.id);
                  }
                }}
                disabled={step.id > currentStep}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${
                  isCurrent 
                    ? 'bg-gradient-to-b from-rose-500 to-rose-600 text-white shadow-sm' 
                    : isCompleted
                    ? 'bg-rose-50 text-rose-800 hover:bg-rose-100/70 cursor-pointer'
                    : 'text-stone-400 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center mb-1 text-xs font-bold transition-all ${
                  isCurrent
                    ? 'bg-white/20 text-white'
                    : isCompleted
                    ? 'bg-rose-600 text-white'
                    : 'bg-stone-100 text-stone-400'
                }`}>
                  {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : step.id}
                </div>
                <span className={`text-[11px] font-semibold text-center leading-tight truncate w-full ${
                  largeTextMode ? 'text-xs' : 'text-[11px]'
                }`}>
                  {step.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
