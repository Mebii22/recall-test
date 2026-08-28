import { useEffect, useState } from "react";
import axios from "axios";
import TopicCard from "../components/TopicCard";
import { Link } from "react-router-dom";

import API_URL from "../api";

function Topics() {
  const [topics, setTopics] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      const [topicsResponse, questionsResponse] =
        await Promise.all([
          axios.get(`${API_URL}/topics`),
          axios.get(`${API_URL}/questions`),
        ]);

      setTopics(topicsResponse.data);
      setQuestions(questionsResponse.data);
    } catch (error) {
      console.log("Error loading topics:", error);
    } finally {
      setLoading(false);
    }
  }

  // Get the REAL number of questions
  // belonging to this topic.
  function getQuestionCount(topicId) {
    return questions.filter(
      (question) =>
        Number(question.topicId) === Number(topicId)
    ).length;
  }

  return (
    <main className="page-section">

      <div className="container">

        {/* ============================================
            PAGE HEADING
        ============================================ */}

        <div className="page-heading-row">

          <div>

            <p className="orange-label">
              TOPIC LIBRARY // JSON SERVER
            </p>

            <h1 className="page-title">
              CHOOSE YOUR
              <br />
              <span>TOPIC.</span>
            </h1>

            <p className="page-description">
              Select a subject and test your knowledge
              using active recall.
            </p>

          </div>

          <Link
            to="/build"
            className="secondary-button"
          >
            + BUILD TOPIC
          </Link>

        </div>

        {/* ============================================
            LOADING
        ============================================ */}

        {loading ? (

          <div className="loading-box">
            LOADING TOPICS...
          </div>

        ) : topics.length === 0 ? (

          <div className="loading-box mt-4">
            NO TOPICS AVAILABLE.
          </div>

        ) : (

          <div className="row g-4 mt-4">

            {topics.map((topic) => {

              const questionCount =
                getQuestionCount(topic.id);

              return (
                <div
                  className="col-md-6"
                  key={topic.id}
                >

                  <TopicCard
                    topic={{
                      ...topic,

                      // IMPORTANT:
                      // Always use the real question count.
                      questions: questionCount,
                    }}
                  />

                </div>
              );

            })}

          </div>

        )}

      </div>

    </main>
  );
}

export default Topics;