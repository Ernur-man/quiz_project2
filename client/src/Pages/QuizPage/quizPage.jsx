
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "./quiz.less";
import { useAuth } from "../../Context/AuthContext";


const API_BASE = import.meta.env.VITE_API_BASE;
const API_URL = `${API_BASE}/api/auth/register`;



export default function QuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();

  const publicMode =
    new URLSearchParams(location.search).get("public") === "true";

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadQuiz() {
      try {
        const url = publicMode
          ? `${API_URL}${id}?public=true`
          : `${API_URL}${id}`;

        const res = await fetch(url, {
          headers: publicMode
            ? {}
            : { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load quiz");
        }

        setQuiz(data);
        setError("");
      } catch (err) {
        console.error("Ошибка загрузки квиза:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadQuiz();
  }, [id, token, publicMode]);

  const shuffle = (arr) => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  useEffect(() => {
    if (!quiz || !quiz.cards || quiz.cards.length === 0) return;

    const card = quiz.cards[currentIndex];
    const correct = card.answer;

    const otherAnswers = quiz.cards
      .filter((_, idx) => idx !== currentIndex)
      .map((c) => c.answer);

    const uniqueOthers = [...new Set(otherAnswers)];
    const distractors = shuffle(uniqueOthers).slice(0, 3);
    const allOptions = shuffle([correct, ...distractors]);

    setOptions(allOptions);
    setSelected(null);
    setIsCorrect(null);
  }, [quiz, currentIndex]);

  if (loading) return <div className="quiz-loading">Loading...</div>;
  if (error) return <div className="quiz-loading">{error}</div>;
  if (!quiz || !quiz.cards || quiz.cards.length === 0) {
    return <div className="quiz-loading">Quiz not found</div>;
  }

  const total = quiz.cards.length;
  const card = quiz.cards[currentIndex];

  const goNext = () => {
    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      navigate(publicMode ? "/" : "/mycards");
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  const handleChoose = (opt) => {
    if (selected) return;
    setSelected(opt);
    setIsCorrect(opt === card.answer);
  };

  const getOptionClass = (opt) => {
    let cls = "quiz-option";
    if (!selected) return cls;

    if (opt === selected) {
      cls += isCorrect ? " correct" : " wrong";
    } else if (!isCorrect && opt === card.answer) {
      cls += " correct";
    }
    return cls;
  };

  return (
    <main className="quiz">
      <div className="container">
        <section className="quiz-card">
          <header className="quiz-header">
            <h1>{quiz.title}</h1>
            <p className="quiz-sub">
              Question {currentIndex + 1} of {total}
              {publicMode && " (public)"}
            </p>
          </header>

          <div className="quiz-question">{card.question}</div>

          <div className="quiz-options">
            {options.map((opt, idx) => (
              <button
                key={idx}
                className={getOptionClass(opt)}
                onClick={() => handleChoose(opt)}
                disabled={!!selected}
              >
                {opt}
              </button>
            ))}
          </div>

          {selected && (
            <p className="quiz-result">
              {isCorrect ? "Correct! ✅" : "Not correct ❌"}
            </p>
          )}

          <footer className="quiz-footer">
            <button
              className="quiz-nav-btn"
              onClick={goPrev}
              disabled={currentIndex === 0}
            >
              Prev
            </button>

            <button className="quiz-nav-btn" onClick={goNext}>
              {currentIndex === total - 1 ? "Finish" : "Next"}
            </button>

            {!publicMode && (
              <button
                className="quiz-back-btn"
                onClick={() => navigate("/mycards")}
              >
                Back to list
              </button>
            )}
          </footer>
        </section>
      </div>
    </main>
  );
}
