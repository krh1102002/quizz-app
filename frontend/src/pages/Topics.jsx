import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { topicsAPI, subtopicsAPI } from '../services/api';

export default function Topics() {
  const { topicId } = useParams();
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [subtopics, setSubtopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (topicId) {
      // Load specific topic and its subtopics
      Promise.all([
        topicsAPI.getOne(topicId),
        subtopicsAPI.getByTopic(topicId)
      ]).then(([topic, subtopicsData]) => {
        setSelectedTopic(topic);
        setSubtopics(Array.isArray(subtopicsData) ? subtopicsData : []);
      }).catch((error) => {
        console.error('Error fetching topic data:', error);
        setSubtopics([]);
      })
        .finally(() => setLoading(false));
    } else {
      // Load all topics
      topicsAPI.getAll()
        .then((data) => setTopics(Array.isArray(data) ? data : []))
        .catch((error) => {
          console.error('Error fetching topics:', error);
          setTopics([]);
        })
        .finally(() => setLoading(false));
    }
  }, [topicId]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p className="loading-text">Loading...</p>
      </div>
    );
  }

  // Show Topic Detail -> List Subtopics
  if (topicId && selectedTopic) {
    return (
      <div style={{ paddingTop: '100px', minHeight: '100vh' }}>
        <div className="container">
          <Link to="/topics" className="btn btn-ghost mb-lg">
            ← Back to All Topics
          </Link>

          <div className="text-center mb-2xl">
            <div style={{ fontSize: '4rem', marginBottom: 'var(--space-md)' }}>
              {selectedTopic.icon}
            </div>
            <h1 style={{ color: selectedTopic.color }}>{selectedTopic.name}</h1>
            <p className="text-secondary">{selectedTopic.description}</p>
          </div>

          {subtopics.length === 0 ? (
            <div className="text-center text-secondary" style={{ padding: 'var(--space-3xl)' }}>
              <p>No subtopics found for this category.</p>
              <Link to="/topics" className="btn btn-primary mt-lg">
                Explore Other Topics
              </Link>
            </div>
          ) : (
            <div className="grid grid-3 gap-lg">
              {subtopics.map(subtopic => (
                <Link
                  key={subtopic._id}
                  to={`/subtopic/${subtopic._id}`}
                  className="topic-card"
                  style={{ '--topic-color': selectedTopic.color }}
                >
                  <div className="topic-icon" style={{ fontSize: '2.5rem' }}>
                    {subtopic.icon || selectedTopic.icon}
                  </div>
                  <h3 className="topic-name">{subtopic.name}</h3>
                  <p className="text-secondary text-sm">
                    {subtopic.description}
                  </p>
                  <p className="topic-count">
                    {subtopic.quizCount} quizzes
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show All Topics List
  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div className="container">
        <div className="text-center mb-2xl">
          <h1>Explore Topics</h1>
          <p className="text-secondary">Choose a verified category to start learning</p>
        </div>

        <div className="grid grid-3 gap-lg">
          {topics.map(topic => (
            <Link
              key={topic._id}
              to={`/topics/${topic._id}`}
              className="topic-card"
              style={{ '--topic-color': topic.color }}
            >
              <div className="topic-icon">{topic.icon}</div>
              <h3 className="topic-name">{topic.name}</h3>
              <p className="text-secondary text-sm" style={{ marginBottom: 'var(--space-sm)' }}>
                {topic.description}
              </p>            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
