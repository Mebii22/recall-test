import { useEffect, useState } from "react";
import axios from "axios";

import API_URL from "../api";

function History() {
  const [results, setResults] = useState([]);
  const [openResult, setOpenResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(`${API_URL}/results`);

      const sortedResults = [...response.data].sort((a, b) => {
        const dateA = new Date(a.timestamp || a.date || 0);
        const dateB = new Date(b.timestamp || b.date || 0);

        return dateB - dateA;
      });

      setResults(sortedResults);
    } catch (error) {
      console.log(error);
      setError(
        "Unable to load history. Make sure JSON Server is running on port 3001."
      );
    } finally {
      setLoading(false);
    }
  }

  function toggleResult(id) {
    if (openResult === id) {
      setOpenResult(null);
    } else {
      setOpenResult(id);
    }
  }

  async function deleteResult(id) {
    const confirmed = window.confirm(
      "Delete this attempt from your history?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/results/${id}`);

      setResults((currentResults) =>
        currentResults.filter((result) => result.id !== id)
      );

      if (openResult === id) {
        setOpenResult(null);
      }
    } catch (error) {
      console.log(error);
      alert("Could not delete this result.");
    }
  }

  async function clearHistory() {
    if (results.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      "Delete ALL previous attempts? This cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      await Promise.all(
        results.map((result) =>
          axios.delete(`${API_URL}/results/${result.id}`)
        )
      );

      setResults([]);
      setOpenResult(null);
    } catch (error) {
      console.log(error);
      alert("Could not clear the history.");
      loadHistory();
    }
  }

  function getPercentage(result) {
    if (result.score !== undefined) {
      return Number(result.score);
    }

    if (result.percentage !== undefined) {
      return Number(result.percentage);
    }

    if (
      result.correctCount !== undefined &&
      result.totalQuestions
    ) {
      return Math.round(
        (Number(result.correctCount) /
          Number(result.totalQuestions)) *
          100
      );
    }

    return 0;
  }

  function getCorrectCount(result) {
    if (result.correctCount !== undefined) {
      return Number(result.correctCount);
    }

    if (result.score !== undefined && result.totalQuestions) {
      return Math.round(
        (Number(result.score) / 100) *
          Number(result.totalQuestions)
      );
    }

    return 0;
  }

  function getTotalQuestions(result) {
    return Number(
      result.totalQuestions ||
        result.total ||
        result.questionCount ||
        0
    );
  }

  function getTopic(result) {
    return (
      result.topicTitle ||
      result.topic ||
      "UNKNOWN TOPIC"
    );
  }

  function getDate(result) {
    const value = result.timestamp || result.date;

    if (!value) {
      return "DATE NOT AVAILABLE";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString();
  }

  function getAnswers(result) {
    if (Array.isArray(result.answers)) {
      return result.answers;
    }

    if (Array.isArray(result.review)) {
      return result.review;
    }

    if (Array.isArray(result.questions)) {
      return result.questions;
    }

    return [];
  }

  function getUserAnswer(answer) {
    return (
      answer.userAnswer ??
      answer.selectedAnswer ??
      answer.selected ??
      answer.answer ??
      ""
    );
  }

  function getCorrectAnswer(answer) {
    return (
      answer.correctAnswer ??
      answer.correct ??
      answer.answer ??
      ""
    );
  }

  function getQuestionText(answer) {
    return (
      answer.question ??
      answer.questionText ??
      "Question unavailable"
    );
  }

  function isAnswerCorrect(answer) {
    if (typeof answer.isCorrect === "boolean") {
      return answer.isCorrect;
    }

    const userAnswer = getUserAnswer(answer);
    const correctAnswer = getCorrectAnswer(answer);

    return (
      userAnswer &&
      correctAnswer &&
      userAnswer === correctAnswer
    );
  }

  return (
    <main className="page-section">
      <div className="container">

        <div className="page-heading-row">
          <div>
            <p className="orange-label">
              HISTORY // PERFORMANCE
            </p>

            <h1 className="page-title">
              YOUR
              <br />
              <span>HISTORY.</span>
            </h1>

            <p className="page-description">
              Review your previous recall attempts, find weak
              areas and learn from your mistakes.
            </p>
          </div>

          {results.length > 0 && (
            <button
              type="button"
              className="delete-button"
              onClick={clearHistory}
            >
              CLEAR HISTORY
            </button>
          )}
        </div>

        {loading && (
          <div className="loading-box mt-5">
            LOADING HISTORY...
          </div>
        )}

        {!loading && error && (
          <div className="error-message mt-5">
            {error}
          </div>
        )}

        {!loading && !error && results.length === 0 && (
          <div className="info-box mt-5">
            <p className="orange-label">
              NO ATTEMPTS
            </p>

            <h2>
              NOTHING
              <br />
              <span>RECORDED.</span>
            </h2>

            <p>
              Complete a recall test and your performance
              will appear here.
            </p>

            <a
              href="/topics"
              className="main-button mt-3"
            >
              START A TEST →
            </a>
          </div>
        )}

        {!loading && !error && results.length > 0 && (
          <section className="manage-section">

            <div className="section-header">
              <p className="orange-label">
                {results.length} ATTEMPT
                {results.length !== 1 ? "S" : ""}
              </p>

              <h2 className="section-title small-title">
                TRACK
                <br />
                <span>PROGRESS.</span>
              </h2>
            </div>

            <div>
              {results.map((result, index) => {
                const percentage = getPercentage(result);
                const correctCount = getCorrectCount(result);
                const totalQuestions =
                  getTotalQuestions(result);

                const answers = getAnswers(result);

                const resultId =
                  result.id ?? `result-${index}`;

                const isOpen = openResult === resultId;

                return (
                  <div
                    className="history-card"
                    key={resultId}
                  >

                    <div
                      className="history-header"
                      onClick={() =>
                        toggleResult(resultId)
                      }
                    >
                      <div>
                        <p className="orange-label mb-1">
                          ATTEMPT #{results.length - index}
                        </p>

                        <h3>
                          {getTopic(result)}
                        </h3>

                        <p className="page-description mb-0">
                          {getDate(result)}
                        </p>
                      </div>

                      <div className="text-end">
                        <div className="history-score">
                          {percentage}%
                        </div>

                        <small className="question-count">
                          {correctCount} /{" "}
                          {totalQuestions} CORRECT
                        </small>
                      </div>
                    </div>

                    {isOpen && (
                      <div className="history-details">

                        <div className="row g-3 mb-4">

                          <div className="col-md-4">
                            <div className="manage-card">
                              <span className="arena-label">
                                SCORE
                              </span>

                              <h3>
                                {percentage}%
                              </h3>
                            </div>
                          </div>

                          <div className="col-md-4">
                            <div className="manage-card">
                              <span className="arena-label">
                                CORRECT
                              </span>

                              <h3>
                                {correctCount}
                              </h3>
                            </div>
                          </div>

                          <div className="col-md-4">
                            <div className="manage-card">
                              <span className="arena-label">
                                QUESTIONS
                              </span>

                              <h3>
                                {totalQuestions}
                              </h3>
                            </div>
                          </div>

                        </div>

                        {answers.length > 0 ? (
                          <div>
                            <p className="orange-label">
                              ANSWER REVIEW
                            </p>

                            <h3 className="mb-4">
                              LEARN FROM
                              <br />
                              <span>MISTAKES.</span>
                            </h3>

                            {answers.map(
                              (answer, answerIndex) => {
                                const correct =
                                  isAnswerCorrect(answer);

                                const userAnswer =
                                  getUserAnswer(answer);

                                const correctAnswer =
                                  getCorrectAnswer(answer);

                                return (
                                  <div
                                    key={
                                      answer.id ??
                                      answerIndex
                                    }
                                    className={`review-card ${
                                      correct
                                        ? "correct"
                                        : "wrong"
                                    }`}
                                  >

                                    <span className="answer-status">
                                      {correct
                                        ? "✓ CORRECT"
                                        : "✕ REVIEW THIS"}
                                    </span>

                                    <h4>
                                      {answerIndex + 1}.{" "}
                                      {getQuestionText(
                                        answer
                                      )}
                                    </h4>

                                    <p>
                                      <strong>
                                        YOUR ANSWER:
                                      </strong>{" "}
                                      {userAnswer ||
                                        "NO ANSWER"}
                                    </p>

                                    <p>
                                      <strong>
                                        CORRECT ANSWER:
                                      </strong>{" "}
                                      {correctAnswer ||
                                        "NOT AVAILABLE"}
                                    </p>

                                    {!correct && (
                                      <div className="review-explanation">
                                        <p className="mb-0">
                                          Review the correct
                                          answer and try this
                                          question again during
                                          your next revision
                                          session.
                                        </p>
                                      </div>
                                    )}

                                  </div>
                                );
                              }
                            )}
                          </div>
                        ) : (
                          <div className="info-box">
                            <p className="orange-label">
                              ANSWER REVIEW
                            </p>

                            <p className="mb-0">
                              Detailed question review was not
                              saved for this attempt. New tests
                              can save the selected answers so
                              you can review every question here.
                            </p>
                          </div>
                        )}

                        <button
                          type="button"
                          className="delete-button"
                          onClick={() =>
                            deleteResult(result.id)
                          }
                        >
                          DELETE ATTEMPT
                        </button>

                      </div>
                    )}

                  </div>
                );
              })}
            </div>

          </section>
        )}

      </div>
    </main>
  );
}

export default History;