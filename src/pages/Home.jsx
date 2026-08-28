import { Link } from "react-router-dom";

function Home() {
  return (
    <main className="page-section">

      <div className="container">

        <div className="hero-section">

          <div className="row align-items-center">

            <div className="col-lg-8">

              <p className="orange-label">
                ACTIVE RECALL // MEMORY TRAINING
              </p>

              <h1 className="hero-title">
                TEST
                <br />
                YOUR
                <br />
                <span>MEMORY.</span>
              </h1>

              <p className="page-description hero-description">
                Recall is a simple active-recall
                application for testing your knowledge,
                finding weak areas and improving through
                revision.
              </p>

              <div className="d-flex gap-3 flex-wrap">

                <Link
                  to="/topics"
                  className="main-button"
                >
                  START RECALL →
                </Link>

                <Link
                  to="/revision"
                  className="secondary-button"
                >
                  REVISE
                </Link>

              </div>

            </div>

            <div className="col-lg-4 mt-5 mt-lg-0">

              <div className="hero-side-box">

                <span className="orange-label">
                  SYSTEM // 01
                </span>

                <h2>
                  RETRIEVE.
                  <br />
                  CHECK.
                  <br />
                  IMPROVE.
                </h2>

                <p>
                  Answer from memory first.
                  Then compare your answer with
                  the correct answer.
                </p>

              </div>

            </div>

          </div>

        </div>

        <section className="mt-5 pt-5">

          <p className="orange-label">
            HOW IT WORKS
          </p>

          <h2 className="section-title">
            SIMPLE
            <br />
            <span>RECALL LOOP.</span>
          </h2>

          <div className="row g-4 mt-4">

            <div className="col-md-4">
              <div className="info-box">
                <span className="step-number">01</span>
                <h3>SELECT</h3>
                <p>
                  Choose a topic and decide how many
                  questions you want to answer.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="info-box">
                <span className="step-number">02</span>
                <h3>RECALL</h3>
                <p>
                  Try to remember the answer before
                  checking the correct answer.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="info-box">
                <span className="step-number">03</span>
                <h3>REVISE</h3>
                <p>
                  Review incorrect answers and
                  practise weak questions again.
                </p>
              </div>
            </div>

          </div>

        </section>

      </div>

    </main>
  );
}

export default Home;