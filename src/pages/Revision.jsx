import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:3001";

function Revision() {
  const [revisionQuestions, setRevisionQuestions] =
    useState([]);

  const [current, setCurrent] = useState(0);

  const [selectedAnswer, setSelectedAnswer] =
    useState("");

  const [showAnswer, setShowAnswer] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [revisionScore, setRevisionScore] =
    useState(0);

  const [savingMastery, setSavingMastery] =
    useState(false);

  const [totalRevisionQuestions, setTotalRevisionQuestions] =
    useState(0);

  // ==================================================
  // LOAD REVISION QUESTIONS
  // ==================================================

  useEffect(() => {
    loadRevision();
  }, []);

  async function loadRevision() {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_URL}/questions`
      );

      const questions = Array.isArray(
        response.data
      )
        ? response.data
        : [];

      // ==================================================
      // ONLY SHOW WEAK + NOT MASTERED QUESTIONS
      // ==================================================

      const weakQuestions = questions.filter(
        (question) =>
          question.weak === true &&
          question.mastered !== true
      );

      // ==================================================
      // RANDOMISE
      // ==================================================

      const shuffledQuestions = [
        ...weakQuestions,
      ].sort(() => Math.random() - 0.5);

      setRevisionQuestions(
        shuffledQuestions
      );

      setTotalRevisionQuestions(
        shuffledQuestions.length
      );

      setCurrent(0);
      setSelectedAnswer("");
      setShowAnswer(false);
      setRevisionScore(0);
    } catch (error) {
      console.error(
        "REVISION LOADING ERROR:",
        error
      );

      setRevisionQuestions([]);
      setTotalRevisionQuestions(0);
    } finally {
      setLoading(false);
    }
  }

  // ==================================================
  // CHECK ANSWER
  // ==================================================

  function checkAnswer() {
    if (!selectedAnswer) {
      return;
    }

    const question =
      revisionQuestions[current];

    if (!question) {
      return;
    }

    setShowAnswer(true);

    if (
      selectedAnswer ===
      question.answer
    ) {
      setRevisionScore(
        (score) => score + 1
      );
    }
  }

  // ==================================================
  // MARK AS MASTERED
  // ==================================================

  async function markAsMastered(
    questionId
  ) {
    try {
      setSavingMastery(true);

      await axios.patch(
        `${API_URL}/questions/${questionId}`,
        {
          weak: false,
          mastered: true,
        }
      );

      return true;
    } catch (error) {
      console.error(
        "MASTERED UPDATE ERROR:",
        error
      );

      alert(
        "Could not update this question. Please try again."
      );

      return false;
    } finally {
      setSavingMastery(false);
    }
  }

  // ==================================================
  // I KNOW THIS
  // ==================================================

  async function markQuestionKnown() {
    const question =
      revisionQuestions[current];

    if (!question) {
      return;
    }

    const saved =
      await markAsMastered(
        question.id
      );

    if (!saved) {
      return;
    }

    /*
     * IMPORTANT:
     *
     * Remove the mastered question from
     * the current list immediately.
     *
     * DO NOT increase current here.
     *
     * Example:
     *
     * [A, B, C]
     * current = 0
     *
     * Remove A:
     * [B, C]
     *
     * current stays 0
     *
     * So B appears immediately.
     */

    setRevisionQuestions(
      (currentQuestions) =>
        currentQuestions.filter(
          (item) =>
            String(item.id) !==
            String(question.id)
        )
    );

    setSelectedAnswer("");
    setShowAnswer(false);

    /*
     * Keep current at the same index.
     *
     * If the deleted question was the
     * last question, move to the previous
     * valid index.
     */

    setCurrent((currentIndex) => {
      const newLength =
        revisionQuestions.length - 1;

      if (newLength <= 0) {
        return 0;
      }

      return Math.min(
        currentIndex,
        newLength - 1
      );
    });
  }

  // ==================================================
  // KEEP IN REVISION
  // ==================================================

  async function keepWeak() {
    const question =
      revisionQuestions[current];

    if (!question) {
      return;
    }

    try {
      setSavingMastery(true);

      await axios.patch(
        `${API_URL}/questions/${question.id}`,
        {
          weak: true,
          mastered: false,
        }
      );

      /*
       * Move to the next question.
       *
       * The question stays weak in the
       * database and will appear again
       * when Revision is restarted.
       */

      setCurrent(
        (value) => value + 1
      );

      setSelectedAnswer("");
      setShowAnswer(false);
    } catch (error) {
      console.error(
        "KEEP WEAK ERROR:",
        error
      );

      alert(
        "Could not save the revision status."
      );
    } finally {
      setSavingMastery(false);
    }
  }

  // ==================================================
  // NEXT AFTER WRONG ANSWER
  // ==================================================

  async function nextAfterWrong() {
    await keepWeak();
  }

  // ==================================================
  // RESTART
  // ==================================================

  function restartRevision() {
    loadRevision();
  }

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <main className="page-section">

        <div className="container">

          <div className="loading-box">
            LOADING REVISION...
          </div>

        </div>

      </main>
    );
  }

  // ==================================================
  // NOTHING TO REVISE
  // ==================================================

  if (
    revisionQuestions.length === 0
  ) {
    return (
      <main className="page-section">

        <div className="container">

          <p className="orange-label">
            REVISION // WEAK AREAS
          </p>

          <h1 className="page-title">
            NOTHING
            <br />
            TO <span>REVISE.</span>
          </h1>

          <p className="page-description">
            Great work. You currently have
            no weak questions to revise.
            Questions you mark as known
            are automatically removed from
            your weak areas.
          </p>

          <div className="d-flex gap-3 flex-wrap mt-4">

            <Link
              to="/topics"
              className="main-button"
            >
              TAKE A TEST →
            </Link>

            <Link
              to="/manage"
              className="secondary-button"
            >
              BUILD QUESTIONS
            </Link>

          </div>

        </div>

      </main>
    );
  }

  // ==================================================
  // REVISION FINISHED
  // ==================================================

  if (
    current >=
    revisionQuestions.length
  ) {
    const percentage =
      totalRevisionQuestions > 0
        ? Math.round(
            (revisionScore /
              totalRevisionQuestions) *
              100
          )
        : 0;

    return (
      <main className="page-section">

        <div className="container">

          <p className="orange-label">
            REVISION COMPLETE
          </p>

          <h1 className="page-title">
            WEAK AREAS
            <br />
            <span>REVIEWED.</span>
          </h1>

          <div className="result-box">

            <p className="result-topic">
              REVISION SCORE
            </p>

            <div className="result-score">
              {percentage}%
            </div>

            <p className="result-correct">
              {revisionScore} /{" "}
              {totalRevisionQuestions}{" "}
              CORRECT
            </p>

            <p className="result-message">
              Questions you marked as known
              have been removed from your
              weak areas.
            </p>

            <div className="d-flex gap-3 justify-content-center flex-wrap">

              <button
                onClick={
                  restartRevision
                }
                className="main-button"
              >
                REVISE AGAIN →
              </button>

              <Link
                to="/topics"
                className="secondary-button"
              >
                TAKE TEST
              </Link>

            </div>

          </div>

        </div>

      </main>
    );
  }

  // ==================================================
  // CURRENT QUESTION
  // ==================================================

  const question =
    revisionQuestions[current];

  if (!question) {
    return null;
  }

  const isCorrect =
    selectedAnswer ===
    question.answer;

  // ==================================================
  // REVISION QUESTION
  // ==================================================

  return (
    <main className="page-section">

      <div className="container">

        <p className="orange-label">
          REVISION //{" "}
          {question.topicTitle ||
            "WEAK AREA"}
        </p>

        <h1 className="page-title">
          FIX YOUR
          <br />
          <span>WEAK AREAS.</span>
        </h1>

        <div className="row justify-content-center mt-5">

          <div className="col-lg-8">

            <div className="info-box">

              {/* ========================================
                  STATUS
              ======================================== */}

              <div className="test-status">

                <span>
                  REVISION{" "}
                  {current + 1} /{" "}
                  {revisionQuestions.length}
                </span>

                <span>
                  SCORE:{" "}
                  {revisionScore}
                </span>

              </div>

              {/* ========================================
                  QUESTION
              ======================================== */}

              <h2 className="test-question">
                {question.question}
              </h2>

              {/* ========================================
                  OPTIONS
              ======================================== */}

              <div className="d-grid gap-3">

                {question.options?.map(
                  (
                    option,
                    index
                  ) => {

                    const isSelected =
                      selectedAnswer ===
                      option;

                    return (
                      <button
                        key={`${question.id}-${index}`}
                        type="button"
                        disabled={
                          showAnswer ||
                          savingMastery
                        }
                        onClick={() =>
                          setSelectedAnswer(
                            option
                          )
                        }
                        className={
                          isSelected
                            ? "answer-button selected"
                            : "answer-button"
                        }
                      >

                        <span>
                          {String.fromCharCode(
                            65 + index
                          )}
                          .{" "}
                          {option}
                        </span>

                      </button>
                    );
                  }
                )}

              </div>

              {/* ========================================
                  CHECK ANSWER
              ======================================== */}

              {!showAnswer && (

                <button
                  onClick={
                    checkAnswer
                  }
                  disabled={
                    !selectedAnswer ||
                    savingMastery
                  }
                  className="main-button mt-5"
                >
                  CHECK ANSWER →
                </button>

              )}

              {/* ========================================
                  ANSWER RESULT
              ======================================== */}

              {showAnswer && (

                <div className="revision-answer">

                  <span className="answer-status">
                    CORRECT ANSWER
                  </span>

                  <h3>
                    {question.answer}
                  </h3>

                  {question.explanation && (
                    <p>
                      {
                        question.explanation
                      }
                    </p>
                  )}

                  {/* ==================================
                      CORRECT
                  ================================== */}

                  {isCorrect ? (

                    <>

                      <p className="revision-correct">
                        ✓ CORRECT. GOOD RECALL.
                      </p>

                      <div className="d-flex gap-2 flex-wrap mt-4">

                        <button
                          onClick={
                            markQuestionKnown
                          }
                          className="main-button"
                          disabled={
                            savingMastery
                          }
                        >
                          {savingMastery
                            ? "SAVING..."
                            : "I KNOW THIS ✓"}
                        </button>

                        <button
                          onClick={
                            keepWeak
                          }
                          className="secondary-button"
                          disabled={
                            savingMastery
                          }
                        >
                          KEEP IN REVISION
                        </button>

                      </div>

                    </>

                  ) : (

                    /* ==================================
                       WRONG
                    ================================== */

                    <>

                      <p className="revision-wrong">
                        ✕ NOT QUITE. KEEP
                        REVISING THIS QUESTION.
                      </p>

                      <button
                        onClick={
                          nextAfterWrong
                        }
                        className="main-button mt-4"
                        disabled={
                          savingMastery
                        }
                      >
                        {savingMastery
                          ? "SAVING..."
                          : "NEXT REVISION →"}
                      </button>

                    </>

                  )}

                </div>

              )}

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}

export default Revision;