
export const API_BASE =
  import.meta.env.VITE_API_BASE ;

export async function apiRequest(path, method = "GET", body = null, token) {
  // если передали только путь — приклеиваем базовый URL
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;

  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (token) {
    options.headers["Authorization"] = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options);
  let data = {};

  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    throw new Error(data.message || "API error");
  }

  return data;
}
