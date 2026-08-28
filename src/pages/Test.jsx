import { useEffect, useState } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import axios from "axios";

import API_URL from "../api";

function Test() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialTopicId =
    searchParams.get("topicId") || "";

  const initialTopicName =
    searchParams.get("topic") || "";

  const [topics, setTopics] = useState([]);

  const [selectedTopicId, setSelectedTopicId] =
    useState(initialTopicId);

  const [selectedTopicName, setSelectedTopicName] =
    useState(initialTopicName);

  const [numberOfQuestions, setNumberOfQuestions] =
    useState(5);

  const [questions, setQuestions] =
    useState([]);

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [selectedAnswer, setSelectedAnswer] =
    useState("");

  const [score, setScore] =
    useState(0);

  const [testStarted, setTestStarted] =
    useState(false);

  const [answers, setAnswers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [savingAnswer, setSavingAnswer] =
    useState(false);

  const [error, setError] =
    useState("");

  // ==================================================
  // LOAD TOPICS
  // ==================================================

  useEffect(() => {
    loadTopics();
  }, [initialTopicId]);

  async function loadTopics() {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/topics`
      );

      const loadedTopics =
        Array.isArray(response.data)
          ? response.data
          : [];

      setTopics(loadedTopics);

      if (initialTopicId) {
        const topic =
          loadedTopics.find(
            (item) =>
              String(item.id) ===
              String(initialTopicId)
          );

        if (topic) {
          setSelectedTopicName(
            topic.title
          );
        }
      }
    } catch (error) {
      console.error(
        "ERROR LOADING TOPICS:",
        error
      );

      setError(
        "COULD NOT LOAD TOPICS."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==================================================
  // START TEST
  // ==================================================

  async function startTest() {
    setError("");

    if (!selectedTopicId) {
      setError(
        "PLEASE CHOOSE A TOPIC."
      );
      return;
    }

    try {
      setLoading(true);

      const response =
        await axios.get(
          `${API_URL}/questions`
        );

      const allQuestions =
        Array.isArray(response.data)
          ? response.data
          : [];

      // ----------------------------------------------
      // GET QUESTIONS FOR SELECTED TOPIC
      // ----------------------------------------------

      const topicQuestions =
        allQuestions.filter(
          (question) =>
            String(question.topicId) ===
            String(selectedTopicId)
        );

      if (topicQuestions.length === 0) {
        setError(
          "NO QUESTIONS HAVE BEEN ADDED TO THIS TOPIC YET. GO TO BUILD AND ADD QUESTIONS."
        );

        setLoading(false);
        return;
      }

      // ----------------------------------------------
      // FIND TOPIC
      // ----------------------------------------------

      const topic =
        topics.find(
          (item) =>
            String(item.id) ===
            String(selectedTopicId)
        );

      // ----------------------------------------------
      // SHUFFLE
      // ----------------------------------------------

      const shuffledQuestions = [
        ...topicQuestions,
      ].sort(
        () => Math.random() - 0.5
      );

      const amount = Math.min(
        Number(numberOfQuestions),
        shuffledQuestions.length
      );

      const selectedQuestions =
        shuffledQuestions.slice(
          0,
          amount
        );

      // ----------------------------------------------
      // START
      // ----------------------------------------------

      setQuestions(
        selectedQuestions
      );

      setSelectedTopicName(
        topic
          ? topic.title
          : "TEST"
      );

      setCurrentQuestion(0);
      setSelectedAnswer("");
      setScore(0);
      setAnswers([]);
      setTestStarted(true);
    } catch (error) {
      console.error(
        "ERROR LOADING QUESTIONS:",
        error
      );

      setError(
        "COULD NOT LOAD QUESTIONS FROM JSON SERVER."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==================================================
  // SELECT ANSWER
  // ==================================================

  function handleAnswer(answer) {
    if (savingAnswer) {
      return;
    }

    setSelectedAnswer(answer);
    setError("");
  }

  // ==================================================
  // SAVE QUESTION MASTERY STATUS
  // ==================================================

  async function updateQuestionStatus(
    question,
    isCorrect
  ) {
    try {
      /*
       * WRONG:
       * weak = true
       * mastered = false
       *
       * CORRECT:
       * weak = false
       *
       * We do NOT automatically set mastered=true
       * here because the user should confirm mastery
       * during Revision.
       */

      await axios.patch(
        `${API_URL}/questions/${question.id}`,
        {
          weak: !isCorrect,
          mastered: false,
        }
      );

      return true;
    } catch (error) {
      console.error(
        "QUESTION STATUS UPDATE ERROR:",
        error
      );

      return false;
    }
  }

  // ==================================================
  // NEXT QUESTION
  // ==================================================

  async function handleNext() {
    if (!selectedAnswer) {
      setError(
        "PLEASE SELECT AN ANSWER."
      );
      return;
    }

    const question =
      questions[currentQuestion];

    if (!question) {
      return;
    }

    try {
      setSavingAnswer(true);
      setError("");

      // ----------------------------------------------
      // CHECK ANSWER
      // ----------------------------------------------

      const isCorrect =
        selectedAnswer ===
        question.answer;

      const newScore = isCorrect
        ? score + 1
        : score;

      // ----------------------------------------------
      // UPDATE WEAK / MASTERED STATUS
      // ----------------------------------------------

      await updateQuestionStatus(
        question,
        isCorrect
      );

      // ----------------------------------------------
      // SAVE ANSWER RECORD
      // ----------------------------------------------

      const answerRecord = {
        questionId: question.id,

        question:
          question.question,

        options:
          question.options,

        selectedAnswer:
          selectedAnswer,

        correctAnswer:
          question.answer,

        explanation:
          question.explanation ||
          "Review this question again.",

        isCorrect:
          isCorrect,
      };

      const updatedAnswers = [
        ...answers,
        answerRecord,
      ];

      setAnswers(
        updatedAnswers
      );

      setScore(newScore);

      // ==============================================
      // FINISH TEST
      // ==============================================

      if (
        currentQuestion ===
        questions.length - 1
      ) {
        const percentage =
          Math.round(
            (newScore /
              questions.length) *
              100
          );

        try {
          await axios.post(
            `${API_URL}/results`,
            {
              topicId:
                selectedTopicId,

              topicTitle:
                selectedTopicName,

              score:
                percentage,

              correctCount:
                newScore,

              totalQuestions:
                questions.length,

              date:
                new Date().toLocaleDateString(),

              timestamp:
                new Date().toISOString(),

              answers:
                updatedAnswers,
            }
          );
        } catch (error) {
          console.error(
            "COULD NOT SAVE RESULT:",
            error
          );
        }

        navigate(
          `/results?topic=${encodeURIComponent(
            selectedTopicName
          )}&score=${newScore}&total=${
            questions.length
          }&percentage=${percentage}`
        );

        return;
      }

      // ==============================================
      // NEXT QUESTION
      // ==============================================

      setCurrentQuestion(
        (current) => current + 1
      );

      setSelectedAnswer("");
    } catch (error) {
      console.error(
        "HANDLE NEXT ERROR:",
        error
      );

      setError(
        "COULD NOT SAVE YOUR ANSWER. PLEASE TRY AGAIN."
      );
    } finally {
      setSavingAnswer(false);
    }
  }

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <main className="page-section">

        <div className="container">

          <div className="loading-box">
            LOADING TEST SYSTEM...
          </div>

        </div>

      </main>
    );
  }

  // ==================================================
  // TEST SETUP
  // ==================================================

  if (!testStarted) {
    return (
      <main className="page-section">

        <div className="container">

          <p className="orange-label">
            ACTIVE RECALL // TEST SETUP
          </p>

          <h1 className="page-title">
            BUILD YOUR
            <br />
            <span>TEST.</span>
          </h1>

          <p className="page-description">
            Choose a topic and decide how
            many questions you want to
            practise.
          </p>

          <div className="row justify-content-center mt-5">

            <div className="col-lg-7">

              <div className="info-box">

                {error && (
                  <div className="error-message mb-4">
                    {error}
                  </div>
                )}

                <label className="form-label arena-label">
                  SELECT TOPIC
                </label>

                <select
                  value={
                    selectedTopicId
                  }
                  onChange={(event) => {
                    const id =
                      event.target.value;

                    setSelectedTopicId(
                      id
                    );

                    setError("");

                    const topic =
                      topics.find(
                        (item) =>
                          String(
                            item.id
                          ) ===
                          String(id)
                      );

                    setSelectedTopicName(
                      topic
                        ? topic.title
                        : ""
                    );
                  }}
                  className="form-select arena-input"
                  disabled={savingAnswer}
                >

                  <option value="">
                    -- CHOOSE TOPIC --
                  </option>

                  {topics.map(
                    (topic) => (
                      <option
                        key={String(
                          topic.id
                        )}
                        value={
                          topic.id
                        }
                      >
                        {topic.title}
                      </option>
                    )
                  )}

                </select>

                <label className="form-label arena-label mt-4">
                  NUMBER OF QUESTIONS
                </label>

                <select
                  value={
                    numberOfQuestions
                  }
                  onChange={(
                    event
                  ) =>
                    setNumberOfQuestions(
                      Number(
                        event.target
                          .value
                      )
                    )
                  }
                  className="form-select arena-input"
                >

                  <option value="3">
                    3 QUESTIONS
                  </option>

                  <option value="5">
                    5 QUESTIONS
                  </option>

                  <option value="10">
                    10 QUESTIONS
                  </option>

                  <option value="15">
                    15 QUESTIONS
                  </option>

                  <option value="20">
                    20 QUESTIONS
                  </option>

                </select>

                <p className="test-hint">
                  If the topic has fewer
                  questions than selected,
                  all available questions
                  will be used.
                </p>

                <button
                  onClick={
                    startTest
                  }
                  className="main-button mt-4"
                  disabled={
                    topics.length ===
                      0 ||
                    savingAnswer
                  }
                >
                  START TEST →
                </button>

              </div>

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
    questions[currentQuestion];

  if (!question) {
    return (
      <main className="page-section">

        <div className="container">

          <div className="loading-box">
            NO QUESTION AVAILABLE.
          </div>

        </div>

      </main>
    );
  }

  // ==================================================
  // TEST QUESTION PAGE
  // ==================================================

  return (
    <main className="page-section">

      <div className="container">

        <p className="orange-label">
          ACTIVE RECALL //{" "}
          {selectedTopicName}
        </p>

        <h1 className="page-title">
          QUESTION
          <br />
          <span>
            {currentQuestion + 1}.
          </span>
        </h1>

        <div className="row justify-content-center mt-5">

          <div className="col-lg-8">

            <div className="info-box">

              <div className="test-status">

                <span>
                  QUESTION{" "}
                  {currentQuestion + 1}{" "}
                  /{" "}
                  {questions.length}
                </span>

                <span>
                  SCORE: {score}
                </span>

              </div>

              <h2 className="test-question">
                {question.question}
              </h2>

              <div className="d-grid gap-3">

                {question.options?.map(
                  (
                    option,
                    index
                  ) => (

                    <button
                      key={`${question.id}-${index}`}
                      type="button"
                      onClick={() =>
                        handleAnswer(
                          option
                        )
                      }
                      disabled={
                        savingAnswer
                      }
                      className={
                        selectedAnswer ===
                        option
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

                  )
                )}

              </div>

              {!selectedAnswer && (
                <p className="validation-message">
                  SELECT AN ANSWER TO
                  CONTINUE.
                </p>
              )}

              {error && (
                <p className="validation-message">
                  {error}
                </p>
              )}

              <button
                onClick={
                  handleNext
                }
                disabled={
                  !selectedAnswer ||
                  savingAnswer
                }
                className="main-button mt-5"
              >

                {savingAnswer
                  ? "SAVING..."
                  : currentQuestion ===
                    questions.length -
                      1
                  ? "FINISH TEST →"
                  : "NEXT QUESTION →"}

              </button>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}

export default Test;