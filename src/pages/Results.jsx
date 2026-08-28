import API_URL from "../api";
import { useEffect, useState } from "react";
import {
  Link,
  useSearchParams,
} from "react-router-dom";
import axios from "axios";

function Results() {
  const [searchParams] =
    useSearchParams();

  const topic =
    searchParams.get("topic") || "TEST";

  const score =
    searchParams.get("score") || 0;

  const total =
    searchParams.get("total") || 0;

  const percentage = Number(
    searchParams.get("percentage") || 0
  );

  const [results, setResults] =
    useState([]);

  const [openResult, setOpenResult] =
    useState(null);

  useEffect(() => {
    axios
      .get("${API_URL}/results")
      .then((response) => {
        setResults(response.data);
      })
      .catch((error) => {
        console.log(
          "Error loading results:",
          error
        );
      });
  }, []);

  function deleteResult(id) {
    const confirmed = window.confirm(
      "Delete this test result?"
    );

    if (!confirmed) {
      return;
    }

    axios
      .delete(
        `${API_URL}/results/${id}`
      )
      .then(() => {
        setResults(
          results.filter(
            (result) =>
              String(result.id) !==
              String(id)
          )
        );
      })
      .catch((error) => {
        console.log(
          "Error deleting result:",
          error
        );
      });
  }

  function getMessage() {
    if (percentage >= 80) {
      return "Excellent recall. Keep going.";
    }

    if (percentage >= 50) {
      return "Good attempt. Review the mistakes and try again.";
    }

    return "Keep practising. Revision will strengthen your memory.";
  }

  return (
    <main className="page-section">

      <div className="container">

        <p className="orange-label">
          TEST COMPLETE // POST MORTEM
        </p>

        <h1 className="page-title">
          YOUR
          <br />
          <span>RESULT.</span>
        </h1>

        <div className="result-box">

          <p className="result-topic">
            {topic}
          </p>

          <div className="result-score">
            {percentage}%
          </div>

          <p className="result-correct">
            {score} / {total} CORRECT
          </p>

          <p className="result-message">
            {getMessage()}
          </p>

          <div className="d-flex gap-3 justify-content-center flex-wrap">

            <Link
              to="/topics"
              className="main-button"
            >
              TRY AGAIN →
            </Link>

            <Link
              to="/revision"
              className="secondary-button"
            >
              REVISION
            </Link>

          </div>

        </div>

        {/* History */}

        <section className="mt-5">

          <p className="orange-label">
            HISTORY // SAVED TESTS
          </p>

          <h2 className="section-title small-title">
            PREVIOUS
            <br />
            <span>ATTEMPTS.</span>
          </h2>

          {results.length === 0 ? (
            <div className="loading-box">
              NO RESULTS YET.
            </div>
          ) : (
            <div className="history-list">

              {results
                .slice()
                .reverse()
                .map((result) => {

                  const isOpen =
                    String(openResult) ===
                    String(result.id);

                  return (
                    <div
                      key={result.id}
                      className="history-card"
                    >

                      <div
                        className="history-header"
                        onClick={() =>
                          setOpenResult(
                            isOpen
                              ? null
                              : result.id
                          )
                        }
                      >

                        <div>
                          <span className="small-label">
                            {result.date}
                          </span>

                          <h3>
                            {result.topicTitle}
                          </h3>
                        </div>

                        <div className="history-score">
                          {result.score}%
                        </div>

                      </div>

                      {isOpen && (
                        <div className="history-details">

                          <p>
                            <strong>
                              SCORE:
                            </strong>{" "}
                            {result.correctCount}{" "}
                            /{" "}
                            {result.totalQuestions}
                          </p>

                          {result.answers &&
                            result.answers.map(
                              (
                                answer,
                                index
                              ) => (
                                <div
                                  key={
                                    answer.questionId ||
                                    index
                                  }
                                  className={
                                    answer.isCorrect
                                      ? "review-card correct"
                                      : "review-card wrong"
                                  }
                                >

                                  <span className="small-label">
                                    QUESTION{" "}
                                    {index + 1}
                                  </span>

                                  <h4>
                                    {
                                      answer.question
                                    }
                                  </h4>

                                  <p>
                                    <strong>
                                      YOUR ANSWER:
                                    </strong>{" "}
                                    {
                                      answer.selectedAnswer
                                    }
                                  </p>

                                  <p>
                                    <strong>
                                      CORRECT ANSWER:
                                    </strong>{" "}
                                    {
                                      answer.correctAnswer
                                    }
                                  </p>

                                  <p className="review-explanation">
                                    {
                                      answer.explanation
                                    }
                                  </p>

                                  <span className="answer-status">
                                    {answer.isCorrect
                                      ? "✓ CORRECT"
                                      : "✕ REVIEW THIS"}
                                  </span>

                                </div>
                              )
                            )}

                          <button
                            type="button"
                            className="delete-button"
                            onClick={() =>
                              deleteResult(
                                result.id
                              )
                            }
                          >
                            DELETE HISTORY
                          </button>

                        </div>
                      )}

                    </div>
                  );
                })}

            </div>
          )}

        </section>

      </div>

    </main>
  );
}

export default Results;