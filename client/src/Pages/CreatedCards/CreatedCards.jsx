
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";

import "./created.less";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_URL = `${API_BASE}/api/auth/register`;



export default function CreatedCards() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [cards, setCards] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    if (!token) {
      setError("Вы не авторизованы");
      setLoading(false);
      return;
    }

    async function load() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Ошибка загрузки квизов");

        setCards(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error loading quizzes:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [token]);

  const openQuiz = (id) => {
    navigate(`/quiz/${id}`);
  };

  const toggleVisibility = async (quizId, currentIsPublic) => {
    if (!token) return;

    try {
      setUpdatingId(quizId);
      const res = await fetch(`${API_URL}/${quizId}/visibility`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isPublic: !currentIsPublic })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Ошибка изменения видимости");

      setCards(prev =>
        prev.map(q =>
          q.id === quizId ? { ...q, is_public: data.is_public } : q
        )
      );
    } catch (err) {
      console.error("Visibility error:", err);
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleShare = async (quizId, isPublic) => {
    if (!isPublic) {
      alert("Сначала сделайте квиз публичным (кнопка Public).");
      return;
    }

    const url = `${window.location.origin}/quiz/${quizId}?public=true`;

    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(quizId);
      setTimeout(() => setCopiedId(null), 1500);
    } catch (err) {
      console.error("Clipboard error:", err);
      prompt("Скопируйте ссылку вручную:", url);
    }
  };

  if (loading)
    return (
      <main className="created">
        <div className="container">
          <p className="loading">Loading...</p>
        </div>
      </main>
    );

  if (error)
    return (
      <main className="created">
        <div className="container">
          <p className="error">{error}</p>
        </div>
      </main>
    );

  if (!cards.length)
    return (
      <main className="created">
        <div className="container">
          <h2>Your Created Card Sets</h2>
          <p className="empty">
            У вас пока нет квизов. Создайте первый на странице “Create Cards”.
          </p>
        </div>
      </main>
    );

  return (
    <main className="created">
      <div className="container">
        <h2>Your Created Card Sets</h2>

        <div className="list">
          {cards.map(q => (
            <article key={q.id} className="card-item">
              <div className="card-main" onClick={() => openQuiz(q.id)}>
                <h3>{q.title}</h3>
                <p>ID: {q.id}</p>
                <p className="date">
                  {q.created_at
                    ? new Date(q.created_at).toLocaleString()
                    : "no date"}
                </p>
                <p className="vis-label-small">
                  {q.is_public ? "Public" : "Private"}
                </p>
              </div>

              <div className="card-footer">
                <button
                  type="button"
                  className={
                    q.is_public ? "vis-toggle public" : "vis-toggle private"
                  }
                  onClick={() => toggleVisibility(q.id, q.is_public)}
                  disabled={updatingId === q.id}
                >
                  {updatingId === q.id
                    ? "Updating..."
                    : q.is_public
                      ? "Make Private"
                      : "Make Public"}
                </button>

                <button
                  type="button"
                  className="share-link"
                  onClick={() => handleShare(q.id, q.is_public)}
                >
                  {copiedId === q.id ? "Link copied!" : "Copy share link"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
