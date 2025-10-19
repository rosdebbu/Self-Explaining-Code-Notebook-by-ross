import React, { useEffect, useRef } from 'react';
import type { ExplanationStep } from '../types';
import { IconListDetails } from './Icons';

interface ExecutionLogProps {
  steps: ExplanationStep[];
  currentStep: number;
  onStepSelect: (index: number) => void;
}

const ExecutionLog: React.FC<ExecutionLogProps> = ({ steps, currentStep, onStepSelect }) => {
  const activeItemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll the active step into view if it's not visible
    activeItemRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
  }, [currentStep]);

  return (
    <div className="h-full flex flex-col bg-slate-800">
      <h3 className="text-sm font-semibold text-slate-300 p-3 border-b border-slate-700 flex items-center flex-shrink-0">
        <IconListDetails className="w-4 h-4 mr-2 text-cyan-400" />
        Execution Log
      </h3>
      <div className="overflow-y-auto flex-grow">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          return (
            <div
              key={index}
              ref={isActive ? activeItemRef : null}
              onClick={() => onStepSelect(index)}
              className={`p-2.5 text-xs border-l-4 cursor-pointer transition-all duration-200 ${
                isActive
                  ? 'border-cyan-400 bg-cyan-900/40 text-slate-100'
                  : 'border-transparent hover:bg-slate-700/50 text-slate-400'
              }`}
            >
              <span className={`font-bold ${isActive ? 'text-cyan-300' : 'text-slate-300'}`}>
                Step {index + 1}:
              </span>{' '}
              {step.title}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExecutionLog;
