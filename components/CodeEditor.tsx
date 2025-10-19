
import React from 'react';

interface CodeEditorProps {
  code: string;
  setCode: (code: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, setCode }) => {
  return (
    <textarea
      value={code}
      onChange={(e) => setCode(e.target.value)}
      className="w-full h-full bg-slate-900 text-cyan-300 font-mono p-4 rounded-md border border-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
      spellCheck="false"
      aria-label="Python code editor"
    />
  );
};

export default CodeEditor;
