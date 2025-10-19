import React from 'react';
import type { CodeExplanationPart } from '../types';
import { IconMessageCircle } from './Icons';

interface CodeExplanationProps {
  breakdown: CodeExplanationPart[];
}

const CodeExplanation: React.FC<CodeExplanationProps> = ({ breakdown }) => {
  return (
    <div>
        <h2 className="text-xl font-bold mb-6 text-slate-200 flex items-center">
            <IconMessageCircle className="w-6 h-6 mr-3 text-cyan-400" />
            Step-by-Step Code Explanation
        </h2>
        <div className="overflow-x-auto bg-slate-800 border border-slate-700 rounded-lg">
            <table className="w-full text-sm text-left text-slate-300">
                <thead className="text-xs text-cyan-300 uppercase bg-slate-700/50">
                    <tr>
                        <th scope="col" className="px-6 py-3 w-1/4">
                            Code Segment
                        </th>
                        <th scope="col" className="px-6 py-3 w-1/2">
                            Explanation
                        </th>
                        <th scope="col" className="px-6 py-3 w-1/4">
                            Purpose
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {breakdown.map((part, index) => (
                        <tr key={index} className="border-b border-slate-700 hover:bg-slate-700/50">
                            <td className="px-6 py-4 font-mono font-semibold text-amber-300 whitespace-nowrap">
                                {part.segment}
                            </td>
                            <td className="px-6 py-4 text-slate-300">
                                {part.explanation}
                            </td>
                            <td className="px-6 py-4 text-slate-400">
                                {part.purpose}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default CodeExplanation;