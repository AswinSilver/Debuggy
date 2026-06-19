/* Simple localStorage-based auth store */

const USERS_KEY = "codexa_users";
const SESSION_KEY = "codexa_session";

function getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || "[]"); }
  catch { return []; }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); }
  catch { return null; }
}

function saveSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function register({ name, email, password }) {
  const users = getUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { ok: false, error: "An account with this email already exists." };
  }
  const user = { id: crypto.randomUUID(), name, email, createdAt: Date.now() };
  // Store password separately (never in session)
  saveUsers([...users, { ...user, password }]);
  saveSession(user);
  return { ok: true, user };
}

export function login({ email, password }) {
  const users = getUsers();
  const found = users.find(
    u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  if (!found) return { ok: false, error: "Invalid email or password." };
  const user = { id: found.id, name: found.name, email: found.email, createdAt: found.createdAt };
  saveSession(user);
  return { ok: true, user };
}
