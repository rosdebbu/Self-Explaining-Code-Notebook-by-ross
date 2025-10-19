
import React from 'react';
import { IconTable, IconLayoutGrid, IconCalculator, IconReportAnalytics } from './Icons';

interface DataFlowDiagramProps {
  currentStep: number;
  totalSteps: number;
}

const DataFlowDiagram: React.FC<DataFlowDiagramProps> = ({ currentStep, totalSteps }) => {
    const steps = [
        { name: 'Initial Data', icon: IconTable, stage: 0 },
        { name: 'Split', icon: IconLayoutGrid, stage: 1 },
        { name: 'Apply Mean', icon: IconCalculator, stage: 2 },
        { name: 'Combine', icon: IconReportAnalytics, stage: 3 },
    ];
    
    // Simple mapping: if there are 4 steps from API, map them 1:1 to diagram stages
    // currentStep is 0-indexed.
    const activeStage = currentStep;

    return (
        <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center">
                <IconLayoutGrid className="w-4 h-4 mr-2 text-cyan-400" />
                Data Flow
            </h3>
            <div className="flex items-center justify-between space-x-2">
                {steps.map((step, index) => {
                    const isActive = activeStage === step.stage;
                    const isCompleted = activeStage > step.stage;

                    return (
                        <React.Fragment key={step.name}>
                            <div className="flex flex-col items-center text-center w-1/4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 ${isActive ? 'bg-cyan-500 shadow-lg shadow-cyan-500/30' : isCompleted ? 'bg-slate-600' : 'bg-slate-700'}`}>
                                    <step.icon className={`w-6 h-6 ${isActive ? 'text-white' : isCompleted ? 'text-cyan-400' : 'text-slate-400'}`} />
                                </div>
                                <p className={`mt-2 text-xs font-medium ${isActive ? 'text-cyan-300' : 'text-slate-400'}`}>
                                    {step.name}
                                </p>
                            </div>

                            {index < steps.length - 1 && (
                                <div className={`flex-grow h-0.5 rounded-full ${isCompleted ? 'bg-cyan-500' : 'bg-slate-700'}`} />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default DataFlowDiagram;
