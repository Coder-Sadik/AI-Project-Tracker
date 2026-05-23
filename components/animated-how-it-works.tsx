'use client';

import { useState, useEffect } from 'react';
import { FileText, Sparkles, CheckSquare, Users, MousePointer2 } from 'lucide-react';

const STEPS = [
  { 
    id: 1, 
    title: 'Paste or upload', 
    desc: 'Drop in text, PDF, DOCX, or TXT files from any source.',
    icon: <FileText size={20} />
  },
  { 
    id: 2, 
    title: 'AI extracts requirements', 
    desc: 'Gemini 2.5 Flash reads the document and extracts only explicit requirements.',
    icon: <Sparkles size={20} />
  },
  { 
    id: 3, 
    title: 'Review & create', 
    desc: 'Edit the list, add a project name, and create with one click.',
    icon: <CheckSquare size={20} />
  },
  { 
    id: 4, 
    title: 'Collaborate in real time', 
    desc: 'Invite teammates. Every change syncs instantly with colour-coded authorship.',
    icon: <Users size={20} />
  },
];

export default function AnimatedHowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  // Auto-advance
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % STEPS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <h2 className="text-3xl font-bold mb-2 text-center" style={{ color: 'var(--text-primary)' }}>
        How it works
      </h2>
      <p className="mb-12 text-center" style={{ color: 'var(--text-secondary)' }}>
        From document to tracked project in under a minute
      </p>

      <div className="flex flex-col md:flex-row gap-8 items-stretch text-left">
        {/* Left: Steps List */}
        <div className="flex-1 flex flex-col gap-4">
          {STEPS.map((step, index) => {
            const isActive = index === activeStep;
            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(index)}
                className="flex items-start gap-4 p-4 rounded-2xl transition-all duration-300 text-left border"
                style={{
                  background: isActive ? 'var(--bg-card)' : 'transparent',
                  borderColor: isActive ? 'var(--border-default)' : 'transparent',
                  boxShadow: isActive ? 'var(--shadow-md)' : 'none',
                  opacity: isActive ? 1 : 0.6,
                }}
              >
                <div 
                  className="flex items-center justify-center rounded-xl transition-all duration-300 flex-shrink-0"
                  style={{
                    width: 44,
                    height: 44,
                    background: isActive ? 'var(--text-primary)' : 'var(--bg-secondary)',
                    color: isActive ? 'var(--bg-primary)' : 'var(--text-primary)',
                  }}
                >
                  {step.icon}
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>
                    {step.title}
                  </h3>
                  <div 
                    className={`overflow-hidden transition-all duration-300 ${isActive ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}`}
                  >
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Animated Graphic */}
        <div className="flex-1 rounded-2xl overflow-hidden relative flex items-center justify-center p-8 border"
             style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)', minHeight: '350px' }}>
          
          {/* Step 1 Graphic */}
          <div className={`absolute inset-0 transition-opacity duration-700 flex flex-col items-center justify-center p-8 ${activeStep === 0 ? 'opacity-100' : 'opacity-0'}`}>
            <div className="w-full max-w-sm rounded-lg p-4 border" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-default)' }}>
              <div className="flex gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-red-400"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
              </div>
              <div className="space-y-3">
                <div className="h-2 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" style={{ animationDelay: '150ms' }}></div>
                <div className="h-2 w-5/6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>

          {/* Step 2 Graphic */}
          <div className={`absolute inset-0 transition-opacity duration-700 flex flex-col items-center justify-center p-8 ${activeStep === 1 ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
            <div className="w-full max-w-sm rounded-lg p-4 border relative overflow-hidden" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-default)' }}>
              <div className="space-y-3 opacity-30">
                <div className="h-2 w-3/4 bg-gray-400 rounded"></div>
                <div className="h-2 w-full bg-gray-400 rounded"></div>
                <div className="h-2 w-5/6 bg-gray-400 rounded"></div>
                <div className="h-2 w-2/3 bg-gray-400 rounded"></div>
              </div>
              
              {/* Scanning bar */}
              <div 
                className="absolute left-0 right-0 h-16 pointer-events-none"
                style={{
                  background: 'linear-gradient(to bottom, transparent, rgba(59, 130, 246, 0.2))',
                  borderBottom: '2px solid #3b82f6',
                  animation: activeStep === 1 ? 'scan 2s infinite ease-in-out' : 'none'
                }}
              ></div>
            </div>
          </div>

          {/* Step 3 Graphic */}
          <div className={`absolute inset-0 transition-opacity duration-700 flex flex-col items-center justify-center p-8 ${activeStep === 2 ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
            <div className="w-full max-w-sm flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border shadow-sm" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-default)' }}>
                  <div className="w-4 h-4 rounded-sm border-2 border-[#3b82f6] flex items-center justify-center">
                    <CheckSquare size={12} className="text-[#3b82f6]" />
                  </div>
                  <div className="h-2 flex-1 bg-gray-300 dark:bg-gray-600 rounded"></div>
                </div>
              ))}
              <div className="mt-2 py-2 px-4 rounded-lg self-end text-sm font-bold text-white text-center" style={{ background: '#3b82f6', width: '120px' }}>
                Create Project
              </div>
            </div>
          </div>

          {/* Step 4 Graphic */}
          <div className={`absolute inset-0 transition-opacity duration-700 flex flex-col items-center justify-center p-8 ${activeStep === 3 ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
            <div className="w-full max-w-sm rounded-lg p-6 border relative" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-default)', minHeight: '160px' }}>
               <div className="flex items-center gap-3 mb-4">
                  <div className="w-4 h-4 rounded-sm border-2 border-gray-300"></div>
                  <div className="h-2 w-3/4 bg-gray-300 dark:bg-gray-600 rounded"></div>
               </div>
               
               {/* Animated cursors */}
               <div className="absolute transition-all duration-1000 ease-in-out flex flex-col items-center"
                    style={{ 
                      left: activeStep === 3 ? '60%' : '80%', 
                      top: activeStep === 3 ? '40%' : '70%',
                      transform: activeStep === 3 ? 'scale(1)' : 'scale(0.8)',
                    }}>
                 <MousePointer2 size={16} fill="#ef4444" color="#ef4444" style={{ transform: 'rotate(-15deg)' }} />
                 <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded shadow mt-1 whitespace-nowrap">Sarah</span>
               </div>

               <div className="absolute transition-all duration-1000 ease-in-out flex flex-col items-center delay-300"
                    style={{ 
                      left: activeStep === 3 ? '30%' : '10%', 
                      top: activeStep === 3 ? '60%' : '90%',
                      transform: activeStep === 3 ? 'scale(1)' : 'scale(0.8)',
                    }}>
                 <MousePointer2 size={16} fill="#10b981" color="#10b981" style={{ transform: 'rotate(-15deg)' }} />
                 <span className="bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded shadow mt-1 whitespace-nowrap">Mike</span>
               </div>
            </div>
          </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: -20%; }
          50% { top: 100%; }
          100% { top: -20%; }
        }
      `}} />
    </div>
  );
}
