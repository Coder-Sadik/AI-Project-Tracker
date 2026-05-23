'use client';

import { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';

const DEMO_PLACEHOLDER = `The upcoming v2.0 release needs a complete overhaul of the authentication system. 
We must support Google and GitHub single sign-on. 
Additionally, the dashboard needs to load in under 2 seconds. 
Make sure to add a dark mode toggle in the navigation bar.`;

const MOCK_REQUIREMENTS = [
  { text: 'Overhaul the authentication system for v2.0', type: 'Feature' },
  { text: 'Implement Google SSO integration', type: 'Auth' },
  { text: 'Implement GitHub SSO integration', type: 'Auth' },
  { text: 'Optimize dashboard load time to under 2 seconds', type: 'Performance' },
  { text: 'Add dark mode toggle to navigation bar', type: 'UI/UX' },
];

export default function LiveDemoWidget() {
  const [inputText, setInputText] = useState(DEMO_PLACEHOLDER);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedReqs, setExtractedReqs] = useState<{ text: string, type: string }[]>([]);

  const handleSimulate = () => {
    if (!inputText.trim()) return;
    
    setIsExtracting(true);
    setExtractedReqs([]);

    // Simulate network delay and AI processing
    setTimeout(() => {
      setIsExtracting(false);
      
      // Animate requirements appearing one by one
      MOCK_REQUIREMENTS.forEach((req, index) => {
        setTimeout(() => {
          setExtractedReqs(prev => [...prev, req]);
        }, index * 400); // Stagger by 400ms
      });
    }, 1200);
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-16 fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          See the magic in action
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Experience how our AI transforms raw text into structured tasks instantly.
        </p>
      </div>

      <div 
        className="flex flex-col md:flex-row items-stretch gap-6 p-2 rounded-2xl"
        style={{ 
          background: 'var(--bg-secondary)', 
          border: '1px solid var(--border-default)' 
        }}
      >
        {/* Left Side: Input */}
        <div className="flex-1 flex flex-col p-6 rounded-xl" style={{ background: 'var(--bg-card)' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <span className="ml-2 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>project-brief.txt</span>
          </div>
          
          <textarea
            className="w-full flex-1 resize-none bg-transparent outline-none mb-4"
            style={{ 
              color: 'var(--text-primary)',
              minHeight: '200px',
              fontFamily: 'inherit',
              lineHeight: 1.6
            }}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or paste some project requirements here..."
          />

          <button 
            className="btn btn-primary w-full flex items-center justify-center gap-2"
            onClick={handleSimulate}
            disabled={isExtracting || extractedReqs.length > 0}
          >
            {isExtracting ? (
              <><Loader2 size={16} className="animate-spin" /> Analyzing...</>
            ) : (
              <><Sparkles size={16} /> Extract Requirements</>
            )}
          </button>
          
          {extractedReqs.length > 0 && (
            <button 
              className="btn btn-ghost w-full mt-2 text-sm"
              onClick={() => { setExtractedReqs([]); setInputText(DEMO_PLACEHOLDER); }}
            >
              Reset Demo
            </button>
          )}
        </div>

        {/* Right Side: Output */}
        <div className="flex-1 flex flex-col p-6 rounded-xl relative overflow-hidden" style={{ background: 'var(--bg-card)' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <CheckCircle2 size={20} style={{ color: 'var(--success)' }} />
              Structured Plan
            </h3>
            <span className="text-xs font-bold px-2 py-1 rounded-md" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
              {extractedReqs.length} / 5 Tasks
            </span>
          </div>

          {!isExtracting && extractedReqs.length === 0 && (
             <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50" style={{ minHeight: '200px' }}>
                <ArrowRight size={32} className="mb-4" style={{ color: 'var(--text-muted)' }} />
                <p style={{ color: 'var(--text-secondary)' }}>Click extract to see the AI generate structured tasks.</p>
             </div>
          )}

          {isExtracting && extractedReqs.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4" style={{ minHeight: '200px' }}>
              <Loader2 size={32} className="animate-spin" style={{ color: 'var(--brand-500)' }} />
              <p className="text-sm animate-pulse" style={{ color: 'var(--text-secondary)' }}>Gemini is reading the brief...</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {extractedReqs.map((req, i) => (
              <div 
                key={i} 
                className="flex items-start gap-3 p-3 rounded-lg border animate-in slide-in-from-bottom-4 fade-in duration-500"
                style={{ 
                  background: 'var(--bg-primary)',
                  borderColor: 'var(--border-default)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div className="mt-1 w-4 h-4 rounded border-2 border-gray-300 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                    {req.text}
                  </p>
                  <span 
                    className="text-xs px-2 py-0.5 rounded-full" 
                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                  >
                    {req.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
