import { useState } from "react";
import "./card.less";
import { useAuth } from "../../Context/AuthContext";


const API_BASE = import.meta.env.VITE_API_BASE;
const API_URL = `${API_BASE}/api/auth/register`;



export default function CardPage() {
  const { token } = useAuth();

  const [title, setTitle] = useState("");
  const [fields, setFields] = useState([{ question: "", answer: "" }]);
  const [isPublic, setIsPublic] = useState(false);

  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const addField = () => {
    setFields(prev => [...prev, { question: "", answer: "" }]);
  };

  const handleChange = (index, key, value) => {
    const updated = [...fields];
    updated[index][key] = value;
    setFields(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    const nonEmptyCards = fields.filter(
      f => f.question.trim() && f.answer.trim()
    );

    if (!title.trim()) {
      setMessage("Введите Title");
      return;
    }
    if (nonEmptyCards.length === 0) {
      setMessage("Добавьте хотя бы одну карточку");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title.trim(),
          cards: nonEmptyCards,
          isPublic
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Ошибка сохранения");

      setMessage(isPublic ? "Публичный квиз сохранён!" : "Квиз сохранён!");
      setTitle("");
      setFields([{ question: "", answer: "" }]);
      setIsPublic(false);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="card-page">
      <div className="card-container">
        <header className="card-header">
          <h2>Create Your Cards</h2>
          <p className="card-sub">
            Добавьте название, вопросы и ответы. При желании сделайте квиз
            публичным, чтобы делиться ссылкой.
          </p>

          <div className="card-visibility">
            <span className={!isPublic ? "vis-label active" : "vis-label"}>
              Private
            </span>

            <button
              type="button"
              className={isPublic ? "vis-switch on" : "vis-switch"}
              onClick={() => setIsPublic(prev => !prev)}
            >
              <span className="thumb" />
            </button>

            <span className={isPublic ? "vis-label active" : "vis-label"}>
              Public
            </span>
          </div>

          <p className="card-vis-note">
            Public — любой по ссылке <b>может проходить</b> квиз, но менять
            его всё равно сможете только вы.
          </p>
        </header>

        <section className="card-form-section">
          <form onSubmit={handleSubmit}>
            <div className="card-title-row">
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            {fields.map((item, index) => (
              <article key={index} className="card-block">
                <p className="card-question-label">Question {index + 1}</p>
                <div className="card-row">
                  <input
                    type="text"
                    placeholder="Question"
                    value={item.question}
                    onChange={e =>
                      handleChange(index, "question", e.target.value)
                    }
                    className="question-input"
                  />

                  <input
                    type="text"
                    placeholder="Answer"
                    value={item.answer}
                    onChange={e =>
                      handleChange(index, "answer", e.target.value)
                    }
                    className="answer-input"
                  />
                </div>
              </article>
            ))}

            <div className="card-buttons">
              <button
                type="button"
                onClick={addField}
                className="btn secondary"
              >
                + Add Card
              </button>

              <button
                type="submit"
                disabled={loading}
                className="btn primary"
              >
                {loading ? "Saving..." : "Save quiz"}
              </button>
            </div>

            {message && <p className="card-message">{message}</p>}
          </form>
        </section>
      </div>
    </main>
  );
}
