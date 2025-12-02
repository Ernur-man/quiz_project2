import React, { useState } from "react";
import "./feedback.less";
import { useAuth } from "../../Context/AuthContext";


const OWNER_WHATSAPP = "77754473174";

export default function FeedbackPage() {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || "");
  const [category, setCategory] = useState("problem");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [status, setStatus] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus(null);

    if (!message.trim()) {
      setStatus({ type: "error", text: "Опиши проблему или идею" });
      return;
    }

    const categoryLabel = {
      problem: "Problem / bug",
      disadvantage: "Disadvantage",
      idea: "Idea / improvement",
      other: "Other"
    }[category] || category;

    const finalSubject = subject.trim() || "Feedback from Quiz Cards";
    const userEmail = email.trim() || "anonymous";

    const text = `
📬 Feedback for Quiz Cards

Category: ${categoryLabel}
Subject: ${finalSubject}
From: ${userEmail}

Message:
${message}
`.trim();

    const waUrl = `https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent(
      text
    )}`;

    window.open(waUrl, "_blank");

    setStatus({
      type: "success",
      text: "Сейчас откроется WhatsApp. Просто нажми «Отправить»."
    });


  };

  return (
    <main className="feedback-page">
      <div className="feedback-container">
        <h2>Feedback & Problems</h2>
        <p className="feedback-sub">
          Нашёл баг, неудобный момент или хочешь предложить идею? Напиши —
          сообщение уйдёт прямо в мой WhatsApp.
        </p>

        <section className="feedback-card">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <label>
                Email (по желанию)
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </label>
            </div>

            <div className="row row-inline">
              <label>
                Category
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                >
                  <option value="problem">Problem / bug</option>
                  <option value="disadvantage">Disadvantage</option>
                  <option value="idea">Idea / improvement</option>
                  <option value="other">Other</option>
                </select>
              </label>

              <label>
                Subject
                <input
                  type="text"
                  placeholder="Short subject"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                />
              </label>
            </div>

            <div className="row">
              <label>
                Message
                <textarea
                  rows={6}
                  placeholder="Расскажи, что именно не нравится или что можно улучшить..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                />
              </label>
            </div>

            <button type="submit" className="feedback-btn">
              Send via WhatsApp
            </button>

            {status && (
              <p
                className={
                  status.type === "success"
                    ? "feedback-status success"
                    : "feedback-status error"
                }
              >
                {status.text}
              </p>
            )}
          </form>
        </section>
      </div>
    </main>
  );
}
