import { useState } from 'react';
import { Play, Code2, Lightbulb, AlertCircle, Sparkles, Target, Wrench, Clock, X } from 'lucide-react';
import './App.css';

function App() {
  const [code, setCode] = useState('age = input("Enter age: ")\\nprint(age + 5)\\n');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [personalizedPractice, setPersonalizedPractice] = useState(null);
  const [loadingPractice, setLoadingPractice] = useState(false);

  const fetchHistory = async () => {
    try {
      const response = await fetch('http://localhost:8000/history');
      const data = await response.json();
      setHistory(data);
      setShowHistory(true);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  const fetchPersonalizedPractice = async () => {
    setLoadingPractice(true);
    try {
      const response = await fetch('http://localhost:8000/practice/suggested');
      const data = await response.json();
      setPersonalizedPractice(data.practice);
    } catch (err) {
      console.error("Failed to fetch practice:", err);
    } finally {
      setLoadingPractice(false);
    }
  };

  const analyzeCode = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setResult({
        status: 'error',
        message: 'Could not connect to the analysis engine. Ensure the backend is running.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface selection:bg-primary-container selection:text-on-primary-container min-h-screen">
      {/* Top Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/40 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
        <div className="flex justify-between items-center w-full px-8 py-4 mx-auto max-w-7xl">
          <div className="text-2xl font-bold tracking-tight text-indigo-400 dark:text-indigo-300 font-headline">Concept Fix</div>
          <div className="flex items-center gap-4">
            <button onClick={fetchHistory} className="px-6 py-2 bg-surface-container-high hover:bg-surface-container-highest text-primary rounded-full font-label text-sm transition-all flex items-center gap-2">
              <Clock size={16} /> History
            </button>
            <button onClick={fetchPersonalizedPractice} disabled={loadingPractice} className="px-6 py-2 bg-gradient-to-r from-primary to-primary-dim text-on-primary rounded-full font-label text-sm font-bold hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
              {loadingPractice ? <span className="loader" style={{ width: 16, height: 16, borderTopColor: 'black' }} /> : <Target size={16} />}
              Personalized Practice
            </button>
          </div>
        </div>
      </nav>

      <main className="relative pt-32 mesh-gradient pb-20">
        <div className="absolute top-40 left-10 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -z-10"></div>
        <div className="absolute top-80 right-20 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] -z-10"></div>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-8 text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-high border border-outline-variant/20 mb-8">
            <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            <span className="font-label text-xs font-bold tracking-widest text-primary uppercase">The Future of Cognition</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-headline font-extrabold tracking-tighter mb-6 bg-gradient-to-b from-on-surface to-on-surface-variant bg-clip-text text-transparent">
            AI Learning with <br /><span className="text-primary italic">misconceptions</span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-on-surface-variant font-body leading-relaxed mb-8">
            Don't just know you are wrong, But understand "why" you are wrong.
          </p>
        </section>

        {/* Dual-Pane Feature: Code & AI Analysis */}
        <section className="max-w-7xl mx-auto px-8 mb-32 relative">
          <div className="grid lg:grid-cols-2 gap-8 items-stretch">

            {/* Python Code Editor Pane */}
            <div className="glass-card rounded-xl flex flex-col shadow-2xl overflow-hidden min-h-[500px]">
              <div className="bg-surface-container-highest/50 px-6 py-4 flex items-center justify-between border-b border-outline-variant/10">
                <div className="flex items-center gap-4">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-error-container/40"></div>
                    <div className="w-3 h-3 rounded-full bg-secondary-container/40"></div>
                    <div className="w-3 h-3 rounded-full bg-tertiary-container/40"></div>
                  </div>
                  <span className="font-label text-xs text-on-surface-variant tracking-widest uppercase">main.py</span>
                </div>
                <button
                  onClick={analyzeCode}
                  disabled={loading}
                  className="bg-primary text-on-primary px-4 py-1.5 rounded text-sm font-bold flex items-center gap-2 hover:bg-primary-dim transition-colors"
                >
                  {loading ? 'Analyzing...' : <><Play size={14} /> Run Code</>}
                </button>
              </div>
              <textarea
                className="flex-grow p-8 font-label text-sm leading-relaxed bg-slate-950/20 text-on-surface resize-none focus:outline-none focus:ring-1 focus:ring-primary/50"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck="false"
              />
            </div>

            {/* Error Analysis Diagnostic */}
            <div className="glass-card rounded-xl p-1 shadow-2xl bg-gradient-to-br from-primary/10 to-transparent flex flex-col">
              <div className="bg-surface-dim/80 h-full w-full rounded-[0.9rem] p-8 flex flex-col overflow-y-auto max-h-[700px]">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-xl">psychology</span>
                  </div>
                  <div>
                    <h3 className="font-headline text-lg font-bold">Error Analysis</h3>
                    <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">Diagnostics Active</p>
                  </div>
                </div>

                {!result && !loading && (
                  <div className="flex-grow flex items-center justify-center text-on-surface-variant flex-col gap-4 opacity-50">
                    <Lightbulb size={48} />
                    <p>Submit your code to see detailed conceptual analysis.</p>
                  </div>
                )}

                {result?.status === 'success' && (
                  <div className="p-6 rounded-lg bg-surface-container-high relative overflow-hidden text-center flex flex-col items-center">
                    <Target size={48} className="text-secondary mb-4" />
                    <h3 className="text-xl font-bold text-on-surface">Execution Successful</h3>
                    {result.output && (
                      <pre className="mt-4 p-4 bg-black/30 rounded text-left text-sm text-green-400 w-full overflow-x-auto">
                        {result.output}
                      </pre>
                    )}
                  </div>
                )}

                {result?.status === 'error' && result.errors && (
                  <div className="space-y-6 flex-grow">
                    {result.errors.map((err, idx) => (
                      <div key={idx} className="space-y-4 mb-8">
                        {/* Error Context Block */}
                        <div className="p-6 rounded-lg bg-surface-container-high relative overflow-hidden group">
                          <div className="absolute left-0 top-0 h-full w-1 bg-error"></div>
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-label text-xs font-bold text-error uppercase">Issue #{idx + 1} {err.line ? `(Line ${err.line})` : ''}</span>
                            <span className="font-label text-[10px] text-outline">[{err.error_type || "Runtime Error"}]</span>
                          </div>
                          <p className="text-sm font-body text-on-surface-variant leading-relaxed mono p-2 bg-black/20 rounded">
                            {err.error_message || result.message}
                          </p>
                        </div>

                        {/* Concept Block */}
                        {err.misconception && (
                          <div className="p-6 rounded-lg bg-surface-container relative overflow-hidden">
                            <div className="absolute left-0 top-0 h-full w-1 bg-tertiary"></div>
                            <h4 className="font-label text-xs font-bold text-tertiary uppercase mb-2">Core Misconception</h4>
                            <p className="text-sm font-body text-on-surface-variant leading-relaxed">
                              {err.misconception}
                            </p>
                          </div>
                        )}

                        {/* Explanation & Fix Block */}
                        {err.explanation && (
                          <div className="p-6 rounded-lg bg-surface-container relative overflow-hidden">
                            <div className="absolute left-0 top-0 h-full w-1 bg-primary"></div>
                            <h4 className="font-label text-xs font-bold text-primary uppercase mb-2">Detailed Explanation</h4>
                            <p className="text-sm font-body text-on-surface-variant leading-relaxed mb-4">
                              {err.explanation}
                            </p>
                            {err.fix && (
                              <>
                                <h4 className="font-label text-xs font-bold text-secondary uppercase mb-2">How to Fix</h4>
                                <p className="text-sm font-body text-on-surface-variant leading-relaxed">
                                  {err.fix}
                                </p>
                              </>
                            )}
                          </div>
                        )}

                        {/* Practice Block */}
                        {err.practice && (
                          <div className="p-6 rounded-lg bg-surface-container relative overflow-hidden border border-outline/20">
                            <h4 className="font-label text-xs font-bold text-surface-tint uppercase mb-2">Quick Practice</h4>
                            <p className="text-sm font-body text-on-surface-variant leading-relaxed">
                              {err.practice}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {result?.status === 'error' && !result.errors && (
                  <div className="p-6 rounded-lg bg-error-container/20 text-error">
                    System Error: {result.message}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Modals */}
      {showHistory && (
        <div className="history-modal fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-end">
          <div className="w-full max-w-md bg-surface-container-high h-full p-6 overflow-y-auto flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/10">
              <h3 className="text-lg font-bold flex items-center gap-2"><Clock size={18} /> Error History</h3>
              <button onClick={() => setShowHistory(false)}><X size={20} /></button>
            </div>
            <div className="space-y-4">
              {history.length === 0 ? <p className="text-on-surface-variant">No history yet.</p> : history.map(item => (
                <div key={item.id} className="p-4 bg-surface-container rounded-lg border border-white/5">
                  <div className="flex justify-between text-xs mb-2">
                    <span className={item.status === 'success' ? 'text-green-400' : 'text-error'}>{item.status.toUpperCase()}</span>
                    <span className="text-outline">{new Date(item.created_at).toLocaleTimeString()}</span>
                  </div>
                  <pre className="text-xs text-on-surface-variant bg-black/40 p-2 rounded overflow-x-hidden">{item.code.substring(0, 50)}...</pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {personalizedPractice && (
        <div className="history-modal fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-surface-container h-auto p-8 rounded-2xl border border-primary/20 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2 text-primary"><Target size={24} /> Personalized Practice</h3>
              <button onClick={() => setPersonalizedPractice(null)}><X size={24} /></button>
            </div>
            <p className="text-lg text-on-surface leading-relaxed p-4 bg-surface-container-high rounded-lg">
              {personalizedPractice}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
