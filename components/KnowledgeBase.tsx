import React from 'react';
import { IconLoader, IconAlertTriangle } from './Icons';

interface KnowledgeBaseProps {
  topic: string | null;
  content: string | null;
  isLoading: boolean;
  error: string | null;
}

const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ topic, content, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="text-center mt-8">
        <IconLoader className="w-10 h-10 animate-spin text-cyan-400 mx-auto" />
        <p className="mt-3 text-slate-300">Fetching explanation for <span className="font-semibold text-cyan-300">{topic}</span>...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-400 p-4 bg-red-900/50 rounded-lg">
        <IconAlertTriangle className="w-10 h-10 mx-auto mb-2" />
        <h3 className="font-bold">Error</h3>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (content) {
    return (
      <div className="prose prose-invert prose-p:text-slate-300 prose-headings:text-cyan-400 prose-code:text-amber-300 prose-code:bg-slate-700 prose-code:p-1 prose-code:rounded max-w-none">
        <h3 className="text-xl font-bold mb-4 text-cyan-300">{topic}</h3>
        {/* Use pre-wrap to respect newlines from the API response */}
        <p className="text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
          {content}
        </p>
      </div>
    );
  }

  return (
      <div className="text-center text-slate-500 mt-8">
          <p>Select a topic above to learn more about it.</p>
      </div>
  );
};

export default KnowledgeBase;