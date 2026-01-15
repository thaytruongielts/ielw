
import React, { useState, useEffect } from 'react';
import { TaskTopic, PracticeExercise, EvaluationResult, AppState } from './types';
import { IELTS_TOPICS } from './constants';
import { generateExercise, evaluateResponse } from './services/geminiService';
import { Button } from './components/Button';

// Icons
const BookOpenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const App: React.FC = () => {
  const [currentState, setCurrentState] = useState<AppState>(AppState.DASHBOARD);
  const [exercise, setExercise] = useState<PracticeExercise | null>(null);
  const [userInput, setUserInput] = useState('');
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startPractice = async (topic: TaskTopic) => {
    setLoading(true);
    setError(null);
    try {
      const newExercise = await generateExercise(topic);
      setExercise(newExercise);
      setUserInput('');
      setCurrentState(AppState.PRACTICE);
    } catch (err) {
      setError('Failed to generate exercise. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!exercise || !userInput.trim()) return;
    setLoading(true);
    try {
      const result = await evaluateResponse(exercise.fullParagraph, userInput);
      setEvaluation(result);
      setCurrentState(AppState.RESULT);
    } catch (err) {
      setError('Failed to evaluate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    // Only allow manual reset to dashboard if they aren't currently blocked by the 90% rule in the results screen
    // or if they are in the dashboard/practice phases.
    if (currentState === AppState.RESULT && evaluation && evaluation.accuracy < 90) {
      setError('Bạn cần đạt ít nhất 90% để chuyển sang đề tiếp theo!');
      setTimeout(() => setError(null), 3000);
      return;
    }
    setCurrentState(AppState.DASHBOARD);
    setExercise(null);
    setEvaluation(null);
    setUserInput('');
  };

  const canProgress = evaluation ? evaluation.accuracy >= 90 : true;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={reset}>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">I</div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight hidden sm:block">IELTS Master <span className="text-indigo-600">Pro</span></h1>
          </div>
          <nav className="flex gap-4">
            <Button variant="ghost" className="hidden sm:flex" onClick={reset}>Dashboard</Button>
            <Button variant="outline" className="text-sm">Vietnam 🇻🇳</Button>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        {currentState === AppState.DASHBOARD && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-900">Sentence Reconstruction</h2>
              <p className="text-slate-600 max-w-lg mx-auto">Master high-scoring IELTS Writing Task 2 structures by building paragraphs from keyword outlines.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {IELTS_TOPICS.map((topic) => (
                <div 
                  key={topic.id} 
                  className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all group cursor-pointer"
                  onClick={() => startPractice(topic)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full uppercase tracking-wider">
                      {topic.category}
                    </span>
                    <BookOpenIcon />
                  </div>
                  <p className="text-slate-800 font-medium leading-relaxed mb-6 line-clamp-3">
                    {topic.question}
                  </p>
                  <Button 
                    variant="primary" 
                    className="w-full opacity-0 group-hover:opacity-100 transition-opacity"
                    isLoading={loading && exercise?.topic.id === topic.id}
                  >
                    Start Exercise
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentState === AppState.PRACTICE && exercise && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl">
              <h3 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                <BookOpenIcon /> Prompt
              </h3>
              <p className="text-indigo-800 text-lg leading-relaxed">{exercise.topic.question}</p>
            </div>

            <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 uppercase tracking-widest text-xs">Keyword Outline (Slash Version)</h4>
                  <span className="text-xs text-slate-400">Add prepositions, articles, and grammar words</span>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-lg font-medium text-slate-700 leading-loose">
                  {exercise.slashVersion}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Your Reconstruction</label>
                <textarea
                  className="w-full h-48 p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none text-lg leading-relaxed transition-all"
                  placeholder="Type the full, grammatically correct paragraph here..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  className="flex-1 py-4 text-lg" 
                  onClick={handleSubmit} 
                  isLoading={loading}
                  disabled={!userInput.trim()}
                >
                  Submit Reconstruction
                </Button>
                <Button variant="outline" onClick={() => setCurrentState(AppState.DASHBOARD)} disabled={loading}>Cancel</Button>
              </div>
            </div>
          </div>
        )}

        {currentState === AppState.RESULT && evaluation && (
          <div className="space-y-8 animate-in zoom-in-95 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase">Overall Accuracy</p>
                <div className={`text-5xl font-black ${evaluation.accuracy >= 90 ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {evaluation.accuracy}%
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase">Grammar (1-10)</p>
                <div className="text-5xl font-black text-indigo-600">{evaluation.grammarScore}</div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase">Vocabulary (1-10)</p>
                <div className="text-5xl font-black text-indigo-600">{evaluation.vocabularyScore}</div>
              </div>
            </div>

            {!canProgress && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center gap-3 text-amber-800 font-medium">
                <LockIcon />
                <span>Bạn cần đạt ít nhất <b>90%</b> độ chính xác để chuyển sang đề tiếp theo. Hãy thử lại!</span>
              </div>
            )}

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8">
              <div>
                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="w-2 h-6 bg-indigo-600 rounded-full"></span>
                  Professional Feedback
                </h4>
                <div className="p-4 bg-slate-50 rounded-xl text-slate-700 leading-relaxed italic">
                  "{evaluation.feedback}"
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8">
                <div>
                  <h4 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Your Version</h4>
                  <div className="p-4 border-l-4 border-slate-300 bg-slate-50 rounded-r-xl text-slate-600">
                    {evaluation.userText}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-emerald-700 mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                    <CheckCircleIcon /> Improved Model Version
                  </h4>
                  <div className="p-4 border-l-4 border-emerald-500 bg-emerald-50 rounded-r-xl text-emerald-900 font-medium">
                    {evaluation.corrections}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-indigo-700 mb-4 text-sm uppercase tracking-wider">Original Band 9.0 Benchmark</h4>
                  <div className="p-4 border-l-4 border-indigo-500 bg-indigo-50 rounded-r-xl text-indigo-900">
                    {evaluation.originalText}
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
                <Button 
                  variant={canProgress ? "primary" : "outline"} 
                  className="flex-1 flex items-center justify-center gap-2" 
                  onClick={reset}
                  disabled={!canProgress}
                >
                  {!canProgress && <LockIcon />}
                  Try Another Topic
                </Button>
                <Button 
                  variant={canProgress ? "outline" : "primary"} 
                  className="flex-1" 
                  onClick={() => setCurrentState(AppState.PRACTICE)}
                >
                  {canProgress ? "Practice Again" : "Retry This One"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 animate-bounce z-50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}
      </main>

      <footer className="bg-slate-900 text-slate-400 py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <h3 className="text-white font-bold text-xl mb-2">IELTS Master</h3>
            <p className="text-sm max-w-xs">The ultimate companion for your IELTS preparation journey. Powered by advanced AI to give you real-time feedback.</p>
          </div>
          <div className="flex gap-8 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
          </div>
          <div className="text-sm">
            © 2024 IELTS Master Pro. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
