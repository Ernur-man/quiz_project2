import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";

import { AuthProvider } from "./Context/AuthContext";

import HomePage from "./Pages/HomePage/HomePage";
import CardPage from "./Pages/CardPage/CardPage";
import CreatedCards from "./Pages/CreatedCards/CreatedCards";
import QuizPage from "./Pages/QuizPage/quizPage";
import LoginPage from "./Pages/LoginPage/LoginPage";
import RegisterPage from "./Pages/RegisterPage/RegisterPage";
import FeedbackPage from "./Pages/FeedBackPages/FeedBackPages.jsx";

import Header from "./Components/header";
import CursorTrailStyled from "./Components/cursorFollow";

function App() {
  const [cursorEnabled, setCursorEnabled] = useState(() => {
    const saved = localStorage.getItem("cursorEnabled");
    if (saved === null) return true; 
    return saved === "true";
  });

  useEffect(() => {
    localStorage.setItem("cursorEnabled", String(cursorEnabled));
  }, [cursorEnabled]);

  const toggleCursor = () => setCursorEnabled(prev => !prev);

  return (
    <AuthProvider>
      <Header
        cursorEnabled={cursorEnabled}
        onToggleCursor={toggleCursor}
      />

      {cursorEnabled && <CursorTrailStyled />}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cards" element={<CardPage />} />
        <Route path="/mycards" element={<CreatedCards />} />
        <Route path="/quiz/:id" element={<QuizPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
