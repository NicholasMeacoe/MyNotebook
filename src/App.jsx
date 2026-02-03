
import { useState, useCallback } from 'react';
import { NotebookPen, FileText, Trash2, Settings, ArrowLeft, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import clsx from 'clsx';
import { UploadZone } from './components/UploadZone';
import { SettingsModal } from './components/SettingsModal';
import { templates } from './lib/templates';
import { aiService } from './lib/ai';

function App() {
  const [sources, setSources] = useState([]);
  const [selectedSourceId, setSelectedSourceId] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Generation State
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(''); // 'indexing' | 'generating'
  const [output, setOutput] = useState(null);
  const [error, setError] = useState(null);

  const handleSourcesAdded = (newSources) => {
    setSources(prev => [...prev, ...newSources]);
  };

  const removeSource = (id) => {
    setSources(prev => prev.filter(s => s.id !== id));
    if (selectedSourceId === id) setSelectedSourceId(null);
  };

  const handleGenerate = async (template) => {
    try {
      if (sources.length === 0) {
        setError("Please add at least one source document.");
        return;
      }

      setError(null);
      setSelectedTemplate(template);
      setIsGenerating(true);
      setOutput(null);

      // 1. Indexing
      setGenerationStep('Reading documents...');
      // Initialize AI service if needed (key might have changed)
      const key = localStorage.getItem('gemini_api_key');
      if (!key) {
        setIsSettingsOpen(true);
        setIsGenerating(false);
        setError("Please set your Gemini API Key first.");
        return;
      }
      aiService.setApiKey(key);

      await aiService.processDocuments(sources);

      // 2. Generating
      setGenerationStep('Generating insights...');
      const result = await aiService.generateResponse(template, sources);

      setOutput(result);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to generate response. Check your API key and try again.");
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const resetView = () => {
    setOutput(null);
    setSelectedTemplate(null);
    setError(null);
  };

  return (
    <div className="flex h-full text-sm font-sans text-text-1">
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={(key) => aiService.setApiKey(key)}
      />

      {/* Sidebar */}
      <aside className="w-80 border-r border-border-1 bg-[var(--bg-2)] flex flex-col glass z-20">
        <div className="p-4 border-b border-border-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[var(--accent)] rounded-lg shadow-glow">
              <NotebookPen className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg tracking-tight">MyNotebook</span>
          </div>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-md hover:bg-bg-3 text-text-2 hover:text-text-1 transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold text-[var(--text-3)] uppercase tracking-wider">Sources ({sources.length})</h3>
            </div>

            {sources.length === 0 ? (
              <div className="border border-dashed border-border-2 rounded-lg p-6 text-center bg-bg-2/30">
                <p className="text-[var(--text-3)] italic">No sources added</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sources.map(source => (
                  <div
                    key={source.id}
                    className={clsx(
                      "group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border",
                      selectedSourceId === source.id
                        ? "bg-accent/10 border-accent/30 shadow-sm"
                        : "bg-bg-2 border-transparent hover:bg-bg-3 hover:border-border-2"
                    )}
                    onClick={() => setSelectedSourceId(source.id)}
                  >
                    <div className="p-2 bg-bg-3 rounded-md text-accent shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text-1 truncate">{source.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-text-3">{source.type === 'application/pdf' ? 'PDF' : 'Text'}</p>
                        <p className="text-xs text-text-3 font-mono">{Math.round(source.content.length / 1000)}k</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeSource(source.id); }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 hover:text-red-400 rounded-md transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6">
              <UploadZone onSourcesAdded={handleSourcesAdded} className="p-6 border border-border-2 bg-bg-2/50" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-[var(--bg-1)] relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-accent/5 blur-[100px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-[100px]"></div>
        </div>

        <header className="h-16 border-b border-border-1 flex items-center px-8 justify-between glass z-10">
          <div className="flex items-center gap-4">
            {output && (
              <button
                onClick={resetView}
                className="p-2 -ml-2 rounded-full hover:bg-bg-3 text-text-2 hover:text-text-1 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="font-medium text-[var(--text-1)] text-lg">
              {output ? selectedTemplate?.name : 'New Notebook'}
            </h2>
          </div>

          <div className="flex gap-2">
            {/* Toolbar actions could go here */}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto z-10 relative scroll-smooth">
          {sources.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500">
              <div className="max-w-xl space-y-8">
                <div className="space-y-4">
                  <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-[var(--text-3)] pb-2 tracking-tight">
                    What do you want to create?
                  </h1>
                  <p className="text-[var(--text-2)] text-xl leading-relaxed font-light">
                    Upload your documents to generate study guides, summaries, or briefings.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 max-w-5xl mx-auto min-h-full">
              {!output && !isGenerating ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="mb-8">
                    <h2 className="text-2xl font-semibold mb-2 text-text-1">Choose a Template</h2>
                    <p className="text-text-2">Select a structure to generate insights from your {sources.length} source{sources.length !== 1 && 's'}.</p>
                  </div>

                  {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200 text-sm">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.map(t => (
                      <button
                        key={t.id}
                        onClick={() => handleGenerate(t)}
                        className="p-6 rounded-xl border border-border-2 bg-bg-2/50 hover:bg-bg-2 hover:border-accent text-left transition-all group hover:shadow-lg hover:-translate-y-1 relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/5 transition-colors duration-300" />
                        <h3 className="font-semibold text-lg mb-2 text-text-1 group-hover:text-accent transition-colors">{t.name}</h3>
                        <p className="text-sm text-text-2 group-hover:text-text-1 transition-colors">{t.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col">
                  {isGenerating ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
                      <Loader2 className="w-12 h-12 text-accent animate-spin mb-6" />
                      <h3 className="text-xl font-medium text-text-1 mb-2">{selectedTemplate?.name}</h3>
                      <p className="text-text-2 animate-pulse">{generationStep}</p>
                    </div>
                  ) : (
                    <div className="prose prose-invert prose-lg max-w-none animate-in fade-in zoom-in-95 duration-500 pb-20">
                      <ReactMarkdown>{output}</ReactMarkdown>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
