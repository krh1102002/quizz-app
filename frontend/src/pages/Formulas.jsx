import React, { useState, useEffect } from 'react';
import { topicsAPI, subtopicsAPI } from '../services/api';
import { ChevronDown, ChevronUp, BookOpen, Calculator, Info, Lightbulb } from 'lucide-react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

const Formulas = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTopic, setExpandedTopic] = useState(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState(null);
  const [subtopicData, setSubtopicData] = useState(null);
  const [loadingSubtopic, setLoadingSubtopic] = useState(false);

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
      // Scroll to top on mobile when selecting
      if (window.innerWidth < 1024) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Error fetching subtopic details:', error);
      setLoadingSubtopic(false);
    }
  };

  const toggleTopic = (topicId) => {
    setExpandedTopic(expandedTopic === topicId ? null : topicId);
  };

  const renderContent = (content) => {
    if (!content) return null;
    // Simple check if it might be LaTeX (contains \ or $)
    const isLatex = content.includes('\\') || content.includes('$');
    if (isLatex) {
      // Split by newlines to keep structure
      return content.split('\n').map((line, idx) => (
        <div key={idx} className="my-2">
          {line.includes('\\') ? <BlockMath math={line} /> : <span>{line}</span>}
        </div>
      ));
    }
    return <p className="whitespace-pre-line">{content}</p>;
  };

  return (
    <div className="min-h-screen bg-[#0d101c] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-12 text-center lg:text-left">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 flex items-center justify-center lg:justify-start gap-4">
            <div className="p-3 bg-indigo-600/20 rounded-2xl border border-indigo-500/30">
              <BookOpen className="w-10 h-10 text-indigo-400" />
            </div>
            <span className="gradient-text">Aptitude Formulas</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl">
            Master complex concepts with our curated collection of formulas and detailed examples.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Topics List */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-gray-500 font-semibold px-2 uppercase tracking-wider text-xs mb-4">Categories</h3>
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-16 bg-white/5 rounded-2xl border border-white/10"></div>
                ))}
              </div>
            ) : (
              topics.map((topic) => (
                <div key={topic._id} className="group overflow-hidden">
                  <button
                    onClick={() => toggleTopic(topic._id)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 border
                      ${expandedTopic === topic._id 
                        ? 'bg-indigo-600/20 border-indigo-500/50 shadow-glow' 
                        : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl group-hover:scale-125 transition-transform" role="img" aria-label={topic.name}>
                        {topic.icon}
                      </span>
                      <span className="font-bold text-gray-200">{topic.name}</span>
                    </div>
                    {expandedTopic === topic._id ? (
                      <ChevronUp className="w-5 h-5 text-indigo-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                  
                  <div className={`transition-all duration-500 ease-in-out ${expandedTopic === topic._id ? 'max-h-[1000px] opacity-100 mt-2' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                     <SubtopicList topicId={topic._id} onSelect={fetchSubtopicDetails} selectedId={selectedSubtopic} />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Main Content - Formulas Display */}
          <div className="lg:col-span-3">
            {selectedSubtopic ? (
              <div className="card p-8 min-h-[600px] border-white/10 bg-white/5 backdrop-blur-3xl">
                {loadingSubtopic ? (
                   <div className="flex flex-col justify-center items-center h-[500px] gap-4">
                     <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
                     <p className="text-indigo-400 font-medium">Loading Formulas...</p>
                   </div>
                ) : subtopicData ? (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="border-b border-white/10 pb-8 mb-8">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                           <div className="w-16 h-16 bg-indigo-600/20 rounded-2xl flex items-center justify-center text-3xl shadow-glow">
                             {subtopicData.icon || '📝'}
                           </div>
                           <div>
                             <h2 className="text-3xl font-bold text-white mb-1">{subtopicData.name}</h2>
                             <div className="badge badge-primary">Concepts & Formulas</div>
                           </div>
                        </div>
                      </div>
                      <p className="mt-4 text-gray-400 text-lg leading-relaxed">{subtopicData.description || `Comprehensive guide to all essential formulas for ${subtopicData.name}.`}</p>
                    </div>

                    {subtopicData.formulas && subtopicData.formulas.length > 0 ? (
                      <div className="grid gap-8">
                        {subtopicData.formulas.map((formula, index) => (
                          <div key={index} className="card-3d p-6 bg-white/[0.03] border-white/5 hover:bg-white/[0.05] group">
                            <h3 className="text-xl font-bold text-indigo-400 mb-6 flex items-center gap-3">
                              <Calculator className="w-6 h-6" />
                              {formula.title}
                            </h3>
                            
                            <div className="bg-black/40 rounded-2xl p-8 border border-white/5 mb-6 text-white overflow-x-auto shadow-inner">
                              {renderContent(formula.content)}
                            </div>

                            {formula.example && (
                              <div className="bg-amber-500/5 rounded-2xl p-6 border border-amber-500/20 flex gap-4">
                                <div className="mt-1">
                                  <Lightbulb className="w-6 h-6 text-amber-500" />
                                </div>
                                <div>
                                  <span className="block font-bold text-amber-500 uppercase tracking-widest text-xs mb-2">Example / Practical Use</span>
                                  <div className="text-gray-300">
                                    {renderContent(formula.example)}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-32 opacity-40">
                        <Calculator className="w-24 h-24 mb-6" />
                        <h3 className="text-2xl font-medium text-white mb-2">No formulas found</h3>
                        <p className="text-gray-400">Our experts are working on adding formulas for this topic.</p>
                      </div>
                    )}
                  </div>
                ) : (
                   <div className="flex flex-col items-center justify-center h-full py-20">
                     <Info className="w-16 h-16 text-red-400 mb-4" />
                     <h3 className="text-xl font-bold text-white">Oops! Load failed</h3>
                     <p className="text-gray-400">Something went wrong while fetching the data.</p>
                   </div>
                )}
              </div>
            ) : (
              <div className="card p-20 text-center h-full min-h-[600px] flex flex-col justify-center items-center bg-white/5 border-dashed border-white/10">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 floating"></div>
                  <BookOpen className="w-32 h-32 text-indigo-500 relative z-10 floating" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">Explore Knowledge</h3>
                <p className="text-gray-400 max-w-md mx-auto text-lg">
                  Select a topic from the sidebar to visualize essential aptitude formulas and mathematical concepts.
                </p>
              </div>
            )}
          </div>
        </div>
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

  if (loading) return <div className="p-4 text-sm text-gray-500 text-center animate-pulse italic">Scanning subtopics...</div>;
  if (subtopics.length === 0) return <div className="p-4 text-sm text-gray-500 text-center italic">No paths discovered</div>;

  return (
    <ul className="py-2 space-y-1">
      {subtopics.map(sub => (
        <li key={sub._id}>
          <button
            onClick={() => onSelect(sub._id)}
            className={`w-full text-left px-6 py-3 text-sm transition-all duration-300 rounded-xl flex items-center justify-between group
              ${selectedId === sub._id 
                ? 'bg-indigo-500 text-white shadow-glow translate-x-1' 
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
          >
            <span className="font-medium">{sub.name}</span>
            <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 
              ${selectedId === sub._id ? 'bg-white scale-125' : 'bg-gray-600 group-hover:bg-indigo-400'}`} />
          </button>
        </li>
      ))}
    </ul>
  );
};

export default Formulas;
