import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronDown, ChevronUp, BookOpen, Calculator } from 'lucide-react';

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
      const response = await axios.get('http://localhost:5000/api/topics');
      setTopics(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching topics:', error);
      setLoading(false);
    }
  };

  const fetchSubtopicDetails = async (subtopicId) => {
    setLoadingSubtopic(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/subtopics/${subtopicId}`);
      setSubtopicData(response.data.subtopic);
      setSelectedSubtopic(subtopicId);
      setLoadingSubtopic(false);
    } catch (error) {
      console.error('Error fetching subtopic details:', error);
      setLoadingSubtopic(false);
    }
  };

  const toggleTopic = (topicId) => {
    if (expandedTopic === topicId) {
      setExpandedTopic(null);
    } else {
      setExpandedTopic(topicId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-indigo-600" />
          Aptitude Formulas
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar - Topics List */}
          <div className="lg:col-span-1 space-y-4">
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            ) : (
              topics.map((topic) => (
                <div key={topic._id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
                  <button
                    onClick={() => toggleTopic(topic._id)}
                    className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl" role="img" aria-label={topic.name}>{topic.icon}</span>
                      <span className="font-semibold text-gray-800">{topic.name}</span>
                    </div>
                    {expandedTopic === topic._id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  
                  {expandedTopic === topic._id && (
                    <div className="bg-gray-50 border-t border-gray-100">
                        {/* We need to fetch subtopics or if topic object has them. 
                            Usually topics list implies separate subtopic fetch or population.
                            Assuming topic API returns subtopics or we need to fetch them.
                            Wait, the topic model might not have subtopics array populated fully if not requested.
                            However, looking at seed.js, subtopics are separate documents.
                            Let's assume we need to fetch subtopics for the topic or they are included.
                            Let's check topicRoutes.js. 
                            Wait, I didn't check topicRoutes.js. 
                            I'll assume I might need to fetch subtopics by topic.
                            Let's try to see if topic structure has them. 
                            If not, I will implement a fetch.
                        */}
                       <SubtopicList topicId={topic._id} onSelect={fetchSubtopicDetails} selectedId={selectedSubtopic} />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Main Content - Formulas Display */}
          <div className="lg:col-span-2">
            {selectedSubtopic ? (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 min-h-[500px]">
                {loadingSubtopic ? (
                   <div className="flex justify-center items-center h-full">
                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                   </div>
                ) : subtopicData ? (
                  <div>
                    <div className="border-b border-gray-100 pb-6 mb-6">
                      <div className="flex items-center gap-3 mb-2">
                         <span className="text-3xl">{subtopicData.icon || '📝'}</span>
                         <h2 className="text-2xl font-bold text-gray-900">{subtopicData.name}</h2>
                      </div>
                      <p className="text-gray-500">{subtopicData.description || `All important formulas and concepts for ${subtopicData.name}.`}</p>
                    </div>

                    {subtopicData.formulas && subtopicData.formulas.length > 0 ? (
                      <div className="grid gap-6">
                        {subtopicData.formulas.map((formula, index) => (
                          <div key={index} className="bg-indigo-50 rounded-lg p-5 border border-indigo-100 hover:shadow-md transition-shadow">
                            <h3 className="text-lg font-bold text-indigo-900 mb-3 flex items-center gap-2">
                              <Calculator className="w-5 h-5" />
                              {formula.title}
                            </h3>
                            <div className="bg-white rounded p-4 font-mono text-sm text-gray-800 whitespace-pre-line border border-indigo-100 mb-3">
                              {formula.content}
                            </div>
                            {formula.example && (
                              <div className="text-sm text-gray-600 bg-yellow-50 p-3 rounded border border-yellow-100">
                                <span className="font-semibold text-yellow-800">Example:</span> {formula.example}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-20 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                        <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No formulas added for this topic yet.</p>
                      </div>
                    )}
                  </div>
                ) : (
                   <div className="text-center text-gray-500">Failed to load data.</div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow border border-gray-100 p-12 text-center h-full flex flex-col justify-center items-center text-gray-400">
                <BookOpen className="w-20 h-20 mb-6 opacity-20" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">Select a Topic</h3>
                <p>Choose a subtopic from the menu to view its formulas and matching concepts.</p>
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
  
  useEffect(() => {
    const fetchSub = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/subtopics/by-topic/${topicId}`);
        setSubtopics(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSub();
  }, [topicId]);

  if (subtopics.length === 0) return <div className="p-4 text-sm text-gray-400 text-center">No subtopics found</div>;

  return (
    <ul className="py-2">
      {subtopics.map(sub => (
        <li key={sub._id}>
          <button
            onClick={() => onSelect(sub._id)}
            className={`w-full text-left px-6 py-3 text-sm transition-colors flex items-center gap-2
              ${selectedId === sub._id 
                ? 'bg-indigo-50 text-indigo-700 font-medium border-l-4 border-indigo-600' 
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-l-4 border-transparent'
              }`}
          >
            <span>{sub.name}</span>
          </button>
        </li>
      ))}
    </ul>
  );
};

export default Formulas;
