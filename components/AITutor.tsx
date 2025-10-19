import React, { useState } from 'react';
import type { QuizFeedback } from '../types';
import { IconLoader, IconSchool, IconSparkles, IconCheck, IconX } from './Icons';

interface AITutorProps {
  code: string;
  question: string | null;
  feedback: QuizFeedback | null;
  isLoading: boolean;
  hasRun: boolean;
  onGenerateQuiz: () => void;
  onAnswerSubmit: (answer: string) => void;
}

const AITutor: React.FC<AITutorProps> = ({ code, question, feedback, isLoading, hasRun, onGenerateQuiz, onAnswerSubmit }) => {
  const [answer, setAnswer] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim()) {
      onAnswerSubmit(answer);
    }
  };

  const renderInitialState = () => (
    <div className="text-center">
      <IconSchool className="w-16 h-16 text-cyan-500 mb-4 mx-auto" />
      <h2 className="text-xl font-bold text-slate-200">AI Tutor</h2>
      <p className="text-slate-400 mt-2 max-w-md mx-auto">
        First, run an explanation on the 'Code' tab. Then, come back here to test your understanding with an AI-generated quiz!
      </p>
    </div>
  );
  
  const renderReadyToQuizState = () => (
     <div className="text-center">
      <IconSchool className="w-16 h-16 text-cyan-500 mb-4 mx-auto" />
      <h2 className="text-xl font-bold text-slate-200">Ready to Learn?</h2>
      <p className="text-slate-400 mt-2 max-w-md mx-auto">
        You've analyzed the code. Now, let's see what you've learned.
      </p>
      <button 
        onClick={onGenerateQuiz} 
        disabled={isLoading}
        className="mt-6 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
      >
        {isLoading ? <IconLoader className="animate-spin" /> : "Generate Quiz Question"}
      </button>
    </div>
  );

  const renderFeedback = () => {
    if (!feedback) return null;
    const isCorrect = feedback.isCorrect;
    const bgColor = isCorrect ? 'bg-green-900/50 border-green-700' : 'bg-red-900/50 border-red-700';
    const textColor = isCorrect ? 'text-green-300' : 'text-red-300';
    const Icon = isCorrect ? IconCheck : IconX;

    return (
        <div className={`mt-6 p-4 rounded-lg border ${bgColor}`}>
            <h3 className={`flex items-center font-bold text-lg ${textColor}`}>
                <Icon className="w-6 h-6 mr-2" />
                {isCorrect ? "Correct!" : "Not Quite"}
            </h3>
            <p className="mt-2 text-slate-300 text-sm leading-relaxed">{feedback.explanation}</p>
            <button
                onClick={() => { onGenerateQuiz(); setAnswer(''); }}
                disabled={isLoading}
                className="mt-4 bg-slate-600 hover:bg-slate-500 disabled:bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors"
            >
                {isLoading ? <IconLoader className="animate-spin w-4 h-4" /> : "Ask Another Question"}
            </button>
        </div>
    )
  }

  return (
    <div className="p-6 h-full flex flex-col">
        <div className="flex-shrink-0 flex items-center mb-6">
            <IconSchool className="w-8 h-8 mr-3 text-cyan-400" />
            <div>
                <h2 className="text-xl font-bold text-slate-200">AI Tutor</h2>
                <p className="text-sm text-slate-400">Check your understanding of: <code className="bg-slate-700 text-amber-300 px-1.5 py-0.5 rounded text-xs">{code}</code></p>
            </div>
        </div>
      
        <div className="flex-grow flex items-center justify-center">
          {!hasRun && renderInitialState()}
          {hasRun && !question && !isLoading && renderReadyToQuizState()}
          
          {isLoading && !question && (
             <div className="text-center">
                 <IconLoader className="w-10 h-10 animate-spin text-cyan-400 mx-auto" />
                 <p className="mt-3 text-slate-300">Generating a question...</p>
             </div>
          )}

          {question && (
            <div className="w-full max-w-2xl">
              <div className="bg-slate-900/50 border border-slate-700 p-6 rounded-lg">
                <p className="text-slate-300 font-semibold text-lg leading-relaxed text-center">
                  {question}
                </p>
                <form onSubmit={handleSubmit} className="mt-6">
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full h-24 bg-slate-800 text-slate-200 p-3 rounded-md border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
                    disabled={isLoading || !!feedback}
                  />
                  {!feedback && (
                    <button 
                        type="submit" 
                        disabled={isLoading || !answer.trim()}
                        className="mt-4 w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-2.5 px-4 rounded-lg flex items-center justify-center transition-colors"
                    >
                      {isLoading ? <IconLoader className="animate-spin mr-2" /> : <IconSparkles className="mr-2" />}
                      {isLoading ? "Evaluating..." : "Submit Answer"}
                    </button>
                  )}
                </form>
              </div>
              
              {isLoading && !!feedback && (
                <div className="text-center mt-6">
                    <IconLoader className="w-8 h-8 animate-spin text-cyan-400 mx-auto" />
                </div>
              )}
              
              {!isLoading && feedback && renderFeedback()}
            </div>
          )}
        </div>
    </div>
  );
};

export default AITutor;
