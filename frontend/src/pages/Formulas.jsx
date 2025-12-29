import React, { useState, useEffect, useMemo } from 'react';
import { topicsAPI, subtopicsAPI } from '../services/api';
import { 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  Calculator, 
  Info, 
  Lightbulb, 
  Search, 
  ArrowRight,
  Target,
  Layers,
  Sparkles
} from 'lucide-react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

const Formulas = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTopic, setExpandedTopic] = useState(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState(null);
  const [subtopicData, setSubtopicData] = useState(null);
  const [loadingSubtopic, setLoadingSubtopic] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const data = await topicsAPI.getAll();
      setTopics(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching topics:', error);
      setLoading(false);
    }
  };

  const fetchSubtopicDetails = async (subtopicId) => {
    setLoadingSubtopic(true);
    try {
      const data = await subtopicsAPI.getOne(subtopicId);
      setSubtopicData(data.subtopic);
      setSelectedSubtopic(subtopicId);
      setLoadingSubtopic(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error fetching subtopic details:', error);
      setLoadingSubtopic(false);
    }
  };

  const filteredTopics = useMemo(() => {
    if (!searchQuery) return topics;
    return topics.filter(t => 
      t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [topics, searchQuery]);

  const renderContent = (content) => {
    if (!content) return null;
    const isLatex = content.includes('\\') || content.includes('$');
    if (isLatex) {
      return content.split('\n').map((line, idx) => (
        <div key={idx} className="my-3 formula-line">
          {line.includes('\\') ? <BlockMath math={line} /> : <span className="text-gray-200">{line}</span>}
        </div>
      ));
    }
    return <p className="whitespace-pre-line text-gray-300 leading-relaxed">{content}</p>;
  };

  return (
    <div className="min-h-screen bg-[#080a12] text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative selection:bg-indigo-500/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-12 text-center lg:text-left">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-white/5">
            <div>
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                  <Calculator className="w-5 h-5 text-indigo-400" />
                </div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400">Knowledge Base</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
                Formula <span className="gradient-text">Repository</span>
              </h1>
              <p className="text-gray-400 text-lg max-w-xl mx-auto lg:mx-0">
                A professional collection of mathematical concepts, logical rules, and practice tips.
              </p>
            </div>
            
            <div className="relative group w-full md:w-80 mx-auto lg:mx-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
              <input 
                type="text"
                placeholder="Search topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all backdrop-blur-md"
              />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="lg:sticky lg:top-32 space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Navigation</h3>
                <Layers className="w-4 h-4 text-gray-600" />
              </div>
              
              <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto pr-2 custom-scrollbar lg:block hidden">
                {loading ? (
                  <SidebarLoadingSkeleton />
                ) : (
                  filteredTopics.map((topic) => (
                    <TopicAccordion 
                      key={topic._id}
                      topic={topic}
                      isExpanded={expandedTopic === topic._id}
                      onToggle={() => setExpandedTopic(expandedTopic === topic._id ? null : topic._id)}
                      onSelectSubtopic={fetchSubtopicDetails}
                      selectedSubtopicId={selectedSubtopic}
                    />
                  ))
                )}
                {!loading && filteredTopics.length === 0 && (
                  <p className="text-center text-gray-500 py-8 text-sm italic">No topics match your search</p>
                )}
              </div>

              {/* Mobile Sidebar (Horizontal Scroll or Simpler List) */}
              <div className="lg:hidden flex overflow-x-auto pb-4 gap-3 no-scrollbar">
                {filteredTopics.map((topic) => (
                  <button
                    key={topic._id}
                    onClick={() => {
                      setExpandedTopic(expandedTopic === topic._id ? null : topic._id);
                    }}
                    className={`flex-shrink-0 px-6 py-3 rounded-2xl border flex items-center gap-2 whitespace-nowrap transition-all
                      ${expandedTopic === topic._id ? 'bg-indigo-600/20 border-indigo-500/50 text-white' : 'bg-white/5 border-white/10 text-gray-400'}`}
                  >
                    <span>{topic.icon}</span>
                    <span className="font-semibold">{topic.name}</span>
                  </button>
                ))}
              </div>
              {expandedTopic && (
                <div className="lg:hidden bg-white/5 rounded-2xl border border-white/10 p-4 mb-8">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase mb-4 tracking-tighter text-center">Select Subtopic</h4>
                  <SubtopicList topicId={expandedTopic} onSelect={fetchSubtopicDetails} selectedId={selectedSubtopic} />
                </div>
              )}
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-9">
            {selectedSubtopic ? (
              <FormulaContent 
                data={subtopicData} 
                loading={loadingSubtopic} 
                renderContent={renderContent} 
              />
            ) : (
              <EmptyState />
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

/* --- UI Sub-Components --- */

const TopicAccordion = ({ topic, isExpanded, onToggle, onSelectSubtopic, selectedSubtopicId }) => {
  return (
    <div className={`rounded-2xl border transition-all duration-300 ${isExpanded ? 'bg-white/5 border-white/10 shadow-lg' : 'border-transparent hover:bg-white/[0.03]'}`}>
      <button 
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 px-5 text-left group"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl group-hover:scale-110 transition-transform">{topic.icon || '📁'}</span>
          <span className={`font-semibold transition-colors ${isExpanded ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
            {topic.name}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-indigo-400' : ''}`} />
      </button>

      <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[800px] opacity-100 pb-4' : 'max-h-0 opacity-0'}`}>
        <SubtopicList topicId={topic._id} onSelect={onSelectSubtopic} selectedId={selectedSubtopicId} />
      </div>
    </div>
  );
};

const SubtopicList = ({ topicId, onSelect, selectedId }) => {
  const [subtopics, setSubtopics] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchSub = async () => {
      setLoading(true);
      try {
        const data = await subtopicsAPI.getByTopic(topicId);
        setSubtopics(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSub();
  }, [topicId]);

  if (loading) return <div className="px-14 py-2 text-xs text-gray-600 animate-pulse uppercase tracking-widest">Loading...</div>;

  return (
    <ul className="px-4 space-y-1">
      {subtopics.map(sub => (
        <li key={sub._id}>
          <button
            onClick={() => onSelect(sub._id)}
            className={`w-full text-left px-4 py-2.5 text-sm rounded-xl transition-all flex items-center gap-3 group
              ${selectedId === sub._id 
                ? 'bg-indigo-500 text-white shadow-glow translate-x-1 font-bold' 
                : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'
              }`}
          >
            <ArrowRight className={`w-3 h-3 transition-transform ${selectedId === sub._id ? 'opacity-100' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}`} />
            <span className="truncate">{sub.name}</span>
          </button>
        </li>
      ))}
    </ul>
  );
};

const FormulaContent = ({ data, loading, renderContent }) => {
  if (loading) {
    return (
      <div className="card p-20 flex flex-col items-center justify-center gap-6 animate-pulse border-white/5">
        <div className="w-16 h-16 bg-white/5 rounded-2xl" />
        <div className="h-8 w-64 bg-white/5 rounded-lg" />
        <div className="h-4 w-96 bg-white/5 rounded-lg" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
      {/* Breadcrumb & Header */}
      <div className="card p-8 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border-white/10 backdrop-blur-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] scale-[4] rotate-12 group-hover:rotate-0 transition-transform duration-1000 select-none pointer-events-none">
           <BookOpen className="w-24 h-24 text-white" />
        </div>
        
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-white/10">
            {data.icon || '📝'}
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">
              <Target className="w-3 h-3" />
              Technical Module
            </div>
            <h2 className="text-3xl font-bold">{data.name}</h2>
          </div>
        </div>
        
        <p className="text-gray-400 text-lg leading-relaxed max-w-3xl">
          {data.description || `Comprehensive analytical guide for ${data.name} including derived formulas and strategy.`}
        </p>
      </div>

      {/* Formula Cards */}
      <div className="grid gap-6">
        {data.formulas && data.formulas.length > 0 ? (
          data.formulas.map((formula, idx) => (
            <div key={idx} className="card-3d p-8 bg-white/[0.02] border-white/5 hover:bg-white/[0.04] transition-all group overflow-hidden">
               <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                        <span className="text-xs font-bold text-indigo-400">{String(idx + 1).padStart(2, '0')}</span>
                      </div>
                      <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{formula.title}</h3>
                    </div>
                    
                    <div className="bg-black/40 rounded-2xl p-8 border border-white/5 text-white/90 overflow-x-auto shadow-inner relative group/math">
                       <div className="absolute top-4 right-4 text-[10px] uppercase font-bold text-white/10 tracking-widest group-hover/math:text-indigo-500/40 transition-colors">Concept View</div>
                       {renderContent(formula.content)}
                    </div>
                  </div>

                  {formula.example && (
                    <div className="w-full md:w-80 space-y-4">
                      <div className="bg-amber-500/5 rounded-2xl p-6 border border-amber-500/10 h-full relative group/tip hover:bg-amber-500/10 transition-colors">
                        <Sparkles className="absolute top-4 right-4 w-4 h-4 text-amber-500/30 group-hover/tip:text-amber-500 transition-colors" />
                        <div className="flex items-center gap-2 mb-4">
                          <Lightbulb className="w-5 h-5 text-amber-500" />
                          <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Application Tip</span>
                        </div>
                        <div className="text-sm text-gray-300 italic leading-relaxed">
                          {formula.example}
                        </div>
                      </div>
                    </div>
                  )}
               </div>
            </div>
          ))
        ) : (
          <div className="card p-20 text-center border-dashed border-white/10 opacity-50">
            <Calculator className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p>Our academic team is populating this concept module.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const EmptyState = () => (
  <div className="card h-full min-h-[600px] flex flex-col items-center justify-center p-20 text-center bg-white/[0.02] border-dashed border-white/10 relative overflow-hidden">
    <div className="absolute inset-0 bg-indigo-500/5 blur-[120px]" />
    <div className="relative group">
      <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" />
      <div className="w-32 h-32 bg-indigo-500/10 rounded-3xl border border-indigo-500/20 flex items-center justify-center mb-8 floating">
        <BookOpen className="w-16 h-16 text-indigo-400" />
      </div>
    </div>
    <h3 className="text-3xl font-bold text-white mb-4">Ready to <span className="gradient-text">Master</span>?</h3>
    <p className="text-gray-400 max-w-sm mx-auto text-lg leading-relaxed">
      Select a conceptual topic from the left menu to visualize advanced formulas and mental shortcuts.
    </p>
  </div>
);

const SidebarLoadingSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3, 4, 5, 6].map(i => (
      <div key={i} className="h-14 bg-white/5 rounded-2xl border border-white/10 animate-pulse" />
    ))}
  </div>
);

export default Formulas;
