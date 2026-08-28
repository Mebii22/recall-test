function About() {
  return (
    <main className="page-section">

      <div className="container">

        <p className="orange-label">
          ABOUT // RECALL
        </p>

        <h1 className="page-title">
          TRAIN
          <br />
          YOUR
          <br />
          <span>RECALL.</span>
        </h1>

        <p className="page-description">
          Recall is a simple active-recall application
          built with React. It helps students test
          their knowledge, identify mistakes and revise
          weak areas.
        </p>

        <div className="row g-4 mt-5">

          <div className="col-md-4">
            <div className="info-box">
              <span className="step-number">
                01
              </span>

              <h2>TEST</h2>

              <p>
                Choose a topic and answer questions
                from memory.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="info-box">
              <span className="step-number">
                02
              </span>

              <h2>CHECK</h2>

              <p>
                Compare your answer with the correct
                answer and explanation.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="info-box">
              <span className="step-number">
                03
              </span>

              <h2>REVISE</h2>

              <p>
                Practise your incorrect answers again
                to improve your knowledge.
              </p>
            </div>
          </div>

        </div>

        <section className="mt-5 pt-5">

          <p className="orange-label">
            TECHNOLOGY // COURSE REQUIREMENTS
          </p>

          <h2 className="section-title">
            BUILT
            <br />
            <span>WITH.</span>
          </h2>

          <div className="row g-3 mt-4">

            {[
              "HTML",
              "CSS",
              "JAVASCRIPT",
              "REACT",
              "BOOTSTRAP",
              "TAILWIND",
              "AXIOS",
              "JSON SERVER",
            ].map((technology) => (
              <div
                className="col-6 col-md-3"
                key={technology}
              >
                <div className="tech-box">
                  {technology}
                </div>
              </div>
            ))}

          </div>

        </section>

      </div>

    </main>
  );
}

export default About;