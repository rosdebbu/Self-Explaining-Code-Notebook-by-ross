
import React from 'react';
import { IconInfoCircle } from './Icons';

interface SummaryExplanationProps {
  summary: string;
}

const SummaryExplanation: React.FC<SummaryExplanationProps> = ({ summary }) => {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center">
        <IconInfoCircle className="w-4 h-4 mr-2 text-cyan-400" />
        Summary
      </h3>
      <p className="text-xs text-slate-400 leading-relaxed bg-slate-800/50 p-3 rounded-md border border-slate-700/50">
        {summary}
      </p>
    </div>
  );
};

export default SummaryExplanation;
