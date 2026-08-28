import {
  useEffect,
  useRef,
  useState,
} from "react";
import axios from "axios";

const API_URL = "http://localhost:3001";

const emptyTopic = {
  title: "",
  description: "",
};

const emptyQuestion = {
  topicId: "",
  question: "",
  options: ["", "", "", ""],
  answer: "",
  explanation: "",
};

function Build() {
  const [topics, setTopics] = useState([]);
  const [questions, setQuestions] = useState([]);

  const [topicForm, setTopicForm] =
    useState(emptyTopic);

  const [questionForm, setQuestionForm] =
    useState(emptyQuestion);

  const [editingTopicId, setEditingTopicId] =
    useState(null);

  const [editingQuestionId, setEditingQuestionId] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [savingTopic, setSavingTopic] =
    useState(false);

  const [savingQuestion, setSavingQuestion] =
    useState(false);

  const [deletingTopicId, setDeletingTopicId] =
    useState(null);

  const [deletingQuestionId, setDeletingQuestionId] =
    useState(null);

  const [error, setError] = useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const notificationTimer = useRef(null);

  // ==================================================
  // LOAD DATA
  // ==================================================

  useEffect(() => {
    loadData();

    return () => {
      if (notificationTimer.current) {
        clearTimeout(
          notificationTimer.current
        );
      }
    };
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [
        topicsResponse,
        questionsResponse,
      ] = await Promise.all([
        axios.get(`${API_URL}/topics`),
        axios.get(`${API_URL}/questions`),
      ]);

      const loadedTopics =
        Array.isArray(topicsResponse.data)
          ? topicsResponse.data
          : [];

      const loadedQuestions =
        Array.isArray(
          questionsResponse.data
        )
          ? questionsResponse.data
          : [];

      setTopics(loadedTopics);
      setQuestions(loadedQuestions);
    } catch (error) {
      console.error(
        "LOAD DATA ERROR:",
        error
      );

      showError(
        "Unable to load Build data. Make sure JSON Server is running on port 3001."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==================================================
  // NOTIFICATIONS
  // ==================================================

  function clearNotificationTimer() {
    if (notificationTimer.current) {
      clearTimeout(
        notificationTimer.current
      );

      notificationTimer.current = null;
    }
  }

  function showSuccess(message) {
    clearNotificationTimer();

    setError("");
    setSuccessMessage(message);

    notificationTimer.current =
      setTimeout(() => {
        setSuccessMessage("");
        notificationTimer.current = null;
      }, 3500);
  }

  function showError(message) {
    clearNotificationTimer();

    setSuccessMessage("");
    setError(message);

    notificationTimer.current =
      setTimeout(() => {
        setError("");
        notificationTimer.current = null;
      }, 4500);
  }

  function closeNotification() {
    clearNotificationTimer();

    setSuccessMessage("");
    setError("");
  }

  // ==================================================
  // TOPIC FORM
  // ==================================================

  function handleTopicChange(event) {
    const {
      name,
      value,
    } = event.target;

    setTopicForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function resetTopicForm() {
    setTopicForm({
      title: "",
      description: "",
    });

    setEditingTopicId(null);
  }

  // ==================================================
  // SAVE TOPIC
  // ==================================================

  async function handleTopicSubmit(event) {
    event.preventDefault();

    setError("");

    if (!topicForm.title.trim()) {
      showError(
        "Please enter a topic title."
      );
      return;
    }

    if (!topicForm.description.trim()) {
      showError(
        "Please enter a topic description."
      );
      return;
    }

    try {
      setSavingTopic(true);

      // ==================================================
      // UPDATE TOPIC
      // ==================================================

      if (editingTopicId !== null) {
        const currentTopic = topics.find(
          (topic) =>
            Number(topic.id) ===
            Number(editingTopicId)
        );

        const response =
          await axios.put(
            `${API_URL}/topics/${editingTopicId}`,
            {
              title: topicForm.title
                .trim()
                .toUpperCase(),

              description:
                topicForm.description.trim(),

              questions:
                getQuestionCount(
                  editingTopicId
                ),
            }
          );

        setTopics((current) =>
          current.map((topic) =>
            Number(topic.id) ===
            Number(editingTopicId)
              ? response.data
              : topic
          )
        );

        const oldTitle =
          currentTopic?.title ||
          response.data.title;

        resetTopicForm();

        showSuccess(
          `TOPIC "${oldTitle}" UPDATED SUCCESSFULLY.`
        );

        return;
      }

      // ==================================================
      // CREATE TOPIC
      // ==================================================

      const response =
        await axios.post(
          `${API_URL}/topics`,
          {
            title: topicForm.title
              .trim()
              .toUpperCase(),

            description:
              topicForm.description.trim(),

            questions: 0,
          }
        );

      // Immediately add to React state.
      setTopics((current) => [
        ...current,
        response.data,
      ]);

      resetTopicForm();

      showSuccess(
        `TOPIC "${response.data.title}" ADDED SUCCESSFULLY.`
      );
    } catch (error) {
      console.error(
        "SAVE TOPIC ERROR:",
        error
      );

      showError(
        "COULD NOT SAVE THE TOPIC."
      );
    } finally {
      setSavingTopic(false);
    }
  }

  // ==================================================
  // EDIT TOPIC
  // ==================================================

  function editTopic(topic) {
    setEditingTopicId(topic.id);

    setTopicForm({
      title: topic.title || "",
      description:
        topic.description || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // ==================================================
  // DELETE TOPIC
  // ==================================================

  async function deleteTopic(topic) {
    const topicId =
      Number(topic.id);

    if (deletingTopicId !== null) {
      return;
    }

    const topicQuestions =
      questions.filter(
        (question) =>
          Number(question.topicId) ===
          topicId
      );

    let message =
      `Delete "${topic.title}"?`;

    if (topicQuestions.length > 0) {
      message +=
        `\n\nThis topic has ${topicQuestions.length} question(s). They will also be deleted.`;
    }

    const confirmed =
      window.confirm(message);

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setDeletingTopicId(topicId);

      // ==================================================
      // DELETE QUESTIONS FIRST
      // ==================================================

      if (topicQuestions.length > 0) {
        const deleteResults =
          await Promise.allSettled(
            topicQuestions.map(
              (question) =>
                axios.delete(
                  `${API_URL}/questions/${question.id}`
                )
            )
          );

        const failedDeletes =
          deleteResults.filter(
            (result) =>
              result.status ===
              "rejected"
          );

        if (
          failedDeletes.length > 0
        ) {
          console.error(
            "QUESTION DELETE ERROR:",
            failedDeletes
          );

          // Reload because the server may
          // have partially deleted questions.
          await loadData();

          showError(
            `COULD NOT DELETE ${failedDeletes.length} QUESTION(S). TOPIC WAS NOT REMOVED.`
          );

          return;
        }
      }

      // ==================================================
      // DELETE TOPIC
      // ==================================================

      await axios.delete(
        `${API_URL}/topics/${topic.id}`
      );

      // ==================================================
      // REMOVE TOPIC FROM REACT STATE
      // ==================================================

      setTopics((currentTopics) =>
        currentTopics.filter(
          (item) =>
            Number(item.id) !==
            topicId
        )
      );

      // ==================================================
      // REMOVE RELATED QUESTIONS FROM REACT STATE
      // ==================================================

      setQuestions(
        (currentQuestions) =>
          currentQuestions.filter(
            (question) =>
              Number(
                question.topicId
              ) !== topicId
          )
      );

      // ==================================================
      // RESET TOPIC FORM
      // ==================================================

      if (
        editingTopicId !== null &&
        Number(editingTopicId) ===
          topicId
      ) {
        resetTopicForm();
      }

      // ==================================================
      // RESET QUESTION FORM
      // ==================================================

      if (
        questionForm.topicId &&
        Number(questionForm.topicId) ===
          topicId
      ) {
        resetQuestionForm();
      }

      showSuccess(
        `TOPIC "${topic.title}" DELETED SUCCESSFULLY.`
      );
    } catch (error) {
      console.error(
        "DELETE TOPIC ERROR:",
        error
      );

      // Restore actual server state.
      await loadData();

      showError(
        "COULD NOT DELETE THE TOPIC."
      );
    } finally {
      setDeletingTopicId(null);
    }
  }

  // ==================================================
  // QUESTION FORM
  // ==================================================

  function handleQuestionChange(event) {
    const {
      name,
      value,
    } = event.target;

    setQuestionForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleOptionChange(
    index,
    value
  ) {
    setQuestionForm((current) => {
      const updatedOptions = [
        ...current.options,
      ];

      const oldOption =
        updatedOptions[index];

      updatedOptions[index] = value;

      return {
        ...current,

        options: updatedOptions,

        // Keep answer synchronized
        // when the selected correct option
        // is edited.
        answer:
          current.answer === oldOption
            ? value
            : current.answer,
      };
    });
  }

  function chooseCorrectAnswer(
    value
  ) {
    setQuestionForm((current) => ({
      ...current,
      answer: value,
    }));
  }

  function resetQuestionForm() {
    setQuestionForm({
      topicId: "",
      question: "",
      options: ["", "", "", ""],
      answer: "",
      explanation: "",
    });

    setEditingQuestionId(null);
  }

  // ==================================================
  // SAVE QUESTION
  // ==================================================

  async function handleQuestionSubmit(
    event
  ) {
    event.preventDefault();

    setError("");

    // ==================================================
    // VALIDATION
    // ==================================================

    if (!questionForm.topicId) {
      showError(
        "Please select a topic."
      );
      return;
    }

    if (!questionForm.question.trim()) {
      showError(
        "Please enter a question."
      );
      return;
    }

    const cleanedOptions =
      questionForm.options.map(
        (option) =>
          option.trim()
      );

    if (
      cleanedOptions.some(
        (option) => !option
      )
    ) {
      showError(
        "Please fill in all four answer options."
      );
      return;
    }

    const uniqueOptions =
      new Set(
        cleanedOptions.map(
          (option) =>
            option.toLowerCase()
        )
      );

    if (uniqueOptions.size !== 4) {
      showError(
        "Each answer option must be different."
      );
      return;
    }

    if (!questionForm.answer) {
      showError(
        "Please choose which answer is correct."
      );
      return;
    }

    if (
      !cleanedOptions.includes(
        questionForm.answer
      )
    ) {
      showError(
        "The correct answer must match one of the options."
      );
      return;
    }

    try {
      setSavingQuestion(true);

      const newTopicId =
        Number(
          questionForm.topicId
        );

      // ==================================================
      // FIND EXISTING QUESTION
      // ==================================================

      let existingQuestion =
        null;

      if (
        editingQuestionId !== null
      ) {
        existingQuestion =
          questions.find(
            (question) =>
              String(question.id) ===
              String(
                editingQuestionId
              )
          );
      }

      const oldTopicId =
        existingQuestion
          ? Number(
              existingQuestion.topicId
            )
          : null;

      // ==================================================
      // QUESTION DATA
      // ==================================================

      const questionData = {
        topicId: newTopicId,

        question:
          questionForm.question.trim(),

        options: cleanedOptions,

        answer: questionForm.answer,

        explanation:
          questionForm.explanation.trim(),
      };

      // ==================================================
      // UPDATE QUESTION
      // ==================================================

      if (
        editingQuestionId !== null
      ) {
        /*
         * IMPORTANT:
         *
         * Preserve the existing revision state
         * when editing a question.
         *
         * This prevents editing a question from
         * accidentally removing its weak/mastered
         * status.
         */

        const preservedRevisionState = {
          weak:
            existingQuestion?.weak ??
            false,

          mastered:
            existingQuestion?.mastered ??
            false,
        };

        const response =
          await axios.put(
            `${API_URL}/questions/${editingQuestionId}`,
            {
              ...questionData,
              ...preservedRevisionState,
            }
          );

        // Update question immediately.
        setQuestions((current) =>
          current.map((question) =>
            String(question.id) ===
            String(
              editingQuestionId
            )
              ? response.data
              : question
          )
        );

        // ==================================================
        // TOPIC COUNTS
        // ==================================================

        if (
          oldTopicId !== null &&
          oldTopicId !== newTopicId
        ) {
          await updateTopicQuestionCount(
            oldTopicId
          );
        }

        await updateTopicQuestionCount(
          newTopicId
        );

        resetQuestionForm();

        showSuccess(
          "QUESTION UPDATED SUCCESSFULLY."
        );

        return;
      }

      // ==================================================
      // CREATE QUESTION
      // ==================================================

      const response =
        await axios.post(
          `${API_URL}/questions`,
          {
            ...questionData,

            // ============================================
            // REVISION STATE
            // ============================================

            weak: false,
            mastered: false,
          }
        );

      // Immediately show question.
      setQuestions((current) => [
        ...current,
        response.data,
      ]);

      // Update topic question count.
      await updateTopicQuestionCount(
        newTopicId
      );

      resetQuestionForm();

      showSuccess(
        "QUESTION ADDED SUCCESSFULLY."
      );
    } catch (error) {
      console.error(
        "SAVE QUESTION ERROR:",
        error
      );

      await loadData();

      showError(
        "COULD NOT SAVE THE QUESTION."
      );
    } finally {
      setSavingQuestion(false);
    }
  }

  // ==================================================
  // EDIT QUESTION
  // ==================================================

  function editQuestion(question) {
    setEditingQuestionId(
      question.id
    );

    setQuestionForm({
      topicId: String(
        question.topicId
      ),

      question:
        question.question || "",

      options:
        question.options?.length === 4
          ? [...question.options]
          : ["", "", "", ""],

      answer:
        question.answer || "",

      explanation:
        question.explanation || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // ==================================================
  // DELETE QUESTION
  // ==================================================

  async function deleteQuestion(
    question
  ) {
    const questionId =
      String(question.id);

    if (
      deletingQuestionId !== null
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        "Delete this question?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setDeletingQuestionId(
        questionId
      );

      // ==================================================
      // DELETE FROM SERVER
      // ==================================================

      await axios.delete(
        `${API_URL}/questions/${question.id}`
      );

      // ==================================================
      // REMOVE FROM UI IMMEDIATELY
      // ==================================================

      setQuestions((current) =>
        current.filter(
          (item) =>
            String(item.id) !==
            questionId
        )
      );

      // ==================================================
      // UPDATE TOPIC COUNT
      // ==================================================

      await updateTopicQuestionCount(
        Number(question.topicId)
      );

      // ==================================================
      // RESET EDIT FORM
      // ==================================================

      if (
        editingQuestionId !== null &&
        String(
          editingQuestionId
        ) === questionId
      ) {
        resetQuestionForm();
      }

      showSuccess(
        "QUESTION DELETED SUCCESSFULLY."
      );
    } catch (error) {
      console.error(
        "DELETE QUESTION ERROR:",
        error
      );

      await loadData();

      showError(
        "COULD NOT DELETE THE QUESTION."
      );
    } finally {
      setDeletingQuestionId(null);
    }
  }

  // ==================================================
  // QUESTION COUNT
  // ==================================================

  function getQuestionCount(
    topicId
  ) {
    return questions.filter(
      (question) =>
        Number(question.topicId) ===
        Number(topicId)
    ).length;
  }

  // ==================================================
  // UPDATE TOPIC QUESTION COUNT
  // ==================================================

  async function updateTopicQuestionCount(
    topicId
  ) {
    try {
      const id = Number(topicId);

      const response =
        await axios.get(
          `${API_URL}/questions?topicId=${id}`
        );

      const actualCount =
        response.data.length;

      const topicResponse =
        await axios.patch(
          `${API_URL}/topics/${id}`,
          {
            questions: actualCount,
          }
        );

      setTopics((current) =>
        current.map((topic) =>
          Number(topic.id) === id
            ? topicResponse.data
            : topic
        )
      );

      return actualCount;
    } catch (error) {
      console.error(
        "QUESTION COUNT UPDATE ERROR:",
        error
      );

      return null;
    }
  }

  // ==================================================
  // TOPIC NAME
  // ==================================================

  function getTopicName(topicId) {
    const topic = topics.find(
      (item) =>
        Number(item.id) ===
        Number(topicId)
    );

    return (
      topic?.title || "UNKNOWN"
    );
  }

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <main className="page-section">
        <div className="container">

          <div className="loading-box">
            LOADING BUILD SYSTEM...
          </div>

        </div>
      </main>
    );
  }

  // ==================================================
  // PAGE
  // ==================================================

  return (
    <main className="page-section">

      <div className="container">

        {/* ============================================
            PAGE INTRO
        ============================================ */}

        <p className="orange-label">
          BUILD // CONTENT MANAGER
        </p>

        <h1 className="page-title">
          BUILD
          <br />
          <span>YOUR RECALL.</span>
        </h1>

        <p className="page-description">
          Create your own topics and
          questions. Choose the correct
          answer and build a personalised
          knowledge library for active
          recall.
        </p>

        {/* ============================================
            TOPIC SECTION
        ============================================ */}

        <section className="manage-section">

          <div className="section-header">

            <p className="orange-label">
              01 // TOPICS
            </p>

            <h2 className="section-title small-title">
              CREATE
              <br />
              <span>TOPICS.</span>
            </h2>

          </div>

          <div className="row g-4">

            {/* TOPIC FORM */}

            <div className="col-lg-5">

              <div className="info-box">

                <p className="orange-label">
                  {editingTopicId !==
                  null
                    ? "EDIT TOPIC"
                    : "NEW TOPIC"}
                </p>

                <form
                  onSubmit={
                    handleTopicSubmit
                  }
                >

                  <div className="mb-4">

                    <label className="arena-label">
                      TOPIC TITLE
                    </label>

                    <input
                      type="text"
                      name="title"
                      value={
                        topicForm.title
                      }
                      onChange={
                        handleTopicChange
                      }
                      className="form-control arena-input"
                      placeholder="e.g. JAVASCRIPT"
                      disabled={
                        savingTopic
                      }
                    />

                  </div>

                  <div className="mb-4">

                    <label className="arena-label">
                      DESCRIPTION
                    </label>

                    <textarea
                      name="description"
                      value={
                        topicForm.description
                      }
                      onChange={
                        handleTopicChange
                      }
                      className="form-control arena-input"
                      rows="5"
                      placeholder="Describe what this topic covers..."
                      disabled={
                        savingTopic
                      }
                    />

                  </div>

                  <div className="d-flex gap-2 flex-wrap">

                    <button
                      type="submit"
                      className="main-button"
                      disabled={
                        savingTopic ||
                        deletingTopicId !==
                          null
                      }
                    >
                      {savingTopic
                        ? "SAVING..."
                        : editingTopicId !==
                          null
                        ? "UPDATE TOPIC →"
                        : "ADD TOPIC →"}
                    </button>

                    {editingTopicId !==
                      null && (
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={
                          resetTopicForm
                        }
                        disabled={
                          savingTopic
                        }
                      >
                        CANCEL
                      </button>
                    )}

                  </div>

                </form>

              </div>

            </div>

            {/* TOPIC LIST */}

            <div className="col-lg-7">

              {topics.length ===
              0 ? (

                <div className="loading-box">
                  NO TOPICS YET.
                </div>

              ) : (

                <div className="row g-3">

                  {topics.map(
                    (topic) => {

                      const count =
                        getQuestionCount(
                          topic.id
                        );

                      const isDeleting =
                        Number(
                          deletingTopicId
                        ) ===
                        Number(
                          topic.id
                        );

                      return (
                        <div
                          className="col-md-6"
                          key={String(
                            topic.id
                          )}
                        >

                          <div className="manage-card">

                            <span className="arena-label">
                              TOPIC //{" "}
                              {String(
                                topic.id
                              ).padStart(
                                2,
                                "0"
                              )}
                            </span>

                            <h3>
                              {
                                topic.title
                              }
                            </h3>

                            <p>
                              {
                                topic.description
                              }
                            </p>

                            <p className="question-count">
                              {count}{" "}
                              QUESTION
                              {count !==
                              1
                                ? "S"
                                : ""}
                            </p>

                            <div className="d-flex gap-2 flex-wrap mt-3">

                              <button
                                type="button"
                                className="small-action"
                                onClick={() =>
                                  editTopic(
                                    topic
                                  )
                                }
                                disabled={
                                  deletingTopicId !==
                                  null ||
                                  deletingQuestionId !==
                                  null
                                }
                              >
                                EDIT
                              </button>

                              <button
                                type="button"
                                className="small-action danger"
                                onClick={() =>
                                  deleteTopic(
                                    topic
                                  )
                                }
                                disabled={
                                  deletingTopicId !==
                                  null
                                }
                              >
                                {isDeleting
                                  ? "DELETING..."
                                  : "DELETE"}
                              </button>

                            </div>

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

              )}

            </div>

          </div>

        </section>

        {/* ============================================
            QUESTION SECTION
        ============================================ */}

        <section className="manage-section">

          <div className="section-header">

            <p className="orange-label">
              02 // QUESTIONS
            </p>

            <h2 className="section-title small-title">
              BUILD
              <br />
              <span>QUESTIONS.</span>
            </h2>

          </div>

          <div className="row g-4">

            {/* QUESTION FORM */}

            <div className="col-lg-7">

              <div className="info-box">

                <p className="orange-label">
                  {editingQuestionId !==
                  null
                    ? "EDIT QUESTION"
                    : "NEW QUESTION"}
                </p>

                <form
                  onSubmit={
                    handleQuestionSubmit
                  }
                >

                  {/* TOPIC */}

                  <div className="mb-4">

                    <label className="arena-label">
                      SELECT TOPIC
                    </label>

                    <select
                      name="topicId"
                      value={
                        questionForm.topicId
                      }
                      onChange={
                        handleQuestionChange
                      }
                      className="form-select arena-input"
                      disabled={
                        topics.length ===
                          0 ||
                        savingQuestion ||
                        deletingTopicId !==
                          null
                      }
                    >

                      <option value="">
                        CHOOSE A TOPIC
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
                            {
                              topic.title
                            }
                          </option>
                        )
                      )}

                    </select>

                  </div>

                  {/* QUESTION */}

                  <div className="mb-4">

                    <label className="arena-label">
                      QUESTION
                    </label>

                    <textarea
                      name="question"
                      value={
                        questionForm.question
                      }
                      onChange={
                        handleQuestionChange
                      }
                      className="form-control arena-input"
                      rows="4"
                      placeholder="Write your question..."
                      disabled={
                        savingQuestion
                      }
                    />

                  </div>

                  {/* ANSWER OPTIONS */}

                  <div className="mb-4">

                    <label className="arena-label">
                      ANSWER OPTIONS
                    </label>

                    <p className="test-hint">
                      Enter four possible
                      answers, then select
                      the correct one.
                    </p>

                    <div className="d-grid gap-3 mt-3">

                      {questionForm.options.map(
                        (
                          option,
                          index
                        ) => (

                          <div
                            className="d-flex gap-2 align-items-center"
                            key={
                              index
                            }
                          >

                            <div
                              style={{
                                minWidth:
                                  "34px",
                                height:
                                  "34px",
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                justifyContent:
                                  "center",
                                border:
                                  "1px solid var(--line)",
                                color:
                                  "var(--orange)",
                                fontFamily:
                                  '"DM Mono", monospace',
                                fontSize:
                                  "11px",
                              }}
                            >
                              {String.fromCharCode(
                                65 +
                                  index
                              )}
                            </div>

                            <input
                              type="text"
                              value={
                                option
                              }
                              onChange={(
                                event
                              ) =>
                                handleOptionChange(
                                  index,
                                  event
                                    .target
                                    .value
                                )
                              }
                              className="form-control arena-input"
                              placeholder={`Answer option ${
                                index +
                                1
                              }`}
                              disabled={
                                savingQuestion
                              }
                            />

                          </div>

                        )
                      )}

                    </div>

                  </div>

                  {/* CORRECT ANSWER */}

                  <div className="mb-4">

                    <label className="arena-label">
                      CORRECT ANSWER
                    </label>

                    <div className="d-grid gap-2">

                      {questionForm.options.map(
                        (
                          option,
                          index
                        ) => (

                          <button
                            type="button"
                            key={
                              index
                            }
                            disabled={
                              !option.trim() ||
                              savingQuestion
                            }
                            onClick={() =>
                              chooseCorrectAnswer(
                                option
                              )
                            }
                            className={
                              questionForm.answer ===
                              option
                                ? "answer-button selected"
                                : "answer-button"
                            }
                          >

                            <span>
                              {String.fromCharCode(
                                65 +
                                  index
                              )}
                              .{" "}
                              {option ||
                                `OPTION ${
                                  index +
                                  1
                                }`}
                            </span>

                            {questionForm.answer ===
                              option &&
                              option && (
                                <span className="ms-auto">
                                  ✓ CORRECT
                                </span>
                              )}

                          </button>

                        )
                      )}

                    </div>

                  </div>

                  {/* EXPLANATION */}

                  <div className="mb-4">

                    <label className="arena-label">
                      EXPLANATION
                    </label>

                    <textarea
                      name="explanation"
                      value={
                        questionForm.explanation
                      }
                      onChange={
                        handleQuestionChange
                      }
                      className="form-control arena-input"
                      rows="4"
                      placeholder="Explain why this answer is correct..."
                      disabled={
                        savingQuestion
                      }
                    />

                  </div>

                  {/* BUTTONS */}

                  <div className="d-flex gap-2 flex-wrap">

                    <button
                      type="submit"
                      className="main-button"
                      disabled={
                        savingQuestion ||
                        topics.length ===
                          0 ||
                        deletingTopicId !==
                          null
                      }
                    >
                      {savingQuestion
                        ? "SAVING..."
                        : editingQuestionId !==
                          null
                        ? "UPDATE QUESTION →"
                        : "ADD QUESTION →"}
                    </button>

                    {editingQuestionId !==
                      null && (
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={
                          resetQuestionForm
                        }
                        disabled={
                          savingQuestion
                        }
                      >
                        CANCEL
                      </button>
                    )}

                  </div>

                  {topics.length ===
                    0 && (
                    <p className="validation-message">
                      Create a topic before
                      adding questions.
                    </p>
                  )}

                </form>

              </div>

            </div>

            {/* QUESTION PREVIEW */}

            <div className="col-lg-5">

              <div className="manage-card">

                <span className="arena-label">
                  RECALL BUILDER
                </span>

                <h3>
                  {questionForm.question ||
                    "YOUR QUESTION"}
                </h3>

                <p>
                  {questionForm.topicId
                    ? getTopicName(
                        questionForm.topicId
                      )
                    : "NO TOPIC SELECTED"}
                </p>

                <div className="mt-4">

                  {questionForm.options.map(
                    (
                      option,
                      index
                    ) => (

                      <div
                        key={
                          index
                        }
                        style={{
                          padding:
                            "12px 0",
                          borderBottom:
                            "1px solid var(--line)",
                          fontFamily:
                            '"DM Mono", monospace',
                          fontSize:
                            "11px",
                          color:
                            questionForm.answer ===
                            option
                              ? "var(--orange)"
                              : "var(--muted)",
                        }}
                      >

                        {String.fromCharCode(
                          65 +
                            index
                        )}
                        .{" "}

                        {option ||
                          "EMPTY OPTION"}

                        {questionForm.answer ===
                          option &&
                          option && (
                            <strong>
                              {" "}
                              // CORRECT
                            </strong>
                          )}

                      </div>

                    )
                  )}

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* ============================================
            QUESTION LIBRARY
        ============================================ */}

        <section className="manage-section">

          <div className="section-header">

            <p className="orange-label">
              03 // QUESTION LIBRARY
            </p>

            <h2 className="section-title small-title">
              MANAGE
              <br />
              <span>KNOWLEDGE.</span>
            </h2>

          </div>

          {questions.length ===
          0 ? (

            <div className="loading-box">
              NO QUESTIONS YET.
            </div>

          ) : (

            <div className="row g-4">

              {questions.map(
                (
                  question,
                  index
                ) => {

                  const isDeleting =
                    String(
                      deletingQuestionId
                    ) ===
                    String(
                      question.id
                    );

                  return (
                    <div
                      className="col-lg-6"
                      key={String(
                        question.id
                      )}
                    >

                      <div className="manage-card">

                        <div className="d-flex justify-content-between gap-3">

                          <span className="arena-label">
                            QUESTION //{" "}
                            {String(
                              index +
                                1
                            ).padStart(
                              2,
                              "0"
                            )}
                          </span>

                          <span className="question-count">
                            {
                              getTopicName(
                                question.topicId
                              )
                            }
                          </span>

                        </div>

                        <h4>
                          {
                            question.question
                          }
                        </h4>

                        <div className="mt-3">

                          {question.options?.map(
                            (
                              option,
                              optionIndex
                            ) => (

                              <div
                                key={
                                  optionIndex
                                }
                                style={{
                                  padding:
                                    "10px 0",
                                  borderBottom:
                                    "1px solid var(--line)",
                                  color:
                                    option ===
                                    question.answer
                                      ? "var(--orange)"
                                      : "var(--muted)",
                                  fontFamily:
                                    '"DM Mono", monospace',
                                  fontSize:
                                    "11px",
                                }}
                              >

                                {String.fromCharCode(
                                  65 +
                                    optionIndex
                                )}
                                .{" "}
                                {
                                  option
                                }

                                {option ===
                                  question.answer && (
                                  <strong>
                                    {" "}
                                    ✓
                                    CORRECT
                                  </strong>
                                )}

                              </div>

                            )
                          )}

                        </div>

                        {question.explanation && (
                          <p
                            className="page-description"
                            style={{
                              marginTop:
                                "20px",
                            }}
                          >
                            {
                              question.explanation
                            }
                          </p>
                        )}

                        {/* REVISION STATUS */}

                        {question.mastered && (
                          <p className="revision-correct">
                            ✓ MASTERED
                          </p>
                        )}

                        {question.weak &&
                          !question.mastered && (
                            <p className="revision-wrong">
                              ! NEEDS REVISION
                            </p>
                          )}

                        <div className="d-flex gap-2 flex-wrap mt-4">

                          <button
                            type="button"
                            className="small-action"
                            onClick={() =>
                              editQuestion(
                                question
                              )
                            }
                            disabled={
                              deletingQuestionId !==
                                null ||
                              deletingTopicId !==
                                null
                            }
                          >
                            EDIT
                          </button>

                          <button
                            type="button"
                            className="small-action danger"
                            onClick={() =>
                              deleteQuestion(
                                question
                              )
                            }
                            disabled={
                              deletingQuestionId !==
                                null ||
                              deletingTopicId !==
                                null
                            }
                          >
                            {isDeleting
                              ? "DELETING..."
                              : "DELETE"}
                          </button>

                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          )}

        </section>

      </div>

      {/* ==================================================
          FIXED NOTIFICATION
      ================================================== */}

      {(successMessage ||
        error) && (
        <div
          className={
            successMessage
              ? "build-notification success"
              : "build-notification error"
          }
          role="status"
          aria-live="polite"
        >

          <span className="build-notification-icon">
            {successMessage
              ? "✓"
              : "!"}
          </span>

          <span className="build-notification-text">
            {successMessage ||
              error}
          </span>

          <button
            type="button"
            className="build-notification-close"
            onClick={
              closeNotification
            }
            aria-label="Close notification"
          >
            ×
          </button>

        </div>
      )}

    </main>
  );
}

export default Build;