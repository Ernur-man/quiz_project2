// server/server.js
import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 3001;

// ---------- JWT ----------
const JWT_SECRET = process.env.JWT_SECRET || "yernurIdea_30.11.25";
const JWT_EXPIRES_IN = "7d";

// ---------- MySQL config ----------
const dbConfig = {
  host: process.env.MYSQLHOST || "localhost",
  user: process.env.MYSQLUSER || "root",
  password: process.env.MYSQLPASSWORD || "",
  database: process.env.MYSQLDATABASE || "quiz_db",
  port: process.env.MYSQLPORT ? Number(process.env.MYSQLPORT) : 3306,
  charset: "utf8mb4",
};

let pool;

// ---------- MIDDLEWARE ----------
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options("*", cors());

app.use(express.json());

// ---------- health-check ----------
app.get("/", (req, res) => {
  res.json({ status: "ok", path: "/" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", path: "/api/health" });
});

// ---------- JWT helpers ----------
function createToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.userId };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

// ---------- AUTH ----------
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password || password.length < 4) {
      return res
        .status(400)
        .json({ message: "Email и пароль (мин. 4 символа) обязательны" });
    }

    const [exists] = await pool.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (exists.length > 0) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      "INSERT INTO users (email, password_hash) VALUES (?, ?)",
      [email, hash]
    );

    const token = createToken(result.insertId);

    return res.status(201).json({
      token,
      user: { id: result.insertId, email },
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.execute(
      "SELECT id, email, password_hash FROM users WHERE email = ?",
      [email]
    );
    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = createToken(user.id);
    return res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ---------- QUIZZES ----------
app.post("/api/quizzes", authMiddleware, async (req, res) => {
  try {
    const { title, cards, isPublic } = req.body;

    if (!title || !Array.isArray(cards) || cards.length === 0) {
      return res
        .status(400)
        .json({ message: "Title и хотя бы один вопрос обязательны" });
    }

    const cleaned = cards
      .filter((c) => c.question && c.answer)
      .map((c) => ({
        question: String(c.question),
        answer: String(c.answer),
      }));

    const json = JSON.stringify(cleaned);

    const [result] = await pool.execute(
      "INSERT INTO quizzes (user_id, title, data, is_public) VALUES (?, ?, ?, ?)",
      [req.user.id, title, json, isPublic ? 1 : 0]
    );

    return res.status(201).json({
      id: result.insertId,
      title,
      cards: cleaned,
      is_public: isPublic ? 1 : 0,
    });
  } catch (err) {
    console.error("Create quiz error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/quizzes", authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, title, created_at, is_public FROM quizzes WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );
    return res.json(rows);
  } catch (err) {
    console.error("Get quizzes error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/quizzes/:id", authMiddleware, async (req, res) => {
  try {
    const quizId = req.params.id;
    const [rows] = await pool.execute(
      "SELECT * FROM quizzes WHERE id = ?",
      [quizId]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "Quiz not found" });

    const quiz = rows[0];

    if (quiz.user_id !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const cards = JSON.parse(quiz.data || "[]");

    return res.json({
      id: quiz.id,
      title: quiz.title,
      created_at: quiz.created_at,
      is_public: quiz.is_public === 1,
      cards,
    });
  } catch (err) {
    console.error("Get quiz error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

app.patch("/api/quizzes/:id/visibility", authMiddleware, async (req, res) => {
  try {
    const quizId = req.params.id;
    const { isPublic } = req.body;

    const [rows] = await pool.execute(
      "SELECT user_id FROM quizzes WHERE id = ?",
      [quizId]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "Quiz not found" });

    if (rows[0].user_id !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    await pool.execute(
      "UPDATE quizzes SET is_public = ? WHERE id = ?",
      [isPublic ? 1 : 0, quizId]
    );

    return res.json({ id: quizId, is_public: isPublic ? 1 : 0 });
  } catch (err) {
    console.error("Visibility error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/public/quizzes/:id", async (req, res) => {
  try {
    const quizId = req.params.id;
    const [rows] = await pool.execute(
      "SELECT id, title, data, created_at, is_public FROM quizzes WHERE id = ?",
      [quizId]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "Quiz not found" });

    const quiz = rows[0];
    if (!quiz.is_public) {
      return res.status(403).json({ message: "Quiz is private" });
    }

    const cards = JSON.parse(quiz.data || "[]");

    return res.json({
      id: quiz.id,
      title: quiz.title,
      created_at: quiz.created_at,
      cards,
    });
  } catch (err) {
    console.error("Public quiz error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ---------- запуск сервера + подключение к БД ----------
(async () => {
  try {
    pool = await mysql.createPool(dbConfig);
    console.log("MySQL pool created");
    const [rows] = await pool.query("SELECT 1 AS t");
    console.log("DB test result:", rows[0]);
  } catch (err) {
    console.error("MySQL connection error:", err);
    // сервер всё равно стартанёт, просто все запросы к БД будут падать
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
})();
