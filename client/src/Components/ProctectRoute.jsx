
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // если есть параметр ?public=true → пропускаем без авторизации
  const publicMode =
    new URLSearchParams(location.search).get("public") === "true";

  if (publicMode) return children;

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
