import { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../api";

const emptyQuestion = {
  question: "",
  option1: "",
  option2: "",
  option3: "",
  option4: "",
  answer: "",
  explanation: "",
};

function Manage() {
  const [topics, setTopics] =
    useState([]);

  const [questions, setQuestions] =
    useState([]);

  const [selectedTopicId, setSelectedTopicId] =
    useState("");

  const [topicTitle, setTopicTitle] =
    useState("");

  const [topicDescription, setTopicDescription] =
    useState("");

  const [questionForm, setQuestionForm] =
    useState(emptyQuestion);

  const [editingTopicId, setEditingTopicId] =
    useState(null);

  const [editingQuestionId, setEditingQuestionId] =
    useState(null);

  useEffect(() => {
    loadData();
  }, []);

  function loadData() {
    Promise.all([
      axios.get(
        `${API_URL}/topics`
      ),
      axios.get(
        `${API_URL}/questions`
      ),
    ])
      .then(([topicsResponse, questionsResponse]) => {
        setTopics(topicsResponse.data);
        setQuestions(
          questionsResponse.data
        );
      })
      .catch((error) => {
        console.log(
          "Error loading data:",
          error
        );
      });
  }

  function addOrUpdateTopic(event) {
    event.preventDefault();

    if (!topicTitle.trim()) {
      alert("Please enter a topic title.");
      return;
    }

    const topicData = {
      title: topicTitle
        .trim()
        .toUpperCase(),
      description:
        topicDescription.trim(),
      questions: editingTopicId
        ? topics.find(
            (topic) =>
              String(topic.id) ===
              String(editingTopicId)
          )?.questions || 0
        : 0,
    };

    if (editingTopicId) {
      axios
        .put(
          `${API_URL}/topics/${editingTopicId}`,
          topicData
        )
        .then(() => {
          resetTopicForm();
          loadData();
        });
    } else {
      axios
        .post(
          `${API_URL}/topics`,
          topicData
        )
        .then(() => {
          resetTopicForm();
          loadData();
        });
    }
  }

  function editTopic(topic) {
    setEditingTopicId(topic.id);
    setTopicTitle(topic.title);
    setTopicDescription(
      topic.description
    );
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function deleteTopic(id) {
    const confirmed = window.confirm(
      "Delete this topic and its questions?"
    );

    if (!confirmed) {
      return;
    }

    const topicQuestions =
      questions.filter(
        (question) =>
          String(question.topicId) ===
          String(id)
      );

    Promise.all([
      axios.delete(
        `${API_URL}/topics/${id}`
      ),
      ...topicQuestions.map(
        (question) =>
          axios.delete(
            `${API_URL}/questions/${question.id}`
          )
      ),
    ]).then(() => {
      loadData();
    });
  }

  function resetTopicForm() {
    setEditingTopicId(null);
    setTopicTitle("");
    setTopicDescription("");
  }

  function updateQuestionField(
    field,
    value
  ) {
    setQuestionForm({
      ...questionForm,
      [field]: value,
    });
  }

  function addOrUpdateQuestion(event) {
    event.preventDefault();

    if (!selectedTopicId) {
      alert("Please select a topic.");
      return;
    }

    if (
      !questionForm.question.trim() ||
      !questionForm.option1.trim() ||
      !questionForm.option2.trim() ||
      !questionForm.option3.trim() ||
      !questionForm.option4.trim() ||
      !questionForm.answer
    ) {
      alert(
        "Please complete all question fields."
      );
      return;
    }

    const questionData = {
      topicId: selectedTopicId,
      question:
        questionForm.question.trim(),
      options: [
        questionForm.option1.trim(),
        questionForm.option2.trim(),
        questionForm.option3.trim(),
        questionForm.option4.trim(),
      ],
      answer: questionForm.answer,
      explanation:
        questionForm.explanation.trim(),
    };

    if (editingQuestionId) {
      axios
        .put(
          `${API_URL}/questions/${editingQuestionId}`,
          questionData
        )
        .then(() => {
          resetQuestionForm();
          loadData();
        });
    } else {
      axios
        .post(
          `${API_URL}/questions`,
          questionData
        )
        .then(() => {
          updateTopicQuestionCount(
            selectedTopicId
          );

          resetQuestionForm();
          loadData();
        });
    }
  }

  function updateTopicQuestionCount(
    topicId
  ) {
    const count =
      questions.filter(
        (question) =>
          String(question.topicId) ===
          String(topicId)
      ).length + 1;

    const topic = topics.find(
      (item) =>
        String(item.id) ===
        String(topicId)
    );

    if (!topic) {
      return;
    }

    axios.patch(
      `${API_URL}/topics/${topicId}`,
      {
        questions: count,
      }
    );
  }

  function editQuestion(question) {
    setEditingQuestionId(
      question.id
    );

    setSelectedTopicId(
      question.topicId
    );

    setQuestionForm({
      question:
        question.question || "",
      option1:
        question.options?.[0] || "",
      option2:
        question.options?.[1] || "",
      option3:
        question.options?.[2] || "",
      option4:
        question.options?.[3] || "",
      answer:
        question.answer || "",
      explanation:
        question.explanation || "",
    });

    window.scrollTo({
      top: 450,
      behavior: "smooth",
    });
  }

  function deleteQuestion(question) {
    const confirmed = window.confirm(
      "Delete this question?"
    );

    if (!confirmed) {
      return;
    }

    axios
      .delete(
        `${API_URL}/questions/${question.id}`
      )
      .then(() => {
        loadData();
      });
  }

  function resetQuestionForm() {
    setEditingQuestionId(null);
    setQuestionForm(emptyQuestion);
  }

  return (
    <main className="page-section">

      <div className="container">

        <p className="orange-label">
          CONTENT MANAGEMENT // JSON SERVER
        </p>

        <h1 className="page-title">
          BUILD YOUR
          <br />
          <span>RECALL.</span>
        </h1>

        {/* TOPIC FORM */}

        <section className="manage-section">

          <div className="section-header">
            <div>
              <p className="orange-label">
                01 // TOPICS
              </p>

              <h2 className="section-title small-title">
                {editingTopicId
                  ? "EDIT TOPIC"
                  : "ADD TOPIC"}
              </h2>
            </div>
          </div>

          <form
            onSubmit={addOrUpdateTopic}
            className="info-box"
          >

            <label className="arena-label">
              TOPIC NAME
            </label>

            <input
              type="text"
              value={topicTitle}
              onChange={(event) =>
                setTopicTitle(
                  event.target.value
                )
              }
              placeholder="EXAMPLE: JAVASCRIPT"
              className="form-control arena-input"
            />

            <label className="arena-label mt-4">
              DESCRIPTION
            </label>

            <textarea
              value={topicDescription}
              onChange={(event) =>
                setTopicDescription(
                  event.target.value
                )
              }
              placeholder="Short description..."
              className="form-control arena-input"
              rows="3"
            />

            <div className="d-flex gap-3 flex-wrap mt-4">

              <button
                type="submit"
                className="main-button"
              >
                {editingTopicId
                  ? "UPDATE TOPIC →"
                  : "ADD TOPIC →"}
              </button>

              {editingTopicId && (
                <button
                  type="button"
                  onClick={resetTopicForm}
                  className="secondary-button"
                >
                  CANCEL
                </button>
              )}

            </div>

          </form>

          <div className="row g-3 mt-3">

            {topics.map((topic) => (
              <div
                className="col-md-6"
                key={topic.id}
              >
                <div className="manage-card">

                  <span className="small-label">
                    {topic.questions} QUESTIONS
                  </span>

                  <h3>
                    {topic.title}
                  </h3>

                  <p>
                    {topic.description}
                  </p>

                  <div className="d-flex gap-2">

                    <button
                      onClick={() =>
                        editTopic(topic)
                      }
                      className="small-action"
                    >
                      EDIT
                    </button>

                    <button
                      onClick={() =>
                        deleteTopic(
                          topic.id
                        )
                      }
                      className="small-action danger"
                    >
                      DELETE
                    </button>

                  </div>

                </div>
              </div>
            ))}

          </div>

        </section>

        {/* QUESTION FORM */}

        <section className="manage-section">

          <div className="section-header">

            <div>
              <p className="orange-label">
                02 // QUESTIONS
              </p>

              <h2 className="section-title small-title">
                {editingQuestionId
                  ? "EDIT QUESTION"
                  : "ADD QUESTION"}
              </h2>
            </div>

          </div>

          <form
            onSubmit={addOrUpdateQuestion}
            className="info-box"
          >

            <label className="arena-label">
              TOPIC
            </label>

            <select
              value={selectedTopicId}
              onChange={(event) =>
                setSelectedTopicId(
                  event.target.value
                )
              }
              className="form-select arena-input"
            >

              <option value="">
                -- CHOOSE TOPIC --
              </option>

              {topics.map((topic) => (
                <option
                  key={topic.id}
                  value={topic.id}
                >
                  {topic.title}
                </option>
              ))}

            </select>

            <label className="arena-label mt-4">
              QUESTION
            </label>

            <textarea
              value={
                questionForm.question
              }
              onChange={(event) =>
                updateQuestionField(
                  "question",
                  event.target.value
                )
              }
              className="form-control arena-input"
              rows="3"
              placeholder="Write your question..."
            />

            <div className="row g-3 mt-1">

              <div className="col-md-6">
                <label className="arena-label">
                  OPTION A
                </label>

                <input
                  value={
                    questionForm.option1
                  }
                  onChange={(event) =>
                    updateQuestionField(
                      "option1",
                      event.target.value
                    )
                  }
                  className="form-control arena-input"
                />
              </div>

              <div className="col-md-6">
                <label className="arena-label">
                  OPTION B
                </label>

                <input
                  value={
                    questionForm.option2
                  }
                  onChange={(event) =>
                    updateQuestionField(
                      "option2",
                      event.target.value
                    )
                  }
                  className="form-control arena-input"
                />
              </div>

              <div className="col-md-6">
                <label className="arena-label">
                  OPTION C
                </label>

                <input
                  value={
                    questionForm.option3
                  }
                  onChange={(event) =>
                    updateQuestionField(
                      "option3",
                      event.target.value
                    )
                  }
                  className="form-control arena-input"
                />
              </div>

              <div className="col-md-6">
                <label className="arena-label">
                  OPTION D
                </label>

                <input
                  value={
                    questionForm.option4
                  }
                  onChange={(event) =>
                    updateQuestionField(
                      "option4",
                      event.target.value
                    )
                  }
                  className="form-control arena-input"
                />
              </div>

            </div>

            <label className="arena-label mt-4">
              CORRECT ANSWER
            </label>

            <select
              value={questionForm.answer}
              onChange={(event) =>
                updateQuestionField(
                  "answer",
                  event.target.value
                )
              }
              className="form-select arena-input"
            >

              <option value="">
                -- CHOOSE CORRECT OPTION --
              </option>

              {[
                questionForm.option1,
                questionForm.option2,
                questionForm.option3,
                questionForm.option4,
              ]
                .filter(
                  (option) =>
                    option.trim()
                )
                .map((option) => (
                  <option
                    key={option}
                    value={option}
                  >
                    {option}
                  </option>
                ))}

            </select>

            <label className="arena-label mt-4">
              EXPLANATION
            </label>

            <textarea
              value={
                questionForm.explanation
              }
              onChange={(event) =>
                updateQuestionField(
                  "explanation",
                  event.target.value
                )
              }
              className="form-control arena-input"
              rows="3"
              placeholder="Explain why this answer is correct..."
            />

            <div className="d-flex gap-3 flex-wrap mt-4">

              <button
                type="submit"
                className="main-button"
              >
                {editingQuestionId
                  ? "UPDATE QUESTION →"
                  : "ADD QUESTION →"}
              </button>

              {editingQuestionId && (
                <button
                  type="button"
                  onClick={
                    resetQuestionForm
                  }
                  className="secondary-button"
                >
                  CANCEL
                </button>
              )}

            </div>

          </form>

        </section>

        {/* QUESTION LIST */}

        <section className="manage-section">

          <p className="orange-label">
            03 // QUESTION DATABASE
          </p>

          <h2 className="section-title small-title">
            ALL
            <br />
            <span>QUESTIONS.</span>
          </h2>

          <div className="row g-3 mt-4">

            {questions.map(
              (question) => {

                const topic =
                  topics.find(
                    (item) =>
                      String(item.id) ===
                      String(
                        question.topicId
                      )
                  );

                return (
                  <div
                    className="col-lg-6"
                    key={question.id}
                  >

                    <div className="manage-card">

                      <span className="small-label">
                        {topic?.title ||
                          "UNKNOWN TOPIC"}
                      </span>

                      <h4>
                        {question.question}
                      </h4>

                      <p>
                        <strong>
                          CORRECT:
                        </strong>{" "}
                        {question.answer}
                      </p>

                      <div className="d-flex gap-2">

                        <button
                          onClick={() =>
                            editQuestion(
                              question
                            )
                          }
                          className="small-action"
                        >
                          EDIT
                        </button>

                        <button
                          onClick={() =>
                            deleteQuestion(
                              question
                            )
                          }
                          className="small-action danger"
                        >
                          DELETE
                        </button>

                      </div>

                    </div>

                  </div>
                );
              }
            )}

          </div>

        </section>

      </div>

    </main>
  );
}

export default Manage;