import React, { useState, useEffect, useMemo } from 'react';
import { topicsAPI, subtopicsAPI } from '../services/api';
import { 
  Calculator, 
  Search, 
  X,
  Target,
  Layers,
  Sparkles,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Lightbulb,
  Brain,
  BarChart3,
  Globe,
  Info,
  ChevronLeft
} from 'lucide-react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

const Formulas = () => {
  const [view, setView] = useState('topics'); // 'topics' or 'subtopics'
  const [topics, setTopics] = useState([]);
  const [subtopicsMap, setSubtopicsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTopic, setActiveTopic] = useState(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [loadingModal, setLoadingModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const topicsData = await topicsAPI.getAll();
      const validTopics = Array.isArray(topicsData) ? topicsData : [];
      setTopics(validTopics);
      
      const subMap = {};
      const subPromises = validTopics.map(async (topic) => {
        const subs = await subtopicsAPI.getByTopic(topic._id);
        subMap[topic._id] = Array.isArray(subs) ? subs : [];
      });
      
      await Promise.all(subPromises);
      setSubtopicsMap(subMap);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching formula data:', error);
      setLoading(false);
    }
  };

  const getTopicIcon = (name) => {
    const icons = {
      'Quantitative Aptitude': <Calculator className="w-8 h-8 md:w-10 md:h-10" />,
      'Logical Reasoning': <Brain className="w-8 h-8 md:w-10 md:h-10" />,
      'Data Interpretation': <BarChart3 className="w-8 h-8 md:w-10 md:h-10" />,
      'Verbal Ability': <Globe className="w-8 h-8 md:w-10 md:h-10" />
    };
    return icons[name] || <Target className="w-8 h-8 md:w-10 md:h-10" />;
  };

  const selectTopic = (topic) => {
    setActiveTopic(topic);
    setView('subtopics');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openModal = async (subtopic) => {
    setLoadingModal(true);
    setSelectedSubtopic(subtopic);
    try {
      const data = await subtopicsAPI.getOne(subtopic._id);
      setModalData(data.subtopic);
      setLoadingModal(false);
    } catch (error) {
      console.error('Error fetching subtopic details:', error);
      setLoadingModal(false);
    }
  };

  const closeModal = () => {
    setSelectedSubtopic(null);
    setModalData(null);
  };

  const filteredSubtopics = useMemo(() => {
    if (!activeTopic) return [];
    const subs = subtopicsMap[activeTopic._id] || [];
    if (!searchQuery) return subs;
    return subs.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [subtopicsMap, activeTopic, searchQuery]);

  const renderMathContent = (content) => {
    if (!content) return null;
    return content.split('\n').map((line, idx) => {
      const isLatex = line.includes('\\') || line.includes('$');
      return (
        <div key={idx} className="my-3 text-lg leading-relaxed text-gray-200">
          {isLatex ? <BlockMath math={line} /> : <span>{line}</span>}
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06080f] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-t-indigo-500 border-indigo-500/10 rounded-full animate-spin"></div>
          <span className="text-indigo-400 font-bold tracking-widest text-xs uppercase">Initializing Lab...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070a] text-white selection:bg-indigo-500/30 selection:text-white font-sans">
      {/* Premium Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">
        {view === 'topics' ? (
          <div className="transition-all duration-700 animate-in fade-in slide-in-from-bottom-8">
            <header className="mb-20 text-center">
              <h1 className="text-4xl md:text-7xl font-black tracking-tight mb-6">
                Formula <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">Nexus</span>
              </h1>
              <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                Unlock specialized knowledge through our academic repository. Select a primary domain to explore detailed modules.
              </p>
            </header>

            {/* Step 1: Topic Selection (3 Large Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {topics.map((topic) => (
                <div 
                  key={topic._id}
                  onClick={() => selectTopic(topic)}
                  className="group relative cursor-pointer"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[2.5rem] blur opacity-10 group-hover:opacity-40 transition duration-500"></div>
                  <div className="relative h-full bg-[#0d1017] border border-white/5 rounded-[2.5rem] p-10 flex flex-col items-start transition-all duration-500 group-hover:-translate-y-4 group-hover:bg-[#121620] group-hover:border-white/10 shadow-2xl overflow-hidden">
                    {/* Decorative Background Icon */}
                    <div className="absolute -right-8 -bottom-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-700 scale-[2] pointer-events-none transform rotate-[-15deg]">
                       {getTopicIcon(topic.name)}
                    </div>

                    <div className="p-5 bg-white/[0.03] border border-white/5 rounded-3xl mb-10 text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500 group-hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]">
                      {getTopicIcon(topic.name)}
                    </div>
                    
                    <div className="mb-4">
                      <span className="text-[10px] font-black tracking-[0.3em] uppercase text-[#f0a501] mb-2 block">Premium Library</span>
                      <h3 className="text-3xl font-black tracking-tighter">{topic.name}</h3>
                    </div>

                    <p className="text-gray-500 text-sm leading-relaxed mb-12 flex-grow">
                      Explore detailed derivations, shortcuts, and conceptual frameworks specifically calibrated for {topic.name}.
                    </p>

                    <div className="flex items-center gap-2 text-indigo-400 text-xs font-black uppercase tracking-widest group/btn">
                      Explore Library <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="transition-all duration-500 animate-in fade-in slide-in-from-right-8">
            <nav className="mb-12 flex items-center justify-between">
              <button 
                onClick={() => setView('topics')}
                className="flex items-center gap-2 text-gray-500 hover:text-white transition-all duration-300 font-black uppercase tracking-widest text-[10px] group px-6 py-3 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10"
              >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Categories
              </button>
              
              <div className="hidden md:flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-[#f0a501] opacity-60">
                <Sparkles className="w-4 h-4" /> conceptual depth verified
              </div>
            </nav>

            <header className="mb-16">
              <div className="flex items-center gap-6 mb-4">
                <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400">
                  {getTopicIcon(activeTopic.name)}
                </div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight">{activeTopic.name}</h2>
              </div>
              <p className="text-gray-500 text-lg md:text-xl max-w-2xl leading-relaxed">
                Specialized sub-modules covering {activeTopic.name}. Select a module to view its full analytical documentation.
              </p>
            </header>

            <div className="max-w-md relative group mb-16">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
              <input 
                type="text"
                placeholder="Search sub-modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-5 pl-14 pr-6 outline-none focus:border-indigo-500/30 text-lg transition-all"
              />
            </div>

            {/* Step 2: Subtopic Grid Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredSubtopics.map((sub) => (
                <div 
                  key={sub._id}
                  onClick={() => openModal(sub)}
                  className="group relative cursor-pointer"
                >
                  <div className="relative h-full bg-[#0d1017] border border-white/5 rounded-[1.5rem] p-8 transition-all duration-300 hover:bg-[#121620] hover:border-indigo-500/30 hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] min-h-[160px] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                         <span className="text-[9px] font-black tracking-[0.2em] uppercase text-indigo-400/50">Tech Module</span>
                         <Target className="w-4 h-4 text-white/10 group-hover:text-amber-500 transition-colors" />
                      </div>
                      <h4 className="text-xl font-black tracking-tight leading-tight group-hover:text-white transition-colors">{sub.name}</h4>
                    </div>
                    
                    <div className="pt-6 border-t border-white/5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                      <span className="text-xs font-black uppercase tracking-widest text-indigo-400">View Reference</span>
                      <ArrowRight className="w-4 h-4 text-indigo-400" />
                    </div>
                  </div>
                </div>
              ))}
              {filteredSubtopics.length === 0 && (
                <div className="col-span-full py-24 text-center border-2 border-dashed border-white/5 rounded-[2.5rem] opacity-30">
                  <span className="text-2xl font-black uppercase tracking-widest">No modules identified</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Immersive Formula Modal */}
      {selectedSubtopic && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-12 overflow-hidden">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-[45px] animate-in fade-in duration-700" 
            onClick={closeModal}
          />
          
          <div className="relative w-full max-w-6xl max-h-[92vh] bg-[#0d0f14] border border-white/10 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-in zoom-in-95 ease-out duration-500">
            {/* Modal Header */}
            <div className="p-8 md:p-12 flex items-center justify-between border-b border-white/5 relative overflow-hidden bg-gradient-to-b from-white/[0.02] to-transparent">
              <div className="flex items-center gap-8">
                <div className="w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-[1.5rem] flex items-center justify-center text-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.15)] transform -rotate-6">
                   {getTopicIcon(activeTopic?.name)}
                </div>
                <div>
                   <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-amber-500/80 mb-3">
                     <Target className="w-4 h-4" /> Technical Reference Documentation
                   </div>
                   <h2 className="text-3xl md:text-5xl font-black tracking-tighter leading-none">{selectedSubtopic.name}</h2>
                </div>
              </div>
              <button 
                onClick={closeModal}
                className="w-16 h-16 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center transition-all group active:scale-90"
              >
                <X className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-8 md:p-16 scrollbar-hide">
              {loadingModal ? (
                <div className="h-96 flex flex-col items-center justify-center gap-8">
                  <div className="w-16 h-16 border-[6px] border-white/5 border-t-indigo-500 rounded-full animate-spin shadow-glow"></div>
                  <p className="text-gray-600 font-black uppercase tracking-[0.5em] text-[10px] animate-pulse">Decrypting Information Core</p>
                </div>
              ) : modalData ? (
                <div className="space-y-24 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                  <div className="relative">
                    <div className="absolute -left-8 top-0 bottom-0 w-1 bg-gradient-to-g from-indigo-500 to-transparent"></div>
                    <p className="text-gray-400 text-xl md:text-2xl leading-relaxed italic font-medium max-w-4xl px-4">
                      "{modalData.description || `Tactical analysis and rigorous derivations calibrated for the ${selectedSubtopic.name} domain.`}"
                    </p>
                  </div>

                  {modalData.formulas && modalData.formulas.length > 0 ? (
                    modalData.formulas.map((formula, idx) => (
                      <div key={idx} className="group/formula pb-24 last:pb-8 relative">
                        {/* Formula Title & Metadata */}
                        <div className="mb-12 flex items-center justify-between relative z-10">
                          <div className="flex items-start gap-6">
                            <div className="mt-1 w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center font-black text-xs text-indigo-400">
                              {String(idx + 1).padStart(2, '0')}
                            </div>
                            <div>
                               <h3 className="text-3xl font-black tracking-tight text-white mb-2 group-hover/formula:text-indigo-400 transition-colors uppercase leading-tight">
                                {formula.title}
                              </h3>
                              <span className="text-[10px] font-black tracking-[0.3em] uppercase text-gray-600 block">Formal Representation Block</span>
                            </div>
                          </div>
                          <Sparkles className="w-6 h-6 text-indigo-500/20 group-hover/formula:text-indigo-500/50 transition-all duration-700" />
                        </div>

                        {/* Visual & Examples */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative">
                           {/* Decorative Underlay */}
                           <div className="absolute -inset-10 bg-indigo-500/5 blur-[80px] opacity-0 group-hover/formula:opacity-100 transition-opacity duration-1000 -z-10"></div>
                           
                           {/* Math Notation Block */}
                           <div className="lg:col-span-8 bg-[#05060a] rounded-[2.5rem] p-12 md:p-16 border border-white/5 shadow-2xl relative overflow-hidden group/math hover:border-indigo-500/20 transition-all duration-500">
                              <div className="absolute top-6 right-10 text-[9px] font-black text-white/5 tracking-[0.5em] uppercase group-hover/math:text-indigo-500/20 transition-colors">Analytical Pattern</div>
                              <div className="relative z-10 transform md:scale-110 lg:scale-125 origin-left">
                                 {renderMathContent(formula.content)}
                              </div>
                           </div>

                           {/* Pro-Tip/Example Block */}
                           {formula.example && (
                            <div className="lg:col-span-4 rounded-[2.5rem] bg-amber-500/[0.02] border border-amber-500/10 p-10 flex flex-col justify-center relative hover:bg-amber-500/[0.04] transition-all duration-500 group/tip">
                               <div className="absolute top-8 right-8 text-amber-500 opacity-20 transform -rotate-12 group-hover/tip:rotate-0 transition-transform duration-700">
                                  <Lightbulb className="w-10 h-10" />
                               </div>
                               <div className="flex items-center gap-3 mb-6">
                                  <span className="h-[2px] w-6 bg-amber-500 opacity-30"></span>
                                  <span className="text-[10px] font-black tracking-[0.4em] uppercase text-amber-500">Strategist Note</span>
                               </div>
                               <p className="text-gray-400 italic text-lg leading-relaxed border-l-2 border-amber-500/30 pl-8">
                                  {formula.example}
                               </p>
                            </div>
                           )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-24 text-center opacity-20 grayscale flex flex-col items-center gap-8">
                      <Layers className="w-24 h-24" />
                      <h4 className="text-2xl font-black uppercase tracking-[0.6em]">No Formula Modules Found</h4>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="p-10 border-t border-white/5 bg-black py-4 flex items-center justify-between text-[10px] font-black text-gray-700 tracking-[0.6em] uppercase">
              <div className="flex items-center gap-12">
                <span className="flex items-center gap-3">Verified Academic Integrity</span>
                <span className="flex items-center gap-3">Cognitive Clarity High</span>
              </div>
              <div className="text-white/5">Antigravity Design Lab v7.4</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Formulas;
