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
  Info
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
      'Quantitative Aptitude': <Calculator className="w-8 h-8" />,
      'Logical Reasoning': <Brain className="w-8 h-8" />,
      'Data Interpretation': <BarChart3 className="w-8 h-8" />,
      'Verbal Ability': <Globe className="w-8 h-8" />
    };
    return icons[name] || <Target className="w-8 h-8" />;
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
        <div key={idx} className="my-4 formula-line text-lg flex justify-start">
          {isLatex ? <BlockMath math={line} /> : <span className="text-gray-300">{line}</span>}
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06080f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin shadow-[0_0_20px_rgba(99,102,241,0.2)]"></div>
          <p className="text-indigo-400 font-bold tracking-[0.3em] uppercase text-xs">Accessing Knowledge Lab...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#04060b] text-white pt-32 pb-20 px-4 md:px-12 relative selection:bg-indigo-500/30 font-sans">
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-600/5 rounded-full blur-[140px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {view === 'topics' ? (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <header className="mb-24 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/5 border border-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8">
                <Layers className="w-4 h-4" /> Academic Repository
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-tight">
                Formula <span className="relative inline-block">
                  <span className="relative z-10 bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">Library</span>
                  <span className="absolute bottom-2 left-0 w-full h-3 bg-indigo-500/10 -z-10"></span>
                </span>
              </h1>
              <p className="text-gray-500 text-xl max-w-2xl mx-auto leading-relaxed font-medium">
                Master complex concepts through our high-density repository of mathematical principles and logical frameworks.
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
              {topics.map((topic) => (
                <div 
                  key={topic._id}
                  onClick={() => selectTopic(topic)}
                  className="group relative cursor-pointer perspective-1000"
                >
                  <div className="absolute -inset-1 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  <div className="relative h-full bg-[#0a0d16] border border-white/5 rounded-[2.5rem] p-10 flex flex-col items-start transition-all duration-500 group-hover:-translate-y-3 group-hover:border-indigo-500/30 group-hover:bg-[#0e121f] shadow-2xl backdrop-blur-md overflow-hidden">
                    {/* Decorative Element */}
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity duration-700 scale-150 -rotate-12 group-hover:rotate-0">
                      {getTopicIcon(topic.name)}
                    </div>

                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl flex items-center justify-center mb-8 border border-white/5 group-hover:border-indigo-500/30 shadow-inner group-hover:scale-110 transition-transform duration-500 text-indigo-400">
                      {getTopicIcon(topic.name)}
                    </div>
                    
                    <div className="mb-6 relative z-10">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="h-1 w-6 bg-indigo-500 rounded-full"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f0a501]">
                          Verified Category
                        </span>
                      </div>
                      <h3 className="text-3xl font-black tracking-tight group-hover:text-white transition-colors">{topic.name}</h3>
                    </div>

                    <p className="text-gray-500 text-sm leading-relaxed mb-12 flex-grow font-medium">
                      Explore detailed conceptual modules and technical derivations specifically calibrated for {topic.name}.
                    </p>

                    <div className="flex items-center justify-between w-full relative z-10 pt-6 border-t border-white/5">
                      <div className="flex items-center gap-3 text-indigo-400 text-[10px] font-black uppercase tracking-widest group/btn">
                        Get Started <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xs font-black text-gray-500 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500">
                         {subtopicsMap[topic._id]?.length || 0}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-8 duration-700">
            <nav className="flex items-center justify-between mb-16">
              <button 
                onClick={() => setView('topics')}
                className="flex items-center gap-3 text-gray-500 hover:text-white transition-all duration-300 font-black uppercase tracking-[0.2em] text-[10px] group px-5 py-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Home / {activeTopic.name}
              </button>
              
              <div className="hidden md:flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-600">
                  <span className="flex items-center gap-1.5"><Info className="w-3 h-3" /> Select a module below</span>
              </div>
            </nav>

            <header className="mb-16">
              <div className="flex items-center gap-6 mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-[2rem] flex items-center justify-center text-indigo-400 border border-white/10 shadow-glow animate-pulse">
                  {getTopicIcon(activeTopic.name)}
                </div>
                <div>
                  <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-2">
                    {activeTopic.name.split(' ')[0]} <span className="text-indigo-400">{activeTopic.name.split(' ').slice(1).join(' ')}</span>
                  </h1>
                  <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px]">
                     Conceptual Syllabus Coverage
                  </p>
                </div>
              </div>
            </header>

            <div className="mb-16 max-w-lg relative group">
              <div className="absolute -inset-1 bg-indigo-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
              <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-white transition-colors" />
                <input 
                  type="text"
                  placeholder="Filter specialized modules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0a0d16] border border-white/5 rounded-2xl py-5 pl-16 pr-6 outline-none focus:border-indigo-500/40 text-lg transition-all backdrop-blur-md shadow-2xl font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredSubtopics.map((sub) => (
                <div 
                  key={sub._id}
                  onClick={() => openModal(sub)}
                  className="group relative cursor-pointer"
                >
                  <div className="relative h-full bg-[#0d121f]/60 backdrop-blur-md border border-white/5 rounded-3xl p-8 flex flex-col justify-between transition-all duration-500 hover:bg-[#121828] hover:border-indigo-500/30 hover:scale-[1.03] hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] min-h-[180px]">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between uppercase tracking-[0.3em] font-black text-[9px] mb-2">
                        <span className="text-indigo-500">Module</span>
                        <Target className="w-3 h-3 text-white/10 group-hover:text-amber-500 transition-colors" />
                      </div>
                      <h3 className="text-xl font-black tracking-tight leading-tight group-hover:text-white transition-colors">
                        {sub.name}
                      </h3>
                    </div>
                    
                    <div className="pt-6 flex justify-between items-center opacity-40 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-gray-400">View Data</span>
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-500">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {filteredSubtopics.length === 0 && (
                <div className="col-span-full py-24 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
                   <div className="text-gray-600 font-extrabold text-xl uppercase tracking-widest italic decoration-indigo-500/20 underline underline-offset-8">
                     No modules discovered in this sector
                   </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Formula Modal with Extreme Focus */}
      {selectedSubtopic && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 md:p-12">
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-[45px] transition-opacity animate-in fade-in duration-700" 
            onClick={closeModal}
          />
          
          <div className="relative w-full max-w-5xl max-h-[92vh] bg-[#090c15] border border-white/10 rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-500">
            {/* Modal Header */}
            <div className="p-10 pb-8 flex items-center justify-between border-b border-white/5 relative bg-gradient-to-b from-white/[0.03] to-transparent">
              <div className="flex items-center gap-8">
                <div className="w-20 h-20 rounded-[1.5rem] bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-4xl shadow-glow text-indigo-400">
                  {getTopicIcon(activeTopic?.name)}
                </div>
                <div>
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-amber-500 mb-3">
                    <Sparkles className="w-4 h-4" /> Official Formulation
                  </div>
                  <h2 className="text-4xl font-black tracking-tighter leading-none">{selectedSubtopic.name}</h2>
                </div>
              </div>
              <button 
                onClick={closeModal}
                className="w-14 h-14 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center transition-all group active:scale-90"
              >
                <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-12 md:p-16 custom-scrollbar">
              {loadingModal ? (
                <div className="h-64 flex flex-col items-center justify-center gap-8">
                  <div className="w-14 h-14 border-[5px] border-white/5 border-t-indigo-500 rounded-full animate-spin" />
                  <p className="text-gray-600 font-black uppercase tracking-[0.6em] text-[10px] animate-pulse">Syncing Logic Core</p>
                </div>
              ) : modalData ? (
                <div className="space-y-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <div className="p-10 rounded-[2.5rem] bg-white/[0.01] border border-white/5 text-gray-400 leading-relaxed italic text-xl text-center backdrop-blur-xl shadow-inner-glow">
                    "{modalData.description || `Tactical concepts and formal derivations developed for ${selectedSubtopic.name}.`}"
                  </div>

                  {modalData.formulas && modalData.formulas.length > 0 ? (
                    modalData.formulas.map((formula, idx) => (
                      <div key={idx} className="group/formula border-white/5 pb-20 last:pb-0 relative">
                        <div className="flex items-center justify-between mb-10">
                          <div className="flex items-center gap-6">
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-sm font-black text-indigo-400">
                              {String(idx + 1).padStart(2, '0')}
                            </div>
                            <h3 className="text-3xl font-black tracking-tighter uppercase text-white/90 group-hover/formula:text-white transition-colors">
                              {formula.title}
                            </h3>
                          </div>
                          <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.3em] text-gray-500">
                             Formula Block
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                          <div className="lg:col-span-12 bg-[#05060a] rounded-[3rem] p-12 md:p-16 border border-white/5 shadow-2xl relative overflow-hidden group/math hover:border-indigo-500/20 transition-all duration-500">
                             <div className="absolute top-6 right-10 text-[10px] font-black text-white/[0.03] tracking-[0.5em] uppercase pointer-events-none group-hover/math:text-indigo-500/10 transition-colors">Theoretical Model</div>
                             <div className="math-container transform scale-110 origin-left">
                               {renderMathContent(formula.content)}
                             </div>
                          </div>

                          {formula.example && (
                            <div className="lg:col-span-12 rounded-[2.5rem] bg-indigo-500/[0.02] border border-indigo-500/10 p-12 relative flex flex-col group/strategy hover:bg-indigo-500/[0.05] transition-all duration-500">
                               <div className="flex items-center gap-3 mb-8 text-indigo-400">
                                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                    <Sparkles className="w-5 h-5" />
                                  </div>
                                  <span className="text-[11px] font-black uppercase tracking-[0.4em]">Elite Strategy</span>
                               </div>
                               <p className="text-gray-400 italic text-xl leading-relaxed border-l-4 border-indigo-500/20 pl-10 relative">
                                  {formula.example}
                               </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-24 text-center opacity-20 flex flex-col items-center">
                      <Layers className="w-24 h-24 mb-10" />
                      <h4 className="text-3xl font-black uppercase tracking-[0.5em]">No Data Blocks</h4>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="p-10 py-6 border-t border-white/5 bg-black flex items-center justify-between text-[11px] font-black text-gray-700 tracking-[0.5em] uppercase">
              <div className="flex items-center gap-12">
                <span className="flex items-center gap-3"><ChevronRight className="w-4 h-4 text-indigo-500" /> Cognitive Optimized</span>
                <span className="flex items-center gap-3"><ChevronRight className="w-4 h-4 text-indigo-500" /> Data Verified</span>
              </div>
              <div className="text-white/10">Antigravity Design Lab v5.0</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Formulas;
