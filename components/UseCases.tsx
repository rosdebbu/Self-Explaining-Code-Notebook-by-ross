import React from 'react';
import type { UseCase } from '../types';
import { 
    IconLoader, 
    IconBulb, 
    IconAlertTriangle,
    IconShoppingCart,
    IconChartLine,
    IconHeartbeat,
    IconDeviceGamepad,
    IconFlask,
    IconUsers,
    IconSparkles
} from './Icons';

interface UseCasesProps {
  code: string;
  useCases: UseCase[] | null;
  isLoading: boolean;
  error: string | null;
  hasRun: boolean;
  onGenerate: () => void;
}

const iconMap: { [key: string]: React.FC<React.SVGProps<SVGSVGElement>> } = {
  'shopping-cart': IconShoppingCart,
  'finance': IconChartLine,
  'health': IconHeartbeat,
  'gaming': IconDeviceGamepad,
  'science': IconFlask,
  'social': IconUsers,
  'default': IconSparkles,
};


const UseCases: React.FC<UseCasesProps> = ({ code, useCases, isLoading, error, hasRun, onGenerate }) => {

    const renderInitialState = () => (
        <div className="text-center">
            <IconBulb className="w-16 h-16 text-cyan-500 mb-4 mx-auto" />
            <h2 className="text-xl font-bold text-slate-200">Real-World Use Cases</h2>
            <p className="text-slate-400 mt-2 max-w-md mx-auto">
                First, run an explanation on the 'Code' tab. Then, come back here to discover how your code is used in practice.
            </p>
        </div>
    );

    const renderReadyToGenerateState = () => (
        <div className="text-center">
            <IconBulb className="w-16 h-16 text-cyan-500 mb-4 mx-auto" />
            <h2 className="text-xl font-bold text-slate-200">Ready to Explore?</h2>
            <p className="text-slate-400 mt-2 max-w-md mx-auto">
                Discover where this pandas operation can be applied in real-world data analysis scenarios.
            </p>
            <button
                onClick={onGenerate}
                disabled={isLoading}
                className="mt-6 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-600 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center mx-auto"
            >
                {isLoading ? <IconLoader className="animate-spin" /> : <IconSparkles className="mr-2"/>}
                Generate Use Cases
            </button>
        </div>
    );
    
    return (
        <div className="p-6 h-full flex flex-col">
            <div className="flex-shrink-0 flex items-center mb-6">
                <IconBulb className="w-8 h-8 mr-3 text-cyan-400" />
                <div>
                    <h2 className="text-xl font-bold text-slate-200">Use Cases</h2>
                    <p className="text-sm text-slate-400">Practical applications for: <code className="bg-slate-700 text-amber-300 px-1.5 py-0.5 rounded text-xs">{code}</code></p>
                </div>
            </div>

            <div className="flex-grow flex items-center justify-center">
                {!hasRun && !isLoading && renderInitialState()}
                {hasRun && !useCases && !isLoading && !error && renderReadyToGenerateState()}

                {isLoading && (
                    <div className="text-center">
                        <IconLoader className="w-10 h-10 animate-spin text-cyan-400 mx-auto" />
                        <p className="mt-3 text-slate-300">Generating real-world scenarios...</p>
                    </div>
                )}

                {error && (
                    <div className="text-center text-red-400 p-4 bg-red-900/50 rounded-lg max-w-md mx-auto">
                        <IconAlertTriangle className="w-10 h-10 mx-auto mb-2" />
                        <h3 className="font-bold">Error Generating Use Cases</h3>
                        <p className="text-sm">{error}</p>
                    </div>
                )}
                
                {useCases && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
                        {useCases.map((uc, index) => {
                            const Icon = iconMap[uc.icon] || iconMap.default;
                            return (
                                <div key={index} className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 flex flex-col hover:border-cyan-500/50 transition-colors duration-300">
                                    <div className="flex items-center mb-4">
                                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center mr-4">
                                            <Icon className="w-6 h-6 text-cyan-400" />
                                        </div>
                                        <h3 className="font-bold text-lg text-slate-100">{uc.title}</h3>
                                    </div>
                                    <p className="text-slate-400 text-sm leading-relaxed">
                                        {uc.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}

            </div>
        </div>
    );
};

export default UseCases;
