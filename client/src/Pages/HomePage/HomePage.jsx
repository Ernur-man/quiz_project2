
import { Link } from "react-router-dom";
import "./home.less";

export default function HomePage() {
  return (
    <main className="home">
      <div className="home-inner">
        <section className="home-hero">
          <div className="home-hero-text">
            <p className="home-badge">Quiz Builder · Free</p>

            <h1>
              Create beautiful quizzes
              <br />
              in a couple of minutes.
            </h1>

            <p className="home-subtitle">
              Build flashcards, tests and study sets. Share them with friends,
              students or your team – for free and without ads.
            </p>

            <div className="home-cta">
              <Link to="/cards" className="home-btn primary">
                + Create new quiz
              </Link>
              <Link to="/mycards" className="home-btn ghost">
                View my quizzes
              </Link>
            </div>

            <p className="home-note">
              No complex setup. Just log in, add questions and start playing.
            </p>
          </div>

          <div className="home-hero-panel">
            <h3>Why Quiz Cards?</h3>
            <ul>
              <li>✓ Free & simple to start</li>
              <li>✓ Clean interface without noise</li>
              <li>✓ Works great for study & trainings</li>
              <li>✓ You can share quizzes by link</li>
            </ul>
          </div>
        </section>

        <section className="home-steps">
          <h2>How it works</h2>
          <div className="home-steps-grid">
            <article className="step">
              <span className="step-number">1</span>
              <h4>Create</h4>
              <p>Add a title and as many question–answer cards as you need.</p>
            </article>

            <article className="step">
              <span className="step-number">2</span>
              <h4>Practice</h4>
              <p>
                Run the quiz mode and try to choose or recall the right
                answers.
              </p>
            </article>

            <article className="step">
              <span className="step-number">3</span>
              <h4>Share</h4>
              <p>
                Send a public link so your friends or students can use your
                quiz too.
              </p>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
