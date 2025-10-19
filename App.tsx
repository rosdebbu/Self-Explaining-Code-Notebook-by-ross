import React from 'react';
import { useState, useCallback, useRef, useEffect } from 'react';
import type { ExplanationResponse, CodeExplanationPart, QuizFeedback, UseCase } from './types';
import { generateExplanation, generateConceptExplanation, generateCodeExplanation, generateQuizQuestion, evaluateAnswer, generateUseCases } from './services/geminiService';
import CodeEditor from './components/CodeEditor';
import ExplanationVisualizer from './components/ExplanationVisualizer';
import KnowledgeBase from './components/KnowledgeBase';
import DataFlowDiagram from './components/DataFlowDiagram';
import SummaryExplanation from './components/SummaryExplanation';
import ExecutionLog from './components/ExecutionLog';
import CodeExplanation from './components/CodeExplanation';
import AITutor from './components/AITutor';
import UseCases from './components/UseCases';
import { INITIAL_CODE } from './constants';
import { 
  IconPlayerPlay, IconLoader, IconAlertTriangle, IconChevronLeft, IconChevronRight, 
  IconPlayerPause, IconPlayerTrackNext, IconPlayerTrackPrev, IconCode, IconChartBar, 
  IconSitemap, IconBook, IconSchool, IconMessageCircle, IconBulb
} from './components/Icons';

type TabID = 'code' | 'visualization' | 'structure' | 'explanation' | 'docs' | 'tutor' | 'useCases';

