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
  ExternalLink,
  ChevronRight,
  Lightbulb
} from 'lucide-react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

const Formulas = () => {
  const [topics, setTopics] = useState([]);
  const [subtopicsMap, setSubtopicsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
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
      setTopics(Array.isArray(topicsData) ? topicsData : []);
      
      const subMap = {};
      const subPromises = topicsData.map(async (topic) => {
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

  const openModal = async (subtopic) => {
    setSelectedSubtopic(subtopic);
    setLoadingModal(true);
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

  const filteredData = useMemo(() => {
    if (!searchQuery) return topics;
    return topics.map(topic => {
      const matchingSubs = (subtopicsMap[topic._id] || []).filter(sub => 
        sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (matchingSubs.length > 0) return { ...topic, filteredSubs: matchingSubs };
      return null;
    }).filter(t => t !== null);
  }, [topics, subtopicsMap, searchQuery]);

  const renderMathContent = (content) => {
    if (!content) return null;
    const isLatex = content.includes('\\') || content.includes('$');
    if (isLatex) {
      return content.split('\n').map((line, idx) => (
        <div key={idx} className="my-4 formula-line text-lg">
          {line.includes('\\') ? <BlockMath math={line} /> : <span className="text-gray-200">{line}</span>}
        </div>
      ));
    }
    return <p className="whitespace-pre-line text-gray-300 leading-relaxed text-lg">{content}</p>;
  };

  return (
    <div className="min-h-screen bg-[#06080f] text-white pt-28 pb-20 px-4 sm:px-6 lg:px-8 relative selection:bg-indigo-500/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-indigo-600/5 rounded-full blur-[160px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[70%] h-[70%] bg-purple-600/5 rounded-full blur-[160px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="text-center mb-20 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6">
            <Sparkles className="w-4 h-4" />
            Interactive Learning Library
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
            Conceptual <span className="gradient-text">Formulas</span>
          </h1>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto leading-relaxed mb-10">
            A visual repository of technical shortcuts, mathematical derivations, and logical principles.
          </p>

          <div className="relative max-w-2xl mx-auto group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-500"></div>
            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
              <input 
                type="text"
                placeholder="Search subtopics, concepts, or rules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0d111c] border border-white/10 rounded-2xl py-5 pl-16 pr-6 outline-none focus:border-indigo-500/30 text-lg transition-all shadow-2xl"
              />
            </div>
          </div>
        </header>

        {loading ? (
          <GridLoadingSkeleton />
        ) : (
          <div className="space-y-24">
            {filteredData.map((topic) => (
              <section key={topic._id} className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="flex items-center gap-4 mb-10 pb-4 border-b border-white/5">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-3xl shadow-inner border border-white/10">
                    {topic.icon}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight">{topic.name}</h2>
                    <p className="text-gray-500 text-sm font-medium uppercase tracking-widest mt-1">
                      {topic.description || `${(topic.filteredSubs || subtopicsMap[topic._id] || []).length} Specialized Modules`}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {(topic.filteredSubs || subtopicsMap[topic._id] || []).map((sub) => (
                    <button
                      key={sub._id}
                      onClick={() => openModal(sub)}
                      className="group relative text-left h-full"
                    >
                      <div className="card-3d h-full p-6 bg-white/[0.03] border border-white/5 hover:border-indigo-500/30 transition-all cursor-pointer overflow-hidden flex flex-col justify-between min-h-[160px]">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                           <Calculator className="w-12 h-12" />
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-3 opacity-60 group-hover:opacity-100 transition-opacity">
                            <Target className="w-3 h-3" />
                            Module Path
                          </div>
                          <h3 className="text-xl font-bold group-hover:text-indigo-400 transition-colors leading-tight">
                            {sub.name}
                          </h3>
                        </div>

                        <div className="mt-6 flex items-center justify-between">
                           <span className="text-xs text-gray-500 font-medium flex items-center gap-1 group-hover:text-gray-300 transition-colors">
                             View Formulas <ArrowRight className="w-3 h-3 translate-x-0 group-hover:translate-x-1 transition-transform" />
                           </span>
                           <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
                             <ChevronRight className="w-4 h-4 text-white" />
                           </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {/* Premium Formula Modal */}
      {selectedSubtopic && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 md:p-10">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-xl transition-opacity animate-in fade-in duration-300" 
            onClick={closeModal}
          />
          
          <div className="relative w-full max-w-5xl max-h-[85vh] bg-[#0d101c] border border-white/10 rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="p-8 pb-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-br from-indigo-500/5 to-transparent relative">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-4xl shadow-glow border border-white/10">
                  {selectedSubtopic.icon || '📚'}
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    Conceptual Module
                  </div>
                  <h2 className="text-3xl font-extrabold tracking-tight">{selectedSubtopic.name}</h2>
                </div>
              </div>
              <button 
                onClick={closeModal}
                className="w-12 h-12 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center transition-all group active:scale-95"
              >
                <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
              {loadingModal ? (
                <div className="h-64 flex flex-col items-center justify-center gap-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                  <p className="text-indigo-400 font-bold uppercase tracking-widest text-xs">Accessing Knowledge...</p>
                </div>
              ) : modalData ? (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="p-8 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 text-gray-400 leading-relaxed italic text-lg text-center backdrop-blur-sm shadow-inner">
                    "{modalData.description || `Master the principles and technical derivations of ${selectedSubtopic.name}.`}"
                  </div>

                  {modalData.formulas && modalData.formulas.length > 0 ? (
                    <div className="space-y-16">
                      {modalData.formulas.map((formula, idx) => (
                        <div key={idx} className="group/formula relative">
                          <div className="flex items-center gap-4 mb-8">
                             <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-base font-bold text-indigo-400 shadow-inner">
                               {String(idx + 1).padStart(2, '0')}
                             </div>
                             <h3 className="text-2xl font-bold tracking-tight text-white group-hover/formula:text-indigo-400 transition-colors uppercase tracking-tight">
                               {formula.title}
                             </h3>
                          </div>

                          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                            <div className="xl:col-span-8 bg-black/40 rounded-[2.5rem] p-12 border border-white/5 relative overflow-hidden group/math shadow-inner">
                               <div className="absolute top-4 right-8 text-[10px] uppercase font-black text-white/5 tracking-[0.3em] group-hover/math:text-indigo-500/20 transition-colors">Technical Notation</div>
                               <div className="math-container">
                                 {renderMathContent(formula.content)}
                               </div>
                            </div>

                            {formula.example && (
                              <div className="xl:col-span-4 rounded-[2.5rem] bg-amber-500/[0.03] border border-amber-500/10 p-10 relative hover:bg-amber-500/[0.06] transition-colors group/tip flex flex-col justify-center">
                                <div className="absolute top-6 right-8">
                                  <Sparkles className="w-5 h-5 text-amber-500/20 group-hover/tip:text-amber-500 transition-colors" />
                                </div>
                                <div className="flex items-center gap-2 mb-6">
                                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                    <Lightbulb className="w-6 h-6 text-amber-500" />
                                  </div>
                                  <span className="text-sm font-black text-amber-500 uppercase tracking-widest">Strategy</span>
                                </div>
                                <div className="text-gray-400 text-lg leading-relaxed italic border-l-2 border-amber-500/20 pl-6">
                                  {formula.example}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-20 text-center opacity-30">
                      <Calculator className="w-20 h-20 mx-auto mb-6" />
                      <h4 className="text-2xl font-bold">Concept Library Empty</h4>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-20 text-center text-red-400 font-bold">
                  Failed to load conceptual data.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-8 py-6 border-t border-white/5 bg-white/[0.02] flex items-center justify-between text-[10px] text-gray-500 font-black tracking-widest uppercase">
              <div className="flex items-center gap-8">
                <span className="flex items-center gap-2 group cursor-help hover:text-indigo-400 transition-colors">
                  <Target className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" /> 
                  Academic Precision
                </span>
                <span className="flex items-center gap-2 group cursor-help hover:text-indigo-400 transition-colors">
                  <ExternalLink className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" /> 
                  Reference Verified
                </span>
              </div>
              <div className="text-indigo-400/40">Antigravity AI Conceptual Lab</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const GridLoadingSkeleton = () => (
  <div className="space-y-24">
    {[1, 2].map(s => (
      <div key={s} className="animate-pulse">
        <div className="flex items-center gap-4 mb-10 pb-4 border-b border-white/5">
          <div className="w-12 h-12 bg-white/5 rounded-xl" />
          <div className="h-8 w-64 bg-white/5 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-44 bg-white/5 rounded-[2rem] border border-white/5" />
          ))}
        </div>
      </div>
    ))}
  </div>
);

export default Formulas;
