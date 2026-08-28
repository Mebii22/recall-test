import { useNavigate } from "react-router-dom";

function TopicCard({ topic }) {
  const navigate = useNavigate();

  function startTest() {
    navigate(
      `/test?topicId=${topic.id}&topic=${encodeURIComponent(
        topic.title
      )}`
    );
  }

  return (
    <div className="topic-card">

      <div className="d-flex justify-content-between align-items-start">

        <span className="small-label">
          TOPIC // {String(topic.id).padStart(2, "0")}
        </span>

        <span className="question-count">
          {topic.questions}Q
        </span>

      </div>

      <h2 className="topic-card-title">
        {topic.title}
      </h2>

      <p className="topic-card-description">
        {topic.description}
      </p>

      <button
        onClick={startTest}
        className="main-button"
      >
        START RECALL →
      </button>

    </div>
  );
}

export default TopicCard;