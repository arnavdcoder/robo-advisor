const API_BASE = "http://127.0.0.1:5000";

export async function getPrediction(ticker) {
  const res = await fetch(`${API_BASE}/api/predict?ticker=${encodeURIComponent(ticker)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export async function getHistory(ticker) {
  const res = await fetch(`${API_BASE}/api/history?ticker=${encodeURIComponent(ticker)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export async function getQuestions() {
  const res = await fetch(`${API_BASE}/api/questions`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export async function submitProfile(answers) {
  const res = await fetch(`${API_BASE}/api/profile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(answers),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}
