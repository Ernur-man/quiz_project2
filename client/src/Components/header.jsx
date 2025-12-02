// src/Components/header.jsx
import { NavLink, Link } from "react-router-dom";
import "./header.less";
import { useState } from "react";
import { useAuth } from "../Context/AuthContext";

export default function Header({ cursorEnabled, onToggleCursor }) {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  const toggleMenu = () => setOpen(prev => !prev);
  const closeMenu = () => setOpen(false);

  return (
    <header className={open ? "navigate active" : "navigate"}>
      <button
        className="burger"
        onClick={toggleMenu}
        aria-label="Toggle navigation"
      >
        <span className="burger-lines">
          <span></span>
          <span></span>
          <span></span>
        </span>
        <i className="fa-solid fa-x"></i>
      </button>

      <div className="nav-inner">
        <h2 className="logo">Quizzes</h2>

        <nav className="nav-links">
          <NavLink
            to="/"
            end
            className="li"
            onClick={closeMenu}
          >
            <i className="fa-solid fa-house"></i>
            <span>Home</span>
          </NavLink>

          <NavLink
            to="/mycards"
            className="li"
            onClick={closeMenu}
          >
            <i className="fa-solid fa-box-archive"></i>
            <span>My Cards</span>
          </NavLink>

          <NavLink
            to="/cards"
            className="li"
            onClick={closeMenu}
          >
            <i className="fa-regular fa-copy"></i>
            <span>Create Cards</span>
          </NavLink>

          <NavLink
            to="/feedback"
            className="li"
            onClick={closeMenu}
          >
            <i className="fa-solid fa-circle-question"></i>
            <span>Feedback</span>
          </NavLink>
        </nav>

        {/* 🔥 Блок с тумблером эффекта курсора */}
        <div className="nav-toggle">
          <span className="nav-toggle-label">Cursor effect</span>
          <button
            type="button"
            className={
              cursorEnabled ? "toggle-switch on" : "toggle-switch"
            }
            onClick={() => {
              onToggleCursor();
            }}
          >
            <span className="thumb" />
          </button>
        </div>

        {/* Авторизация */}
        <div className="nav-auth">
          {user ? (
            <>
              <span className="nav-user">{user.email}</span>
              <button
                className="nav-logout"
                onClick={() => {
                  logout();
                  closeMenu();
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="nav-auth-link"
                onClick={closeMenu}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="nav-auth-btn"
                onClick={closeMenu}
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
