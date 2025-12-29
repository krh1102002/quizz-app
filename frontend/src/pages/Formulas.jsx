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
  Lightbulb,
  MousePointer2
} from 'lucide-react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

const Formulas = () => {
  const [topics, setTopics] = useState([]);
  const [subtopicsMap, setSubtopicsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTopicId, setActiveTopicId] = useState(null);
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
      
      if (validTopics.length > 0) {
        setActiveTopicId(validTopics[0]._id);
      }

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

  const getTopicTheme = (topicName) => {
    const themes = {
      'Quantitative Aptitude': {
        accent: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        glow: 'shadow-[0_0_20px_rgba(245,158,11,0.2)]',
        gradient: 'from-amber-500/20 via-amber-500/5 to-transparent'
      },
      'Logical Reasoning': {
        accent: 'text-purple-400',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20',
        glow: 'shadow-[0_0_20px_rgba(168,85,247,0.2)]',
        gradient: 'from-purple-500/20 via-purple-500/5 to-transparent'
      },
      'Data Interpretation': {
        accent: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        glow: 'shadow-[0_0_20px_rgba(59,130,246,0.2)]',
        gradient: 'from-blue-500/20 via-blue-500/5 to-transparent'
      },
      'Verbal Ability': {
        accent: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        glow: 'shadow-[0_0_20px_rgba(16,185,129,0.2)]',
        gradient: 'from-emerald-500/20 via-emerald-500/5 to-transparent'
      }
    };
    return themes[topicName] || {
      accent: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
      glow: 'shadow-[0_0_20px_rgba(99,102,241,0.2)]',
      gradient: 'from-indigo-500/20 via-indigo-500/5 to-transparent'
    };
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

  const activeTopic = useMemo(() => 
    topics.find(t => t._id === activeTopicId), 
  [topics, activeTopicId]);

  const activeSubtopics = useMemo(() => {
    const subs = subtopicsMap[activeTopicId] || [];
    if (!searchQuery) return subs;
    return subs.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [subtopicsMap, activeTopicId, searchQuery]);

  const renderMathContent = (content) => {
    if (!content) return null;
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      const isLatex = line.includes('\\') || line.includes('$');
      return (
        <div key={idx} className="my-4 formula-line text-lg">
          {isLatex ? <BlockMath math={line} /> : <span className="text-gray-300">{line}</span>}
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-white pt-28 pb-20 px-4 sm:px-6 lg:px-8 relative selection:bg-indigo-500/30">
      {/* Immersive Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs font-bold uppercase tracking-widest mb-6">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Adaptive Learning Environment
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-6">
            Formula <span className="gradient-text">Laboratory</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto font-medium">
            Explore advanced conceptual frameworks through a streamlined, tab-driven interactive interface.
          </p>
        </header>

        {/* Global Search */}
        <div className="max-w-xl mx-auto mb-16 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/50 to-purple-500/50 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-500"></div>
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-white transition-colors" />
            <input 
              type="text"
              placeholder="Search across all modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 pl-16 pr-6 outline-none focus:border-white/20 text-lg transition-all backdrop-blur-md"
            />
          </div>
        </div>

        {/* Topic Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {topics.map((topic) => (
            <button
              key={topic._id}
              onClick={() => setActiveTopicId(topic._id)}
              className={`px-8 py-3.5 rounded-2xl border font-bold text-sm uppercase tracking-widest transition-all duration-300 flex items-center gap-3
                ${activeTopicId === topic._id 
                  ? 'bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.2)] scale-105' 
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                }`}
            >
              <span className="text-lg">{topic.icon}</span>
              {topic.name}
            </button>
          ))}
        </div>

        {/* Subtopic Grid of Tabs */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse border border-white/10" />)}
          </div>
        ) : activeTopic ? (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className={`p-8 rounded-[2.5rem] bg-gradient-to-br ${getTopicTheme(activeTopic.name).gradient} border ${getTopicTheme(activeTopic.name).border} backdrop-blur-sm`}>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 text-xl shadow-inner">
                  {activeTopic.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight">{activeTopic.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`h-1 w-8 rounded-full ${getTopicTheme(activeTopic.name).bg.replace('/10', '/40')}`}></span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Select a subtopic pill below</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {activeSubtopics.map((sub) => (
                  <button
                    key={sub._id}
                    onClick={() => openModal(sub)}
                    className={`group relative text-left py-4 px-6 rounded-2xl border transition-all duration-300 hover:scale-[1.02] flex items-center justify-between
                      bg-white/[0.02] border-white/5 hover:bg-white/5 hover:border-white/20
                    `}
                  >
                    <span className="font-extrabold text-sm tracking-tight text-gray-300 group-hover:text-white transition-colors truncate pr-4">
                      {sub.name}
                    </span>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all group-hover:bg-white group-hover:text-black opacity-30 group-hover:opacity-100`}>
                      <MousePointer2 className="w-4 h-4" />
                    </div>
                  </button>
                ))}
                {activeSubtopics.length === 0 && (
                  <div className="col-span-full py-12 text-center text-gray-600 font-bold uppercase tracking-widest italic decoration-dashed underline underline-offset-8">
                    No matching subtopics found in this category
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Extreme Blur Formula Modal */}
      {selectedSubtopic && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-[40px] transition-opacity animate-in fade-in duration-500" 
            onClick={closeModal}
          />
          
          <div className="relative w-full max-w-4xl max-h-[85vh] bg-[#0d101c] border border-white/10 rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="p-10 pb-6 flex items-center justify-between border-b border-white/5 relative bg-gradient-to-b from-white/[0.02] to-transparent">
              <div className="flex items-center gap-8">
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-5xl shadow-2xl border border-white/10 ${getTopicTheme(activeTopic?.name).bg}`}>
                  {selectedSubtopic.icon || '📘'}
                </div>
                <div>
                  <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] mb-2 ${getTopicTheme(activeTopic?.name).accent}`}>
                    <Target className="w-4 h-4" />
                    Deep Logic Module
                  </div>
                  <h2 className="text-4xl font-black tracking-tighter">{selectedSubtopic.name}</h2>
                </div>
              </div>
              <button 
                onClick={closeModal}
                className="w-14 h-14 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center transition-all group active:scale-95"
              >
                <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
              {loadingModal ? (
                <div className="h-64 flex flex-col items-center justify-center gap-6">
                  <div className="w-16 h-16 border-4 border-white/10 border-t-indigo-500 rounded-full animate-spin" />
                  <p className="text-gray-500 font-black uppercase tracking-[0.5em] text-[10px]">Processing Data</p>
                </div>
              ) : modalData ? (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="p-8 rounded-[2rem] bg-white/[0.01] border border-white/5 text-gray-400 leading-relaxed italic text-lg text-center backdrop-blur-md">
                    {modalData.description || `High-level conceptual breakdown and strategy for ${selectedSubtopic.name}.`}
                  </div>

                  {modalData.formulas && modalData.formulas.length > 0 ? (
                    <div className="space-y-16">
                      {modalData.formulas.map((formula, idx) => (
                        <div key={idx} className="group/formula relative">
                          <div className="flex items-center gap-4 mb-8">
                             <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center text-sm font-black shadow-inner ${getTopicTheme(activeTopic?.name).bg} ${getTopicTheme(activeTopic?.name).border} ${getTopicTheme(activeTopic?.name).accent}`}>
                               {String(idx + 1).padStart(2, '0')}
                             </div>
                             <h3 className="text-2xl font-black tracking-tight text-white group-hover/formula:text-white transition-colors uppercase">
                               {formula.title}
                             </h3>
                          </div>

                          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                            <div className="xl:col-span-12 bg-black/40 rounded-[2.5rem] p-12 border border-white/5 relative overflow-hidden shadow-inner hover:border-white/10 transition-colors">
                               <div className="absolute top-4 right-8 text-[10px] font-black text-white/5 tracking-[0.4em] uppercase">Formal Notation</div>
                               <div className="math-container relative z-10">
                                 {renderMathContent(formula.content)}
                               </div>
                            </div>

                            {formula.example && (
                              <div className="xl:col-span-12 rounded-[2.5rem] bg-indigo-500/[0.02] border border-indigo-500/10 p-10 relative hover:bg-indigo-500/[0.05] transition-colors group/tip">
                                <div className="absolute top-6 right-10">
                                  <Sparkles className="w-5 h-5 text-indigo-500/20 group-hover/tip:text-indigo-500 transition-colors" />
                                </div>
                                <div className="flex items-center gap-2 mb-6 text-indigo-400 font-black uppercase tracking-[0.2em] text-xs">
                                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                                    <Lightbulb className="w-5 h-5" />
                                  </div>
                                  Tactical Application
                                </div>
                                <div className="text-gray-300 text-lg leading-relaxed italic border-l-4 border-indigo-500/30 pl-8">
                                  {formula.example}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-20 text-center opacity-30 animate-pulse">
                      <Calculator className="w-20 h-20 mx-auto mb-6" />
                      <h4 className="text-2xl font-black uppercase tracking-widest">Awaiting Content</h4>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="p-10 py-6 border-t border-white/5 bg-white/[0.02] flex items-center justify-between text-[10px] text-gray-500 font-black tracking-[0.3em] uppercase">
              <div className="flex items-center gap-12">
                <span className="flex items-center gap-2"><Target className="w-4 h-4" /> Cognitive Ready</span>
                <span className="flex items-center gap-2"><ArrowRight className="w-4 h-4" /> Logic System v4.0</span>
              </div>
              <div className="text-white/20">Antigravity Design Lab</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Formulas;
