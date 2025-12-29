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
  Zap
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

  const getTopicColor = (name) => {
    const colors = {
      'Quantitative Aptitude': 'from-blue-500/20 via-indigo-500/20 to-purple-500/20',
      'Logical Reasoning': 'from-purple-500/20 via-pink-500/20 to-rose-500/20',
      'Data Interpretation': 'from-cyan-500/20 via-blue-500/20 to-indigo-500/20',
      'Verbal Ability': 'from-emerald-500/20 via-teal-500/20 to-cyan-500/20'
    };
    return colors[name] || 'from-indigo-500/20 via-purple-500/20 to-pink-500/20';
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
      <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#0f1419] to-[#0a0e1a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-purple-500/30 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="text-indigo-400 font-semibold tracking-wider uppercase text-sm">Loading Formula Library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#0f1419] to-[#0a0e1a] text-white pt-24 pb-20 px-4 md:px-8 lg:px-12 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {view === 'topics' ? (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Header */}
            <header className="mb-16 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-6 backdrop-blur-sm">
                <Layers className="w-4 h-4" /> Formula Repository
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-tight">
                <span className="bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent">
                  Formula Library
                </span>
              </h1>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
                Explore comprehensive formulas and concepts organized by topics. Click on any topic to discover subtopics and their formulas.
              </p>
            </header>

            {/* Topics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {topics.map((topic, index) => (
                <div 
                  key={topic._id}
                  onClick={() => selectTopic(topic)}
                  className="group relative cursor-pointer"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* 3D Card Effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"></div>
                  
                  {/* Main Card */}
                  <div className="relative h-full bg-gradient-to-br from-[#1a1f2e] to-[#0f1419] border border-white/10 rounded-3xl p-8 flex flex-col transition-all duration-500 group-hover:-translate-y-2 group-hover:border-indigo-500/30 group-hover:shadow-2xl group-hover:shadow-indigo-500/20 backdrop-blur-sm">
                    {/* Card Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-indigo-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 rounded-3xl transition-all duration-500"></div>
                    
                    {/* Icon Container */}
                    <div className="relative z-10 mb-6">
                      <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getTopicColor(topic.name)} flex items-center justify-center border border-white/10 group-hover:border-indigo-500/30 group-hover:scale-110 transition-all duration-500 shadow-lg`}>
                        <div className="text-indigo-400 group-hover:text-indigo-300 transition-colors">
                          {getTopicIcon(topic.name)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="relative z-10 flex-grow">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-1 w-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                          Topic
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold mb-4 group-hover:text-white transition-colors">
                        {topic.name}
                      </h3>
                      <p className="text-gray-400 text-sm leading-relaxed mb-6">
                        Explore {subtopicsMap[topic._id]?.length || 0} subtopics with detailed formulas and explanations.
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="relative z-10 flex items-center justify-between pt-6 border-t border-white/5 group-hover:border-indigo-500/20 transition-colors">
                      <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold group-hover:text-indigo-300 transition-colors">
                        Explore
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-300 group-hover:from-indigo-500/20 group-hover:to-purple-500/20 transition-all">
                        {subtopicsMap[topic._id]?.length || 0} Formulas
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-8 duration-700">
            {/* Navigation */}
            <nav className="flex items-center justify-between mb-12">
              <button 
                onClick={() => {
                  setView('topics');
                  setActiveTopic(null);
                  setSearchQuery('');
                }}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-300 font-semibold group px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/30 hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm">Back to Topics</span>
              </button>
              
              <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <Info className="w-4 h-4" />
                <span>Select a subtopic to view formulas</span>
              </div>
            </nav>

            {/* Topic Header */}
            <header className="mb-12">
              <div className="flex items-center gap-6 mb-6">
                <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${getTopicColor(activeTopic.name)} flex items-center justify-center border border-white/10 shadow-xl`}>
                  <div className="text-indigo-400 text-4xl">
                    {getTopicIcon(activeTopic.name)}
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">
                    <span className="bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
                      {activeTopic.name}
                    </span>
                  </h1>
                  <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">
                    {filteredSubtopics.length} Subtopics Available
                  </p>
                </div>
              </div>
            </header>

            {/* Search Bar */}
            <div className="mb-12 max-w-2xl relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  type="text"
                  placeholder="Search subtopics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1a1f2e] border border-white/10 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-indigo-500/40 text-base transition-all backdrop-blur-sm placeholder-gray-500"
                />
              </div>
            </div>

            {/* Subtopics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredSubtopics.map((sub, index) => (
                <div 
                  key={sub._id}
                  onClick={() => openModal(sub)}
                  className="group relative cursor-pointer"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* 3D Card Effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-30 blur-lg transition-opacity duration-500"></div>
                  
                  {/* Main Card */}
                  <div className="relative h-full bg-gradient-to-br from-[#1a1f2e] to-[#0f1419] border border-white/10 rounded-2xl p-6 flex flex-col transition-all duration-500 group-hover:-translate-y-1 group-hover:border-indigo-500/40 group-hover:shadow-xl group-hover:shadow-indigo-500/20 backdrop-blur-sm min-h-[180px]">
                    {/* Card Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/10 group-hover:to-purple-500/10 rounded-2xl transition-all duration-500"></div>
                    
                    {/* Content */}
                    <div className="relative z-10 flex-grow flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <div className="px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                          <Zap className="w-4 h-4 text-indigo-400" />
                        </div>
                        <Target className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 transition-colors" />
                      </div>
                      
                      <h3 className="text-lg font-bold mb-4 group-hover:text-white transition-colors leading-tight">
                        {sub.name}
                      </h3>
                      
                      <div className="mt-auto pt-4 border-t border-white/5 group-hover:border-indigo-500/20 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-500 group-hover:text-indigo-400 transition-colors uppercase tracking-wider">
                            View Formula
                          </span>
                          <div className="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-gradient-to-r group-hover:from-indigo-500 group-hover:to-purple-500 flex items-center justify-center transition-all duration-500">
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredSubtopics.length === 0 && (
                <div className="col-span-full py-20 text-center border-2 border-dashed border-white/10 rounded-3xl bg-white/5">
                  <div className="flex flex-col items-center gap-4">
                    <Search className="w-12 h-12 text-gray-600" />
                    <p className="text-gray-500 font-semibold text-lg">
                      No subtopics found
                    </p>
                    <p className="text-gray-600 text-sm">
                      Try adjusting your search query
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Formula Modal */}
      {selectedSubtopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-300" 
            onClick={closeModal}
          />
          
          {/* Modal Container */}
          <div className="relative w-full max-w-6xl max-h-[90vh] bg-gradient-to-br from-[#1a1f2e] to-[#0f1419] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="p-6 md:p-8 flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-indigo-500/5 to-purple-500/5">
              <div className="flex items-center gap-6">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getTopicColor(activeTopic?.name)} flex items-center justify-center border border-white/10 shadow-lg`}>
                  <div className="text-indigo-400">
                    {getTopicIcon(activeTopic?.name)}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2">
                    <Sparkles className="w-4 h-4" />
                    Formula Details
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                    {selectedSubtopic.name}
                  </h2>
                </div>
              </div>
              <button 
                onClick={closeModal}
                className="w-12 h-12 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center transition-all group hover:border-red-500/30 hover:bg-red-500/10"
              >
                <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
              {loadingModal ? (
                <div className="h-64 flex flex-col items-center justify-center gap-6">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-purple-500/30 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                  </div>
                  <p className="text-gray-500 font-semibold text-sm">Loading formulas...</p>
                </div>
              ) : modalData ? (
                <div className="space-y-8">
                  {/* Description */}
                  {modalData.description && (
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                      <p className="text-gray-300 leading-relaxed text-base italic">
                        {modalData.description}
                      </p>
                    </div>
                  )}

                  {/* Formula Count Badge */}
                  {modalData.formulas && modalData.formulas.length > 0 && (
                    <div className="flex items-center justify-between px-4">
                      <div className="flex items-center gap-3">
                        <div className="px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
                          <span className="text-sm font-bold text-indigo-300">
                            {modalData.formulas.length} {modalData.formulas.length === 1 ? 'Formula' : 'Formulas'} Available
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Formulas - Display ALL variants */}
                  {modalData.formulas && modalData.formulas.length > 0 ? (
                    <div className="space-y-6">
                      {modalData.formulas.map((formula, idx) => (
                        <div 
                          key={idx} 
                          className="group/formula space-y-6 p-6 md:p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-sm hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300"
                        >
                          {/* Formula Header with Variant Indicator */}
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-indigo-500/30 flex items-center justify-center text-base font-bold text-indigo-300 shadow-lg">
                                {String(idx + 1).padStart(2, '0')}
                              </div>
                              <div className="flex-1">
                                <h3 className="text-xl md:text-2xl font-bold mb-2 group-hover/formula:text-white transition-colors">
                                  {formula.title}
                                </h3>
                                <div className="flex items-center gap-2">
                                  <span className="px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                                    Variant {idx + 1}
                                  </span>
                                  {modalData.formulas.length > 1 && (
                                    <span className="text-xs text-gray-500">
                                      of {modalData.formulas.length} variants
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Formula Content - Enhanced Display */}
                          <div className="p-6 md:p-8 rounded-xl bg-gradient-to-br from-[#0a0e1a] to-[#05060a] border border-white/5 shadow-inner">
                            <div className="flex items-center gap-2 mb-4">
                              <Calculator className="w-5 h-5 text-indigo-400" />
                              <span className="text-sm font-semibold uppercase tracking-wider text-indigo-400">
                                Formula
                              </span>
                            </div>
                            <div className="math-container text-lg">
                              {renderMathContent(formula.content)}
                            </div>
                          </div>

                          {/* Example - Enhanced Display */}
                          {formula.example && (
                            <div className="p-6 md:p-8 rounded-xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 shadow-lg">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                                  <Lightbulb className="w-5 h-5 text-indigo-400" />
                                </div>
                                <span className="text-sm font-semibold uppercase tracking-wider text-indigo-400">
                                  Example & Application
                                </span>
                              </div>
                              <div className="pl-4 border-l-4 border-indigo-500/40">
                                <p className="text-gray-200 leading-relaxed text-base">
                                  {formula.example}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Separator for multiple formulas */}
                          {idx < modalData.formulas.length - 1 && (
                            <div className="pt-4 border-t border-white/5">
                              <div className="flex items-center justify-center gap-2 text-xs text-gray-600 uppercase tracking-wider">
                                <div className="h-px w-16 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"></div>
                                <span>Next Formula</span>
                                <div className="h-px w-16 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"></div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <BookOpen className="w-16 h-16 text-gray-600" />
                        <p className="text-gray-500 font-semibold text-lg">
                          No formulas available
                        </p>
                        <p className="text-gray-600 text-sm">
                          Formulas will be added soon
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-white/10 bg-black/20 flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Verified Content</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span>Mathematically Accurate</span>
                </div>
              </div>
              <span className="text-gray-600">Formula Library v2.0</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Formulas;