const App: React.FC = () => {
  const [code, setCode] = useState<string>(INITIAL_CODE);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<ExplanationResponse | null>(null);
  const [codeExplanation, setCodeExplanation] = useState<CodeExplanationPart[] | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<TabID>('code');

  // State for Knowledge Base
  const [kbTopic, setKbTopic] = useState<string | null>(null);
  const [kbContent, setKbContent] = useState<string | null>(null);
  const [isKbLoading, setIsKbLoading] = useState(false);
  const [kbError, setKbError] = useState<string | null>(null);

  // State for AI Tutor
  const [quizQuestion, setQuizQuestion] = useState<string | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<QuizFeedback | null>(null);
  const [isTutorLoading, setIsTutorLoading] = useState<boolean>(false);

  // State for Use Cases
  const [useCases, setUseCases] = useState<UseCase[] | null>(null);
  const [isUseCasesLoading, setIsUseCasesLoading] = useState(false);
  const [useCasesError, setUseCasesError] = useState<string | null>(null);


  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isPlaying && explanation && currentStep < explanation.steps.length - 1) {
      timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 2500);
    } else if (isPlaying) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, explanation]);

  const handleExplain = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setExplanation(null);
    setCodeExplanation(null);
    setQuizQuestion(null);
    setQuizFeedback(null);
    setUseCases(null);
    setUseCasesError(null);
    setCurrentStep(0);
    setIsPlaying(false);
    setActiveTab('visualization');

    try {
      if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set.");
      }
      const [visResult, codeResult] = await Promise.all([
        generateExplanation(code),
        generateCodeExplanation(code)
      ]);
      setExplanation(visResult);
      setCodeExplanation(codeResult);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "An unknown error occurred.");
      setActiveTab('visualization'); // Stay on vis tab to show error
    } finally {
      setIsLoading(false);
    }
  }, [code]);

  const handleGenerateQuiz = useCallback(async () => {
    if (!explanation) return;
    setIsTutorLoading(true);
    setQuizQuestion(null);
    setQuizFeedback(null);
    setActiveTab('tutor');
    try {
        const question = await generateQuizQuestion(code);
        setQuizQuestion(question);
    } catch (e) {
        // Handle error specifically for tutor
        console.error("Failed to generate quiz", e);
    } finally {
        setIsTutorLoading(false);
    }
  }, [code, explanation]);

  const handleAnswerSubmit = useCallback(async (answer: string) => {
    if (!quizQuestion) return;
    setIsTutorLoading(true);
    setQuizFeedback(null);
    try {
        const feedback = await evaluateAnswer(quizQuestion, answer);
        setQuizFeedback(feedback);
    } catch (e) {
        console.error("Failed to evaluate answer", e);
    } finally {
        setIsTutorLoading(false);
    }
  }, [quizQuestion]);

  const handleGenerateUseCases = useCallback(async () => {
    if (!explanation) return;
    setIsUseCasesLoading(true);
    setUseCases(null);
    setUseCasesError(null);
    setActiveTab('useCases');
    try {
      const result = await generateUseCases(code);
      setUseCases(result);
    } catch (e) {
      setUseCasesError(e instanceof Error ? e.message : "Failed to generate use cases.");
      console.error("Failed to generate use cases", e);
    } finally {
      setIsUseCasesLoading(false);
    }
  }, [code, explanation]);

  const handleStepChange = (direction: 'next' | 'prev' | 'first' | 'last') => {
    if (!explanation) return;
    setIsPlaying(false);
    if (direction === 'next') {
        setCurrentStep(s => Math.min(s + 1, explanation.steps.length - 1));
    } else if (direction === 'prev') {
        setCurrentStep(s => Math.max(s - 1, 0));
    } else if (direction === 'first') {
        setCurrentStep(0);
    } else if (direction === 'last') {
        setCurrentStep(explanation.steps.length - 1);
    }
  };

  const handleLogStepSelect = (index: number) => {
    setIsPlaying(false);
    setCurrentStep(index);
  };

  const togglePlay = () => {
    if (explanation) {
        if (currentStep === explanation.steps.length - 1) {
            setCurrentStep(0);
        }
        setIsPlaying(p => !p);
    }
  };

  const handleShowKb = useCallback(async (topic: string) => {
    setActiveTab('docs');
    setKbTopic(topic);
    setIsKbLoading(true);
    setKbContent(null);
    setKbError(null);
    try {
      const explanationText = await generateConceptExplanation(topic);
      setKbContent(explanationText);
    } catch (e) {
      setKbError(e instanceof Error ? e.message : "Failed to load explanation.");
    } finally {
      setIsKbLoading(false);
    }
  }, []);

  const tabs = [
    { id: 'code', label: 'Code', icon: IconCode },
    { id: 'visualization', label: 'Visualization', icon: IconChartBar },
    { id: 'structure', label: 'Structure', icon: IconSitemap },
    { id: 'explanation', label: 'Explanation', icon: IconMessageCircle },
    { id: 'useCases', label: 'Use Cases', icon: IconBulb },
    { id: 'tutor', label: 'AI Tutor', icon: IconSchool },
    { id: 'docs', label: 'Docs', icon: IconBook },
  ] as const;

  const renderContent = () => {
    switch (activeTab) {
      case 'code':
        return (
          <div className="flex flex-col h-full bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-700">
              <h2 className="text-lg font-semibold">1. Python Code</h2>
              <p className="text-sm text-slate-400">Enter a pandas or numpy operation to visualize.</p>
            </div>
            <div className="flex-grow p-4 relative">
              <CodeEditor code={code} setCode={setCode} />
            </div>
            <div className="p-4 border-t border-slate-700">
              <button
                onClick={handleExplain}
                disabled={isLoading}
                className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-200"
              >
                {isLoading ? <IconLoader className="animate-spin mr-2" /> : <IconPlayerPlay className="mr-2" />}
                {isLoading ? 'Thinking...' : 'Run & Explain'}
              </button>
            </div>
          </div>
        );
      case 'visualization':
        return (
          <div className="flex flex-col h-full bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
             <div className="p-4 border-b border-slate-700 flex justify-between items-center">
               <div>
                  <h2 className="text-lg font-semibold">Visual Explanation</h2>
                  <p className="text-sm text-slate-400">Watch the data transformation unfold.</p>
               </div>
               {explanation && (
                 <button onClick={handleGenerateQuiz} className="bg-cyan-600/50 hover:bg-cyan-600/80 text-cyan-200 font-bold py-2 px-4 rounded-lg flex items-center justify-center transition-all duration-200 text-sm">
                    <IconSchool className="mr-2 w-4 h-4" /> Test Your Knowledge
                 </button>
               )}
            </div>
            <div className="flex-grow p-4 flex items-center justify-center relative min-h-0">
              {isLoading && (
                <div className="text-center">
                  <IconLoader className="w-12 h-12 animate-spin text-cyan-400 mx-auto" />
                  <p className="mt-4 text-slate-300">Gemini is analyzing the code...</p>
                  <p className="text-xs text-slate-400">This may take a moment.</p>
                </div>
              )}
              {error && (
                <div className="text-center text-red-400 p-4 bg-red-900/50 rounded-lg">
                  <IconAlertTriangle className="w-12 h-12 mx-auto mb-2" />
                  <h3 className="font-bold">An Error Occurred</h3>
                  <p className="text-sm">{error}</p>
                </div>
              )}
              {!isLoading && !error && !explanation && (
                <div className="text-center text-slate-500">
                  <p>Click "Run & Explain" on the Code tab to see the visualization.</p>
                </div>
              )}
              {explanation && (
                <ExplanationVisualizer step={explanation.steps[currentStep]} />
              )}
            </div>
            {explanation && (
              <div className="flex-shrink-0 border-y border-slate-700 h-40">
                <ExecutionLog 
                  steps={explanation.steps} 
                  currentStep={currentStep} 
                  onStepSelect={handleLogStepSelect} 
                />
              </div>
            )}
            {explanation && (
              <div className="flex-shrink-0 bg-slate-900/50">
                  <div className="p-4">
                      <div className="flex items-center justify-center space-x-4">
                          <button onClick={() => handleStepChange('first')} title="First Step" className="p-2 rounded-full hover:bg-slate-700 transition-colors"><IconPlayerTrackPrev /></button>
                          <button onClick={() => handleStepChange('prev')} title="Previous Step" className="p-2 rounded-full hover:bg-slate-700 transition-colors"><IconChevronLeft /></button>
                          <button onClick={togglePlay} title={isPlaying ? "Pause" : "Play"} className="p-3 rounded-full bg-cyan-500 text-white hover:bg-cyan-600 transition-colors">
                              {isPlaying ? <IconPlayerPause /> : <IconPlayerPlay />}
                          </button>
                          <button onClick={() => handleStepChange('next')} title="Next Step" className="p-2 rounded-full hover:bg-slate-700 transition-colors"><IconChevronRight /></button>
                          <button onClick={() => handleStepChange('last')} title="Last Step" className="p-2 rounded-full hover:bg-slate-700 transition-colors"><IconPlayerTrackNext /></button>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-1.5 mt-4">
                          <div className="bg-cyan-400 h-1.5 rounded-full" style={{ width: `${((currentStep + 1) / explanation.steps.length) * 100}%` }}></div>
                      </div>
                      <div className="text-center text-xs text-slate-400 mt-2">
                          Step {currentStep + 1} of {explanation.steps.length}: {explanation.steps[currentStep].title}
                      </div>
                  </div>
              </div>
            )}
          </div>
        );
      case 'structure':
        return (
          <div className="flex flex-col h-full bg-slate-800 rounded-lg border border-slate-700 p-6 space-y-8 overflow-y-auto">
            {explanation ? (
              <>
                <DataFlowDiagram currentStep={currentStep} totalSteps={explanation.steps.length} />
                <SummaryExplanation summary={explanation.overallExplanation} />
              </>
            ) : (
               <div className="flex-grow flex items-center justify-center text-center text-slate-500">
                  <p>Run an explanation to see the structure and summary.</p>
                </div>
            )}
          </div>
        );
      case 'explanation':
        return (
           <div className="flex flex-col h-full bg-slate-800 rounded-lg border border-slate-700 p-6 overflow-y-auto">
            {codeExplanation ? (
              <CodeExplanation breakdown={codeExplanation} />
            ) : (
               <div className="flex-grow flex items-center justify-center text-center text-slate-500">
                  <p>Run an explanation to see the code breakdown.</p>
                </div>
            )}
          </div>
        );
       case 'docs':
        return (
          <div className="flex flex-col h-full bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-700">
                <h2 className="text-lg font-semibold">Knowledge Base</h2>
                <p className="text-sm text-slate-400">Get AI-powered explanations of concepts.</p>
            </div>
            <div className='p-4'>
                <div className="flex space-x-2">
                    <button onClick={() => handleShowKb('pandas df.groupby')} className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 py-1 px-3 rounded-full transition-colors">Explain `df.groupby`</button>
                    <button onClick={() => handleShowKb('pandas .agg()')} className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 py-1 px-3 rounded-full transition-colors">Explain `.agg()`</button>
                    <button onClick={() => handleShowKb('numpy np.mean')} className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 py-1 px-3 rounded-full transition-colors">Explain `np.mean`</button>
                </div>
            </div>
            <div className="flex-grow p-4 overflow-y-auto">
                <KnowledgeBase
                    topic={kbTopic}
                    content={kbContent}
                    isLoading={isKbLoading}
                    error={kbError}
                />
            </div>
          </div>
        );
      case 'tutor':
         return (
          <div className="h-full bg-slate-800 rounded-lg border border-slate-700 overflow-y-auto">
            <AITutor 
                code={code}
                question={quizQuestion}
                feedback={quizFeedback}
                isLoading={isTutorLoading}
                hasRun={explanation !== null}
                onGenerateQuiz={handleGenerateQuiz}
                onAnswerSubmit={handleAnswerSubmit}
            />
          </div>
        );
      case 'useCases':
        return (
          <div className="h-full bg-slate-800 rounded-lg border border-slate-700 overflow-y-auto">
            <UseCases
              code={code}
              useCases={useCases}
              isLoading={isUseCasesLoading}
              error={useCasesError}
              hasRun={explanation !== null}
              onGenerate={handleGenerateUseCases}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans flex flex-col">
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-cyan-400">Self-Explaining Code Notebook byy ross</h1>
        <p className="text-sm text-slate-400">Powered by Gemini & D3.js</p>
      </header>

      <div className="flex-shrink-0 px-4 border-b border-slate-700">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center
                ${
                  activeTab === tab.id
                    ? 'border-cyan-400 text-cyan-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
                }
              `}
            >
              <tab.icon className={`mr-2 w-5 h-5 ${activeTab === tab.id ? 'text-cyan-400' : 'text-slate-500'}`} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <main className="flex-grow p-4 overflow-hidden">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;